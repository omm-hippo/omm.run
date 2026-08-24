"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import {
  searchCommandIndex,
  type CommandSearchField,
  type CommandSearchIndexItem,
} from "@/components/commands/commandSearchLogic";
import { localeHref, type Locale } from "@/i18n/config";

export type CommandSearchText = {
  readonly label: string;
  readonly placeholder: string;
  readonly hint: string;
  readonly clear: string;
  readonly resultCount: string;
  readonly noResultsTitle: string;
  readonly noResultsBody: string;
  readonly matchPrefix: string;
  readonly matchLabels: Readonly<Record<CommandSearchField, string>>;
};

function fillCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

export default function CommandSearch({
  index,
  locale,
  text,
}: {
  index: readonly CommandSearchIndexItem[];
  locale: Locale;
  text: CommandSearchText;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchCommandIndex(index, deferredQuery);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.defaultPrevented
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    }

    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <div className="mt-10">
      <div role="search" aria-labelledby="command-search-label">
        <label
          id="command-search-label"
          htmlFor="command-search"
          className="text-label block text-ink-2"
        >
          {text.label}
        </label>
        <div className="mt-3 flex items-center gap-2 border-b border-line-1 bg-bg-1 px-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] focus-within:border-accent">
          <span className="font-mono text-[15px] text-accent" aria-hidden>
            /
          </span>
          <input
            ref={inputRef}
            id="command-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                setQuery("");
              }
            }}
            placeholder={text.placeholder}
            autoComplete="off"
            aria-describedby="command-search-hint command-search-status"
            aria-keyshortcuts="/"
            className="min-w-0 flex-1 bg-transparent py-3 font-mono text-[15px] text-ink-0 outline-none placeholder:text-ink-3"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-label shrink-0 rounded-sm px-1.5 py-1 text-ink-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-3 hover:text-ink-0"
            >
              {text.clear}
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p id="command-search-hint" className="text-small text-ink-3">
            {text.hint}
          </p>
          <output
            id="command-search-status"
            aria-live="polite"
            aria-atomic="true"
            className="text-label text-ink-2"
          >
            {fillCount(text.resultCount, results.length)}
          </output>
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="mt-6 flex flex-col border-t border-line-0">
          {results.map((result) => (
            <li key={result.slug} className="border-b border-line-0">
              <Link
                href={localeHref(result.href, locale)}
                className="group grid grid-cols-1 gap-2 px-2 py-6 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,16ch)_minmax(0,1fr)_auto] sm:gap-6"
                prefetch={false}
              >
                <span className="text-h3 font-mono">{result.name}</span>
                <span className="min-w-0">
                  <span className="text-small block max-w-[62ch]">{result.summary}</span>
                  {deferredQuery && result.matchedFields.length > 0 ? (
                    <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-label text-ink-3">{text.matchPrefix}</span>
                      {result.matchedFields.map((field) => (
                        <span
                          key={field}
                          className="text-label rounded-sm border border-line-1 px-1.5 py-1 text-ink-2"
                        >
                          {text.matchLabels[field]}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden
                  className="hidden self-center font-mono text-ink-3 transition-colors duration-[120ms] ease-[var(--ease-micro)] group-hover:text-accent sm:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 border-y border-line-0 px-2 py-10" role="status">
          <p className="text-h3">{text.noResultsTitle}</p>
          <p className="text-small mt-2 max-w-[62ch]">{text.noResultsBody}</p>
        </div>
      )}
    </div>
  );
}
