#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseCommandDocs,
  verifyCommandDocs,
} from "./lib/command-docs-verifier.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptsDir, "..");
const sourceRoot = process.env.OMM_SOURCE_DIR
  ? path.resolve(process.env.OMM_SOURCE_DIR)
  : null;

if (!sourceRoot) {
  console.error(
    "OMM_SOURCE_DIR is required. Point it at a local omm-hippo/omm checkout, " +
      "for example: OMM_SOURCE_DIR=../omm npm run verify:command-docs",
  );
  process.exit(2);
}

if (!fs.existsSync(sourceRoot)) {
  console.error(`OMM_SOURCE_DIR does not exist: ${sourceRoot}`);
  process.exit(2);
}

const extractor = spawnSync(
  process.env.PYTHON ?? "python3",
  [path.join(scriptsDir, "extract-omm-command-contract.py"), sourceRoot],
  { encoding: "utf8" },
);
if (extractor.status !== 0) {
  process.stderr.write(extractor.stderr || "omm command contract extraction failed\n");
  process.exit(extractor.status ?? 2);
}

let upstream;
try {
  upstream = JSON.parse(extractor.stdout);
} catch (error) {
  console.error(`extractor returned invalid JSON: ${error.message}`);
  process.exit(2);
}

let docs;
try {
  docs = parseCommandDocs(path.join(repositoryRoot, "src/i18n/commands/base.ts"));
} catch (error) {
  console.error(`could not read command documentation: ${error.message}`);
  process.exit(2);
}

const errors = verifyCommandDocs({ docs, upstream, sourceRoot });
if (errors.length > 0) {
  console.error(`Command documentation drift detected (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  console.error(
    "Update src/i18n/commands/base.ts plus the aligned en.ts/ko.ts copy, then rerun " +
      "OMM_SOURCE_DIR=<checkout> npm run verify:command-docs.",
  );
  process.exit(1);
}

const git = spawnSync("git", ["-C", sourceRoot, "rev-parse", "--short=12", "HEAD"], {
  encoding: "utf8",
});
const revision = git.status === 0 ? git.stdout.trim() : "non-git source tree";
console.log(
  `Command docs match omm source ${revision}: 6 commands, explicit/global flags, defaults, capabilities, and cited error anchors.`,
);
