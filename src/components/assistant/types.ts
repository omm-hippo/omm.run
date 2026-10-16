import type { CommandRisk } from "@/i18n/commands/base";
import type { CommandId } from "@/lib/assistant/catalog";
import type { AssistantResponse } from "@/lib/assistant/types";

export type {
  AssistantKind,
  AssistantSource,
  AssistantReason,
} from "@/lib/assistant/types";

export type AssistantCommandCard = {
  readonly id: CommandId;
  readonly name: string;
  readonly summary: string;
  readonly href: string;
  readonly example: string;
  readonly options: readonly string[];
  readonly remainingOptionCount: number;
  /** `null` for a reference-only command: no written page has classified it. */
  readonly risk: CommandRisk | null;
};

export type AssistantResult = Pick<AssistantResponse, "kind" | "source" | "reason"> & {
  readonly commandIds: readonly CommandId[];
};
