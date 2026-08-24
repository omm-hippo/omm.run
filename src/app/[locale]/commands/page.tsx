import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCommandLinks } from "@/components/commands/commands";
import {
  OG_LOCALE,
  alternatesFor,
  isLocale,
  localeHref,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/commands">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { commandsChooser } = getDictionary(locale);

  return {
    title: commandsChooser.metaTitle,
    description: commandsChooser.metaDescription,
    alternates: alternatesFor("/commands"),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref("/commands", locale),
      locale: OG_LOCALE[locale],
      title: commandsChooser.metaTitle,
      description: commandsChooser.metaDescription,
    },
  };
}

export default async function CommandsChooser({
  params,
}: PageProps<"/[locale]/commands">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { commandsChooser } = getDictionary(locale);
  const links = getCommandLinks(locale);

  return (
    <main className="relative border-b border-line-0 bg-bg-0">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-page px-5 pt-16 pb-32 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-4">
            <p className="text-label">{commandsChooser.label}</p>
            <h1 className="text-h2 mt-4">{commandsChooser.heading}</h1>
            <p className="text-lede mt-5 max-w-[62ch]">{commandsChooser.lede}</p>

            <ul className="mt-12 flex flex-col border-t border-line-0">
              {links.map((link) => (
                <li key={link.slug} className="border-b border-line-0">
                  <Link
                    href={localeHref(link.href, locale)}
                    className="grid grid-cols-1 gap-2 px-2 py-6 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,16ch)_minmax(0,1fr)] sm:gap-6"
                    prefetch={false}
                  >
                    <span className="text-h3 font-mono">{link.name}</span>
                    <span className="text-small max-w-[62ch]">{link.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
