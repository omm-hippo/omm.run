import type { LeaderboardDictionary } from "@/i18n/leaderboard";
import {
  efficiencyText,
  installRef,
  modelName,
  mostBeaten,
  qualityText,
} from "@/lib/leaderboard/view";
import type { ArenaModel, Scope } from "@/lib/leaderboard/types";

import CopyCommand from "./CopyCommand";
import { Label } from "./Hero";

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-t border-line-1 py-2 text-[13px]">
      <span className="text-ink-2">{label}</span>
      <span className="text-right font-mono text-ink-0">{value}</span>
    </div>
  );
}

export default function ModelDrawer({
  t,
  scope,
  model,
}: {
  t: LeaderboardDictionary;
  scope: Scope;
  model: ArenaModel;
}) {
  const { name, quant } = modelName(model);
  const quality = qualityText(model);
  const efficiency = efficiencyText(model);
  const beaten = mostBeaten(scope, model.key);
  const opponent = beaten ? scope.models.find((entry) => entry.key === beaten.key) : undefined;
  const ref = installRef(model);
  return (
    <aside aria-label={t.selected} className="border-t border-line-1 bg-bg-2 px-4 py-6 text-[14px] lg:border-t-0 lg:border-l">
      <Label>{t.selected}</Label>
      <div className="mt-2 mb-1 text-[19px] leading-[1.3] font-semibold text-ink-0">{name}</div>
      <div className="mb-4 font-mono text-[11.5px] break-all text-ink-3">
        {[model.repo_id, quant].filter(Boolean).join(" · ")}
      </div>
      <Line label={t.dQuality} value={`${t.tier(model.quality.tier ?? 0)} · ${quality.score}`} />
      <Line label={t.dInterval} value={`${model.quality.ci_low.toFixed(2)} – ${model.quality.ci_high.toFixed(2)}`} />
      <Line label={t.dBothBad} value={`${Math.round(model.both_bad_rate * 100)}%`} />
      <Line label={t.dEfficiency} value={efficiency ?? "—"} />
      {model.efficiency ? (
        <Line label={t.dReference} value={`${model.efficiency.raw_median_tok_s_per_gb.toFixed(1)} tok/s·GB`} />
      ) : null}
      <Line label={t.dBattles} value={`${model.battles} (${model.effective_battles.toFixed(1)})`} />
      {beaten && opponent ? (
        <Line
          label={t.dBeaten}
          value={t.beaten(modelName(opponent).name, Math.round(beaten.rate * 100), beaten.battles)}
        />
      ) : null}
      {ref ? (
        <CopyCommand command={`omm install ${ref}`} copyLabel={t.copy} copiedLabel={t.copied} />
      ) : (
        <p className="mt-4 text-[12px] text-ink-3">{t.noInstall}</p>
      )}
      <CopyCommand command="omm arena" copyLabel={t.copy} copiedLabel={t.copied} variant="button" />
      <p className="mt-1 text-center text-[12px] text-ink-3">{t.arenaCta}</p>
    </aside>
  );
}
