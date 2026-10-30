import { cache } from "react";

import { OmmDocsUnavailable } from "./errors";

/**
 * The omm docs pages mirror these source documents. Each is fetched at request time, not at
 * build time, so a change upstream shows up without a redeploy.
 *
 * The OpenNext static-assets incremental cache is build-time only, so Next's
 * own `fetch` cache and `revalidateTag` do nothing at runtime on this deploy.
 * Instead the README is held in the Cloudflare runtime cache (`caches.default`)
 * for an hour per colo: steady state is at most one GitHub subrequest per colo
 * per hour (see `docs/superpowers/specs/2026-09-04-omm-docs-mirror-design.md`).
 *
 * Instant refresh: a GitHub Action in `omm-hippo/omm` posts the pushed commit
 * to `POST /api/omm-docs/refresh`, which stores it in the `OMM_DOCS` KV
 * namespace. Pages then read `raw.githubusercontent.com/.../<sha>/...`: a new
 * URL, so it misses every colo's cache at once, and immutable, so GitHub's own
 * ~5-minute CDN cache of `main` cannot serve the old file. The KV entry
 * expires after a day, after which reads fall back to `main` — by then current
 * even if a later Action run failed.
 */
const RAW_BASE = "https://raw.githubusercontent.com/omm-hippo/omm";
const PATHS = { readme: "README.md", install: "docs/install.md" } as const;

export const README_URL = `${RAW_BASE}/main/${PATHS.readme}`;
export const INSTALL_GUIDE_URL = `${RAW_BASE}/main/${PATHS.install}`;
export type DocSource = "readme" | "install";

const EDGE_CACHE_TTL_SECONDS = 3600;
const REVISION_KEY = "revision";
export const REVISION_TTL_SECONDS = 24 * 3600;
/** KV edge-caches reads for this long (its minimum), so a refresh reaches
 *  every colo within about a minute. */
const REVISION_READ_CACHE_SECONDS = 60;
const SHA = /^[0-9a-f]{40}$/u;

type RevisionStore = {
  get(key: string, options: { cacheTtl: number }): Promise<string | null>;
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
};
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

/** `OMM_DOCS` KV. Undefined under `next dev` and in tests: reads use `main`. */
export async function revisionStore(): Promise<RevisionStore | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as { OMM_DOCS?: RevisionStore };
    return env.OMM_DOCS ?? null;
  } catch {
    return null;
  }
}

export function isCommitSha(value: unknown): value is string {
  return typeof value === "string" && SHA.test(value);
}

/** Raw URL of a source document at a commit, or at `main` without one. */
export function sourceUrl(source: DocSource = "readme", revision: string | null = null): string {
  return `${RAW_BASE}/${isCommitSha(revision) ? revision : "main"}/${PATHS[source]}`;
}

/** The cache key for a document at a revision. */
export function readmeCacheKey(source: DocSource = "readme", revision: string | null = null): Request {
  return new Request(sourceUrl(source, revision), { method: "GET" });
}

async function currentRevision(): Promise<string | null> {
  try {
    const value = await (await revisionStore())?.get(REVISION_KEY, {
      cacheTtl: REVISION_READ_CACHE_SECONDS,
    });
    return isCommitSha(value) ? value : null;
  } catch {
    // A KV outage degrades to the hourly `main` mirror, not a docs outage.
    return null;
  }
}

/** Records the commit the docs pages should read. Called by the refresh route. */
export async function setRevision(store: RevisionStore, sha: string): Promise<void> {
  await store.put(REVISION_KEY, sha, { expirationTtl: REVISION_TTL_SECONDS });
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

export async function fetchFromGitHub(
  source: DocSource,
  revision: string | null = null,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(sourceUrl(source, revision), {
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
 * Source markdown. `React.cache` dedupes the call within a single render
 * (the full-README page fetches once even though the body renders in a nested
 * component).
 */
export const fetchReadme = cache(async (source: DocSource = "readme"): Promise<string> => {
  const revision = await currentRevision();
  const store = edgeCache();
  if (!store) return fetchFromGitHub(source, revision);

  const key = readmeCacheKey(source, revision);
  try {
    const hit = await store.match(key);
    if (hit) return await hit.text();
  } catch {
    // A failed cache read is a miss, not a document outage.
  }

  const markdown = await fetchFromGitHub(source, revision);
  const entry = new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": `s-maxage=${EDGE_CACHE_TTL_SECONDS}`,
    },
  });
  await runAfterResponse(store.put(key, entry));
  return markdown;
});
