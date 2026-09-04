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

const SLUG = "storage-location" as const;
const PATH = "/docs/storage-location";
const SECTION = "Storage location";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/docs/storage-location">): Promise<Metadata> {
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
}: PageProps<"/[locale]/docs/storage-location">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DocPage locale={locale} slug={SLUG} section={SECTION} />;
}
