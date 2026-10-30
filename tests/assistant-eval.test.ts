import assert from "node:assert/strict";
import test from "node:test";

import fixture from "./fixtures/assistant-eval.json";
import paraphraseFixture from "./fixtures/assistant-paraphrase.json";
import { isCommandId } from "../src/lib/assistant/catalog";
import {
  modelCandidates,
  narrowCandidates,
} from "../src/lib/assistant/knowledge";
import { ASSISTANT_LIMITS } from "../src/lib/assistant/types";

type Question = { readonly locale: "en" | "ko"; readonly q: string; readonly accept: readonly string[] };
const QUESTIONS = fixture.questions as readonly Question[];

/**
 * The deterministic ranker's recall on the held-out set, measured 2026-10-17:
 * 38 of 51. This is a floor against regressions, not a target — the ranker's
 * misses are why the model now sees every command (`modelCandidates`). Live
 * model accuracy is `scripts/assistant-eval.ts`, which costs Workers AI calls.
 */
const RANKER_RECALL_FLOOR = 38;

test("every eval question accepts only real, selectable commands", () => {
  assert.ok(QUESTIONS.length >= 50);
  for (const { q, locale, accept } of QUESTIONS) {
    assert.ok(locale === "en" || locale === "ko", q);
    assert.ok(accept.length > 0, q);
    for (const id of accept) assert.ok(isCommandId(id), `${q}: ${id} is not a command`);
  }
});

test("the ranker's recall on the eval set does not regress", () => {
  const hits = QUESTIONS.filter(({ q, locale, accept }) =>
    narrowCandidates(q, locale).some(({ id }) => accept.includes(id)),
  ).length;
  assert.ok(
    hits >= RANKER_RECALL_FLOOR,
    `ranker recall ${hits}/${QUESTIONS.length} fell below ${RANKER_RECALL_FLOOR}`,
  );
});

test("the model always sees the accepted command, with context only on the top few", () => {
  for (const { q, locale, accept } of QUESTIONS) {
    const candidates = modelCandidates(narrowCandidates(q, locale), locale);
    assert.ok(
      candidates.some(({ id }) => accept.includes(id)),
      `${q}: accepted command missing from the model's list`,
    );
    assert.equal(new Set(candidates.map(({ id }) => id)).size, candidates.length, q);
    const detailed = candidates.filter(({ context }) => context.length > 0).length;
    assert.ok(detailed <= ASSISTANT_LIMITS.detailedCandidates, q);
  }
});

// This fixed development/regression set was inspected while improving the
// ranker. It is not a held-out estimate of Workers AI or a local model.
test("the first three deterministic suggestions retain regression-set coverage", () => {
  for (const {q,locale,accept} of QUESTIONS) {
    assert.ok(narrowCandidates(q,locale).slice(0,3).some(({id}) => accept.includes(id)), q);
  }
});

const PARAPHRASES = paraphraseFixture.questions as readonly Question[];

/**
 * Short everyday paraphrases, measured 2026-10-29: top-1 went from 32/52 to
 * 52/52 after the intent rules for them were added. Tuned on this set, so
 * it guards against regressions only; 20 fresh questions written after the
 * tuning went from 10/20 to 12/20, which is why the model still decides
 * whenever the ranker is not confident.
 */
const PARAPHRASE_TOP1_FLOOR = 50;

test("every paraphrase question accepts only real, selectable commands", () => {
  assert.ok(PARAPHRASES.length >= 50);
  for (const { q, accept } of PARAPHRASES) {
    for (const id of accept) assert.ok(isCommandId(id), `${q}: ${id} is not a command`);
  }
});

test("the ranker's first pick on the paraphrase set does not regress", () => {
  const misses = PARAPHRASES.filter(
    ({ q, locale, accept }) => !accept.includes(narrowCandidates(q, locale)[0]?.id ?? ""),
  );
  assert.ok(
    PARAPHRASES.length - misses.length >= PARAPHRASE_TOP1_FLOOR,
    `misses: ${misses.map(({ q }) => q).join(" | ")}`,
  );
});
