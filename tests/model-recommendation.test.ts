import assert from 'node:assert/strict';
import test from 'node:test';
import { WIKI_MODELS, getWikiModel, localizeModel } from '../src/lib/models/catalog';
import { planningMemory, recommendModels, validateProfile, type HardwareProfile } from '../src/lib/models/recommend';

const pc: HardwareProfile = { system: 'windows', accelerator: 'cpu', ramGB: 16, bits: 4, context: 4096 };

test('rejects incomplete, incompatible and nonfinite hardware instead of inventing specs', () => {
  for (const ramGB of [0, 3, NaN, Infinity, 2049]) assert.ok(validateProfile({ ...pc, ramGB }).includes('ram'));
  assert.ok(validateProfile({ ...pc, accelerator: 'apple' }).includes('accelerator'));
  assert.ok(validateProfile({ ...pc, accelerator: 'nvidia' }).includes('vram'));
  for (const vramGB of [0, NaN, 513]) assert.ok(validateProfile({ ...pc, accelerator: 'amd', vramGB }).includes('vram'));
  assert.ok(validateProfile({ ...pc, diskGB: -1 }).includes('disk'));
  assert.ok(validateProfile({ ...pc, context: 1000 } as unknown as HardwareProfile).includes('context'));
  assert.deepEqual(recommendModels(WIKI_MODELS, { ...pc, ramGB: NaN }), []);
});

test('small RAM never produces a candidate above its reserved memory budget', () => {
  assert.equal(recommendModels(WIKI_MODELS, { ...pc, ramGB: 4 }).length, 0);
  const results = recommendModels(WIKI_MODELS, pc);
  assert.ok(results.length > 0);
  assert.ok(results.every((candidate) => candidate.planningGB <= 12 && candidate.budgetGB === 12 && candidate.route === 'cpu'));
  assert.ok(!results.some((candidate) => candidate.model.id === 'qwen3-coder-next'));
});

test('MoE screening uses total experts, not active parameter size', () => {
  const model = getWikiModel('qwen3-coder-next')!;
  assert.equal(planningMemory(model, pc).weightGB, 48);
  assert.equal(recommendModels([model], { ...pc, accelerator: 'nvidia', vramGB: 12, ramGB: 32 }).length, 0);
});

test('dedicated VRAM is not added to RAM, insufficient VRAM falls back to labelled CPU', () => {
  const model = getWikiModel('qwen3-8b')!;
  const gpu = { ...pc, accelerator: 'nvidia' as const, vramGB: 12, ramGB: 32 };
  assert.equal(recommendModels([model], gpu)[0].route, 'gpu');
  const fallback = recommendModels([model], { ...gpu, vramGB: 4 })[0];
  assert.equal(fallback.route, 'cpu');
  assert.equal(fallback.budgetGB, 24);
  // The combined capacity could fit this model, but neither pool alone can.
  const larger = getWikiModel('qwen3-14b')!;
  assert.deepEqual(recommendModels([larger], { ...gpu, ramGB: 12, vramGB: 8 }), []);
  assert.equal(recommendModels([model], { ...gpu, ramGB: 4 }).length, 0);
});

test('Apple unified memory is counted once and stale VRAM does not enlarge it', () => {
  const apple = { ...pc, system: 'macos' as const, accelerator: 'apple' as const, ramGB: 24 };
  const results = recommendModels(WIKI_MODELS, apple);
  assert.ok(results.length > 0);
  assert.ok(results.every((candidate) => candidate.route === 'unified' && candidate.budgetGB === 18));
  assert.deepEqual(recommendModels(WIKI_MODELS, { ...apple, vramGB: 512 }), results);
});

test('purpose, documented context, precision and disk actually restrict candidates', () => {
  const coding = recommendModels(WIKI_MODELS, { ...pc, task: 'coding' });
  assert.ok(coding.length > 0);
  assert.ok(coding.every((candidate) => candidate.model.tasks.includes('coding')));
  const long = recommendModels(WIKI_MODELS, { ...pc, ramGB: 64, context: 32768 });
  assert.ok(long.every((candidate) => candidate.model.context.tokens >= 32768));
  assert.ok(long.length < recommendModels(WIKI_MODELS, { ...pc, ramGB: 64 }).length);
  const model = getWikiModel('qwen3-8b')!;
  assert.equal(recommendModels([model], pc).length, 1);
  assert.equal(recommendModels([model], { ...pc, bits: 8 }).length, 0);
  assert.deepEqual(recommendModels(WIKI_MODELS, { ...pc, diskGB: 0 }), []);
  const download = planningMemory(model, pc).weightGB * 1.1;
  assert.equal(recommendModels([model], { ...pc, diskGB: download }).length, 1);
  assert.equal(recommendModels([model], { ...pc, diskGB: download - 0.01 }).length, 0);
});

test('memory threshold is inclusive and localization cannot change recommendations', () => {
  const model = getWikiModel('qwen3-8b')!;
  const planning = planningMemory(model, pc).planningGB;
  // At this scale the fixed 4 GB reserve exceeds 25% of total memory.
  assert.equal(recommendModels([model], { ...pc, ramGB: planning + 4 }).length, 1);
  assert.equal(recommendModels([model], { ...pc, ramGB: planning + 4 - 0.01 }).length, 0);
  const ids = recommendModels(WIKI_MODELS, pc).map((candidate) => candidate.model.id);
  for (const locale of ['ko', 'en'] as const) assert.deepEqual(recommendModels(WIKI_MODELS.map((m) => localizeModel(m, locale)), pc).map((c) => c.model.id), ids);
});
