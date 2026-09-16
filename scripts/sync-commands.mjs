#!/usr/bin/env node
/**
 * Keeps `src/data/commands.json` identical to `docs/commands.json` in
 * omm-hippo/omm, which is generated from `src/omm/cli.py` by
 * `scripts/export_command_reference.py` there.
 *
 *   npm run sync-commands   — fetch and write the file
 *   npm run check-commands  — fetch and fail if the committed copy differs
 *
 * The check job is what stops the site from quietly describing a CLI that no
 * longer exists (omm-hippo/omm#347).
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  process.env.OMM_COMMANDS_URL ??
  "https://raw.githubusercontent.com/omm-hippo/omm/main/docs/commands.json";
const SCHEMA_VERSION = 1;

const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const TARGET = path.join(REPO_ROOT, "src/data/commands.json");

const check = process.argv.includes("--check");

function fail(message) {
  process.stderr.write(`commands.json sync failed: ${message}\n`);
  process.exit(1);
}

function validate(document, origin) {
  if (typeof document !== "object" || document === null) {
    fail(`${origin} is not a JSON object`);
  }
  if (document.schema_version !== SCHEMA_VERSION) {
    fail(
      `${origin} has schema_version ${JSON.stringify(document.schema_version)}, expected ${SCHEMA_VERSION}`,
    );
  }
  if (!Array.isArray(document.commands) || document.commands.length === 0) {
    fail(`${origin} has no commands`);
  }
  for (const entry of document.commands) {
    if (!Array.isArray(entry.path) || entry.path.length === 0) {
      fail(`${origin} has an entry without a path`);
    }
    if (entry.kind !== "command" && entry.kind !== "group") {
      fail(`${origin}: ${entry.path.join(" ")} has kind ${JSON.stringify(entry.kind)}`);
    }
  }
  return document;
}

function paths(document) {
  return document.commands.map((entry) => entry.path.join(" "));
}

/**
 * What the check compares. `omm_version` moves with every release commit in
 * the product repo, so comparing it would fail this site's builds on a bump
 * that changed no command at all. The CLI's own check ignores it too; a real
 * change to any command, flag, default or help text still shows up here.
 */
function comparable(document) {
  const rest = { ...document };
  delete rest.omm_version;
  return `${JSON.stringify(rest, null, 2)}\n`;
}

/** The command paths that differ, so a failing check names the real change. */
function diffPaths(local, remote) {
  const left = new Set(paths(local));
  const right = new Set(paths(remote));
  return {
    added: [...right].filter((entry) => !left.has(entry)).sort(),
    removed: [...left].filter((entry) => !right.has(entry)).sort(),
  };
}

async function fetchRemote() {
  let response;
  try {
    response = await fetch(SOURCE_URL, {
      headers: { accept: "application/json" },
    });
  } catch (error) {
    fail(`could not reach ${SOURCE_URL}: ${error.message}`);
  }
  // Until the export lands on the product repo's default branch there is
  // nothing to compare against. Checking must not turn that into a red build
  // on a pull request that has not touched the copy; syncing still fails,
  // because someone asking for a sync wants the file.
  if (response.status === 404 && check) {
    process.stdout.write(
      `commands.json check skipped: ${SOURCE_URL} does not exist yet (HTTP 404).\n`,
    );
    process.exit(0);
  }
  if (!response.ok) {
    fail(`${SOURCE_URL} returned HTTP ${response.status}`);
  }
  const text = await response.text();
  let document;
  try {
    document = JSON.parse(text);
  } catch (error) {
    fail(`${SOURCE_URL} is not valid JSON: ${error.message}`);
  }
  return validate(document, SOURCE_URL);
}

async function readLocal() {
  let text;
  try {
    text = await readFile(TARGET, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      fail("src/data/commands.json is missing — run `npm run sync-commands`");
    }
    throw error;
  }
  return validate(JSON.parse(text), "src/data/commands.json");
}

const remote = await fetchRemote();
const serialised = `${JSON.stringify(remote, null, 2)}\n`;

if (!check) {
  await writeFile(TARGET, serialised, "utf8");
  process.stdout.write(
    `commands.json synced: ${remote.commands.length} entries from omm ${remote.omm_version}.\n`,
  );
  process.exit(0);
}

const local = await readLocal();

if (comparable(local) === comparable(remote)) {
  process.stdout.write(
    `commands.json is current: ${local.commands.length} entries from omm ${local.omm_version}.\n`,
  );
  process.exit(0);
}

const { added, removed } = diffPaths(local, remote);
process.stderr.write(
  [
    "commands.json sync failed: the committed copy differs from omm-hippo/omm.",
    `  local omm_version:  ${local.omm_version}`,
    `  remote omm_version: ${remote.omm_version}`,
    `  only upstream: ${added.length > 0 ? added.join(", ") : "(none)"}`,
    `  only on site:  ${removed.length > 0 ? removed.join(", ") : "(none)"}`,
    added.length === 0 && removed.length === 0
      ? "  the command list matches; a usage line, flag, default or help text changed."
      : "",
    "Run `npm run sync-commands` and commit the result.",
    "",
  ]
    .filter(Boolean)
    .join("\n"),
);
process.exit(1);
