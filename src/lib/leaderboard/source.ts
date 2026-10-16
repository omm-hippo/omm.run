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

type EdgeCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

function edgeCache(): EdgeCache | null {
  const store = (globalThis as { caches?: { default?: EdgeCache } }).caches;
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

const CACHE_KEY = "https://omm.run/__cache/arena-leaderboard-v2";

/** The verified board for this request. `React.cache` dedupes within a render. */
export const fetchBoard = cache(async (): Promise<BoardState> => {
  const fixture = await fixtureBoard();
  if (fixture) return fixture;

  const store = edgeCache();
  const key = new Request(CACHE_KEY);
  if (store) {
    try {
      const hit = await store.match(key);
      if (hit) {
        const { artifact, manifest } = (await hit.json()) as { artifact: string; manifest: string };
        const encoder = new TextEncoder();
        const state = await decide(encoder.encode(artifact), encoder.encode(manifest), ARENA_PUBLIC_KEY);
        if (state.kind !== "error") return state;
      }
    } catch {
      // A failed or unverifiable cache read is a miss.
    }
  }

  const fetched = await fetchPair(fetch, ARTIFACT_URL, MANIFEST_URL);
  if ("kind" in fetched) return fetched;
  const { raw, manifestRaw } = fetched;
  const state = await decide(raw, manifestRaw, ARENA_PUBLIC_KEY);
  if (store && state.kind !== "error" && manifestRaw) {
    const decoder = new TextDecoder();
    const entry = new Response(
      JSON.stringify({ artifact: decoder.decode(raw), manifest: decoder.decode(manifestRaw) }),
      { headers: { "content-type": "application/json", "cache-control": `s-maxage=${EDGE_CACHE_TTL_SECONDS}` } },
    );
    await runAfterResponse(store.put(key, entry));
  }
  return state;
});
