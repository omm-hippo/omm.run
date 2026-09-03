import type { Slug } from "@/components/commands/commands";
import type { CommandRisk } from "@/i18n/commands/base";
import type { AssistantResponse } from "@/lib/assistant/types";

export type {
  AssistantKind,
  AssistantSource,
  AssistantReason,
} from "@/lib/assistant/types";

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

export type AssistantResult = Pick<AssistantResponse, "kind" | "source" | "reason"> & {
  readonly commandIds: readonly Slug[];
};
