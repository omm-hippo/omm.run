/**
 * The fallback command page: the CLI's own reference, nothing else.
 *
 * Commands that have a hand-written page under `src/app/[locale]/commands/<slug>`
 * keep it — a static segment wins over this dynamic one, and those slugs are
 * excluded from `generateStaticParams` so nothing is built twice. What lands
 * here is a command the CLI has exported but the site has not written prose
 * for yet, which is exactly the drift omm-hippo/omm#347 is about: the command
 * gets a real page the day it ships instead of the day someone notices.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CommandReference from "@/components/commands/CommandReference";
import { COMMAND_ORDER } from "@/i18n/commands/base";
import {
  OG_LOCALE,
  alternatesFor,
  isLocale,
  localeHref,
} from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import {
  OMM_REFERENCE_VERSION,
  getEntry,
  referenceNames,
  subEntries,
} from "@/lib/commands/reference";

const HAND_WRITTEN = new Set<string>(COMMAND_ORDER);

export function generateStaticParams() {
  return referenceNames()
    .filter((name) => !HAND_WRITTEN.has(name))
    .map((name) => ({ name }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/commands/[name]">): Promise<Metadata> {
  const { locale, name } = await params;
  if (!isLocale(locale)) notFound();
  const entry = getEntry(name);
  if (!entry) notFound();

  const t = getDictionary(locale).commandReference;
  const title = fill(t.metaTitle, { command: name });
  const path = `/commands/${name}`;

  return {
    title,
    description: entry.summary,
    alternates: alternatesFor(path),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref(path, locale),
      locale: OG_LOCALE[locale],
      title,
      description: entry.summary,
    },
  };
}

export default async function CommandReferencePage({
  params,
}: PageProps<"/[locale]/commands/[name]">) {
  const { locale, name } = await params;
  if (!isLocale(locale)) notFound();
  const entry = getEntry(name);
  if (!entry) notFound();

  const dictionary = getDictionary(locale);
  const t = dictionary.commandReference;

  return (
    <main>
      <section className="relative border-b border-line-0 bg-bg-0 pt-24 pb-16">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-page px-5 md:px-8">
          <nav aria-label={t.breadcrumbAria} className="text-label">
            <Link href={localeHref("/", locale)} className="hover:text-ink-1" prefetch={false}>
              omm
            </Link>
            <span className="text-ink-3"> / </span>
            <Link
              href={localeHref("/commands", locale)}
              className="hover:text-ink-1"
              prefetch={false}
            >
              commands
            </Link>
            <span className="text-ink-3"> / </span>
            <span className="text-ink-1">{name}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 className="text-h2 font-mono">{`omm ${name}`}</h1>
              <p className="text-lede mt-5 max-w-[62ch]">{entry.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-page px-5 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-3 py-12">
            <CommandReference
              entry={entry}
              subs={subEntries(name)}
              t={t}
              version={OMM_REFERENCE_VERSION}
              showReadmeLink
            />

            <p className="text-small mt-10">
              <Link
                href={localeHref("/commands", locale)}
                className="border-b border-line-0 pb-0.5 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
                prefetch={false}
              >
                {t.backToIndex}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
