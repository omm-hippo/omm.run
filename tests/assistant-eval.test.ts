import assert from "node:assert/strict";
import test from "node:test";

import fixture from "./fixtures/assistant-eval.json";
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
