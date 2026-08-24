import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CommandDocPage from "@/components/commands/CommandDocPage";
import { getCommand } from "@/components/commands/commands";
import { OG_LOCALE, alternatesFor, isLocale, localeHref } from "@/i18n/config";

const SLUG = "autoremove" as const;
const PATH = "/commands/autoremove";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/commands/autoremove">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const command = getCommand(SLUG, locale);

  return {
    title: command.metaTitle,
    description: command.metaDescription,
    alternates: alternatesFor(PATH),
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

export default async function AutoremoveCommandDoc({
  params,
}: PageProps<"/[locale]/commands/autoremove">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CommandDocPage command={getCommand(SLUG, locale)} locale={locale} />;
}
