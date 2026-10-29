import { isLocale as isSiteLocale, type Locale } from "../../i18n/config";
import type { CommandId } from "./catalog";

export const ASSISTANT_LIMITS = {
  maxBodyCharacters: 2_048,
  minQuestionCharacters: 1,
  maxQuestionCharacters: 480,
  maxTurns: 3,
  maxCandidates: 8,
  detailedCandidates: 4,
  maxSuggestions: 3,
  maxCompletionTokens: 48,
  inferenceTimeoutMs: 5_000,
  /** School-PC gateway first, then Workers AI with what is left of the
   *  browser's 7-second budget. */
  gatewayTimeoutMs: 2_500,
  fallbackInferenceTimeoutMs: 3_500,
  /** An intent rule this strong, and this far ahead of the runner-up, was
   *  right on every regression and fresh question (2026-10-29), so the model
   *  is skipped for an instant answer. */
  confidentScore: 200,
  confidentMargin: 2,
  clientWindowSeconds: 10 * 60,
  clientRequestsPerWindow: 10,
  dailyRequests: 200,
  cacheSeconds: 15 * 60,
  cacheNamespace: "assistant-v5",
} as const;

export type AssistantSource = "workers-ai" | "self-hosted" | "deterministic";
export type AssistantKind = "command" | "clarify" | "fallback";
export type AssistantReason =
  | "matched"
  | "ambiguous"
  | "no_match"
  | "sensitive_input"
  | "unsafe_input"
  | "openai_model_ambiguous"
  | "rate_limited"
  | "daily_cap"
  | "not_configured"
  | "provider_unavailable"
  | "invalid_response"
  | "invalid_request";

export type AssistantRequest = {
  readonly locale: Locale;
  readonly question: string;
  /** Zero-based count of prior questions in this browser session. */
  readonly turnCount: number;
  /** Validated static command ID, never a page URL or page text. */
  readonly contextCommand?: CommandId;
};

export type AssistantResponse = {
  readonly kind: AssistantKind;
  readonly source: AssistantSource;
  readonly reason: AssistantReason;
  readonly commandId: CommandId | null;
  readonly candidateIds: readonly CommandId[];
};

export type Candidate = {
  readonly id: CommandId;
  readonly name: string;
  readonly summary: string;
  /** A few lines of symptom→fix and example captions from the static docs,
   *  so Workers AI has more than a one-line summary to disambiguate on. */
  readonly context: string;
  readonly score: number;
};

export type ModelSelection =
  | { readonly action: "command"; readonly commandId: CommandId }
  | { readonly action: "clarify"; readonly commandId: null };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && isSiteLocale(value);
}
