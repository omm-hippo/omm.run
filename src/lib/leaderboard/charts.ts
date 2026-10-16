import type { ArenaArtifact, Scope } from "./types";
import { MIN_PAIR_BATTLES } from "./view";

/** Models × ranked scopes. A cell is the model's quality TIER in that scope
 *  (null when unranked there): a position inside a tier is efficiency order,
 *  and showing it as a rank would blend the two axes. */
export function rankMatrix(artifact: ArenaArtifact, limit = 12): {
  columns: string[];
  rows: { key: string; tiers: (number | null)[] }[];
} {
  const scopes: [string, Scope][] = [
    ...(artifact.ranked ? ([["overall", artifact]] as [string, Scope][]) : []),
    ...artifact.groups.filter((group) => group.ranked).map((group) => [group.key, group] as [string, Scope]),
  ];
  const order: string[] = [];
  for (const [, scope] of scopes) {
    for (const model of scope.models) {
      if (!model.provisional && !order.includes(model.key)) order.push(model.key);
    }
  }
  return {
    columns: scopes.map(([key]) => key),
    rows: order.slice(0, limit).map((key) => ({
      key,
      tiers: scopes.map(([, scope]) => {
        const model = scope.models.find((entry) => entry.key === key && !entry.provisional);
        return model ? model.quality.tier : null;
      }),
    })),
  };
}

export type WinCell = { row: string; col: string; rate: number | null; battles: number };

/** Row's share of decisive (not both-bad) wins against the column, for the
 *  scope's top ranked models. */
export function winRates(scope: Scope, limit = 8): {
  keys: string[];
  cells: (WinCell | null)[][];
  headline: WinCell & { rate: number } | null;
} {
  const keys = scope.models.filter((model) => !model.provisional).slice(0, limit).map((model) => model.key);
  let headline: (WinCell & { rate: number }) | null = null;
  const cells = keys.map((row) =>
    keys.map((col): WinCell | null => {
      if (row === col) return null;
      const pair = scope.pairs.find((p) => (p.a === row && p.b === col) || (p.a === col && p.b === row));
      if (!pair) return { row, col, rate: null, battles: 0 };
      const own = pair.a === row ? pair.wins_a : pair.wins_b;
      const other = pair.a === row ? pair.wins_b : pair.wins_a;
      const rate = own + other > 0 ? own / (own + other) : null;
      const cell = { row, col, rate, battles: pair.battles };
      if (rate !== null && pair.battles >= MIN_PAIR_BATTLES && (!headline || rate > headline.rate)) {
        headline = { ...cell, rate };
      }
      return cell;
    }),
  );
  return { keys, cells, headline };
}

export type ScatterPoint = { key: string; quality: number; efficiency: number; tier: number };

/** Only models whose efficiency rating is comparable within the scope. */
export function scatterPoints(scope: Scope): ScatterPoint[] {
  return scope.models
    .filter((model) => !model.provisional && model.efficiency_comparable && model.efficiency)
    .map((model) => ({
      key: model.key,
      quality: model.quality.strength,
      efficiency: model.efficiency!.rating,
      tier: model.quality.tier ?? 0,
    }));
}
