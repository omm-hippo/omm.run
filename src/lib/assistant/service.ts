import type { Slug } from "../../i18n/commands/base";
import type { AssistantStore } from "./budget";
import {
  explicitCommand,
  narrowCandidates,
  needsOpenAiModelClarification,
} from "./knowledge";
import { inspectInput, privateHash } from "./security";
import {
  ASSISTANT_LIMITS,
  type AssistantReason,
  type AssistantRequest,
  type AssistantResponse,
  type ModelSelection,
} from "./types";
import {
  resolveWorkersAiModel,
  selectWithWorkersAi,
  type WorkersAiBinding,
} from "./workers-ai";

export type AssistantDependencies = {
  readonly ai?: WorkersAiBinding;
  readonly store?: AssistantStore;
  readonly model?: string;
  readonly hashSalt?: string;
  readonly clientIdentity: string;
  readonly now?: number;
};

function response(
  kind: AssistantResponse["kind"],
  reason: AssistantReason,
  candidateIds: readonly Slug[],
  commandId: Slug | null = null,
  source: AssistantResponse["source"] = "deterministic",
): AssistantResponse {
  return {
    kind,
    source,
    reason,
    commandId,
    candidateIds: candidateIds.slice(0, ASSISTANT_LIMITS.maxSuggestions),
  };
}

function fromSelection(
  selection: ModelSelection,
  candidates: readonly Slug[],
  source: AssistantResponse["source"],
): AssistantResponse {
  if (selection.action === "command") {
    return response("command", "matched", candidates, selection.commandId, source);
  }
  return response("clarify", "ambiguous", candidates, null, source);
}

function utcDay(now: number): string {
  return new Date(now * 1_000).toISOString().slice(0, 10);
}

function nextUtcDay(now: number): number {
  const date = new Date(now * 1_000);
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
  ) / 1_000;
}

export async function answerAssistantQuestion(
  request: AssistantRequest,
  dependencies: AssistantDependencies,
): Promise<AssistantResponse> {
  const candidates = narrowCandidates(request.question, request.locale);
  const candidateIds = candidates.map(({ id }) => id);
  const safety = inspectInput(request.question);

  if (safety === "sensitive") {
    return response("fallback", "sensitive_input", candidateIds);
  }
  if (safety === "url") {
    return response("fallback", "unsafe_input", candidateIds);
  }
  if (needsOpenAiModelClarification(request.question)) {
    return response(
      "clarify",
      "openai_model_ambiguous",
      ["search", "install"],
    );
  }

  const explicit = explicitCommand(request.question);
  if (explicit) return response("command", "matched", [explicit], explicit);
  if (candidates.length === 0) return response("fallback", "no_match", []);

  const { ai, store, hashSalt } = dependencies;
  const model = resolveWorkersAiModel(dependencies.model);
  if (!ai || !store || !hashSalt || hashSalt.length < 16 || !model) {
    return response("fallback", "not_configured", candidateIds);
  }

  const now = dependencies.now ?? Math.floor(Date.now() / 1_000);
  const questionHash = await privateHash(
    hashSalt,
    `${request.locale}\u0000${request.question}`,
  );

  try {
    const cached = await store.getSelection(questionHash, now);
    if (
      cached &&
      (cached.action === "clarify" || candidateIds.includes(cached.commandId))
    ) {
      return fromSelection(cached, candidateIds, "deterministic");
    }

    const clientHash = await privateHash(hashSalt, dependencies.clientIdentity);
    const window = Math.floor(now / ASSISTANT_LIMITS.clientWindowSeconds);
    const windowExpires = (window + 1) * ASSISTANT_LIMITS.clientWindowSeconds;
    const withinClientLimit = await store.consume(
      `client:${window}:${clientHash}`,
      ASSISTANT_LIMITS.clientRequestsPerWindow,
      windowExpires,
      now,
    );
    if (!withinClientLimit) return response("fallback", "rate_limited", candidateIds);

    const withinDailyLimit = await store.consume(
      `daily:${utcDay(now)}`,
      ASSISTANT_LIMITS.dailyRequests,
      nextUtcDay(now),
      now,
    );
    if (!withinDailyLimit) return response("fallback", "daily_cap", candidateIds);
  } catch {
    return response("fallback", "not_configured", candidateIds);
  }

  const inference = await selectWithWorkersAi(
    ai,
    model,
    request.locale,
    request.question,
    candidates,
  );
  if (!inference.ok) return response("fallback", inference.reason, candidateIds);
  const { selection } = inference;

  try {
    await store.putSelection(
      questionHash,
      selection,
      now + ASSISTANT_LIMITS.cacheSeconds,
    );
  } catch {
    // Cache failure must not change a validated, already-computed selection.
  }
  return fromSelection(selection, candidateIds, "workers-ai");
}
