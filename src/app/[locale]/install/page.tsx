import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuideLinks } from "@/components/install/guides";
import Install from "@/components/Install";
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
    alternates: alternatesFor("/install", locale),
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

  return (
    <main className="document-page install-page section-page">
      <article className="min-w-0">
        <Install locale={locale} />
        <section id="guides" className="border-t border-line-0 pt-12 pb-16">
          <div>
            <p className="text-label">{installChooser.label}</p>
            <h2 className="text-h3 mt-4">{installChooser.heading}</h2>
            <p className="text-small mt-4 max-w-[62ch]">{installChooser.lede}</p>

            <ul className="mt-8 flex flex-col border-t border-line-0">
              {links.map((link) => (
                <li key={link.slug} className="border-b border-line-0">
                  <Link
                    href={localeHref(link.href, locale)}
                    className="grid grid-cols-1 gap-2 px-2 py-5 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,16ch)_minmax(0,1fr)] sm:gap-6"
                    prefetch={false}
                  >
                    <span className="text-small font-medium text-ink-0">{link.os} →</span>
                    <span className="text-small max-w-[62ch]">
                      {link.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    </main>
  );
}
