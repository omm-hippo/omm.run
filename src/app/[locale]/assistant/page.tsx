import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AssistantClient from "@/components/assistant/AssistantClient";
import type { AssistantCommandCard } from "@/components/assistant/types";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import {
  COMMAND_ORDER,
  getCommand,
  getCommandLinks,
} from "@/components/commands/commands";
import {
  OG_LOCALE,
  alternatesFor,
  isLocale,
  localeHref,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const PATH = "/assistant";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/assistant">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { assistant } = getDictionary(locale);

  return {
    title: assistant.metaTitle,
    description: assistant.metaDescription,
    alternates: alternatesFor(PATH),
    openGraph: {
      type: "website",
      siteName: "omm",
      url: localeHref(PATH, locale),
      locale: OG_LOCALE[locale],
      title: assistant.metaTitle,
      description: assistant.metaDescription,
    },
  };
}

export default async function AssistantPage({
  params,
}: PageProps<"/[locale]/assistant">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { assistant } = getDictionary(locale);
  const links = new Map(getCommandLinks(locale).map((link) => [link.slug, link]));

  // Only this compact, server-built projection crosses the RSC boundary. The
  // client never uses command strings, URLs, or options returned by the model.
  const cards: readonly AssistantCommandCard[] = COMMAND_ORDER.map((id) => {
    const command = getCommand(id, locale);
    const link = links.get(id);
    const visibleOptions = command.options.slice(0, 3).map((option) =>
      option.argument ? `${option.name} ${option.argument}` : option.name,
    );

    return {
      id,
      name: command.name,
      summary: link?.summary ?? command.lede,
      href: link?.href ?? `/commands/${id}`,
      example: command.examples[0]?.command ?? command.name,
      options: visibleOptions,
      remainingOptionCount: Math.max(0, command.options.length - visibleOptions.length),
      risk: command.risk,
    };
  });

  return (
    <>
      <Nav locale={locale} />
      <main className="relative flex-1 border-b border-line-0 bg-bg-0">
        <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[34rem]" aria-hidden />
        <div className="relative mx-auto w-full max-w-page px-5 pt-16 pb-32 md:px-8 md:pt-24">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 lg:col-start-3">
              <p className="text-label">{assistant.label}</p>
              <h1 className="text-h2 mt-5 max-w-[22ch]">{assistant.heading}</h1>
              <p className="text-lede mt-5 max-w-[65ch]">{assistant.lede}</p>
              <p className="text-small mt-4 font-mono text-ink-3">{assistant.scope}</p>
            </div>
          </div>

          <div className="mt-16 border-y border-line-0 py-8 lg:py-12">
            <AssistantClient cards={cards} locale={locale} />
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
