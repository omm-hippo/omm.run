"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { CommandLink } from "@/components/commands/commands";
import type { CommandGroup } from "@/i18n/commands/base";
import { localeHref, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/dictionaries";

type Props = {
  readonly links: readonly CommandLink[];
  readonly locale: Locale;
  readonly placeholder: string;
  /** `{query}` template for the no-results message. */
  readonly empty: string;
  /** Purpose buckets in display order; a group with no matches is hidden. */
  readonly groups: readonly { readonly id: CommandGroup; readonly label: string }[];
  readonly initialQuery?: string;
};

const SEARCH_STOP_WORDS = new Set([
  "and",
  "but",
  "can",
  "does",
  "for",
  "how",
  "installed",
  "is",
  "model",
  "need",
  "not",
  "omm",
  "runner",
  "the",
  "this",
  "use",
  "what",
  "with",
  "러너",
  "모델",
  "명령어",
]);

const SEARCH_ALIASES: Partial<Record<CommandLink["slug"], string>> = {
  scan: "hardware detect detected detection missing 하드웨어 감지 인식 찾지 못해",
  doctor: "diagnose diagnostic troubleshoot broken error 진단 오류 문제 점검",
  link: "repair relink runner link 연결 복구 다시 연결",
  setup: "configure onboarding checklist 설정 초기 구성",
  engine: "runner program lm studio ollama 러너 프로그램",
};

function searchTerms(query: string): readonly string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/u)
    .map((term) =>
      term
        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
        .replace(/(?:하려면|하려고|에서|으로|에게|은|는|이|가|을|를|와|과|도)$/u, ""),
    )
    .filter((term) => term.length >= 2 && !SEARCH_STOP_WORDS.has(term));
}

/** Client-side filter over name + one-line summary — 24 rows is small
 *  enough that no build-time index or fuzzy scoring earns its keep. */
export default function CommandSearch({
  links,
  locale,
  placeholder,
  empty,
  groups,
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return links;
    const terms = searchTerms(query);
    return links.filter((link) => {
      const haystack = `${link.name} ${link.summary} ${SEARCH_ALIASES[link.slug] ?? ""}`.toLowerCase();
      return haystack.includes(needle) || terms.some((term) => haystack.includes(term));
    });
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
        <div className="mt-6 flex flex-col gap-12">
          {groups.map((group) => {
            const rows = filtered.filter((link) => link.group === group.id);
            if (rows.length === 0) return null;
            return (
              <section key={group.id}>
                <h2 className="text-label border-b border-line-0 pb-3">{group.label}</h2>
                <ul className="flex flex-col">
                  {rows.map((link) => (
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
              </section>
            );
          })}
        </div>
      ) : (
        <p className="text-small mt-8 text-ink-3">{fill(empty, { query })}</p>
      )}
    </div>
  );
}
