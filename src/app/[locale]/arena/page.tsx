import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Leaderboard from "@/components/arena/Leaderboard";
import { arenaDictionary } from "@/i18n/arena";
import { alternatesFor, isLocale, localeHref } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = arenaDictionary(locale);
  return { title: `${t.title} — omm`, description: t.lede, alternates: alternatesFor("/arena", locale) };
}
export default async function ArenaPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = arenaDictionary(locale);
  return <main className="flex-1"><div className="mx-auto w-full max-w-page px-5 pt-8 pb-20 md:px-8 md:pt-16">
    <div className="border-b border-line-1 pb-8"><p className="text-label text-accent">{t.eyebrow}</p><h1 className="mt-4 text-[28px] leading-[1.2] font-semibold tracking-tight text-ink-0 md:text-[48px]">{t.title}</h1><p className="mt-5 max-w-[70ch] text-ink-2">{t.lede}</p></div>
    <section aria-label={t.title} className="mt-8"><Leaderboard locale={locale} /></section>
    <section className="mt-12 grid gap-6 border-t border-line-1 pt-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10"><h2 className="text-[18px] font-medium text-ink-0">{t.methodology}</h2><div className="max-w-[76ch] text-small text-ink-2"><p>{t.notes}</p><div className="mt-5 flex flex-wrap gap-x-6 gap-y-3"><a href="https://github.com/omm-hippo/omm/blob/e8b6c2d69be4ef819aa5f2af4ce75066b9bf4262/docs/superpowers/specs/2026-09-26-arena-vote-aggregation-design.md" className="text-accent">{t.source} ↗</a><a href={localeHref("/commands/arena", locale)} className="text-ink-1">{t.participate} ↗</a><a href="/api/arena" target="_blank" rel="noreferrer" className="text-ink-1">{t.json} ↗</a></div><code className="mt-5 block text-ink-1">omm arena --leaderboard</code></div></section>
  </div></main>;
}
