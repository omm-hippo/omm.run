import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../src/app/api/models/route";
import { WIKI_MODELS, getWikiModel, localizeModel } from "../src/lib/models/catalog";
import { rawWeightIllustration } from "../src/lib/models/memory";
import { filterModels } from "../src/lib/models/search";

test("search keeps version numbers separate from parameter-size names", () => {
  for (const query of ["Qwen3.8", "qwen 3.8", "Ｑｗｅｎ３．８", "큐웬 3.8"]) {
    assert.deepEqual(filterModels(WIKI_MODELS, { query }).map((model) => model.id), ["qwen3-8-27b"]);
  }
  assert.deepEqual(filterModels(WIKI_MODELS, { query: "qwen3-8b" }).map((model) => model.id), ["qwen3-8b"]);
  assert.deepEqual(filterModels(WIKI_MODELS, { query: "qwen coder" }).map((model) => model.id), ["qwen3-coder-next", "qwen2-5-coder-7b-instruct", "qwen2-5-coder-32b-instruct"]);
});

test("use case, publisher and image filters intersect instead of widening results", () => {
  assert.deepEqual(filterModels(WIKI_MODELS, { task: "vision", publisher: "Google", visionOnly: true }).map((model) => model.id), ["gemma-3-4b-it", "gemma-3-12b-it", "gemma-3-27b-it", "gemma-4-e4b-it", "gemma-4-31b-it"]);
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
      assert.ok(claim.text.en && claim.text.ko);
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
  assert.equal(data.total, 5);
  const gemma = getWikiModel("gemma-3-4b-it")!;
  assert.deepEqual(data.models[0], localizeModel(gemma, "ko"));
  assert.equal(typeof data.models[0].summary, "string");
  assert.equal(data.models[0].toolCalling, null);
  assert.equal(data.models[0].ommEvaluation, null);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
});

test("API validates inputs and distinguishes no match from unknown checkpoint", async () => {
  for (const query of ["locale=fr", "task=unrecognized", `q=${"a".repeat(161)}`]) {
    assert.equal(GET(new Request(`https://example.test/api/models?${query}`)).status, 400);
  }
  assert.equal(GET(new Request("https://example.test/api/models?id=unknown")).status, 404);
  const empty = await GET(new Request("https://example.test/api/models?q=unknown-checkpoint-12345")).json();
  assert.deepEqual(empty.models, []);
  assert.equal(empty.total, 0);
});

test('wiki coverage has substantive bilingual examples, sources and parameter distinctions', () => {
  assert.equal(WIKI_MODELS.length, 23);
  for (const model of WIKI_MODELS) {
    assert.ok(Number.isFinite(model.parameterScaleB) && model.parameterScaleB > 0, model.id);
    assert.ok(model.strengths.length && model.cautions.length, model.id);
    assert.equal(new Set(model.sources.map((source) => source.id)).size, model.sources.length, model.id);
    for (const locale of ['ko', 'en'] as const) {
      assert.ok(model.example.prompt[locale].length > 30, model.id);
      assert.ok(model.example.check[locale].length > 30, model.id);
      assert.equal(localizeModel(model, locale).example.prompt, model.example.prompt[locale]);
    }
  }
  const gemmaEdge = getWikiModel('gemma-4-e4b-it')!;
  assert.equal(gemmaEdge.parameterScaleB, 8); // E4B is the effective-size name.
  assert.ok(gemmaEdge.inputs.includes('audio'));
  assert.ok(!getWikiModel('gemma-4-31b-it')!.inputs.includes('audio'));
  assert.deepEqual(getWikiModel('gemma-3-1b-it')!.inputs, ['text']);
  assert.notEqual(getWikiModel('gemma-3-4b-it')!.license.label, gemmaEdge.license.label);
  assert.equal(getWikiModel('qwen2-5-coder-7b-instruct')!.context.tokens, 32768);
  assert.equal(getWikiModel('qwen2-5-coder-7b-instruct')!.context.extendedTokens, 131072);
});

test('weight examples use total size and do not substitute active MoE parameters', () => {
  assert.equal(rawWeightIllustration(8.2, 4), 4.1);
  assert.equal(rawWeightIllustration(8.2, 16), 16.4);
  const coder = getWikiModel('qwen3-coder-next')!;
  assert.equal(rawWeightIllustration(coder.parameterScaleB, 4), 40);
  assert.notEqual(rawWeightIllustration(coder.parameterScaleB, 4), rawWeightIllustration(coder.activeParametersB!, 4));
});
