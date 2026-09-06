import { cache } from "react";

import { OmmDocsUnavailable } from "./errors";

/**
 * The omm docs pages mirror this file. It is fetched at request time, not at
 * build time, so a change upstream shows up without a redeploy.
 *
 * The OpenNext static-assets incremental cache is build-time only, so Next's
 * own `fetch` cache and `revalidateTag` do nothing at runtime on this deploy.
 * Instead the README is held in the Cloudflare runtime cache (`caches.default`)
 * for an hour per colo: steady state is at most one GitHub subrequest per colo
 * per hour, and `POST /api/omm-docs/refresh` deletes the entry for an instant
 * refresh (see `docs/superpowers/specs/2026-09-04-omm-docs-mirror-design.md`).
 */
export const README_URL =
  "https://raw.githubusercontent.com/omm-hippo/omm/main/README.md";

const EDGE_CACHE_TTL_SECONDS = 3600;
const FETCH_TIMEOUT_MS = 5_000;

type EdgeCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
  delete(request: Request): Promise<boolean>;
};

/**
 * `caches.default` in the Workers runtime. Undefined under `next dev` and in
 * tests, where the fetch just falls through to the network every time.
 */
export function edgeCache(): EdgeCache | null {
  const store = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return store?.default ?? null;
}

/** The key both the read path and the refresh route address. */
export function readmeCacheKey(): Request {
  return new Request(README_URL, { method: "GET" });
}

async function runAfterResponse(promise: Promise<unknown>): Promise<void> {
  // Handle rejection before importing the runtime: cache writes are best effort.
  const settled = promise.catch(() => {});
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    getCloudflareContext().ctx.waitUntil(settled);
  } catch {
    // No Cloudflare context (dev, tests): just await it inline.
    await settled;
  }
}

async function fetchFromGitHub(): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(README_URL, {
      cache: "no-store",
      signal: controller.signal,
      redirect: "manual",
    });
    if (!response.ok) throw new OmmDocsUnavailable(response.status);
    // Await the body here: a connection can fail after successful headers,
    // and the same deadline must cover the entire download.
    return await response.text();
  } catch (error) {
    if (error instanceof OmmDocsUnavailable) throw error;
    throw new OmmDocsUnavailable();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * The README markdown. `React.cache` dedupes the call within a single render
 * (the full-README page fetches once even though the body renders in a nested
 * component).
 */
export const fetchReadme = cache(async (): Promise<string> => {
  const store = edgeCache();
  if (!store) return fetchFromGitHub();

  const key = readmeCacheKey();
  try {
    const hit = await store.match(key);
    if (hit) return await hit.text();
  } catch {
    // A failed cache read is a miss, not a document outage.
  }

  const markdown = await fetchFromGitHub();
  const entry = new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": `s-maxage=${EDGE_CACHE_TTL_SECONDS}`,
    },
  });
  await runAfterResponse(store.put(key, entry));
  return markdown;
});
