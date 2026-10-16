import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { groupFamily, groupLabel } from "../src/lib/leaderboard/groups";
import { loadBoard, ARTIFACT_URL, MANIFEST_URL } from "../src/lib/leaderboard/source";
import { ARENA_PUBLIC_KEY, verifySignedArtifact } from "../src/lib/leaderboard/verify";

const FIXTURES = path.join(__dirname, "fixtures", "leaderboard");
const TEST_KEY = readFileSync(path.join(FIXTURES, "test-public-key.txt"), "utf8").trim();

function fixture(name: "ranked" | "collecting") {
  return {
    raw: new Uint8Array(readFileSync(path.join(FIXTURES, `${name}.json`))),
    manifest: JSON.parse(readFileSync(path.join(FIXTURES, `${name}.manifest.json`), "utf8")),
  };
}

function served(table: Record<string, Response | Error>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const value = table[String(input)];
    if (value === undefined || value instanceof Error) throw value ?? new Error("offline");
    return value.clone();
  }) as typeof fetch;
}

function publish(raw: Uint8Array, manifest: unknown) {
  return {
    [ARTIFACT_URL]: new Response(raw as BodyInit),
    [MANIFEST_URL]: new Response(JSON.stringify(manifest)),
  };
}

test("the production key is omm's catalog_public_key", () => {
  assert.equal(ARENA_PUBLIC_KEY, "p8uo6GFXDcg8Rp7/t8GGl5hwPsXhObY5vI1sll5KpaI=");
});

test("a signed fixture verifies; a flipped byte or a wrong hash does not", async () => {
  const { raw, manifest } = fixture("ranked");
  assert.equal(await verifySignedArtifact(raw, manifest, TEST_KEY), true);
  const flipped = raw.slice();
  flipped[10] ^= 1;
  assert.equal(await verifySignedArtifact(flipped, manifest, TEST_KEY), false);
  assert.equal(
    await verifySignedArtifact(raw, { ...manifest, artifact_sha256: "0".repeat(64) }, TEST_KEY),
    false,
  );
  assert.equal(await verifySignedArtifact(raw, manifest, ARENA_PUBLIC_KEY), false);
  assert.equal(await verifySignedArtifact(raw, { schema_version: 2 }, TEST_KEY), false);
});

test("a ranked board loads", async () => {
  const { raw, manifest } = fixture("ranked");
  const state = await loadBoard({ fetcher: served(publish(raw, manifest)), publicKey: TEST_KEY });
  assert.equal(state.kind, "ranked");
  if (state.kind === "ranked") {
    assert.equal(state.artifact.schema_version, 2);
    assert.ok(state.artifact.groups.length >= 2);
  }
});

test("a collecting board loads as collecting", async () => {
  const { raw, manifest } = fixture("collecting");
  const state = await loadBoard({ fetcher: served(publish(raw, manifest)), publicKey: TEST_KEY });
  assert.equal(state.kind, "collecting");
});

test("a 404 means nothing is published yet", async () => {
  const state = await loadBoard({
    fetcher: served({ [ARTIFACT_URL]: new Response("404: Not Found", { status: 404 }) }),
    publicKey: TEST_KEY,
  });
  assert.deepEqual(state, { kind: "unpublished" });
});

test("a tampered artifact is an error state, never data", async () => {
  const { raw, manifest } = fixture("ranked");
  const tampered = new TextEncoder().encode(
    new TextDecoder().decode(raw).replace('"ranked"', '"rankeD"'),
  );
  const state = await loadBoard({ fetcher: served(publish(tampered, manifest)), publicKey: TEST_KEY });
  assert.deepEqual(state, { kind: "error", reason: "verification" });
});

test("a missing manifest is a verification error", async () => {
  const { raw } = fixture("ranked");
  const state = await loadBoard({
    fetcher: served({
      [ARTIFACT_URL]: new Response(raw as BodyInit),
      [MANIFEST_URL]: new Response("", { status: 404 }),
    }),
    publicKey: TEST_KEY,
  });
  assert.deepEqual(state, { kind: "error", reason: "verification" });
});

test("a network failure is unavailable", async () => {
  const state = await loadBoard({ fetcher: served({}), publicKey: TEST_KEY });
  assert.deepEqual(state, { kind: "error", reason: "unavailable" });
});

test("a newer signed schema is too_new", async () => {
  const { createHash, generateKeyPairSync, sign } = await import("node:crypto");
  const pair = generateKeyPairSync("ed25519");
  const raw = new TextEncoder().encode(JSON.stringify({ schema_version: 3, status: "ranked" }));
  const manifest = {
    schema_version: 1,
    artifact_sha256: createHash("sha256").update(raw).digest("hex"),
    signature: sign(null, raw, pair.privateKey).toString("base64"),
  };
  const key = pair.publicKey.export({ format: "der", type: "spki" }).subarray(-32).toString("base64");
  const state = await loadBoard({ fetcher: served(publish(raw, manifest)), publicKey: key });
  assert.deepEqual(state, { kind: "error", reason: "too_new" });
});

test("group labels mirror omm's memory_group.display_label", () => {
  assert.equal(groupLabel("overall", "ko"), "전체");
  assert.equal(groupLabel("overall", "en"), "All machines");
  assert.equal(groupLabel("unified:16", "ko"), "Mac · 통합 메모리 16GB");
  assert.equal(groupLabel("unified:18-24", "en"), "Mac · unified memory 18–24GB");
  assert.equal(groupLabel("vram:20-24", "ko"), "PC · GPU VRAM 20–24GB");
  assert.equal(groupLabel("vram:0-6", "en"), "PC · GPU VRAM ≤6GB");
  assert.equal(groupLabel("cpu:64+", "ko"), "CPU 전용 · RAM 64GB+");
  assert.equal(groupLabel("vram:7", "en"), "vram:7");
  assert.equal(groupFamily("unified:16"), "unified");
  assert.equal(groupFamily("vram:7"), "unknown");
});

test("a live signature failure falls back to the last verified copy in the store", async () => {
  const { resolveBoard } = await import("../src/lib/leaderboard/source");
  const { raw, manifest } = fixture("ranked");
  const entries = new Map<string, Response>();
  const store = {
    match: async (request: Request) => entries.get(request.url)?.clone(),
    put: async (request: Request, response: Response) => void entries.set(request.url, response),
  };
  const good = await resolveBoard({ fetcher: served(publish(raw, manifest)), store, publicKey: TEST_KEY, now: 0 });
  assert.equal(good.kind, "ranked");
  const tampered = new TextEncoder().encode(new TextDecoder().decode(raw).replace('"ranked"', '"rankeD"'));
  // Past the short cache: the live pair is fetched again and fails.
  const later = await resolveBoard({ fetcher: served(publish(tampered, manifest)), store, publicKey: TEST_KEY, now: 3_600_000 });
  assert.equal(later.kind, "ranked");
  const empty = { match: async () => undefined, put: async () => {} };
  const none = await resolveBoard({ fetcher: served(publish(tampered, manifest)), store: empty, publicKey: TEST_KEY, now: 0 });
  assert.deepEqual(none, { kind: "error", reason: "verification" });
});

test("a short-cache hit that no longer verifies is a miss", async () => {
  const { resolveBoard } = await import("../src/lib/leaderboard/source");
  const { raw, manifest } = fixture("ranked");
  const entries = new Map<string, Response>();
  const store = {
    match: async (request: Request) => entries.get(request.url)?.clone(),
    put: async (request: Request, response: Response) => void entries.set(request.url, response),
  };
  await resolveBoard({ fetcher: served(publish(raw, manifest)), store, publicKey: TEST_KEY, now: 0 });
  for (const [url, response] of entries) {
    const body = (await response.clone().text()).replace("ranked", "rankeD");
    entries.set(url, new Response(body));
  }
  const state = await resolveBoard({ fetcher: served({}), store, publicKey: TEST_KEY, now: 1000 });
  assert.deepEqual(state, { kind: "error", reason: "unavailable" });
});
