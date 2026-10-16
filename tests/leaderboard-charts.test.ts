import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Analysis from "../src/components/leaderboard/Analysis";
import { rankMatrix, scatterPoints, winRates } from "../src/lib/leaderboard/charts";
import type { ArenaArtifact } from "../src/lib/leaderboard/types";

const FIXTURES = path.join(__dirname, "fixtures", "leaderboard");
const ranked: ArenaArtifact = JSON.parse(readFileSync(path.join(FIXTURES, "ranked.json"), "utf8"));

test("heatmap cells are the row's share of decisive wins against the column", () => {
  const grid = winRates(ranked, 8);
  for (const cell of grid.cells.flat()) {
    if (!cell || cell.rate === null) continue;
    const pair = ranked.pairs.find(
      (p) => (p.a === cell.row && p.b === cell.col) || (p.a === cell.col && p.b === cell.row),
    )!;
    const own = pair.a === cell.row ? pair.wins_a : pair.wins_b;
    const other = pair.a === cell.row ? pair.wins_b : pair.wins_a;
    assert.equal(cell.rate, own / (own + other));
    assert.equal(cell.battles, pair.battles);
  }
  const keys = grid.keys;
  assert.equal(grid.cells[0][0], null); // the diagonal is empty
  const a = grid.cells[0][1]!;
  const b = grid.cells[1][0]!;
  if (a.rate !== null && b.rate !== null) assert.ok(Math.abs(a.rate + b.rate - 1) < 1e-9);
  assert.ok(keys.length <= 8);
});

test("the heatmap headline is the most lopsided pair with enough battles", () => {
  const grid = winRates(ranked, 8);
  const best = grid.headline!;
  assert.ok(best.battles >= 5);
  for (const cell of grid.cells.flat()) {
    if (cell?.rate != null && cell.battles >= 5) assert.ok(cell.rate <= best.rate);
  }
});

test("the scatter plots only comparable models", () => {
  const points = scatterPoints(ranked);
  const comparable = ranked.models.filter((m) => !m.provisional && m.efficiency_comparable);
  assert.deepEqual(points.map((p) => p.key).sort(), comparable.map((m) => m.key).sort());
  const withHole = { ...ranked, models: ranked.models.map((m, i) => (i === 0 ? { ...m, efficiency_comparable: false } : m)) };
  assert.ok(!scatterPoints(withHole).some((p) => p.key === ranked.models[0].key));
});

test("the rank matrix shows tiers per ranked scope; accent cells are tier-1 cells", () => {
  const matrix = rankMatrix(ranked);
  const rankedScopes = ["overall", ...ranked.groups.filter((g) => g.ranked).map((g) => g.key)];
  assert.deepEqual(matrix.columns, rankedScopes);
  for (const row of matrix.rows) {
    matrix.columns.forEach((column, index) => {
      const scope = column === "overall" ? ranked : ranked.groups.find((g) => g.key === column)!;
      const model = scope.models.find((m) => m.key === row.key && !m.provisional);
      assert.equal(row.tiers[index], model ? model.quality.tier : null);
    });
  }
  const html = renderToStaticMarkup(createElement(Analysis, { artifact: ranked, scope: ranked, scopeKey: "overall", locale: "ko" }));
  const tierOneCells = matrix.rows.flatMap((row) => row.tiers.filter((tier) => tier === 1)).length;
  assert.equal((html.match(/data-top="true"/g) ?? []).length, tierOneCells);
});

test("the analysis renders headlines from the artifact", () => {
  const html = renderToStaticMarkup(createElement(Analysis, { artifact: ranked, scope: ranked, scopeKey: "overall", locale: "ko" }));
  assert.match(html, /순위 뒤의 숫자/);
  assert.match(html, new RegExp(`${rankMatrix(ranked).columns.length}개 구간`));
  assert.match(html, new RegExp(`${Math.round(winRates(ranked, 8).headline!.rate * 100)}%`));
  assert.match(html, /<svg/);
});

test("leaderboard components use palette tokens only (DIRECTION.md §5.4)", () => {
  const directory = path.join(__dirname, "..", "src", "components", "leaderboard");
  for (const file of readdirSync(directory)) {
    const source = readFileSync(path.join(directory, file), "utf8");
    assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/u, file);
  }
});
