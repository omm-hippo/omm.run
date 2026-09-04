import { Suspense } from "react";

import { localeHref, type Locale } from "@/i18n/config";
import { fill, getDictionary, type Dictionary } from "@/i18n/dictionaries";

import DocBody from "./DocBody";
import DocSkeleton from "./DocSkeleton";

const GITHUB_README = "https://github.com/omm-hippo/omm#readme";
const SYNC_SOURCE = "raw.githubusercontent.com";

export type DocSlug = keyof Dictionary["docs"]["pages"];

/**
 * Shared shell for every `/docs/*` page: `.grid-bg` header with a breadcrumb
 * and the "synced from GitHub" line, then the streamed README body in a
 * reading-width column.
 */
export default function DocPage({
  locale,
  slug,
  section,
  wide = false,
}: {
  locale: Locale;
  slug: DocSlug;
  /** Heading to slice; omitted for the full README. */
  section?: string;
  /** Full-width body (the full README); sections stay at reading width. */
  wide?: boolean;
}) {
  const t = getDictionary(locale).docs;
  const page = t.pages[slug];

  return (
    <main>
      <section className="relative border-b border-line-0 bg-bg-0 pt-24 pb-16">
        <div
          className="grid-bg pointer-events-none absolute inset-0"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-page px-5 md:px-8">
          <nav aria-label={t.breadcrumbAria} className="text-label">
            <a href={localeHref("/", locale)} className="hover:text-ink-1">
              omm
            </a>
            <span className="text-ink-3"> / </span>
            <span className="text-ink-1">docs</span>
            <span className="text-ink-3"> / </span>
            <span className="text-ink-1">{slug}</span>
          </nav>

          <h1 className="text-h2 mt-8">{page.heading}</h1>
          <p className="text-lede mt-5 max-w-[62ch]">{page.lede}</p>
          <p className="text-label mt-8">
            {fill(t.syncedFrom, { source: SYNC_SOURCE })}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-page px-5 pb-24 md:px-8">
        <div className={`mt-12 ${wide ? "max-w-[94ch]" : "max-w-[72ch]"}`}>
          <Suspense fallback={<DocSkeleton />}>
            <DocBody locale={locale} section={section} />
          </Suspense>
        </div>

        <p className="mt-16 border-t border-line-0 pt-6">
          <a
            href={GITHUB_README}
            target="_blank"
            rel="noreferrer"
            className="text-small border-b border-line-1 text-ink-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
          >
            {t.sourceLink}
          </a>
        </p>
      </div>
    </main>
  );
}
