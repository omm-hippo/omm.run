"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { arenaDictionary } from "@/i18n/arena";
import { orderedModels, type ArenaModel, type ArenaState } from "@/lib/arena/leaderboard";

function Efficiency({ model, locale }: { model: ArenaModel; locale: Locale }) {
  const t = arenaDictionary(locale), measured = model.efficiency;
  if (!measured) return <span className="text-ink-2">{t.unmeasured}</span>;
  return <><span className="font-mono text-ink-0">{measured.rating >= 0 ? "+" : ""}{measured.rating.toFixed(2)}</span>
    <span className="mt-1 block text-[12px] text-ink-2">{t.groupName} {measured.component + 1}</span></>;
}

export default function Leaderboard({ locale }: { locale: Locale }) {
  const t = arenaDictionary(locale);
  const [state, setState] = useState<ArenaState | null>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [showProvisional, setShowProvisional] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/arena", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((value: ArenaState) => { if (!controller.signal.aborted) { setLoadedAt(Date.now()); setState(value); } })
      .catch(() => { if (!controller.signal.aborted) setState({ status: "error" }); });
    return () => controller.abort();
  }, []);

  const data = state?.status === "available" ? state.data : null;
  const groups = useMemo(() => [...new Set(data?.models.flatMap((model) => model.efficiency ? [model.efficiency.component] : []) ?? [])].sort((a, b) => a - b), [data]);
  const models = useMemo(() => orderedModels(data?.models ?? []).filter((model) =>
    (showProvisional || !model.provisional) &&
    (group === "all" || String(model.efficiency?.component) === group) &&
    `${model.display_filename ?? model.key} ${model.repo_id ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())), [data, query, group, showProvisional]);

  if (!state) return <p role="status" className="py-12 text-ink-2">{t.loading}</p>;
  if (state.status !== "available") {
    const heading = t[state.status], note = t[`${state.status}Note`];
    return <div className="border-y border-line-1 py-12" role="status">
      <h2 className="text-[22px] font-medium text-ink-0">{heading}</h2>
      <p className="mt-3 max-w-[65ch] text-ink-2">{note}</p>
      <code className="mt-6 block text-small text-accent">omm arena</code>
    </div>;
  }
  const stale = loadedAt - Date.parse(state.data.generated_at) > 7 * 86400_000;
  return <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-2">
      <p>{t.updated} <time dateTime={state.data.generated_at} className="font-mono text-ink-1">{state.data.generated_at.slice(0, 10)}</time> · {t.verified}</p>
      <p>{state.testData ? <span className="text-accent">{t.example}</span> : null}{stale ? <span className="ml-2 text-accent">{t.stale}</span> : null}</p>
    </div>
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <label className="min-w-[180px] flex-1 text-small text-ink-2">{t.search}
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-2 w-full rounded-md border border-line-1 bg-bg-1 px-3 py-2.5 text-ink-0 outline-none focus:border-accent" />
      </label>
      <label className="text-small text-ink-2">{t.group}
        <select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-2 block w-full rounded-md border border-line-1 bg-bg-1 px-3 py-2.5 text-ink-0">
          <option value="all">{t.all}</option>{groups.map((value) => <option key={value} value={value}>{t.groupName} {value + 1}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 py-2.5 text-small text-ink-1"><input type="checkbox" checked={showProvisional} onChange={(event) => setShowProvisional(event.target.checked)} className="accent-accent" />{t.provisionalToggle}</label>
    </div>
    <p aria-live="polite" className="mb-3 font-mono text-[12px] text-ink-2">{models.length} / {state.data.models.length}</p>
    <div className="hidden overflow-x-auto rounded-md border border-line-1 md:block">
      <table className="w-full text-left text-small">
        <thead className="bg-bg-2 text-ink-2"><tr>{[t.quality, t.model, t.efficiency, t.votes, t.bothBad].map((label) => <th key={label} scope="col" className="px-4 py-3 font-medium">{label}</th>)}</tr></thead>
        <tbody>{models.map((model) => <tr key={model.key} className="border-t border-line-0 align-top hover:bg-bg-1">
          <td className="px-4 py-4 font-mono text-accent">{model.provisional ? <span className="font-sans text-ink-2">{t.provisional}</span> : model.quality.tier}</td>
          <th scope="row" className="max-w-[38ch] px-4 py-4 font-normal"><span className="break-all font-medium text-ink-0">{model.display_filename ?? model.key}</span><span className="mt-1 block break-all text-[12px] text-ink-2">{model.repo_id}</span><span className="mt-2 block font-mono text-[11px] text-ink-2" title={t.interval}>[{model.quality.ci_low.toFixed(2)}, {model.quality.ci_high.toFixed(2)}]</span>{model.quality_warning ? <span className="mt-2 block text-[12px] text-accent">{t.warning}</span> : null}</th>
          <td className="px-4 py-4"><Efficiency model={model} locale={locale} /></td>
          <td className="px-4 py-4 font-mono text-ink-1">{model.effective_battles.toFixed(1)}</td>
          <td className="px-4 py-4 font-mono text-ink-1">{(model.both_bad_rate * 100).toFixed(0)}%</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="border-t border-line-1 md:hidden">{models.map((model) => <article key={model.key} className="border-b border-line-1 py-5">
      <div className="mb-3 flex items-center justify-between gap-3 text-small"><p className="text-accent">{model.provisional ? t.provisional : `${t.quality} ${model.quality.tier}`}</p><span className="font-mono text-ink-2">{t.votes} {model.effective_battles.toFixed(1)}</span></div>
      <h2 className="break-all font-medium text-ink-0">{model.display_filename ?? model.key}</h2><p className="mt-1 break-all text-[12px] text-ink-2">{model.repo_id}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-small"><div><p className="mb-1 text-ink-2">{t.efficiency}</p><Efficiency model={model} locale={locale} /></div><div><p className="mb-1 text-ink-2">{t.bothBad}</p><span className="font-mono text-ink-0">{(model.both_bad_rate * 100).toFixed(0)}%</span></div></div>
      <p className="mt-3 text-[12px] text-ink-2">{t.interval} [{model.quality.ci_low.toFixed(2)}, {model.quality.ci_high.toFixed(2)}]</p>
      {model.quality_warning ? <p className="mt-3 text-[12px] text-accent">{t.warning}</p> : null}
    </article>)}</div>
    {models.length === 0 ? <p role="status" className="border-b border-line-1 py-10 text-ink-2">{t.empty}</p> : null}
  </>;
}
