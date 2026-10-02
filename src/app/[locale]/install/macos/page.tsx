import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GuidePage from "@/components/install/GuidePage";
import { getGuide } from "@/components/install/guides";
import { OG_LOCALE, alternatesFor, isLocale, localeHref } from "@/i18n/config";

const SLUG = "macos" as const;
const PATH = "/install/macos";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/install/macos">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const guide = getGuide(SLUG, locale);

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: alternatesFor(PATH, locale),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref(PATH, locale),
      locale: OG_LOCALE[locale],
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
  };
}

export default async function MacosInstallGuide({
  params,
}: PageProps<"/[locale]/install/macos">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <GuidePage guide={getGuide(SLUG, locale)} locale={locale} />;
}
