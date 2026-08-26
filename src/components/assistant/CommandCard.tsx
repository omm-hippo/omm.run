import Link from "next/link";

import type { AssistantCommandCard } from "@/components/assistant/types";
import { localeHref, type Locale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";

export default function CommandCard({
  card,
  locale,
}: {
  readonly card: AssistantCommandCard;
  readonly locale: Locale;
}) {
  const t = getDictionary(locale).assistant;

  return (
    <article className="border-t border-line-1 py-6 first:border-t-0 first:pt-0">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,15ch)_minmax(0,1fr)]">
        <div>
          <h3 className="font-mono text-[17px] font-medium text-ink-0">
            {card.name}
          </h3>
        </div>

        <div className="min-w-0">
          <p className="max-w-[62ch] text-ink-1">{card.summary}</p>

          <div className="mt-6 grid grid-cols-1 gap-px border border-line-0 bg-line-0 md:grid-cols-2">
            <div className="min-w-0 bg-bg-1 p-4">
              <p className="text-label">{t.example}</p>
              <code className="mt-3 block overflow-x-auto font-mono text-[13px] leading-6 text-ink-0">
                {card.example}
              </code>
            </div>
            <div className="min-w-0 bg-bg-1 p-4">
              <p className="text-label">{t.options}</p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[12px] leading-5 text-ink-1">
                {card.options.length > 0 ? (
                  card.options.map((option) => <code key={option}>{option}</code>)
                ) : (
                  <span>—</span>
                )}
                {card.remainingOptionCount > 0 ? (
                  <span className="text-ink-3">
                    {fill(t.moreOptions, {
                      count: String(card.remainingOptionCount),
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 border-l border-accent-line pl-4">
            <p className="text-label text-ink-2">{t.changeCheck}</p>
            <p className="mt-2 font-medium text-ink-0">{t.risk[card.risk].label}</p>
            <p className="text-small mt-1 max-w-[68ch]">
              {t.risk[card.risk].description}
            </p>
            <p className="text-small mt-2 max-w-[68ch] text-ink-3">
              {t.changeNote}
            </p>
          </div>

          <Link
            href={localeHref(card.href, locale)}
            prefetch={false}
            className="mt-5 inline-flex items-center gap-2 border-b border-line-1 pb-0.5 text-small font-medium text-ink-1 transition-colors duration-[120ms] ease-micro hover:border-accent hover:text-ink-0"
          >
            {t.openReference}
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
