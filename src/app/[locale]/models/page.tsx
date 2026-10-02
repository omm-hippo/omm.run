import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModelExplorer from "@/components/models/ModelExplorer";
import { OG_LOCALE, alternatesFor, isLocale, localeHref } from "@/i18n/config";
import { getModelDictionary } from "@/i18n/models";
import { MODEL_WIKI_REVIEWED_AT, WIKI_MODELS, localizeModel } from "@/lib/models/catalog";

export async function generateMetadata({ params }: PageProps<"/[locale]/models">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getModelDictionary(locale);
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternatesFor("/models", locale), openGraph: { title: t.metaTitle, description: t.metaDescription, url: localeHref("/models", locale), locale: OG_LOCALE[locale] } };
}

export default async function ModelsPage({ params }: PageProps<"/[locale]/models">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getModelDictionary(locale);
  return <main className="flex-1">
    <div className="mx-auto w-full max-w-page px-5 pt-8 pb-20 md:px-8 md:pt-16">
      <div className="border-b border-line-1 pb-6 md:pb-8">
        <p className="text-label text-accent">{t.eyebrow} / 01</p>
        <h1 className="mt-4 max-w-[24ch] text-[28px] leading-[1.2] font-semibold tracking-tight text-ink-0 md:text-[48px]">{t.heading}</h1>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <p className="max-w-[65ch] text-ink-2"><span className="sm:hidden">{t.mobileLede}</span><span className="hidden sm:inline">{t.lede}</span></p>
          <p className="shrink-0 text-[12px] text-ink-2"><span className="font-mono text-ink-0">{WIKI_MODELS.length}</span> {t.checkpoints}<br className="hidden sm:block" /><span className="sm:hidden"> · </span>{t.reviewed} <time className="font-mono" dateTime={MODEL_WIKI_REVIEWED_AT}>{MODEL_WIKI_REVIEWED_AT}</time></p>
        </div>
      </div>
      <div className="mt-8"><ModelExplorer locale={locale} models={WIKI_MODELS.map((model) => localizeModel(model, locale))} /></div>
      <div className="mt-12 grid gap-6 border-t border-line-1 pt-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
        <h2 className="text-[18px] font-medium text-ink-0">{t.evidenceTitle}</h2>
        <div className="max-w-[76ch] text-small text-ink-2"><p>{t.evidenceNote}</p><p className="mt-3">{t.sizeNote}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2"><a href={`/api/models?locale=${locale}`} className="text-accent">{t.json} ↗</a><a href="https://github.com/omm-hippo/omm.run/issues/new" target="_blank" rel="noreferrer" className="text-ink-1 hover:text-accent">{t.contribution} ↗</a></div>
        </div>
      </div>
    </div>
  </main>;
}
