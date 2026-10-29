'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { localeHref, type Locale } from '@/i18n/config';
import { getModelDictionary } from '@/i18n/models';
import { getRecommendationDictionary } from '@/i18n/model-recommendation';
import { ACCELERATORS, CONTEXTS, SYSTEMS, recommendModels, validateProfile, type HardwareProfile, type ProfileIssue } from '@/lib/models/recommend';
import { MODEL_TASKS, type ModelTask, type ModelView } from '@/lib/models/types';

const CONTROL = 'mt-2 w-full min-w-0 rounded-md border border-line-1 bg-bg-0 px-3 py-3 text-small text-ink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
type Draft = { system: HardwareProfile['system'] | ''; accelerator: HardwareProfile['accelerator'] | ''; ram: string; vram: string; disk: string; task: ModelTask | ''; bits: 4 | 8; context: HardwareProfile['context'] };
const EMPTY: Draft = { system: '', accelerator: '', ram: '', vram: '', disk: '', task: '', bits: 4, context: 4096 };
const PRESETS: readonly Draft[] = [
  { ...EMPTY, system: 'windows', accelerator: 'cpu', ram: '16' },
  { ...EMPTY, system: 'windows', accelerator: 'nvidia', ram: '32', vram: '12' },
  { ...EMPTY, system: 'macos', accelerator: 'apple', ram: '24' },
];
function toProfile(draft: Draft): HardwareProfile {
  return { system: draft.system as HardwareProfile['system'], accelerator: draft.accelerator as HardwareProfile['accelerator'], ramGB: Number(draft.ram), vramGB: draft.vram.trim() ? Number(draft.vram) : undefined, diskGB: draft.disk.trim() ? Number(draft.disk) : undefined, task: draft.task || undefined, bits: draft.bits, context: draft.context };
}

export default function ModelRecommender({ models, locale }: { models: readonly ModelView[]; locale: Locale }) {
  const t = getRecommendationDictionary(locale);
  const wiki = getModelDictionary(locale);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [submitted, setSubmitted] = useState<HardwareProfile | null>(null);
  const [issues, setIssues] = useState<ProfileIssue[]>([]);
  const dedicated = ['nvidia', 'amd', 'intel'].includes(draft.accelerator);
  const candidates = submitted ? recommendModels(models, submitted) : [];
  const gb = (value: number) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} GB`;
  // An edited form must never leave recommendations for the old specs visible.
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setSubmitted(null);
    setIssues([]);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const profile = toProfile(draft);
    const errors = validateProfile(profile);
    setIssues(errors);
    setSubmitted(errors.length ? null : profile);
  }
  function applyPreset(preset: Draft) { setDraft({ ...preset }); setIssues([]); setSubmitted(null); }
  function reset() { setDraft(EMPTY); setSubmitted(null); setIssues([]); }

  return <section aria-labelledby="pc-heading">
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <div className="min-w-0">
        <h2 id="pc-heading" className="text-[24px] font-medium text-ink-0">{t.title}</h2>
        <p className="mt-3 text-small text-ink-2">{t.intro}</p>
        <form onSubmit={submit} noValidate className="mt-6">
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0 text-small text-ink-1" htmlFor="pc-system">{t.system}
              <select id="pc-system" required value={draft.system} aria-invalid={issues.includes('system')} className={CONTROL} onChange={(event) => {
                const system = event.target.value as Draft['system'];
                setDraft((previous) => ({ ...previous, system, accelerator: system !== 'macos' && previous.accelerator === 'apple' ? '' : previous.accelerator }));
                setSubmitted(null); setIssues([]);
              }}><option value="">{t.choose}</option>{SYSTEMS.map((value) => <option key={value} value={value}>{t.systems[value]}</option>)}</select>
            </label>
            <label className="min-w-0 text-small text-ink-1" htmlFor="pc-accelerator">{t.accelerator}
              <select id="pc-accelerator" required value={draft.accelerator} aria-invalid={issues.includes('accelerator')} className={CONTROL} onChange={(event) => change('accelerator', event.target.value as Draft['accelerator'])}><option value="">{t.choose}</option>{ACCELERATORS.filter((value) => value !== 'apple' || draft.system === 'macos').map((value) => <option key={value} value={value}>{t.accelerators[value]}</option>)}</select>
            </label>
            <label className="min-w-0 text-small text-ink-1" htmlFor="pc-ram">{draft.accelerator === 'apple' ? t.unified : t.ram}
              <input id="pc-ram" type="number" inputMode="decimal" min={4} max={2048} step="any" required value={draft.ram} aria-describedby="pc-memory-hint" aria-invalid={issues.includes('ram')} onChange={(event) => change('ram', event.target.value)} className={CONTROL} placeholder="16" />
            </label>
            {dedicated ? <label className="min-w-0 text-small text-ink-1" htmlFor="pc-vram">{t.vram}
              <input id="pc-vram" type="number" inputMode="decimal" min={1} max={512} step="any" required value={draft.vram} aria-describedby="pc-memory-hint" aria-invalid={issues.includes('vram')} onChange={(event) => change('vram', event.target.value)} className={CONTROL} placeholder="8" />
            </label> : null}
            <label className="min-w-0 text-small text-ink-1" htmlFor="pc-task">{t.task}
              <select id="pc-task" value={draft.task} className={CONTROL} onChange={(event) => change('task', event.target.value as Draft['task'])}><option value="">{t.general}</option>{MODEL_TASKS.map((value) => <option key={value} value={value}>{wiki.tasks[value]}</option>)}</select>
            </label>
          </div>
          <p id="pc-memory-hint" className="mt-3 text-[12px] leading-relaxed text-ink-2">{t.memoryHint}</p>
          <details className="mt-5 border-y border-line-0 py-4">
            <summary className="cursor-pointer text-small text-ink-1">{t.advanced}</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="min-w-0 text-small text-ink-1" htmlFor="pc-bits">{t.bits}<select id="pc-bits" value={draft.bits} className={CONTROL} onChange={(event) => change('bits', Number(event.target.value) as 4 | 8)}>{[4, 8].map((value) => <option key={value} value={value}>{value}-bit</option>)}</select></label>
              <label className="min-w-0 text-small text-ink-1" htmlFor="pc-context">{t.context}<select id="pc-context" value={draft.context} className={CONTROL} onChange={(event) => change('context', Number(event.target.value) as Draft['context'])}>{CONTEXTS.map((value) => <option key={value} value={value}>{new Intl.NumberFormat(locale).format(value)} tokens</option>)}</select></label>
              <label className="min-w-0 text-small text-ink-1 sm:col-span-2" htmlFor="pc-disk">{t.disk}<input id="pc-disk" type="number" inputMode="decimal" min={0} max={100000} step="any" value={draft.disk} aria-invalid={issues.includes('disk')} onChange={(event) => change('disk', event.target.value)} className={CONTROL} /></label>
            </div><p className="mt-3 text-[12px] leading-relaxed text-ink-2">{t.bitsHint}</p>
          </details>
          {issues.length ? <div role="alert" className="mt-4 border-l-2 border-accent pl-4 text-small text-ink-1"><p>{t.invalid}</p><ul className="mt-2 list-disc pl-4">{issues.map((issue) => <li key={issue}>{t.issues[issue]}</li>)}</ul></div> : null}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button type="submit" className="rounded-md bg-accent px-5 py-3 text-small font-medium text-accent-ink hover:bg-accent-press" aria-controls="pc-results">{t.submit} →</button>
            <button type="button" onClick={reset} className="text-small text-ink-2 underline underline-offset-4">{t.reset}</button>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-2">{t.privacy}</p>
        </form>
        <details className="mt-5 text-small text-ink-2"><summary className="cursor-pointer">{t.help}</summary><p className="mt-3 leading-relaxed">{t.helpText}</p></details>
        <div className="mt-6 border-t border-line-0 pt-5"><p className="text-[12px] text-ink-2">{t.examples}</p><div className="mt-3 flex flex-wrap gap-2">{PRESETS.map((preset, index) => <button key={index} type="button" onClick={() => applyPreset(preset)} className="rounded-sm border border-line-1 px-2 py-2 text-[12px] text-ink-1 hover:border-accent-line hover:text-accent">{t.presets[index]}</button>)}</div></div>
      </div>
      <div id="pc-results" className="min-w-0 border-t-2 border-accent-line pt-5" aria-labelledby="pc-results-heading">
        <h2 id="pc-results-heading" className="text-[24px] font-medium text-ink-0">{t.results}</h2>
        <div role="status" aria-live="polite" className="mt-3 text-small text-ink-2">{submitted ? `${candidates.length} ${t.count}` : t.placeholder}</div>
        {!submitted ? <p className="mt-6 max-w-[45ch] text-ink-2">{t.placeholderBody}</p> : <>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-2">{t.systems[submitted.system]} · {gb(submitted.ramGB)} {submitted.accelerator === 'apple' ? 'unified' : 'RAM'}{submitted.vramGB !== undefined && ['nvidia', 'amd', 'intel'].includes(submitted.accelerator) ? ` · ${gb(submitted.vramGB)} VRAM` : ''} · {submitted.bits}-bit · {new Intl.NumberFormat(locale).format(submitted.context)} tokens</p>
          {candidates.length === 0 ? <div className="mt-6 border-y border-line-1 py-6"><h3 className="font-medium text-ink-0">{t.noResults}</h3><p className="mt-3 text-small text-ink-2">{t.noResultsHint}</p></div> : <ol className="mt-5">{candidates.slice(0, 3).map((candidate, index) => <li key={candidate.model.id} data-recommendation-id={candidate.model.id} className="border-t border-line-1 py-6">
            <div className="flex items-start gap-4"><span aria-hidden="true" className="pt-1 font-mono text-small text-accent">0{index + 1}</span><div className="min-w-0 flex-1">
              <p className="text-[12px] text-ink-2">{candidate.model.publisher} · {candidate.model.sizeLabel}</p>
              <h3 className="mt-2 break-words text-[22px] leading-snug font-medium text-ink-0">{candidate.model.name}</h3>
              <p className="mt-3 text-small text-ink-1">{candidate.model.chooseWhen}</p>
              <p className="mt-4 text-small text-accent">{t[candidate.headroom]} · {t.routes[candidate.route]}</p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-[12px]"><div><dt className="text-ink-2">{t.estimated}</dt><dd className="mt-1 font-mono text-ink-0">~{gb(candidate.planningGB)}</dd></div><div><dt className="text-ink-2">{t.budget}</dt><dd className="mt-1 font-mono text-ink-0">{gb(candidate.budgetGB)}</dd></div></dl>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-2">{candidate.route === 'gpu' ? t.gpuNote : candidate.route === 'unified' ? t.unifiedNote : t.cpuNote}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small">{candidate.model.sources[0] ? <a href={candidate.model.sources[0].url} target="_blank" rel="noreferrer" className="text-accent">{t.details} ↗</a> : null}<Link href={localeHref('/commands/fit', locale)} prefetch={false} className="text-ink-1 underline underline-offset-4">{t.fit}</Link></div>
            </div></div>
          </li>)}</ol>}
          <p className="mt-4 text-[12px] leading-relaxed text-ink-2">{t.order}</p>
          <p className="mt-3 text-small text-ink-2">{t.estimateNote}</p>
        </>}
      </div>
    </div>
    <details className="mt-10 border-y border-line-1 py-5 text-small text-ink-2"><summary className="cursor-pointer text-ink-1">{t.method}</summary><div className="mt-4 max-w-[85ch] space-y-3"><p>{t.formula}</p><p>{t.reserves}</p><p>{t.contextNote}</p><div className="flex flex-wrap gap-5"><a className="underline underline-offset-4" href="https://huggingface.co/docs/transformers/main/en/kv_cache" target="_blank" rel="noreferrer">{t.sourceCache} ↗</a><a className="underline underline-offset-4" href="https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md" target="_blank" rel="noreferrer">{t.sourceBackend} ↗</a></div></div></details>
  </section>;
}
