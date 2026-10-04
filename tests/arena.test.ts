import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";
import { loadLeaderboard, orderedModels, parseLeaderboard, verifyLeaderboard } from "../src/lib/arena/leaderboard";

function model(key: string, component = 0, rating = 0, tier: number | null = 1) {
  return { key: `filename:${key}`, display_filename: `${key}.gguf`, repo_id: `test/${key}`, provider: "huggingface", quant_bits: 4,
    battles: 40, effective_battles: 30, provisional: tier === null, quality_warning: false, both_bad_rate: 0.1,
    quality: { tier, strength: 1, ci_low: 0.8, ci_high: 1.2 }, efficiency: { component, rating, raw_median_tok_s_per_gb: 10 } };
}
function document() {
  return { schema_version: 1, generated_at: "2026-10-03T00:00:00+00:00", corpus: { rows_used: 300, effective_votes: 250, client_count: 20, largest_client_share: 0.1 },
    models: [model("a", 0, 1), model("b", 1, 1000), model("c", 0, 2), model("d", 0, 0, null)] };
}
function signed() {
  const pair = generateKeyPairSync("ed25519");
  const content = new TextEncoder().encode(JSON.stringify(document()));
  const manifest = { schema_version: 1, artifact_sha256: createHash("sha256").update(content).digest("hex"), signature: sign(null, content, pair.privateKey).toString("base64") };
  const publicKey = pair.publicKey.export({ format: "der", type: "spki" }).subarray(-32).toString("base64");
  return { content, manifest, publicKey };
}
test("signed artifact is verified and unrelated efficiency groups do not share a rank", async () => {
  const fixture = signed();
  const data = await verifyLeaderboard(fixture.content, fixture.manifest, fixture.publicKey);
  assert.deepEqual(orderedModels(data.models).map((model) => model.key), ["filename:c", "filename:a", "filename:b", "filename:d"]);
});
test("tampering and a different trusted key fail closed", async () => {
  const fixture = signed();
  await assert.rejects(verifyLeaderboard(new TextEncoder().encode(new TextDecoder().decode(fixture.content) + " "), fixture.manifest, fixture.publicKey));
  await assert.rejects(verifyLeaderboard(fixture.content, fixture.manifest, signed().publicKey));
});
test("invalid or contradictory ranking fields are rejected", () => {
  const data = document();
  data.models[0].provisional = true;
  assert.throws(() => parseLeaderboard(data));
  data.models[0].provisional = false;
  data.models[0].quality.ci_high = 0;
  assert.throws(() => parseLeaderboard(data));
});
test("producer log-strengths and intervals may be negative", () => {
  const data = document();
  data.models[0].quality = { tier: 1, strength: -1.4, ci_low: -2, ci_high: -0.8 };
  assert.equal(parseLeaderboard(data).models[0].quality.ci_low, -2);
});
test("missing published artifact has an explicit state and needs one request", async () => {
  let calls = 0;
  const fetcher = (async () => { calls++; return new Response(null, { status: 404 }); }) as typeof fetch;
  assert.deepEqual(await loadLeaderboard(fetcher), { status: "unavailable" });
  assert.equal(calls, 1);
});
test("fetch path verifies the same bytes it returns to the UI", async () => {
  const fixture = signed();
  const fetcher = (async (url) => new Response(String(url).endsWith("manifest.json") ? JSON.stringify(fixture.manifest) : fixture.content)) as typeof fetch;
  const state = await loadLeaderboard(fetcher, "https://example.test/", fixture.publicKey, true);
  assert.equal(state.status, "available");
  if (state.status === "available") {
    assert.equal(state.verified, true);
    assert.equal(state.testData, true);
    assert.equal(state.data.models.length, 4);
  }
});
test("a signed response outside the data contract never becomes a ranking", async () => {
  const fixture = signed();
  fixture.manifest.signature = "AA==";
  const fetcher = (async (url) => new Response(String(url).endsWith("manifest.json") ? JSON.stringify(fixture.manifest) : fixture.content)) as typeof fetch;
  assert.deepEqual(await loadLeaderboard(fetcher, "https://example.test/", fixture.publicKey), { status: "invalid" });
});
test("response body cap is applied while reading", async () => {
  const fetcher = (async () => new Response(new Uint8Array(4 * 1024 * 1024 + 1))) as typeof fetch;
  assert.deepEqual(await loadLeaderboard(fetcher), { status: "error" });
});
