import { cache } from "react";

import type { ArenaArtifact, BoardState } from "./types";
import { ARENA_PUBLIC_KEY, verifySignedArtifact } from "./verify";

/**
 * The signed arena leaderboard omm's nightly job publishes to `main`.
 * Fetched at request time and held in the Cloudflare runtime cache, like
 * `src/lib/omm-docs/source.ts` (the OpenNext incremental cache is build-time
 * only). The cached pair is re-verified on every read: nothing that did not
 * verify is ever rendered.
 */
export const ARTIFACT_URL =
  "https://raw.githubusercontent.com/omm-hippo/omm/main/published/arena-leaderboard.json";
export const MANIFEST_URL =
  "https://raw.githubusercontent.com/omm-hippo/omm/main/published/arena-leaderboard.manifest.json";

const SUPPORTED_SCHEMA = 2;
const MAX_ARTIFACT_BYTES = 8 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 64 * 1024;
const FETCH_TIMEOUT_MS = 5_000;
const EDGE_CACHE_TTL_SECONDS = 600;

class NotFound extends Error {}

async function boundedBytes(response: Response, limit: number): Promise<Uint8Array> {
  if (response.status === 404) throw new NotFound();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength > limit) throw new Error("too large");
  return buffer;
}

async function get(fetcher: typeof fetch, url: string, limit: number): Promise<Uint8Array> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetcher(url, { cache: "no-store", signal: controller.signal, redirect: "manual" });
    return await boundedBytes(response, limit);
  } finally {
    clearTimeout(timeout);
  }
}

export async function decide(
  raw: Uint8Array,
  manifestRaw: Uint8Array | null,
  publicKey: string,
): Promise<BoardState> {
  let manifest: unknown = null;
  try {
    manifest = manifestRaw ? JSON.parse(new TextDecoder().decode(manifestRaw)) : null;
  } catch {
    manifest = null;
  }
  if (!(await verifySignedArtifact(raw, manifest, publicKey))) {
    return { kind: "error", reason: "verification" };
  }
  let artifact: Record<string, unknown>;
  try {
    artifact = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
  } catch {
    return { kind: "error", reason: "verification" };
  }
  const version = artifact?.schema_version;
  if (typeof version === "number" && version > SUPPORTED_SCHEMA) return { kind: "error", reason: "too_new" };
  if (
    version !== SUPPORTED_SCHEMA ||
    (artifact.status !== "ranked" && artifact.status !== "collecting") ||
    !Array.isArray(artifact.models) ||
    !Array.isArray(artifact.groups)
  ) {
    return { kind: "error", reason: "verification" };
  }
  const typed = artifact as unknown as ArenaArtifact;
  return { kind: typed.status, artifact: typed };
}

type Fetched = { raw: Uint8Array; manifestRaw: Uint8Array | null } | BoardState;

async function fetchPair(
  fetcher: typeof fetch,
  artifactUrl: string,
  manifestUrl: string,
): Promise<Fetched> {
  let raw: Uint8Array;
  try {
    raw = await get(fetcher, artifactUrl, MAX_ARTIFACT_BYTES);
  } catch (error) {
    return error instanceof NotFound ? { kind: "unpublished" } : { kind: "error", reason: "unavailable" };
  }
  try {
    return { raw, manifestRaw: await get(fetcher, manifestUrl, MAX_MANIFEST_BYTES) };
  } catch (error) {
    // A board without its manifest is unverifiable, not missing.
    return error instanceof NotFound ? { raw, manifestRaw: null } : { kind: "error", reason: "unavailable" };
  }
}

export async function loadBoard({
  fetcher = fetch,
  publicKey = ARENA_PUBLIC_KEY,
  artifactUrl = ARTIFACT_URL,
  manifestUrl = MANIFEST_URL,
}: {
  fetcher?: typeof fetch;
  publicKey?: string;
  artifactUrl?: string;
  manifestUrl?: string;
} = {}): Promise<BoardState> {
  const fetched = await fetchPair(fetcher, artifactUrl, manifestUrl);
  if ("kind" in fetched) return fetched;
  return decide(fetched.raw, fetched.manifestRaw, publicKey);
}

export type BoardStore = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

function edgeCache(): BoardStore | null {
  const store = (globalThis as { caches?: { default?: BoardStore } }).caches;
  return store?.default ?? null;
}

async function runAfterResponse(promise: Promise<unknown>): Promise<void> {
  const settled = promise.catch(() => {});
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    getCloudflareContext().ctx.waitUntil(settled);
  } catch {
    await settled;
  }
}

/** Short cache: steady state is one GitHub round trip per colo per TTL. */
const SHORT_KEY = "https://omm.run/__cache/arena-leaderboard-v2";
/** The last pair that verified, kept for a week. Right after a nightly
 *  publish the raw CDN can serve the new artifact next to the old manifest
 *  for a few minutes; that must show yesterday's verified board, not an
 *  error that reads like tampering. */
const LAST_GOOD_KEY = "https://omm.run/__cache/arena-leaderboard-v2-last-good";
const LAST_GOOD_TTL_SECONDS = 7 * 24 * 3600;

type Stored = { artifact: string; manifest: string; at: number };

async function readStored(store: BoardStore, key: string, publicKey: string): Promise<{ state: BoardState; at: number } | null> {
  try {
    const hit = await store.match(new Request(key));
    if (!hit) return null;
    const stored = (await hit.json()) as Stored;
    const encoder = new TextEncoder();
    const state = await decide(encoder.encode(stored.artifact), encoder.encode(stored.manifest), publicKey);
    return state.kind === "error" ? null : { state, at: stored.at };
  } catch {
    // A failed or unverifiable cache read is a miss.
    return null;
  }
}

function storedResponse(raw: Uint8Array, manifestRaw: Uint8Array, at: number, ttl: number): Response {
  const decoder = new TextDecoder();
  const body: Stored = { artifact: decoder.decode(raw), manifest: decoder.decode(manifestRaw), at };
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": `s-maxage=${ttl}` },
  });
}

/**
 * The board for one request, given a cache store. Every cached pair is
 * re-verified on read; unverified bytes are never stored or returned.
 */
export async function resolveBoard({
  fetcher = fetch,
  store,
  publicKey = ARENA_PUBLIC_KEY,
  now = Date.now(),
  defer = (promise: Promise<unknown>) => promise.then(() => {}),
}: {
  fetcher?: typeof fetch;
  store: BoardStore;
  publicKey?: string;
  now?: number;
  defer?: (promise: Promise<unknown>) => Promise<void>;
}): Promise<BoardState> {
  const short = await readStored(store, SHORT_KEY, publicKey);
  if (short && now - short.at < EDGE_CACHE_TTL_SECONDS * 1000) return short.state;

  const lastGood = async (fallback: BoardState) =>
    (await readStored(store, LAST_GOOD_KEY, publicKey))?.state ?? fallback;

  const fetched = await fetchPair(fetcher, ARTIFACT_URL, MANIFEST_URL);
  if ("kind" in fetched) return fetched.kind === "unpublished" ? fetched : lastGood(fetched);
  const state = await decide(fetched.raw, fetched.manifestRaw, publicKey);
  if (state.kind === "error") return state.reason === "verification" ? lastGood(state) : state;
  if (fetched.manifestRaw) {
    await defer(
      Promise.all([
        store.put(new Request(SHORT_KEY), storedResponse(fetched.raw, fetched.manifestRaw, now, EDGE_CACHE_TTL_SECONDS)),
        store.put(new Request(LAST_GOOD_KEY), storedResponse(fetched.raw, fetched.manifestRaw, now, LAST_GOOD_TTL_SECONDS)),
      ]),
    );
  }
  return state;
}

/** Dev-only preview of the signed test fixtures (never in production). */
async function fixtureBoard(): Promise<BoardState | null> {
  const directory = process.env.ARENA_FIXTURE_DIR;
  if (process.env.NODE_ENV === "production" || !directory) return null;
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const name = process.env.ARENA_FIXTURE_NAME === "collecting" ? "collecting" : "ranked";
  const raw = new Uint8Array(await readFile(path.join(directory, `${name}.json`)));
  const manifest = new Uint8Array(await readFile(path.join(directory, `${name}.manifest.json`)));
  const key = (await readFile(path.join(directory, "test-public-key.txt"), "utf8")).trim();
  const state = await decide(raw, manifest, key);
  return state.kind === "ranked" || state.kind === "collecting" ? { ...state, example: true } : state;
}

/** The verified board for this request. `React.cache` dedupes within a render. */
export const fetchBoard = cache(async (): Promise<BoardState> => {
  const fixture = await fixtureBoard();
  if (fixture) return fixture;
  const store = edgeCache();
  if (!store) return loadBoard();
  return resolveBoard({ store, defer: runAfterResponse });
});
