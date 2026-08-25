"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { CommandLink } from "@/components/commands/commands";
import { localeHref, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/dictionaries";

type Props = {
  readonly links: readonly CommandLink[];
  readonly locale: Locale;
  readonly placeholder: string;
  /** `{query}` template for the no-results message. */
  readonly empty: string;
};

/** Client-side filter over name + one-line summary — 22 rows is small
 *  enough that no build-time index or fuzzy scoring earns its keep. */
export default function CommandSearch({ links, locale, placeholder, empty }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return links;
    return links.filter(
      (link) =>
        link.name.toLowerCase().includes(needle) ||
        link.summary.toLowerCase().includes(needle),
    );
  }, [links, query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="focus-ring-neutral mt-12 w-full rounded-md border border-line-1 bg-bg-0 px-3 py-2 text-small text-ink-0 placeholder:text-ink-3"
      />

      {filtered.length > 0 ? (
        <ul className="mt-6 flex flex-col border-t border-line-0">
          {filtered.map((link) => (
            <li key={link.slug} className="border-b border-line-0">
              <Link
                href={localeHref(link.href, locale)}
                prefetch={false}
                className="grid grid-cols-1 gap-2 px-2 py-6 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,16ch)_minmax(0,1fr)] sm:gap-6"
              >
                <span className="text-h3 font-mono">{link.name}</span>
                <span className="text-small max-w-[62ch]">{link.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small mt-8 text-ink-3">{fill(empty, { query })}</p>
      )}
    </div>
  );
}
