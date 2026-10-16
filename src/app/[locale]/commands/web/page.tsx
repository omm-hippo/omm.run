import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CommandDocPage from "@/components/commands/CommandDocPage";
import { getCommand } from "@/components/commands/commands";
import { OG_LOCALE, alternatesFor, isLocale, localeHref } from "@/i18n/config";

const SLUG = "web" as const;
const PATH = "/commands/web";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/commands/web">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const command = getCommand(SLUG, locale);

  return {
    title: command.metaTitle,
    description: command.metaDescription,
    alternates: alternatesFor(PATH, locale),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref(PATH, locale),
      locale: OG_LOCALE[locale],
      title: command.metaTitle,
      description: command.metaDescription,
    },
  };
}

export default async function WebCommandDoc({
  params,
}: PageProps<"/[locale]/commands/web">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CommandDocPage command={getCommand(SLUG, locale)} locale={locale} />;
}
