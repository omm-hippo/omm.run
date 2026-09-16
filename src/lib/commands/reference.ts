/**
 * The CLI reference, read from `src/data/commands.json`.
 *
 * That file is a verbatim copy of `docs/commands.json` in omm-hippo/omm, which
 * `scripts/export_command_reference.py` generates from `src/omm/cli.py`. It is
 * the same text `omm <command> --help` prints, so nothing here is translated
 * or reworded — see design/FACTS.md, section "Command reference data".
 *
 * `npm run sync-commands` refreshes the copy; `npm run check-commands` fails
 * when the copy and the product repo have drifted apart.
 */

import data from "@/data/commands.json";

export const REFERENCE_SCHEMA_VERSION = 1;

export type ReferenceArgument = {
  readonly name: string;
  readonly help: string;
  readonly required: boolean;
};

export type ReferenceOption = {
  readonly flags: readonly string[];
  readonly metavar: string | null;
  readonly is_flag: boolean;
  readonly help: string;
  readonly default: string | null;
  /** Injected by the CLI's `global_flags` decorator, so every command has it. */
  readonly global: boolean;
};

export type ReferenceEntry = {
  /** `["setting", "version"]` — `path[0]` is the route, `path[1]` the anchor. */
  readonly path: readonly string[];
  readonly kind: "command" | "group";
  readonly aliases: readonly string[];
  readonly summary: string;
  readonly description: string;
  readonly usage: string;
  readonly arguments: readonly ReferenceArgument[];
  readonly options: readonly ReferenceOption[];
  readonly docs_url: string;
};

export type CommandReferenceFile = {
  readonly schema_version: number;
  readonly generated_by: string;
  readonly omm_version: string;
  readonly docs_base_url: string;
  readonly commands: readonly ReferenceEntry[];
};

/** The whole exported document, typed. Everything below reads from it. */
export const REFERENCE = data as CommandReferenceFile;

/** The omm release the reference was exported from. */
export const OMM_REFERENCE_VERSION = REFERENCE.omm_version;

/** Top-level commands, in the order the export wrote them (sorted by path). */
export function topLevelEntries(): readonly ReferenceEntry[] {
  return REFERENCE.commands.filter((entry) => entry.path.length === 1);
}

/** Every top-level command name — the set of `/commands/<name>` routes. */
export function referenceNames(): readonly string[] {
  return topLevelEntries().map((entry) => entry.path[0]);
}

export function getEntry(name: string): ReferenceEntry | undefined {
  return REFERENCE.commands.find(
    (entry) => entry.path.length === 1 && entry.path[0] === name,
  );
}

/** The sub-commands of a group, which render as `#<sub>` anchors on its page. */
export function subEntries(name: string): readonly ReferenceEntry[] {
  return REFERENCE.commands.filter(
    (entry) => entry.path.length === 2 && entry.path[0] === name,
  );
}

/** A command's own options — the shared ones get one note instead. */
export function ownOptions(entry: ReferenceEntry): readonly ReferenceOption[] {
  return entry.options.filter((option) => !option.global);
}

/**
 * The flags the CLI injects into every command, collected once so no page
 * repeats them. Deduplicated by the joined flag spelling.
 */
export function sharedFlags(): readonly string[] {
  const seen = new Set<string>();
  for (const entry of REFERENCE.commands) {
    for (const option of entry.options) {
      if (option.global) seen.add(option.flags.join(", "));
    }
  }
  return [...seen].sort();
}

/** `--engine TEXT`, `--json`, `--yes, -y` — how a flag row is labelled. */
export function flagLabel(option: ReferenceOption): string {
  const flags = option.flags.join(", ");
  return option.metavar ? `${flags} ${option.metavar}` : flags;
}
