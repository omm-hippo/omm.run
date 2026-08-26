#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const EXPECTED_ALIASES = new Map([
  ["ls", "list"],
  ["rm", "uninstall"],
  ["up", "upgrade"],
]);
const EXPECTED_RECOMMEND_FLAGS = ["--profile"];
const EXPECTED_MEMORY_GUARD_FLAGS = [
  "--policy",
  "--poll-seconds",
  "--low-memory-seconds",
];

function fail(message, exitCode = 1) {
  process.stderr.write(`OMM command sync check failed: ${message}\n`);
  process.exit(exitCode);
}

function sorted(values) {
  return [...values].sort();
}

function sameSet(left, right) {
  return JSON.stringify(sorted(new Set(left))) === JSON.stringify(sorted(new Set(right)));
}

function extractSiteCommandIds(source) {
  const match = source.match(
    /export const COMMAND_ORDER:[^=]+?=\s*\[([\s\S]*?)\];/u,
  );
  if (!match) fail("could not parse COMMAND_ORDER from src/i18n/commands/base.ts");
  return [...match[1].matchAll(/["']([a-z][a-z0-9-]*)["']/gu)].map(
    (entry) => entry[1],
  );
}

function extractDecoratedCommands(source, decoratorName) {
  const decorator = new RegExp(
    `^@${decoratorName}\\.command\\(([^\\n]*)\\)\\n([\\s\\S]*?)^def\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(`,
    "gmu",
  );
  const commands = [];
  for (const match of source.matchAll(decorator)) {
    const options = match[1];
    if (/hidden\s*=\s*True/u.test(options)) continue;
    const explicitName = options.match(/name\s*=\s*["']([^"']+)["']/u)?.[1];
    commands.push(explicitName ?? match[3].replaceAll("_", "-"));
  }
  return commands;
}

function extractAddedTyperGroups(source) {
  const definitions = new Map();
  for (const match of source.matchAll(
    /^(\w+)_app\s*=\s*typer\.Typer\(\s*\n?\s*name\s*=\s*["']([^"']+)["']/gmu,
  )) {
    definitions.set(`${match[1]}_app`, match[2]);
  }

  const groups = [];
  for (const match of source.matchAll(/^app\.add_typer\((\w+_app)\)/gmu)) {
    const name = definitions.get(match[1]);
    if (!name) fail(`could not resolve Typer group ${match[1]}`);
    groups.push(name);
  }
  return groups;
}

function extractAliases(source) {
  const match = source.match(/^_COMMAND_ALIASES\s*=\s*\{([^\n]+)\}/mu);
  if (!match) fail("could not parse _COMMAND_ALIASES from cli.py");
  const aliases = new Map();
  for (const entry of match[1].matchAll(
    /["']([^"']+)["']\s*:\s*["']([^"']+)["']/gu,
  )) {
    aliases.set(entry[1], entry[2]);
  }
  return aliases;
}

function extractFunction(source, functionName) {
  const start = source.indexOf(`def ${functionName}(`);
  if (start === -1) fail(`could not find def ${functionName}(...) in cli.py`);
  const nextDefinition = source.indexOf("\ndef ", start + 1);
  const nextDecorator = source.indexOf("\n@app.command", start + 1);
  const nextSettingDecorator = source.indexOf("\n@setting_app.command", start + 1);
  const endpoints = [nextDefinition, nextDecorator, nextSettingDecorator].filter(
    (value) => value !== -1,
  );
  return source.slice(start, Math.min(...endpoints, source.length));
}

function assertFlags(label, source, expectedFlags) {
  const missing = expectedFlags.filter((flag) => !source.includes(flag));
  if (missing.length > 0) fail(`${label} is missing ${missing.join(", ")}`);
}

const sourceDir = process.env.OMM_SOURCE_DIR?.trim();
if (!sourceDir) {
  fail(
    "OMM_SOURCE_DIR is required. Point it at a trusted local checkout of https://github.com/omm-hippo/omm; this opt-in check never fetches the network.",
    2,
  );
}

const resolvedSourceDir = path.resolve(sourceDir);
const cliPath = path.join(resolvedSourceDir, "src/omm/cli.py");
const siteBasePath = fileURLToPath(
  new URL("../src/i18n/commands/base.ts", import.meta.url),
);

let cliSource;
let siteBaseSource;
try {
  [cliSource, siteBaseSource] = await Promise.all([
    readFile(cliPath, "utf8"),
    readFile(siteBasePath, "utf8"),
  ]);
} catch (error) {
  fail(`${error.message} (expected OMM CLI at ${cliPath})`);
}

const siteCommandIds = extractSiteCommandIds(siteBaseSource);
const upstreamCommands = [
  ...extractDecoratedCommands(cliSource, "app"),
  ...extractAddedTyperGroups(cliSource),
];

if (new Set(upstreamCommands).size !== upstreamCommands.length) {
  fail(`duplicate visible upstream commands: ${upstreamCommands.join(", ")}`);
}
if (!sameSet(siteCommandIds, upstreamCommands)) {
  const site = new Set(siteCommandIds);
  const upstream = new Set(upstreamCommands);
  const missingFromSite = sorted([...upstream].filter((id) => !site.has(id)));
  const missingFromUpstream = sorted([...site].filter((id) => !upstream.has(id)));
  fail(
    `visible command mismatch; missing from site=[${missingFromSite.join(", ")}], missing from upstream=[${missingFromUpstream.join(", ")}]`,
  );
}

const aliases = extractAliases(cliSource);
if (
  !sameSet(aliases.keys(), EXPECTED_ALIASES.keys()) ||
  [...EXPECTED_ALIASES].some(([alias, target]) => aliases.get(alias) !== target)
) {
  fail(
    `alias mismatch; expected=${JSON.stringify(Object.fromEntries(EXPECTED_ALIASES))}, actual=${JSON.stringify(Object.fromEntries(aliases))}`,
  );
}

assertFlags(
  "upstream recommend",
  extractFunction(cliSource, "recommend"),
  EXPECTED_RECOMMEND_FLAGS,
);
assertFlags(
  "upstream setting memory-guard",
  extractFunction(cliSource, "configure_memory_guard"),
  EXPECTED_MEMORY_GUARD_FLAGS,
);

const recommendSiteBlock = siteBaseSource.slice(
  siteBaseSource.indexOf("  recommend: {"),
  siteBaseSource.indexOf("  contribute: {"),
);
const settingSiteBlock = siteBaseSource.slice(
  siteBaseSource.indexOf("  setting: {"),
  siteBaseSource.indexOf("  doctor: {"),
);
assertFlags("site recommend docs", recommendSiteBlock, EXPECTED_RECOMMEND_FLAGS);
assertFlags(
  "site setting memory-guard docs",
  settingSiteBlock,
  EXPECTED_MEMORY_GUARD_FLAGS,
);

process.stdout.write(
  `OMM command sync check passed: ${siteCommandIds.length} visible commands, ${aliases.size} aliases, recommend/profile, and memory-guard flags match ${resolvedSourceDir}.\n`,
);
