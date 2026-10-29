import { Suspense } from "react";

import { type Locale } from "@/i18n/config";
import { getSiteCopy } from "@/i18n/site";
import { fill, getDictionary, type Dictionary } from "@/i18n/dictionaries";

import DocBody from "./DocBody";
import type { DocSource } from "@/lib/omm-docs/source";
import DocSkeleton from "./DocSkeleton";
import DocsMenu from "./DocsMenu";

const GITHUB_README = "https://github.com/omm-hippo/omm#readme";
const SYNC_SOURCE = "raw.githubusercontent.com";

export type DocSlug = keyof Dictionary["docs"]["pages"];

/**
 * Shared shell for the README-mirror `/docs/*` pages: the docs sidebar, then
 * the heading, an "English source, synced from GitHub" line and the streamed
 * README body.
 */
export default function DocPage({
  locale,
  slug,
  section,
  wide = false,
  source = "readme",
}: {
  locale: Locale;
  slug: DocSlug;
  /** Heading to slice; omitted for the full README. */
  section?: string;
  /** Full-width body (the full README); sections stay at reading width. */
  wide?: boolean;
  source?: DocSource;
}) {
  const t = getDictionary(locale).docs;
  const page = t.pages[slug];
  const site = getSiteCopy(locale);

  return (
    <main className="document-page site-reading">
      <DocsMenu locale={locale} current={`/docs/${slug}`} />
      <article className="min-w-0">
        <h1 className="text-h2">{page.heading}</h1>
        <p className="text-lede mt-5 max-w-[62ch]">{page.lede}</p>
        <p className="text-label mt-6">
          <span className="docs-menu-tag ml-0 mr-2">{site.englishTag}</span>
          {fill(t.syncedFrom, { source: SYNC_SOURCE })}
        </p>

        <div className={`mt-10 border-t border-line-0 pt-8 ${wide ? "max-w-[94ch]" : "max-w-[72ch]"}`}>
          <Suspense fallback={<DocSkeleton />}>
            <DocBody locale={locale} section={section} source={source} />
          </Suspense>
        </div>

        <p className="mt-16 border-t border-line-0 pt-6">
          <a
            href={source === "install" ? "https://github.com/omm-hippo/omm/blob/main/docs/install.md" : GITHUB_README}
            target="_blank"
            rel="noreferrer"
            className="text-small border-b border-line-1 text-ink-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
          >
            {t.sourceLink}
          </a>
        </p>
      </article>
    </main>
  );
}
