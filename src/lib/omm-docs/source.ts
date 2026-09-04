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
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    getCloudflareContext().ctx.waitUntil(promise);
  } catch {
    // No Cloudflare context (dev, tests): just await it inline.
    await promise;
  }
}

async function fetchFromGitHub(): Promise<string> {
  let response: Response;
  try {
    response = await fetch(README_URL, { cache: "no-store" });
  } catch {
    throw new OmmDocsUnavailable();
  }
  if (!response.ok) throw new OmmDocsUnavailable(response.status);
  return response.text();
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
  const hit = await store.match(key);
  if (hit) return hit.text();

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
