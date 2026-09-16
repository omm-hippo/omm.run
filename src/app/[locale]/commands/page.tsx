import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { subcommandLabel } from "@/components/commands/CommandReference";
import CommandSearch from "@/components/commands/CommandSearch";
import { getCommandLinks } from "@/components/commands/commands";
import { COMMAND_GROUPS } from "@/i18n/commands/base";
import {
  OG_LOCALE,
  alternatesFor,
  isLocale,
  localeHref,
} from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import {
  OMM_REFERENCE_VERSION,
  subEntries,
  topLevelEntries,
} from "@/lib/commands/reference";

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
  searchParams,
}: PageProps<"/[locale]/commands">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q.slice(0, 120) : "";
  const dictionary = getDictionary(locale);
  const { commandsChooser } = dictionary;
  const links = getCommandLinks(locale);
  const groups = COMMAND_GROUPS.map((id) => ({
    id,
    label: commandsChooser.groups[id],
  }));

  // Straight from the CLI's exported reference: one row per top-level command,
  // and one row — not one per sub-command — for a group like `setting`.
  const reference = topLevelEntries().map((entry) => ({
    name: entry.path[0],
    aliases: entry.aliases,
    summary: entry.summary,
    subs: entry.kind === "group" ? subEntries(entry.path[0]).length : 0,
  }));

  return (
    <main className="relative border-b border-line-0 bg-bg-0">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-page px-5 pt-16 pb-32 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-4">
            <p className="text-label">{commandsChooser.label}</p>
            <h1 className="text-h2 mt-4">{commandsChooser.heading}</h1>
            <p className="text-lede mt-5 max-w-[62ch]">{commandsChooser.lede}</p>

            <CommandSearch
              links={links}
              locale={locale}
              placeholder={commandsChooser.searchPlaceholder}
              empty={commandsChooser.searchEmpty}
              groups={groups}
              initialQuery={initialQuery}
            />

            <section
              id="reference"
              aria-labelledby="reference-title"
              className="mt-20 scroll-mt-14 border-t border-line-0 pt-12"
            >
              <h2 id="reference-title" className="text-h2">
                {commandsChooser.reference.title}
              </h2>
              <p className="text-small mt-4 max-w-[68ch]">
                {commandsChooser.reference.body}
              </p>

              <ul className="mt-8 flex flex-col border-t border-line-0">
                {reference.map((row) => (
                  <li key={row.name} className="border-b border-line-0">
                    <Link
                      href={localeHref(`/commands/${row.name}`, locale)}
                      prefetch={false}
                      className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,24ch)_minmax(0,1fr)] sm:gap-6"
                    >
                      <span>
                        <span className="text-terminal text-ink-0">{`omm ${row.name}`}</span>
                        {row.aliases.length > 0 ? (
                          <span className="text-table block text-ink-3">
                            {fill(commandsChooser.reference.aliases, {
                              aliases: row.aliases.join(", "),
                            })}
                          </span>
                        ) : null}
                        {row.subs > 0 ? (
                          <span className="text-table block text-ink-3">
                            {subcommandLabel(
                              dictionary.commandReference,
                              row.subs,
                            )}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-small">{row.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="text-label mt-8">
                {fill(dictionary.commandReference.generated, {
                  version: OMM_REFERENCE_VERSION,
                })}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
