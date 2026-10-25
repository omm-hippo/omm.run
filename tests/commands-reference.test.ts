import assert from "node:assert/strict";
import test from "node:test";

import {
  REFERENCE,
  REFERENCE_SCHEMA_VERSION,
  flagLabel,
  ownOptions,
  referenceNames,
  referenceAnchor,
  sharedFlags,
  subEntries,
  topLevelEntries,
} from "../src/lib/commands/reference";

test("the committed CLI export matches the contract the site renders", () => {
  assert.equal(REFERENCE.schema_version, REFERENCE_SCHEMA_VERSION);
  assert.ok(REFERENCE.commands.length > 0);

  for (const entry of REFERENCE.commands) {
    assert.ok(entry.path.length >= 1);
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
    if (entry.path.length === 1) continue;
    const parent = REFERENCE.commands.find((candidate) =>
      candidate.path.join(" ") === entry.path.slice(0, -1).join(" "),
    );
    assert.ok(parent, `${entry.path.join(" ")} has no parent entry`);
    assert.equal(parent.kind, "group");
    assert.ok(subEntries(entry.path[0]).includes(entry));
  }
});

test("nested commands remain reachable with unique anchors and their real options", () => {
  for (const name of referenceNames()) {
    const descendants = subEntries(name);
    const anchors = descendants.map(referenceAnchor);
    assert.equal(new Set(anchors).size, anchors.length, `${name}: duplicate anchors`);
    for (const sub of descendants) {
      const cliAnchor = new URL(sub.docs_url).hash.slice(1);
      assert.ok(anchors.includes(cliAnchor), `${sub.usage}: CLI help link is unresolved`);
    }
  }
  for (const [group, path, flag] of [
    ["setting", "setting agent local", "--model"],
    ["rag", "rag remote set", "--token"],
    ["cluster", "cluster status", "--json"],
  ]) {
    const sub = subEntries(group).find((entry) => entry.path.join(" ") === path);
    assert.ok(sub, `${path} is visible`);
    assert.ok(sub.options.some((option) => option.flags.includes(flag)), `${path}: ${flag}`);
  }
  const tokenAdd = subEntries("cluster").find((entry) => entry.path.join(" ") === "cluster token add");
  assert.ok(tokenAdd?.arguments.some((argument) => argument.name === "name" && argument.required));
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
