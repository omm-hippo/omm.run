import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LeaderboardView from "@/components/leaderboard/LeaderboardView";
import { OG_LOCALE, alternatesFor, isLocale, localeHref } from "@/i18n/config";
import { leaderboardDictionary } from "@/i18n/leaderboard";
import { fetchBoard } from "@/lib/leaderboard/source";

const PATH = "/leaderboard";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = leaderboardDictionary(locale);
  return {
    title: t.metaTitle,
    description: t.lede,
    alternates: alternatesFor(PATH, locale),
    openGraph: {
      type: "website",
      siteName: "omm",
      url: localeHref(PATH, locale),
      locale: OG_LOCALE[locale],
      title: t.metaTitle,
      description: t.lede,
    },
  };
}

// The signed board is fetched and verified at request time.
export const dynamic = "force-dynamic";

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function LeaderboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const state = await fetchBoard();
  return (
    <main className="flex-1">
      <LeaderboardView
        state={state}
        locale={locale}
        scope={single(query.scope)}
        model={single(query.model)}
      />
    </main>
  );
}
