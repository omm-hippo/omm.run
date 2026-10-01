"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { localeHref, type Locale } from "@/i18n/config";
import { getModelDictionary } from "@/i18n/models";
import { filterModels } from "@/lib/models/search";
import { MODEL_TASKS, isModelTask, type ModelTask, type ModelView } from "@/lib/models/types";
import { ContextValue } from "./ModelFacts";

const CONTROL = "rounded-md border border-line-1 bg-bg-1 px-3 py-2.5 text-small text-ink-0";

function Comparison({ models, locale, onClose }: { models: readonly ModelView[]; locale: Locale; onClose: () => void }) {
  const t = getModelDictionary(locale);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    section.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    section.current?.focus({ preventScroll: true });
  }, []);
  const rows = [
    { label: t.chooseWhen, value: (model: ModelView) => model.chooseWhen },
    { label: t.architecture, value: (model: ModelView) => model.architecture === "moe" ? t.moe : t.dense },
    { label: t.specs, value: (model: ModelView) => `${model.sizeLabel} ${t.total}${model.activeParametersB ? ` / ${model.activeParametersB}B ${t.active}` : ""}` },
    { label: t.context, value: (model: ModelView) => <ContextValue model={model} locale={locale} /> },
    { label: t.input, value: (model: ModelView) => model.inputs.map((input) => t.inputs[input]).join(" / ") },
    { label: t.tools, value: (model: ModelView) => model.toolCalling === true ? t.documented : t.unconfirmed },
    { label: t.cautions, value: (model: ModelView) => model.cautions.map((claim) => claim.text).join(" ") },
    { label: t.license, value: (model: ModelView) => <a href={model.license.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-accent">{model.license.label} ↗</a> },
    { label: t.evaluation, value: () => t.notMeasured },
  ];
  return (
    <section ref={section} tabIndex={-1} id="model-comparison" className="mt-10 scroll-mt-20 border-t border-accent-line pt-6" aria-label={t.comparison}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-h3">{t.comparison}</h2>
        <button type="button" onClick={onClose} className="text-small text-ink-2 hover:text-ink-0">{t.closeComparison} ×</button>
      </div>
      <div className="overflow-x-auto rounded-md border border-line-1" role="region" aria-label={t.comparison} tabIndex={0}>
        <table className="w-full min-w-[660px] table-fixed text-left text-small">
          <caption className="sr-only">{t.comparison}</caption>
          <thead className="bg-bg-2">
            <tr><th scope="col" className="w-36 p-4 text-ink-2">{t.model}</th>
              {models.map((model) => <th key={model.id} scope="col" className="p-4 align-top font-medium text-ink-0"><Link href={localeHref(`/models/${model.id}`, locale)} prefetch={false} className="hover:text-accent">{model.name} ↗</Link></th>)}
            </tr>
          </thead>
          <tbody>{rows.map((row) => <tr key={row.label} className="border-t border-line-0">
            <th scope="row" className="p-4 align-top font-normal text-ink-2">{row.label}</th>
            {models.map((model) => <td key={model.id} className="p-4 align-top text-ink-1">{row.value(model)}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <p className="text-small mt-4 text-ink-2">{t.sizeNote}</p>
    </section>
  );
}

export default function ModelExplorer({ models, locale }: { models: readonly ModelView[]; locale: Locale }) {
  const t = getModelDictionary(locale);
  const [query, setQuery] = useState("");
  const [task, setTask] = useState<ModelTask | undefined>();
  const [publisher, setPublisher] = useState("");
  const [visionOnly, setVisionOnly] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [comparing, setComparing] = useState(false);
  const visible = filterModels(models, { query, task, publisher: publisher || undefined, visionOnly });
  const comparisonModels = models.filter((model) => selected.includes(model.id));
  const publishers = [...new Set(models.map((model) => model.publisher))].sort();
  const clear = () => { setQuery(""); setTask(undefined); setPublisher(""); setVisionOnly(false); };
  const toggle = (id: string) => setSelected((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : previous.length < 3 ? [...previous, id] : previous);

  return (
    <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
      <aside>
        <h2 className="text-label mb-4">{t.taskHeading}</h2>
        <label className="block lg:hidden"><span className="sr-only">{t.taskHeading}</span>
          <select value={task ?? ""} onChange={(event) => setTask(isModelTask(event.target.value) ? event.target.value : undefined)} className={`${CONTROL} w-full`}>
            <option value="">{t.all} ({models.length})</option>
            {MODEL_TASKS.map((value) => <option key={value} value={value}>{t.tasks[value]} ({models.filter((model) => model.tasks.includes(value)).length})</option>)}
          </select>
        </label>
        <div className="hidden lg:flex lg:flex-col lg:gap-1" role="group" aria-label={t.taskHeading}>
          {[undefined, ...MODEL_TASKS].map((value) => {
            const active = task === value;
            return <button type="button" key={value ?? "all"} aria-pressed={active} onClick={() => setTask(value)} className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left text-small transition-colors ${active ? "border-accent-line bg-accent-wash text-accent" : "border-transparent text-ink-2 hover:bg-bg-2 hover:text-ink-0"}`}>
              <span>{value ? t.tasks[value] : t.all}</span>
              <span className="font-mono text-[11px]">{value ? models.filter((model) => model.tasks.includes(value)).length : models.length}</span>
            </button>;
          })}
        </div>
        <div className="mt-8 hidden border-t border-line-0 pt-5 lg:block">
          <p className="text-small text-ink-2">{t.openWeightsNote}</p>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="min-w-0"><span className="sr-only">{t.search}</span>
            <input type="search" value={query} maxLength={160} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} className={`${CONTROL} w-full`} />
          </label>
          <label><span className="sr-only">{t.publisher}</span>
            <select value={publisher} onChange={(event) => setPublisher(event.target.value)} className={`${CONTROL} w-full`}>
              <option value="">{t.allPublishers}</option>{publishers.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-small">
          <p role="status" aria-live="polite" className="text-ink-2"><span className="font-mono text-ink-0">{visible.length}</span> {t.result}</p>
          <label className="flex cursor-pointer items-center gap-2 text-ink-2"><input type="checkbox" checked={visionOnly} onChange={(event) => setVisionOnly(event.target.checked)} className="size-4 accent-accent" />{t.visionOnly}</label>
          {query || task || publisher || visionOnly ? <button type="button" onClick={clear} className="text-ink-2 underline underline-offset-4 hover:text-ink-0">{t.clear}</button> : null}
        </div>

        <div className="mt-5 border-t border-line-1">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_130px_52px] gap-5 border-b border-line-0 py-3 text-label lg:grid">
            <span>{t.model}</span><span>{t.bestFor}</span><span>{t.specs}</span><span>{t.compare}</span>
          </div>
          {visible.length === 0 ? <div className="border-b border-line-0 py-16 text-center"><p className="text-ink-0">{t.empty}</p><p className="text-small mt-2 text-ink-2">{t.emptyHint}</p><button type="button" onClick={clear} className="mt-5 text-small text-accent">{t.clear} ↗</button></div> : visible.map((model) => <article key={model.id} data-model-id={model.id} className="grid gap-4 border-b border-line-0 py-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_130px_52px] lg:gap-5">
            <div className="min-w-0">
              <p className="text-label mb-2">{model.publisher}</p>
              <h3 className="text-[19px] leading-tight font-medium text-ink-0"><Link href={localeHref(`/models/${model.id}`, locale)} prefetch={false} className="hover:text-accent">{model.name}</Link></h3>
              <p className="text-small mt-3 text-ink-2">{model.summary}</p>
              <Link href={localeHref(`/models/${model.id}`, locale)} prefetch={false} className="text-small mt-3 inline-block text-accent">{t.details} ↗</Link>
            </div>
            <div className="min-w-0">
              <p className="text-small text-ink-1">{model.chooseWhen}</p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-2">{model.tasks.map((value) => <span key={value}>{t.tasks[value]}</span>)}</div>
            </div>
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2 text-small lg:block">
              <p className="font-mono text-ink-0">{model.sizeLabel}{model.activeParametersB ? <span className="mt-1 block text-[11px] text-ink-2">{model.activeParametersB}B {t.active} · MoE</span> : <span className="mt-1 block text-[11px] text-ink-2">{t.dense}</span>}</p>
              <p className="font-mono text-ink-2 lg:mt-4">{new Intl.NumberFormat(locale).format(model.context.tokens)}<span className="mt-1 block text-[11px]">{model.context.basis === "native" ? t.native : t.configured}</span></p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 self-start text-small text-ink-2 lg:justify-center lg:pt-1">
              <input type="checkbox" aria-label={`${t.compare}: ${model.name}`} checked={selected.includes(model.id)} disabled={selected.length >= 3 && !selected.includes(model.id)} onChange={() => toggle(model.id)} className="size-4 accent-accent disabled:cursor-not-allowed disabled:opacity-40" />
              <span className="lg:sr-only">{t.compare}</span>
            </label>
          </article>)}
        </div>

        <div className={`${selected.length > 0 ? "sticky bottom-0 z-10" : ""} mt-5 border-y border-line-1 bg-bg-1 px-4 py-3`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-small text-ink-2">{selected.length > 0 ? `${selected.length}/3 ${t.selected}` : t.compareHint}</p>
            <button type="button" disabled={selected.length < 2} onClick={() => setComparing(true)} aria-expanded={comparing && selected.length >= 2} aria-controls="model-comparison" className="rounded-md border border-accent-line px-3 py-2 text-small text-accent hover:bg-accent-wash disabled:border-line-1 disabled:text-ink-3 disabled:cursor-not-allowed">{t.compareSelected} ↓</button>
          </div>
          {selected.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{comparisonModels.map((model) => <button key={model.id} type="button" onClick={() => toggle(model.id)} aria-label={`${t.clearSelected}: ${model.name}`} className="rounded-sm border border-line-1 px-2 py-1 font-mono text-[11px] text-ink-2 hover:text-ink-0">{model.name} ×</button>)}</div> : null}
          {selected.length === 3 ? <p className="text-small mt-2 text-ink-2" role="status">{t.compareMax}</p> : null}
        </div>
        {comparing && comparisonModels.length >= 2 ? <Comparison models={comparisonModels} locale={locale} onClose={() => setComparing(false)} /> : null}
      </div>
    </div>
  );
}
