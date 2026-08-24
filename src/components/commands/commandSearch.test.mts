import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's built-in TypeScript runner requires the file extension.
import { searchCommandIndex, type CommandSearchIndexItem } from "./commandSearchLogic.ts";

const INDEX: readonly CommandSearchIndexItem[] = [
  {
    slug: "search",
    name: "omm search",
    href: "/commands/search",
    summary: "Find a model across catalogs.",
    fields: {
      name: ["omm search", "search"],
      summary: ["Find a model across catalogs."],
      use: ["Look up HuggingFace models."],
      options: ["--json", "Print structured JSON."],
      errors: ["No models found matching this query."],
    },
  },
  {
    slug: "install",
    name: "omm install",
    href: "/commands/install",
    summary: "모델을 내려받아 러너에 연결합니다.",
    fields: {
      name: ["omm install", "install"],
      summary: ["모델을 내려받아 러너에 연결합니다."],
      use: ["Download and link a model."],
      options: ["--force"],
      errors: ["디스크 공간이 부족합니다."],
    },
  },
];

test("returns the source order for an empty query", () => {
  assert.deepEqual(
    searchCommandIndex(INDEX, "").map((result) => result.slug),
    ["search", "install"],
  );
});

test("ranks an exact command name and reports its matched field", () => {
  const [result] = searchCommandIndex(INDEX, "omm install");

  assert.equal(result.slug, "install");
  assert.deepEqual(result.matchedFields, ["name"]);
});

test("searches option and localized error text", () => {
  assert.deepEqual(searchCommandIndex(INDEX, "--json")[0].matchedFields, ["options"]);
  assert.equal(searchCommandIndex(INDEX, "디스크 부족")[0].slug, "install");
  assert.deepEqual(searchCommandIndex(INDEX, "디스크 부족")[0].matchedFields, ["errors"]);
});

test("requires every query token while allowing tokens across fields", () => {
  assert.equal(searchCommandIndex(INDEX, "json huggingface")[0].slug, "search");
  assert.equal(searchCommandIndex(INDEX, "json disk").length, 0);
});
