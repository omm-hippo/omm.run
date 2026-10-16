import type { LeaderboardDictionary } from "@/i18n/leaderboard";
import {
  efficiencyText,
  modelName,
  provisionalModels,
  qualityText,
  rankedModels,
  scopeHref,
} from "@/lib/leaderboard/view";
import type { ArenaModel, Scope } from "@/lib/leaderboard/types";

/** Rows grouped under tier bands; tier 1 on the accent wash. Quality is the
 *  primary order (the artifact's own order); efficiency is a relative
 *  multiplier shown only when it is comparable. */
export default function TierTable({
  t,
  scope,
  scopeKey,
  selected,
}: {
  t: LeaderboardDictionary;
  scope: Scope;
  scopeKey: string;
  selected: string | null;
}) {
  const ranked = rankedModels(scope);
  const provisional = provisionalModels(scope);
  const tiers = [...new Set(ranked.map((model) => model.quality.tier as number))];
  const incomparable = ranked.some((model) => model.efficiency && !model.efficiency_comparable);
  return (
    <>
      <div className="relative mt-4 overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[13px] leading-[1.45]">
          <thead>
            <tr className="bg-bg-2 text-left text-[11px] tracking-[.06em] text-ink-3 uppercase">
              <th scope="col" className="px-3 py-2 font-medium">{t.colModel}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">{t.colQuality}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium" title={t.efficiencyHelp}>{t.colEfficiency}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">{t.colBattles}</th>
              <th scope="col" className="px-3 py-2"><span className="sr-only">{t.oftenFails}</span></th>
            </tr>
          </thead>
          {tiers.map((tier) => (
            <tbody key={tier}>
              <tr>
                <td colSpan={5} className="px-3 pt-4 pb-1.5">
                  <span className={`font-mono text-[11px] font-medium tracking-[.06em] uppercase ${tier === 1 ? "text-accent" : "text-ink-2"}`}>
                    {t.tier(tier)}
                  </span>
                  {tier === 1 ? <span className="ml-2 font-sans text-[12px] text-ink-3">{t.tierOneWhy}</span> : null}
                </td>
              </tr>
              {ranked
                .filter((model) => model.quality.tier === tier)
                .map((model) => (
                  <Row key={model.key} t={t} model={model} scopeKey={scopeKey} top={tier === 1} on={model.key === selected} />
                ))}
            </tbody>
          ))}
        </table>
      </div>
      {incomparable ? <p className="mt-3 font-mono text-[12px] text-ink-3">{t.incomparable}</p> : null}
      {provisional.length > 0 ? (
        <details className="mt-3 border-t border-dashed border-line-1 px-3 pt-3 font-mono text-[12px] text-ink-3">
          <summary className="cursor-pointer">{t.provisional(provisional.length)}</summary>
          <ul className="mt-2 space-y-1">
            {provisional.map((model) => (
              <li key={model.key}>{modelName(model).name}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}

function Row({
  t,
  model,
  scopeKey,
  top,
  on,
}: {
  t: LeaderboardDictionary;
  model: ArenaModel;
  scopeKey: string;
  top: boolean;
  on: boolean;
}) {
  const { name, org, quant } = modelName(model);
  const quality = qualityText(model);
  const efficiency = efficiencyText(model);
  const background = on ? (top ? "bg-accent-line/40" : "bg-bg-3") : top ? "bg-accent-wash" : "";
  return (
    <tr className={`border-t border-line-0 ${background}`}>
      <td className={`border-l-2 px-3 py-2.5 ${top ? "border-accent" : "border-transparent"}`}>
        <a href={scopeHref(scopeKey, model.key)} className="block hover:underline">
          <span className={`block font-sans leading-[1.3] text-ink-0 ${top ? "text-[17px] font-semibold" : "text-[15px] font-medium"}`}>
            {name}
          </span>
          <span className="text-[11.5px] text-ink-3">{[org, quant].filter(Boolean).join(" · ")}</span>
        </a>
      </td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap">
        <span className={top ? "font-bold text-accent" : "text-ink-0"}>{quality.score}</span>
        <span className="ml-1.5 text-[11.5px] text-ink-3">±{quality.half}</span>
      </td>
      <td className="px-3 py-2.5 text-right text-ink-1">{efficiency ?? "—"}</td>
      <td className="px-3 py-2.5 text-right text-ink-1">{model.battles}</td>
      <td className="px-3 py-2.5">
        {model.quality_warning ? (
          <span className="rounded-sm border border-line-1 bg-bg-2 px-1.5 py-px text-[10.5px] whitespace-nowrap text-ink-0">
            <span className="mr-1 font-bold text-accent">!</span>
            {t.oftenFails}
          </span>
        ) : null}
      </td>
    </tr>
  );
}
