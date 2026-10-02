import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../src/app/api/models/route";
import { WIKI_MODELS, getWikiModel, localizeModel } from "../src/lib/models/catalog";
import { filterModels } from "../src/lib/models/search";

test("search keeps version numbers separate from parameter-size names", () => {
  for (const query of ["Qwen3.8", "qwen 3.8", "Ｑｗｅｎ３．８", "큐웬 3.8"]) {
    assert.deepEqual(filterModels(WIKI_MODELS, { query }).map((model) => model.id), ["qwen3-8-27b"]);
  }
  assert.deepEqual(filterModels(WIKI_MODELS, { query: "qwen3-8b" }).map((model) => model.id), ["qwen3-8b"]);
  assert.deepEqual(filterModels(WIKI_MODELS, { query: "qwen coder" }).map((model) => model.id), ["qwen3-coder-next"]);
});

test("use case, publisher and image filters intersect instead of widening results", () => {
  assert.deepEqual(filterModels(WIKI_MODELS, { task: "vision", publisher: "Google", visionOnly: true }).map((model) => model.id), ["gemma-3-4b-it"]);
  assert.equal(filterModels(WIKI_MODELS, { task: "compact", publisher: "Z.ai" }).length, 0);
  assert.equal(filterModels(WIKI_MODELS, { query: "<script>unknown</script>" }).length, 0);
  assert.ok(filterModels(WIKI_MODELS, { query: "수학" }).length > 0);
});

test("every checkpoint has resolvable primary evidence and no invented OMM score", () => {
  assert.equal(new Set(WIKI_MODELS.map((model) => model.id)).size, WIKI_MODELS.length);
  for (const model of WIKI_MODELS) {
    assert.match(model.id, /^[a-z0-9-]+$/); // Dotted slugs bypass the site's locale rewrite.
    assert.equal(model.ommEvaluation, null);
    assert.ok(model.sources.length > 0);
    assert.ok(model.sources.some((source) => source.id === model.context.sourceId));
    for (const claim of [...model.strengths, ...model.cautions]) {
      assert.ok(claim.text.ko);
      if (claim.basis === "publisher") assert.ok(model.sources.some((source) => source.id === claim.sourceId));
    }
    for (const source of model.sources) {
      assert.equal(new URL(source.url).protocol, "https:");
      assert.match(source.accessedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
  assert.equal(getWikiModel("unknown"), undefined);
});

test("native and configured contexts, distills and MoE sizes remain checkpoint-specific", () => {
  assert.equal(getWikiModel("qwen3-8b")?.context.tokens, 32768);
  assert.equal(getWikiModel("qwen3-8b")?.context.extendedTokens, 131072);
  assert.equal(getWikiModel("qwen3-coder-next")?.sizeLabel, "80B");
  assert.equal(getWikiModel("qwen3-coder-next")?.activeParametersB, 3);
  assert.equal(getWikiModel("deepseek-r1-distill-qwen-7b")?.context.basis, "config");
  assert.equal(getWikiModel("deepseek-r1-distill-qwen-7b")?.toolCalling, null);
});

test("localized UI projection and API describe the same checkpoints and provenance", async () => {
  const response = GET(new Request("https://example.test/api/models?locale=ko&task=vision&q=gemma"));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.locale, "ko");
  assert.equal(data.total, 1);
  const gemma = getWikiModel("gemma-3-4b-it")!;
  assert.deepEqual(data.models[0], localizeModel(gemma, "ko"));
  assert.equal(typeof data.models[0].summary, "string");
  assert.equal(data.models[0].toolCalling, null);
  assert.equal(data.models[0].ommEvaluation, null);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
});

test("API validates inputs and distinguishes no match from unknown checkpoint", async () => {
  for (const query of ["locale=en", "locale=fr", "task=unrecognized", `q=${"a".repeat(161)}`]) {
    assert.equal(GET(new Request(`https://example.test/api/models?${query}`)).status, 400);
  }
  assert.equal(GET(new Request("https://example.test/api/models?id=unknown")).status, 404);
  const empty = await GET(new Request("https://example.test/api/models?q=unknown-checkpoint-12345")).json();
  assert.deepEqual(empty.models, []);
  assert.equal(empty.total, 0);
});
