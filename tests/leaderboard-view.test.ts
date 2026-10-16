import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import LeaderboardView from "../src/components/leaderboard/LeaderboardView";
import { leaderboardDictionary } from "../src/i18n/leaderboard";
import type { ArenaArtifact, BoardState } from "../src/lib/leaderboard/types";
import {
  installRef,
  modelName,
  mostBeaten,
  navItems,
  scopeOf,
} from "../src/lib/leaderboard/view";

const FIXTURES = path.join(__dirname, "fixtures", "leaderboard");
function artifact(name: "ranked" | "collecting"): ArenaArtifact {
  return JSON.parse(readFileSync(path.join(FIXTURES, `${name}.json`), "utf8"));
}
function render(state: BoardState, scope?: string, model?: string, locale: "ko" | "en" = "ko") {
  return renderToStaticMarkup(createElement(LeaderboardView, { state, locale, scope, model }));
}

test("a ranked group is shown as itself", () => {
  const view = scopeOf(artifact("ranked"), "unified:16");
  assert.equal(view.key, "unified:16");
  assert.equal(view.fellBack, false);
  assert.equal(view.scope.ranked, true);
});

test("an unranked group falls back to the overall board", () => {
  const view = scopeOf(artifact("ranked"), "cpu:32");
  assert.equal(view.key, "overall");
  assert.equal(view.requested, "cpu:32");
  assert.equal(view.fellBack, true);
});

test("an unknown scope in the URL shows the overall board without a notice", () => {
  const view = scopeOf(artifact("ranked"), "nonsense");
  assert.equal(view.key, "overall");
  assert.equal(view.fellBack, false);
});

test("nav lists overall first, then families, with thin groups flagged", () => {
  const items = navItems(artifact("ranked"), "ko");
  assert.deepEqual(items.map((item) => item.key), ["overall", "unified:16", "vram:8", "cpu:32"]);
  assert.equal(items.find((item) => item.key === "cpu:32")?.ranked, false);
  assert.equal(items[0].votes, artifact("ranked").corpus.rows_used);
});

test("model names drop the extension and quant; org comes from the repo", () => {
  assert.deepEqual(
    modelName({ display_filename: "Qwen2.5-7B-Instruct-Q4_K_M.gguf", repo_id: "Qwen/Qwen2.5-7B-Instruct-GGUF", key: "x" }),
    { name: "Qwen2.5-7B-Instruct", org: "Qwen", quant: "Q4_K_M" },
  );
  assert.deepEqual(
    modelName({ display_filename: null, repo_id: null, key: "filename:local.gguf" }),
    { name: "local", org: null, quant: null },
  );
});

test("install refs are exact, with the provider prefix; none without a repo", () => {
  const base = { display_filename: "a-Q4_K_M.gguf", repo_id: "org/a", provider: "huggingface" };
  assert.equal(installRef(base), "org/a:a-Q4_K_M.gguf");
  assert.equal(installRef({ ...base, provider: "modelscope" }), "ms:org/a:a-Q4_K_M.gguf");
  assert.equal(installRef({ ...base, repo_id: null }), null);
});

test("the most-beaten opponent needs at least five battles", () => {
  const scope = artifact("ranked");
  const top = scope.models[0];
  const beaten = mostBeaten(scope, top.key);
  assert.ok(beaten);
  const pair = scope.pairs.find((p) => [p.a, p.b].includes(top.key) && [p.a, p.b].includes(beaten.key))!;
  assert.ok(pair.battles >= 5);
  const self = pair.a === top.key ? pair.wins_a : pair.wins_b;
  const other = pair.a === top.key ? pair.wins_b : pair.wins_a;
  assert.equal(beaten.rate, self / (self + other));
  const thin = { ...scope, pairs: scope.pairs.map((p) => ({ ...p, battles: 4 })) };
  assert.equal(mostBeaten(thin, top.key), null);
});

test("a ranked board renders tier bands and keeps provisional models collapsed", () => {
  const html = render({ kind: "ranked", artifact: artifact("ranked") });
  assert.match(html, /1티어/);
  assert.match(html, /<table/);
  const outside = html.replace(/<details[\s\S]*?<\/details>/g, "");
  assert.doesNotMatch(outside, /tinyllama/i);
  assert.match(html, /표본 부족 모델 1개/);
  assert.match(html, /Ed25519/);
});

test("picking a thin group shows the notice and the overall board", () => {
  const html = render({ kind: "ranked", artifact: artifact("ranked") }, "cpu:32");
  assert.match(html, /표본이 부족해 전체 순위를 보여줍니다/);
  assert.match(html, /<table/);
});

test("the collecting state shows real counts and no table", () => {
  const data = artifact("collecting");
  const html = render({ kind: "collecting", artifact: data });
  assert.doesNotMatch(html, /<table/);
  assert.match(html, new RegExp(`>${data.corpus.rows_used}<`));
  assert.match(html, /omm arena/);
});

test("an error state shows no numbers at all", () => {
  for (const reason of ["verification", "unavailable", "too_new"] as const) {
    const html = render({ kind: "error", reason });
    assert.doesNotMatch(html.replace(/<[^>]+>/g, ""), /\d/);
  }
});

test("unpublished points at omm arena", () => {
  const html = render({ kind: "unpublished" });
  assert.match(html, /omm arena/);
  assert.doesNotMatch(html, /<table/);
});

test("an unknown group key renders with its raw key", () => {
  const data = artifact("ranked");
  const strange = { ...data.groups[0], key: "vram:7", memory_bucket: "7" };
  const html = render({ kind: "ranked", artifact: { ...data, groups: [...data.groups, strange] } }, "vram:7");
  assert.match(html, /vram:7/);
});

test("example data is labelled as such", () => {
  const html = render({ kind: "ranked", artifact: artifact("ranked"), example: true });
  assert.match(html, /예시 데이터/);
});

test("ko and en dictionaries have the same keys", () => {
  assert.deepEqual(
    Object.keys(leaderboardDictionary("ko")).sort(),
    Object.keys(leaderboardDictionary("en")).sort(),
  );
});

test("English copy renders on the en locale", () => {
  const html = render({ kind: "ranked", artifact: artifact("ranked") }, undefined, undefined, "en");
  assert.match(html, /Tier 1/);
  assert.match(html, /All machines/);
  assert.match(html, /\+ 1 model with too few votes/);
});
