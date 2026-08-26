import type { Locale } from "../../i18n/config";
import type { Slug } from "../../i18n/commands/base";

export const ASSISTANT_LIMITS = {
  maxBodyCharacters: 2_048,
  minQuestionCharacters: 1,
  maxQuestionCharacters: 480,
  maxTurns: 3,
  maxCandidates: 5,
  maxSuggestions: 3,
  maxCompletionTokens: 48,
  inferenceTimeoutMs: 5_000,
  clientWindowSeconds: 10 * 60,
  clientRequestsPerWindow: 3,
  dailyRequests: 40,
  cacheSeconds: 15 * 60,
} as const;

export type AssistantSource = "workers-ai" | "deterministic";
export type AssistantKind = "command" | "clarify" | "fallback";
export type AssistantReason =
  | "matched"
  | "ambiguous"
  | "no_match"
  | "sensitive_input"
  | "unsafe_input"
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
};

export type AssistantResponse = {
  readonly kind: AssistantKind;
  readonly source: AssistantSource;
  readonly reason: AssistantReason;
  readonly commandId: Slug | null;
  readonly candidateIds: readonly Slug[];
};

export type Candidate = {
  readonly id: Slug;
  readonly name: string;
  readonly summary: string;
  readonly score: number;
};

export type ModelSelection =
  | { readonly action: "command"; readonly commandId: Slug }
  | { readonly action: "clarify"; readonly commandId: null };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ko";
}
