/**
 * Live accuracy check for the OMM assistant against real Workers AI.
 *
 *   npx tsx scripts/assistant-eval.ts --mode narrowed --limit 2
 *   npx tsx scripts/assistant-eval.ts --mode hybrid
 *
 * COSTS MONEY: every question is one Workers AI call billed to the account in
 * wrangler.jsonc, sharing the daily free allocation with production traffic.
 * It needs `wrangler login`. It reads tests/fixtures/assistant-eval.json and
 * never touches the D1 budget, the cache, or the deployed Worker.
 *
 * Modes:
 *   narrowed — the previous production path: only the token-overlap
 *              ranker's top 8 (with context) reach the model.
 *   hybrid   — the production path (`modelCandidates`): every command's
 *              summary, context on the ranker's top few.
 */

import { getPlatformProxy } from "wrangler";

import fixture from "../tests/fixtures/assistant-eval.json";
import {
  explicitCommand,
  modelCandidates,
  narrowCandidates,
} from "../src/lib/assistant/knowledge";
import type { Candidate } from "../src/lib/assistant/types";
import {
  DEFAULT_WORKERS_AI_MODEL,
  buildWorkersAiInput,
  parseWorkersAiSelection,
  type WorkersAiBinding,
} from "../src/lib/assistant/workers-ai";

type Mode = "narrowed" | "hybrid";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const mode = (arg("mode") ?? "narrowed") as Mode;
if (mode !== "narrowed" && mode !== "hybrid") throw new Error(`unknown --mode ${mode}`);
const limit = Number(arg("limit") ?? fixture.questions.length);
const model = arg("model") ?? DEFAULT_WORKERS_AI_MODEL;

function candidatesFor(question: string, locale: "en" | "ko"): readonly Candidate[] {
  const narrowed = narrowCandidates(question, locale);
  return mode === "narrowed" ? narrowed : modelCandidates(narrowed, locale);
}

async function main(): Promise<void> {
  const proxy = await getPlatformProxy<{ AI: WorkersAiBinding }>();
  const ai = proxy.env.AI;

  let correct = 0;
  let clarified = 0;
  let promptTokens = 0;
  const rows: string[] = [];

  for (const { q, locale, accept } of fixture.questions.slice(0, limit)) {
    const loc = locale as "en" | "ko";
    let picked: string;

    const explicit = explicitCommand(q);
    const candidates = candidatesFor(q, loc);
    if (explicit) {
      picked = explicit;
    } else if (candidates.length === 0) {
      picked = "(no candidates)";
    } else {
      const output = (await ai.run(model, buildWorkersAiInput(loc, q, candidates))) as {
        usage?: { prompt_tokens?: number };
      };
      promptTokens += output?.usage?.prompt_tokens ?? 0;
      const selection = parseWorkersAiSelection(
        output,
        candidates.map(({ id }) => id),
      );
      picked = selection
        ? selection.action === "clarify"
          ? "(clarify)"
          : selection.commandId
        : "(invalid)";
    }

    const ok = accept.includes(picked);
    if (ok) correct += 1;
    if (picked === "(clarify)") clarified += 1;
    rows.push(`${ok ? "OK  " : "MISS"} ${accept.join("/").padEnd(14)} ${picked.padEnd(16)} ${q}`);
  }

  await proxy.dispose();

  const asked = Math.min(limit, fixture.questions.length);
  console.log(rows.join("\n"));
  console.log(
    `\nmode=${mode} model=${model}\naccuracy ${correct}/${asked}  clarify ${clarified}  prompt_tokens total ${promptTokens}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
