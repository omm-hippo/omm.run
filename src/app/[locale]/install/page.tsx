import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuideLinks } from "@/components/install/guides";
import {
  OG_LOCALE,
  alternatesFor,
  isLocale,
  localeHref,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/install">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { installChooser } = getDictionary(locale);

  return {
    title: installChooser.metaTitle,
    description: installChooser.metaDescription,
    alternates: alternatesFor("/install"),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref("/install", locale),
      locale: OG_LOCALE[locale],
      title: installChooser.metaTitle,
      description: installChooser.metaDescription,
    },
  };
}

export default async function InstallChooser({
  params,
}: PageProps<"/[locale]/install">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { installChooser } = getDictionary(locale);
  const links = getGuideLinks(locale);
  const [beforeLink, linkLabel, afterLink] = installChooser.shortcut;

  return (
    <main className="relative border-b border-line-0 bg-bg-0">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-page px-5 pt-16 pb-32 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-4">
            <p className="text-label">{installChooser.label}</p>
            <h1 className="text-h2 mt-4">{installChooser.heading}</h1>
            <p className="text-lede mt-5 max-w-[62ch]">{installChooser.lede}</p>

            <ul className="mt-12 flex flex-col border-t border-line-0">
              {links.map((link) => (
                <li key={link.slug} className="border-b border-line-0">
                  <Link
                    href={localeHref(link.href, locale)}
                    className="grid grid-cols-1 gap-2 px-2 py-6 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,16ch)_minmax(0,1fr)] sm:gap-6"
                    prefetch={false}
                  >
                    <span className="text-h3">{link.os}</span>
                    <span className="text-small max-w-[62ch]">
                      {link.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-small mt-8 max-w-[62ch]">
              {beforeLink}
              <Link
                href={localeHref("/#install", locale)}
                className="border-b border-line-1 text-ink-1 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
                prefetch={false}
              >
                {linkLabel}
              </Link>
              {afterLink}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
