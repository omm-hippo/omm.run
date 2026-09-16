import assert from "node:assert/strict";
import test from "node:test";

import {
  REFERENCE,
  REFERENCE_SCHEMA_VERSION,
  flagLabel,
  getEntry,
  ownOptions,
  referenceNames,
  sharedFlags,
  subEntries,
  topLevelEntries,
} from "../src/lib/commands/reference";

test("the committed CLI export matches the contract the site renders", () => {
  assert.equal(REFERENCE.schema_version, REFERENCE_SCHEMA_VERSION);
  assert.ok(REFERENCE.commands.length > 0);

  for (const entry of REFERENCE.commands) {
    assert.ok(entry.path.length === 1 || entry.path.length === 2);
    assert.ok(entry.kind === "command" || entry.kind === "group");
    assert.ok(entry.usage.startsWith("omm "));

    // The route the CLI's --help epilog sends people to has to be the route
    // this site actually serves, anchor included.
    const expected =
      entry.path.length === 1
        ? `${REFERENCE.docs_base_url}/${entry.path[0]}`
        : `${REFERENCE.docs_base_url}/${entry.path[0]}#${entry.path[1]}`;
    assert.equal(entry.docs_url, expected);
  }
});

test("top-level names are unique and every sub-command has a parent", () => {
  const names = referenceNames();
  assert.equal(new Set(names).size, names.length);
  assert.equal(topLevelEntries().length, names.length);

  for (const entry of REFERENCE.commands) {
    if (entry.path.length !== 2) continue;
    const parent = getEntry(entry.path[0]);
    assert.ok(parent, `${entry.path.join(" ")} has no parent entry`);
    assert.equal(parent.kind, "group");
    assert.ok(subEntries(entry.path[0]).includes(entry));
  }
});

test("shared flags are collected once and never repeated per command", () => {
  const shared = sharedFlags();
  for (const entry of REFERENCE.commands) {
    for (const option of ownOptions(entry)) {
      assert.equal(option.global, false);
      assert.ok(!shared.includes(option.flags.join(", ")));
    }
  }
});

test("a flag with a metavar is labelled with it", () => {
  assert.equal(
    flagLabel({
      flags: ["--engine"],
      metavar: "TEXT",
      is_flag: false,
      help: "",
      default: null,
      global: false,
    }),
    "--engine TEXT",
  );
});
