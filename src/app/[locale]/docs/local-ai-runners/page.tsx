import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DocPage from "@/components/docs/DocPage";
import {
  OG_LOCALE,
  alternatesFor,
  isLocale,
  localeHref,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const SLUG = "local-ai-runners" as const;
const PATH = "/docs/local-ai-runners";
const SECTION = "Local AI runners";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/docs/local-ai-runners">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getDictionary(locale).docs.pages[SLUG];

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: alternatesFor(PATH),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref(PATH, locale),
      locale: OG_LOCALE[locale],
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: PageProps<"/[locale]/docs/local-ai-runners">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DocPage locale={locale} slug={SLUG} section={SECTION} />;
}
