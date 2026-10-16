import { COMMAND_ORDER, type Slug } from "../../i18n/commands/base";
import { referenceNames } from "../commands/reference";

/**
 * A command the assistant may select: every hand-written command doc, plus
 * every top-level command in the CLI reference (`src/data/commands.json`)
 * that has no hand-written page yet. The second half is what keeps a newly
 * shipped command selectable the day the reference is synced, instead of the
 * day someone writes its page (omm-hippo/omm#347).
 */
export type CommandId = Slug | (string & {});

const HAND_WRITTEN = new Set<string>(COMMAND_ORDER);

/** Reference-only commands, in the order the CLI export lists them. */
export const REFERENCE_ONLY_IDS: readonly string[] = referenceNames().filter(
  (name) => !HAND_WRITTEN.has(name),
);

/** Hand-written commands first, then reference-only ones. */
export const COMMAND_IDS: readonly CommandId[] = [
  ...COMMAND_ORDER,
  ...REFERENCE_ONLY_IDS,
];

const ALL = new Set<string>(COMMAND_IDS);

export function isCommandId(value: unknown): value is CommandId {
  return typeof value === "string" && ALL.has(value);
}

export function isHandWritten(id: CommandId): id is Slug {
  return HAND_WRITTEN.has(id);
}
