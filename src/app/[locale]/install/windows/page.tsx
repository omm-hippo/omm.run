import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GuidePage from "@/components/install/GuidePage";
import { getGuide } from "@/components/install/guides";
import { OG_LOCALE, alternatesFor, isLocale, localeHref } from "@/i18n/config";

const SLUG = "windows" as const;
const PATH = "/install/windows";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/install/windows">): Promise<Metadata> {
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

export default async function WindowsInstallGuide({
  params,
}: PageProps<"/[locale]/install/windows">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <GuidePage guide={getGuide(SLUG, locale)} locale={locale} />;
}
