import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModelArticle from "@/components/models/ModelArticle";
import { alternatesFor, isLocale, localeHref, OG_LOCALE } from "@/i18n/config";
import { getModelDictionary } from "@/i18n/models";
import { WIKI_MODELS, getWikiModel, localizeModel } from "@/lib/models/catalog";

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

export default async function ModelPage({ params }: PageProps<"/[locale]/models/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const entry = getWikiModel(slug);
  if (!entry) notFound();
  return <ModelArticle model={localizeModel(entry, locale)} locale={locale} />;
}
