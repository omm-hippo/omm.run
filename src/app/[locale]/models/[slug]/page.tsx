import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModelFacts } from "@/components/models/ModelFacts";
import { alternatesFor, isLocale, localeHref, OG_LOCALE, type Locale } from "@/i18n/config";
import { getModelDictionary } from "@/i18n/models";
import { WIKI_MODELS, getWikiModel, localizeModel } from "@/lib/models/catalog";
import type { ModelView } from "@/lib/models/types";

// Prebuild known entries; unknown ids still reach the checkpoint validation.
export function generateStaticParams() { return WIKI_MODELS.map((model) => ({ slug: model.id })); }

export async function generateMetadata({ params }: PageProps<"/[locale]/models/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const model = getWikiModel(slug);
  if (!model) notFound();
  const t = getModelDictionary(locale);
  const title = `${model.name} — ${t.eyebrow.toLowerCase()} — omm`;
  return { title, description: model.summary[locale], alternates: alternatesFor(`/models/${slug}`, locale), openGraph: { title, description: model.summary[locale], url: localeHref(`/models/${slug}`, locale), locale: OG_LOCALE[locale] } };
}

function Claims({ claims, model, locale }: { claims: ModelView["strengths"]; model: ModelView; locale: Locale }) {
  const t = getModelDictionary(locale);
  return <ul className="mt-4 space-y-5">{claims.map((claim, index) => {
    const source = model.sources.find((value) => value.id === claim.sourceId);
    return <li key={index} className="border-l border-line-1 pl-4"><p className="text-ink-1">{claim.text}</p>
      <p className="text-small mt-1 text-ink-2">{claim.basis === "publisher" ? t.publisherClaim : t.editorial}{source ? <> · <a href={source.url} target="_blank" rel="noreferrer" className="underline decoration-line-1 underline-offset-4 hover:text-accent">{source.id === "card" ? t.repository : source.title} ↗</a></> : null}</p>
    </li>;
  })}</ul>;
}

export default async function ModelPage({ params }: PageProps<"/[locale]/models/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const entry = getWikiModel(slug);
  if (!entry) notFound();
  const model = localizeModel(entry, locale);
  const t = getModelDictionary(locale);
  return <main className="flex-1">
    <article className="mx-auto w-full max-w-page px-5 pt-10 pb-20 md:px-8 md:pt-14">
      <Link href={localeHref("/models", locale)} prefetch={false} className="text-small text-ink-2 hover:text-accent">← {t.back}</Link>
      <div className="mt-8 border-b border-line-1 pb-8">
        <p className="text-label text-accent">{t.eyebrow} / {model.publisher}</p>
        <h1 className="mt-4 text-[32px] leading-[1.2] font-semibold tracking-tight text-ink-0 md:text-[48px]">{model.name}</h1>
        <p className="text-lede mt-5 max-w-[70ch]">{model.summary}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small text-ink-2">{model.tasks.map((task) => <span key={task}>{t.tasks[task]}</span>)}<span>{t.lastReviewed} <time dateTime={model.reviewedAt}>{model.reviewedAt}</time></span></div>
      </div>
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-16">
        <div className="min-w-0 space-y-9">
          <section><h2 className="text-h3">{t.chooseWhen}</h2><p className="mt-4 text-ink-1">{model.chooseWhen}</p><p className="text-small mt-2 text-ink-2">{t.editorial}</p></section>
          <section><h2 className="text-h3">{t.strengths}</h2><Claims claims={model.strengths} model={model} locale={locale} /></section>
          <section><h2 className="text-h3">{t.cautions}</h2><Claims claims={model.cautions} model={model} locale={locale} /></section>
          <section><h2 className="text-h3">{t.runtime}</h2><p className="mt-4 text-ink-1">{model.runtimeNote}</p><p className="text-small mt-2 text-ink-2">{t.evidenceNote}</p></section>
          <section className="border-t border-line-1 pt-7"><h2 className="text-h3">{t.handoffHeading}</h2><p className="text-small mt-4 text-ink-2">{t.handoffBody}</p>
            <pre className="mt-4 overflow-x-auto rounded-md border border-line-1 bg-bg-1 p-4 font-mono text-small text-ink-0"><code>{`omm search "${model.name}"`}</code></pre>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small text-accent">{[["search", t.searchCommand], ["fit", t.fitCommand], ["benchmark", t.benchmarkCommand]].map(([command, label]) => <Link key={command} href={localeHref(`/commands/${command}`, locale)} prefetch={false}>{label} ↗</Link>)}</div>
          </section>
        </div>
        <aside className="min-w-0">
          <ModelFacts model={model} locale={locale} />
          <p className="text-small mt-4 text-ink-2">{t.sizeNote}</p>
          <section className="mt-8"><h2 className="text-label">{t.officialSources}</h2><ul className="mt-4 space-y-4">{model.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer" className="text-small break-words text-ink-1 hover:text-accent">{source.title} ↗</a><p className="text-[12px] text-ink-2">{t.reviewed} {source.accessedAt}</p></li>)}</ul></section>
          <a href={`/api/models?locale=${locale}&id=${model.id}`} className="text-small mt-8 inline-block text-accent">{t.json} ↗</a>
          <p className="text-small mt-5 text-ink-2">{t.openWeightsNote}</p>
        </aside>
      </div>
    </article>
  </main>;
}
