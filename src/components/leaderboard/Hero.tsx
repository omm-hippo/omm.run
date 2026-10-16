import type { LeaderboardDictionary } from "@/i18n/leaderboard";
import { formatUpdated, rankedModels } from "@/lib/leaderboard/view";
import type { ArenaArtifact } from "@/lib/leaderboard/types";

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`font-mono text-[11px] leading-none font-medium tracking-[.06em] text-ink-3 uppercase ${className}`}>
      {children}
    </div>
  );
}

/** Title + lede, and - only when there is verified data - the KPI strip. */
export default function Hero({
  t,
  artifact,
  updatedAt,
  example,
}: {
  t: LeaderboardDictionary;
  artifact?: ArenaArtifact;
  /** When the shown ranking last changed (its scope's `updated_at`); a kept
   *  board can be much older than the run that last touched the file. */
  updatedAt?: string | null;
  example?: boolean;
}) {
  const updated = formatUpdated(updatedAt ?? null);
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] items-end gap-8 pt-10 pb-8 md:pt-16 lg:grid-cols-[7fr_5fr] lg:gap-12">
      <div>
        <Label>{t.eyebrow}</Label>
        <h1 className="mt-3 mb-2 text-[28px] leading-[1.25] font-semibold text-ink-0 md:text-[40px]">{t.title}</h1>
        <p className="max-w-[560px] text-[17px] leading-[1.65] text-ink-1">{t.lede}</p>
      </div>
      {artifact ? (
        <div>
          <div className="grid grid-cols-3 rounded-lg border border-line-0 bg-bg-1">
            {[
              [t.kpiVotes, artifact.corpus.rows_used],
              [t.kpiMachines, artifact.corpus.client_count],
              [t.kpiRanked, artifact.ranked ? rankedModels(artifact).length : 0],
            ].map(([label, value], index) => (
              <div key={String(label)} className={`p-4 ${index < 2 ? "border-r border-line-0" : ""}`}>
                <Label>{label}</Label>
                <div className="mt-2 font-mono text-[28px] leading-[1.1] font-medium text-ink-0">{value}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[12px] text-ink-3">
            {updated ? (
              <>
                {t.updated} <b className="font-medium text-ink-1">{updated}</b> ·{" "}
              </>
            ) : null}
            {t.verified}
          </p>
          {example ? <p className="mt-2 font-mono text-[12px] text-accent">{t.example}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
