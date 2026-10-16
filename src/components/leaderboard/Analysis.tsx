import type { Locale } from "@/i18n/config";
import { leaderboardDictionary, type LeaderboardDictionary } from "@/i18n/leaderboard";
import { rankMatrix, scatterPoints, winRates, type WinCell } from "@/lib/leaderboard/charts";
import { groupLabel } from "@/lib/leaderboard/groups";
import type { ArenaArtifact, Scope } from "@/lib/leaderboard/types";
import { MIN_PAIR_BATTLES, modelName } from "@/lib/leaderboard/view";

import { Label } from "./Hero";

/** Below the board: one full-width row per chart, text and chart alternating
 *  sides, each with one headline number computed from the artifact. */
export default function Analysis({
  artifact,
  scope,
  scopeKey,
  locale,
}: {
  artifact: ArenaArtifact;
  scope: Scope;
  scopeKey: string;
  locale: Locale;
}) {
  const t = leaderboardDictionary(locale);
  const names = new Map(
    [...artifact.models, ...artifact.groups.flatMap((group) => group.models)].map((model) => [
      model.key,
      modelName(model).name,
    ]),
  );
  const name = (key: string) => names.get(key) ?? key;
  const matrix = rankMatrix(artifact);
  const grid = winRates(scope);
  const points = scatterPoints(scope);
  return (
    <>
      <div className="border-t border-line-0" />
      <section className="mx-auto w-full max-w-page px-5 pt-16 pb-24 md:px-8 md:pt-24 md:pb-32">
        <Label className="mb-3">{t.analysisLabel}</Label>
        <h2 className="mb-8 text-[26px] leading-[1.25] font-semibold text-ink-0 md:mb-12 md:text-[30px]">{t.analysisTitle}</h2>

        <Row
          label={t.matrixLabel}
          title={t.matrixTitle}
          body={t.matrixBody}
          take={t.matrixTake(matrix.columns.length)}
          takeSub={t.matrixTakeSub}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-[13px]">
              <thead>
                <tr>
                  <th scope="col" className="border-b border-line-1 px-2.5 py-2 text-left text-[11px] font-medium text-ink-3"><span className="sr-only">{t.colModel}</span></th>
                  {matrix.columns.map((column) => (
                    <th key={column} scope="col" className={`border-b border-line-1 px-2.5 py-2 text-center text-[11px] font-medium tracking-[.04em] ${column === scopeKey ? "text-accent" : "text-ink-3"}`}>
                      {groupLabel(column, locale)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row" className="border-b border-line-0 px-2.5 py-3 text-left font-sans text-[14px] font-normal text-ink-0">{name(row.key)}</th>
                    {row.tiers.map((tier, index) => (
                      <td
                        key={matrix.columns[index]}
                        data-top={tier === 1 ? "true" : undefined}
                        className={`border-b border-line-0 px-2.5 py-3 text-center ${matrix.columns[index] === scopeKey ? "bg-bg-2" : ""} ${tier === null ? "text-line-1" : "text-ink-1"}`}
                      >
                        {tier === 1 ? (
                          <span className="rounded-sm bg-accent px-2 py-0.5 font-bold text-accent-ink">1</span>
                        ) : (
                          (tier ?? "—")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Row>

        <Row
          flip
          label={t.heatLabel}
          title={t.heatTitle}
          body={t.heatBody}
          take={grid.headline ? `${Math.round(grid.headline.rate * 100)}%` : "—"}
          takeSub={grid.headline ? t.heatTakeSub(name(grid.headline.row), name(grid.headline.col), grid.headline.battles) : ""}
        >
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[480px] gap-[3px] font-mono text-[12.5px]"
              style={{ gridTemplateColumns: `120px repeat(${grid.keys.length}, minmax(0, 1fr))` }}
            >
              <div />
              {grid.keys.map((key) => (
                <div key={key} className="truncate py-1.5 text-center text-[11px] text-ink-3" title={name(key)}>
                  {name(key).split(/[-_ ]/u)[0]}
                </div>
              ))}
              {grid.keys.map((row, rowIndex) => (
                <HeatRow key={row} t={t} rowName={name(row)} cells={grid.cells[rowIndex]} name={name} />
              ))}
            </div>
          </div>
        </Row>

        <Row
          label={t.scatterLabel}
          title={t.scatterTitle}
          body={t.scatterBody}
          take={t.scatterTake(points.length)}
          takeSub={t.scatterTakeSub}
          legend={t}
        >
          <Scatter points={points} name={name} t={t} />
        </Row>
      </section>
    </>
  );
}

function Row({
  flip = false,
  label,
  title,
  body,
  take,
  takeSub,
  legend,
  children,
}: {
  flip?: boolean;
  label: string;
  title: string;
  body: string;
  take: string;
  takeSub: string;
  legend?: LeaderboardDictionary;
  children: React.ReactNode;
}) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] items-start gap-8 border-t border-line-0 py-10 md:py-12 lg:gap-12 ${flip ? "lg:grid-cols-[8fr_4fr]" : "lg:grid-cols-[4fr_8fr]"}`}>
      <div className={flip ? "lg:order-2" : ""}>
        <Label>{label}</Label>
        <h3 className="mt-2 mb-2 text-[22px] leading-[1.4] font-semibold text-ink-0">{title}</h3>
        <p className="mb-6 text-[15px] leading-[1.7] text-ink-2">{body}</p>
        <div className="border-l-2 border-accent pl-3">
          <div className="font-mono text-[28px] leading-[1.2] text-ink-0">{take}</div>
          {takeSub ? <div className="text-[13px] leading-normal text-ink-2">{takeSub}</div> : null}
        </div>
        {legend ? (
          <div className="mt-6 flex gap-4 font-mono text-[11.5px] text-ink-2">
            <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-accent align-[-1px]" />{legend.tier(1)}</span>
            <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-ink-1 align-[-1px]" />{legend.tier(2)}</span>
            <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-ink-3 align-[-1px]" />{legend.tier(3)}+</span>
          </div>
        ) : null}
      </div>
      <div className="min-w-0 rounded-lg border border-line-0 bg-bg-1 p-4 md:p-6">{children}</div>
    </div>
  );
}

function heatClass(rate: number | null, battles: number): string {
  if (rate === null) return "border border-dashed border-line-1";
  // Too few battles to call a winner: show the number, but never as a win.
  if (battles < MIN_PAIR_BATTLES) return "bg-bg-1 text-ink-3";
  if (rate >= 0.8) return "bg-accent/80 font-bold text-accent-ink";
  if (rate >= 0.7) return "bg-accent/60 font-bold text-accent-ink";
  if (rate >= 0.6) return "bg-accent/40 text-ink-0";
  if (rate >= 0.5) return "bg-accent/20 text-ink-0";
  if (rate > 0.4) return "bg-bg-2 text-ink-2";
  if (rate > 0.3) return "bg-bg-3 text-ink-2";
  return "bg-line-1 text-ink-2";
}

function HeatRow({
  t,
  rowName,
  cells,
  name,
}: {
  t: LeaderboardDictionary;
  rowName: string;
  cells: (WinCell | null)[];
  name: (key: string) => string;
}) {
  return (
    <>
      <div className="truncate py-3 pl-1 text-left font-sans text-[13px] text-ink-1" title={rowName}>{rowName}</div>
      {cells.map((cell, index) =>
        cell === null ? (
          <div key={index} className="rounded-sm border border-dashed border-line-1" />
        ) : (
          <div
            key={index}
            className={`rounded-sm py-3 text-center ${heatClass(cell.rate, cell.battles)}`}
            title={cell.rate === null ? undefined : t.heatCell(rowName, name(cell.col), Math.round(cell.rate * 100), cell.battles)}
          >
            {cell.rate === null ? "" : Math.round(cell.rate * 100)}
          </div>
        ),
      )}
    </>
  );
}

/** Rough label boxes (monospace, 11.5px): nudge a label down until it no
 *  longer overlaps a label or point already placed. */
function placeLabels<T extends { cx: number; cy: number; label: string }>(items: T[]) {
  const boxes: { x0: number; x1: number; y0: number; y1: number }[] = items.map(({ cx, cy }) => ({
    x0: cx - 8, x1: cx + 8, y0: cy - 8, y1: cy + 8,
  }));
  const placed: (T & { right: boolean; labelY: number })[] = [];
  for (const item of [...items].sort((a, b) => a.cy - b.cy)) {
    const right = item.cx > WIDTH * 0.7;
    const width = item.label.length * 7;
    const x0 = right ? item.cx - 10 - width : item.cx + 10;
    let labelY = item.cy - 8;
    for (let tries = 0; tries < 12; tries++) {
      const box = { x0, x1: x0 + width, y0: labelY - 11, y1: labelY + 3 };
      const hit = boxes.some((other) => box.x0 < other.x1 && other.x0 < box.x1 && box.y0 < other.y1 && other.y0 < box.y1);
      if (!hit) break;
      labelY += 14;
    }
    boxes.push({ x0, x1: x0 + width, y0: labelY - 11, y1: labelY + 3 });
    placed.push({ ...item, right, labelY });
  }
  return placed;
}

const WIDTH = 600;
const HEIGHT = 320;
const PAD = 32;

function Scatter({
  points,
  name,
  t,
}: {
  points: ReturnType<typeof scatterPoints>;
  name: (key: string) => string;
  t: LeaderboardDictionary;
}) {
  if (points.length === 0) return null;
  const span = (values: number[]) => {
    const low = Math.min(...values);
    const high = Math.max(...values);
    return high - low < 1e-9 ? [low - 1, high + 1] : [low, high];
  };
  const [xLow, xHigh] = span(points.map((p) => p.efficiency));
  const [yLow, yHigh] = span(points.map((p) => p.quality));
  const x = (value: number) => PAD + ((value - xLow) / (xHigh - xLow)) * (WIDTH - 2 * PAD);
  const y = (value: number) => HEIGHT - PAD - ((value - yLow) / (yHigh - yLow)) * (HEIGHT - 2 * PAD);
  const fill = (tier: number) => (tier === 1 ? "var(--accent)" : tier === 2 ? "var(--ink-1)" : "var(--ink-3)");
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={t.scatterTitle}>
      {[0.25, 0.5, 0.75].map((f) => (
        <g key={f} stroke="var(--line-0)" strokeDasharray="3 3">
          <line x1={PAD} x2={WIDTH - PAD} y1={PAD + f * (HEIGHT - 2 * PAD)} y2={PAD + f * (HEIGHT - 2 * PAD)} />
          <line y1={PAD} y2={HEIGHT - PAD} x1={PAD + f * (WIDTH - 2 * PAD)} x2={PAD + f * (WIDTH - 2 * PAD)} />
        </g>
      ))}
      <line x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} stroke="var(--line-1)" />
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="var(--line-1)" />
      <text x={WIDTH - PAD} y={PAD - 10} textAnchor="end" fill="var(--accent)" fontSize="11" fontFamily="var(--stack-mono)">{t.quadrant}</text>
      <text x={WIDTH - PAD} y={HEIGHT - 8} textAnchor="end" fill="var(--ink-3)" fontSize="11" fontFamily="var(--stack-mono)">{t.axisEfficiency}</text>
      <text x={12} y={PAD} fill="var(--ink-3)" fontSize="11" fontFamily="var(--stack-mono)" transform={`rotate(-90 12 ${PAD})`} textAnchor="end">{t.axisQuality}</text>
      {placeLabels(points.map((point) => ({ point, cx: x(point.efficiency), cy: y(point.quality), label: name(point.key) }))).map(({ point, cx, cy, right, labelY }) => {
        return (
          <g key={point.key}>
            <circle cx={cx} cy={cy} r={point.tier === 1 ? 7 : 6} fill={fill(point.tier)} />
            <text
              x={right ? cx - 10 : cx + 10}
              y={labelY}
              textAnchor={right ? "end" : "start"}
              fill="var(--ink-1)"
              fontSize="11.5"
              fontFamily="var(--stack-mono)"
            >
              {name(point.key)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
