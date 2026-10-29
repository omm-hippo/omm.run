import type { AssistantStore } from "./budget";
import type { CommandId } from "./catalog";
import {
  explicitCommand,
  modelCandidates,
  narrowCandidates,
  needsOpenAiModelClarification,
} from "./knowledge";
import { inspectInput, privateHash } from "./security";
import {
  ASSISTANT_LIMITS,
  type AssistantReason,
  type Candidate,
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
  /** The school-PC Ollama gateway; tried before Workers AI when present. */
  readonly gateway?: { readonly binding: WorkersAiBinding; readonly model: string };
  readonly store?: AssistantStore;
  readonly model?: string;
  readonly hashSalt?: string;
  readonly clientIdentity: string;
  readonly now?: number;
};

function response(
  kind: AssistantResponse["kind"],
  reason: AssistantReason,
  candidateIds: readonly CommandId[],
  commandId: CommandId | null = null,
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
  candidates: readonly CommandId[],
  source: AssistantResponse["source"],
): AssistantResponse {
  if (selection.action === "command") {
    // The ranker's list is only worth showing as "related" when it agreed
    // with the model; otherwise it is the noise the model just overruled.
    const related = candidates.includes(selection.commandId) ? candidates : [];
    return response("command", "matched", related, selection.commandId, source);
  }
  return response("clarify", "ambiguous", candidates, null, source);
}

function isConfident([top, next]: readonly Candidate[]): boolean {
  return (
    top !== undefined &&
    top.score >= ASSISTANT_LIMITS.confidentScore &&
    top.score >= ASSISTANT_LIMITS.confidentMargin * (next?.score ?? 0)
  );
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

  // Deictic help questions can use a validated command-page context. Safety
  // checks above still run first; unrelated questions never inherit the page.
  if (request.contextCommand && /^(?:(?:이거|이것|이\s*명령어|이\s*명령|이\s*옵션)(?:는|은|을|를)?\s*(?:뭐야|뭔가요|무슨.{0,30}|어떻게.{0,30}|설명.{0,20}|사용법.{0,20}|주의할.{0,20})|what does this(?: command)? do|how do i use this(?: command)?|explain this(?: command)?|what is this(?: command)?)[?.! ]*$/iu.test(request.question.trim())) {
    return response("command", "matched", [request.contextCommand], request.contextCommand);
  }
  const explicit = explicitCommand(request.question);
  if (explicit) return response("command", "matched", [explicit], explicit);
  // A strong intent rule is answered instantly, without spending inference.
  if (isConfident(candidates)) {
    return response("command", "matched", [candidates[0].id], candidates[0].id);
  }
  // Nothing to read at all (punctuation, emoji): no inference either. A real
  // question the ranker found no words for still goes to the model, which
  // sees every command — that was the "how fast is my model" miss.
  if (!/[\p{L}\p{N}]/u.test(request.question)) {
    return response("fallback", "no_match", []);
  }
  // The ranker only orders and details the list; the model sees every command.
  const offered = modelCandidates(candidates, request.locale);
  const offeredIds = offered.map(({ id }) => id);

  const { ai, gateway, store, hashSalt } = dependencies;
  const model = resolveWorkersAiModel(dependencies.model);
  const providers: {
    readonly binding: WorkersAiBinding;
    readonly model: string;
    readonly source: AssistantResponse["source"];
  }[] = [];
  if (gateway) providers.push({ ...gateway, source: "self-hosted" });
  if (ai && model) providers.push({ binding: ai, model, source: "workers-ai" });
  if (providers.length === 0 || !store || !hashSalt || hashSalt.length < 16) {
    return response("fallback", "not_configured", candidateIds);
  }

  const now = dependencies.now ?? Math.floor(Date.now() / 1_000);
  const questionHash = await privateHash(
    hashSalt,
    `${ASSISTANT_LIMITS.cacheNamespace}\u0000${request.locale}\u0000${request.question}`,
  );

  try {
    const cached = await store.getSelection(questionHash, now);
    if (
      cached &&
      (cached.action === "clarify" || offeredIds.includes(cached.commandId))
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

  // One attempt per provider, no retries: the school PC first, then Workers
  // AI if it is off, asleep or too slow. The daily cap counts the question
  // once whichever provider answers it.
  let inference: Awaited<ReturnType<typeof selectWithWorkersAi>> = {
    ok: false,
    reason: "provider_unavailable",
  };
  let source: AssistantResponse["source"] = "workers-ai";
  for (const [index, provider] of providers.entries()) {
    const timeoutMs =
      provider.source === "self-hosted"
        ? ASSISTANT_LIMITS.gatewayTimeoutMs
        : index > 0
          ? ASSISTANT_LIMITS.fallbackInferenceTimeoutMs
          : ASSISTANT_LIMITS.inferenceTimeoutMs;
    inference = await selectWithWorkersAi(
      provider.binding,
      provider.model,
      request.locale,
      request.question,
      offered,
      timeoutMs,
    );
    source = provider.source;
    if (inference.ok) break;
  }
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
  return fromSelection(selection, candidateIds, source);
}
