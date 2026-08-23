"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_LABEL,
  LOCALE_NAME,
  HTML_LANG,
  localeHref,
  switchLocalePath,
  type Locale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

/** Fallback shown until the live fetch below resolves, or if it fails. Keep
 *  this roughly current — it's a fallback, not a source of truth. */
const FALLBACK_VERSION = "v0.2.148";
const REPO = "https://github.com/omm-hippo/omm";
const WIKI = `${REPO}/wiki`;
const PYPROJECT_RAW_URL =
  "https://raw.githubusercontent.com/omm-hippo/omm/main/pyproject.toml";

/** Reads `version = "X.Y.Z"` straight off origin/main's `pyproject.toml` so
 *  the badge never drifts from what's actually published. Client-side only:
 *  raw.githubusercontent.com is a CDN, not the rate-limited GitHub API, so a
 *  per-visitor fetch is fine. Falls back to FALLBACK_VERSION on any failure. */
function useLiveVersion(): string {
  const [version, setVersion] = useState(FALLBACK_VERSION);

  useEffect(() => {
    let cancelled = false;

    fetch(PYPROJECT_RAW_URL, { cache: "no-store" })
      .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
      .then((text) => {
        const match = text.match(/^version\s*=\s*"([^"]+)"/m);
        if (match && !cancelled) setVersion(`v${match[1]}`);
      })
      .catch(() => {
        /* keep FALLBACK_VERSION */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return version;
}

/** Section ids are owned by the other section components. */
/* Absolute so the same nav works from /install/* as well as from "/". */
const SECTION_HREFS = ["/#problem", "/#features", "/#runners", "/#install"] as const;

const LINK =
  "border-b border-transparent pb-0.5 text-small text-ink-2 transition-colors duration-[120ms] ease-micro hover:border-accent hover:text-ink-0";

/**
 * Remembers the reader's choice so the `Accept-Language` redirect in
 * `src/proxy.ts` never overrides it on a later visit. Written from the click
 * rather than from a server action: the toggle is a plain link, so the
 * navigation itself is what renders the other language.
 */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

/** EN / KO segmented control — same geometry as the Install tabs (§4.6). */
function LanguageToggle({
  locale,
  label,
  onNavigate,
  className = "",
}: {
  locale: Locale;
  label: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      aria-label={label}
      className={`inline-flex gap-1 rounded-md border border-line-1 bg-bg-0 p-1 ${className}`}
    >
      {LOCALES.map((candidate) => {
        const active = candidate === locale;
        return (
          <Link
            key={candidate}
            href={switchLocalePath(pathname, candidate)}
            /* hrefLang describes the destination. No `lang` here: both chips
               are Latin, and marking one of them Korean would hand it the
               `:lang(ko)` tracking and make the pair look uneven. */
            hrefLang={HTML_LANG[candidate]}
            aria-current={active ? "true" : undefined}
            title={LOCALE_NAME[candidate]}
            onClick={() => {
              rememberLocale(candidate);
              onNavigate?.();
            }}
            className={`text-label rounded-md border-b-2 px-2.5 py-1.5 transition-colors duration-[120ms] ease-[var(--ease-micro)] ${
              active
                ? "border-accent bg-bg-2 text-ink-0"
                : "border-transparent text-ink-2 hover:bg-bg-3 hover:text-ink-0"
            }`}
          >
            {LOCALE_LABEL[candidate]}
          </Link>
        );
      })}
    </div>
  );
}

export default function Nav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const t = getDictionary(locale).nav;
  const close = () => setOpen(false);
  const version = useLiveVersion();

  return (
    <header className="sticky top-0 z-50 border-b border-line-0 bg-bg-0/92">
      <div className="mx-auto flex h-14 max-w-page items-center px-5 md:px-8">
        <Link
          href={localeHref("/", locale)}
          className="flex shrink-0 items-center gap-2"
          onClick={close}
        >
          <span className="font-mono text-[15px] font-medium lowercase text-ink-0">omm</span>
          <span className="rounded-sm border border-line-1 px-1.5 py-0.5 font-mono text-[11px] leading-none text-ink-3">
            {version}
          </span>
        </Link>

        <nav className="ml-8 hidden items-center gap-6 md:flex">
          {SECTION_HREFS.map((href, index) => (
            <a key={href} href={localeHref(href, locale)} className={LINK}>
              {t.sections[index]}
            </a>
          ))}
          <Link href={localeHref("/install", locale)} className={LINK}>
            {t.guides}
          </Link>
          <a href={WIKI} className={LINK} target="_blank" rel="noreferrer">
            {t.docs}
          </a>
        </nav>

        <div className="ml-auto hidden items-center gap-6 md:flex">
          <a href={REPO} className={LINK} target="_blank" rel="noreferrer">
            {t.github}
          </a>
          <LanguageToggle locale={locale} label={t.language} />
          <Link
            href={localeHref("/#install", locale)}
            className="focus-ring-neutral rounded-md bg-accent px-4 py-1.5 text-small font-medium text-accent-ink transition-colors duration-[120ms] ease-micro hover:bg-accent-press"
          >
            {t.install}
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="nav-panel"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md border border-line-1 px-3 py-2 text-label text-ink-2 md:hidden"
        >
          {open ? t.close : t.menu}
        </button>
      </div>

      {/* Mobile: plain full-width panel. No slide, no hamburger morph. */}
      {open ? (
        <div id="nav-panel" className="border-t border-line-0 bg-bg-0 md:hidden">
          <nav className="mx-auto flex max-w-page flex-col px-5 py-2">
            {SECTION_HREFS.map((href, index) => (
              <a
                key={href}
                href={localeHref(href, locale)}
                onClick={close}
                className="border-b border-line-0 py-3 text-small text-ink-2"
              >
                {t.sections[index]}
              </a>
            ))}
            <Link
              href={localeHref("/install", locale)}
              onClick={close}
              className="border-b border-line-0 py-3 text-small text-ink-2"
            >
              {t.guides}
            </Link>
            <a
              href={WIKI}
              target="_blank"
              rel="noreferrer"
              className="border-b border-line-0 py-3 text-small text-ink-2"
            >
              {t.docs}
            </a>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="border-b border-line-0 py-3 text-small text-ink-2"
            >
              {t.github}
            </a>
            <div className="flex items-center justify-between border-b border-line-0 py-3">
              <span className="text-small text-ink-2">{t.language}</span>
              <LanguageToggle
                locale={locale}
                label={t.language}
                onNavigate={close}
              />
            </div>
            <Link
              href={localeHref("/#install", locale)}
              onClick={close}
              className="focus-ring-neutral mt-4 mb-2 rounded-md bg-accent px-4 py-2 text-center text-small font-medium text-accent-ink"
            >
              {t.install}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
