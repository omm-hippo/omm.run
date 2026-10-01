import type { Locale } from "../../i18n/config";

export const MODEL_TASKS = ["agents", "coding", "reasoning", "vision", "multilingual", "compact"] as const;
export type ModelTask = (typeof MODEL_TASKS)[number];
export type Localized = Readonly<Record<Locale, string>>;
export type ModelSource = {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly accessedAt: string;
};
export type ModelClaim = {
  readonly text: Localized;
  readonly basis: "publisher" | "editorial";
  readonly sourceId?: string;
};

/** Checkpoint-specific facts, not family-wide promises or runner support. */
export type WikiModel = {
  readonly id: string;
  readonly name: string;
  readonly publisher: string;
  readonly repository: string;
  readonly aliases: readonly string[];
  /** Editorial discovery categories, not measured capability scores. */
  readonly tasks: readonly ModelTask[];
  readonly architecture: "dense" | "moe";
  readonly sizeLabel: string;
  readonly activeParametersB: number | null;
  readonly context: { readonly tokens: number; readonly basis: "native" | "config"; readonly extendedTokens?: number; readonly sourceId: string };
  readonly inputs: readonly ("text" | "image" | "video")[];
  /** null means unconfirmed; it must never be displayed as unsupported. */
  readonly toolCalling: boolean | null;
  readonly license: { readonly label: string; readonly url: string };
  readonly summary: Localized;
  readonly chooseWhen: Localized;
  readonly strengths: readonly ModelClaim[];
  readonly cautions: readonly ModelClaim[];
  readonly runtimeNote: Localized;
  readonly sources: readonly ModelSource[];
  readonly reviewedAt: string;
  /** Populate only with a real, linked OMM evaluation; null is not a score. */
  readonly ommEvaluation: null;
};

export type ModelView = Omit<WikiModel, "summary" | "chooseWhen" | "strengths" | "cautions" | "runtimeNote"> & {
  readonly summary: string;
  readonly chooseWhen: string;
  readonly strengths: readonly (Omit<ModelClaim, "text"> & { readonly text: string })[];
  readonly cautions: readonly (Omit<ModelClaim, "text"> & { readonly text: string })[];
  readonly runtimeNote: string;
};

export function isModelTask(value: string): value is ModelTask {
  return (MODEL_TASKS as readonly string[]).includes(value);
}
