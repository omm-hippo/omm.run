import type { CSSProperties } from "react";

import Terminal from "@/components/Terminal";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

/** DIRECTION.md §3: one --accent-wash radial, single colour to transparent. */
const WASH: CSSProperties = {
  background: "radial-gradient(58% 62% at 55% 38%, var(--accent-wash), transparent 70%)",
};

export default function Hero({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.hero;

  return (
    <section className="relative overflow-x-clip pt-16 pb-42 md:pt-24">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-page grid-cols-1 items-start gap-6 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-label">{t.eyebrow}</p>

          {/* DIRECTION.md §3: the H1 never animates. Nothing above the fold does. */}
          <h1 className="mt-6 text-display">{t.heading}</h1>

          <p className="mt-8 max-w-[46ch] text-lede">{t.lede}</p>

          <div className="mt-8 flex flex-col gap-4">
            <a
              href="#install"
              className="focus-ring-neutral inline-flex w-fit items-center rounded-md bg-accent px-6 py-3 font-medium text-accent-ink transition-colors duration-[120ms] ease-micro hover:bg-accent-press"
            >
              {t.cta}
            </a>
          </div>
        </div>

        {/* Bleeds 24px past the container edge so it reads as a window, not a card
            — small enough that the window's right hairline stays inside the
            viewport at 1280 with a scrollbar. Clipped by overflow-x-clip. */}
        <div className="relative mt-12 lg:col-span-7 lg:mt-2 lg:-mr-6">
          <div className="pointer-events-none absolute -inset-8" style={WASH} aria-hidden="true" />
          <div className="relative">
            <Terminal
              label={dictionary.terminal.a11y}
              footnote={dictionary.terminal.footnote}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
