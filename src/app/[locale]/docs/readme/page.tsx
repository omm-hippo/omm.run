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

const SLUG = "readme" as const;
const PATH = "/docs/readme";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/docs/readme">): Promise<Metadata> {
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

// The README is fetched at request time; nothing to prerender.
export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: PageProps<"/[locale]/docs/readme">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DocPage locale={locale} slug={SLUG} wide />;
}
