import type { Slug } from "@/components/commands/commands";
import type { CommandRisk } from "@/i18n/commands/base";

export type AssistantCommandCard = {
  readonly id: Slug;
  readonly name: string;
  readonly summary: string;
  readonly href: string;
  readonly example: string;
  readonly options: readonly string[];
  readonly remainingOptionCount: number;
  readonly risk: CommandRisk;
};

export type AssistantKind = "command" | "clarify" | "fallback";
export type AssistantSource = "workers-ai" | "deterministic";
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

export type AssistantResult = {
  readonly kind: AssistantKind;
  readonly source: AssistantSource;
  readonly reason: AssistantReason;
  readonly commandIds: readonly Slug[];
};
