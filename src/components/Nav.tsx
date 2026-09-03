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
import { publishedVersion, PYPI_RELEASE_URL } from "@/lib/site-metadata";

const REPO = "https://github.com/omm-hippo/omm";

/** Main can be ahead of release. Show only PyPI's confirmed package version. */
function useLiveVersion(): string | null {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(PYPI_RELEASE_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: unknown) => {
        if (!controller.signal.aborted) setVersion(publishedVersion(data));
      })
      .catch(() => {
        // A missing badge is preferable to claiming an unverified version.
      });

    return () => controller.abort();
  }, []);

  return version;
}

/** Section ids are owned by the other section components. */
/* Absolute so the same nav works from /install/* as well as from "/". */
const SECTION_HREFS = ["/#problem", "/#features", "/#runners"] as const;

const LINK =
  "border-b border-transparent pb-0.5 text-small text-ink-2 transition-colors duration-[120ms] ease-micro hover:border-accent hover:text-ink-0";

/**
 * Records the explicit language choice. The link itself selects the locale;
 * middleware keeps first visits in English regardless of Accept-Language.
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
            prefetch={false}
            scroll={false}
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
  const pathname = usePathname();

  /** Link to "/" is a no-op navigation when already on the home page, so
   *  Next.js never fires its scroll-to-top. Do it by hand in that case. */
  const goHome = () => {
    close();
    if (pathname === localeHref("/", locale)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line-0 bg-bg-0/92">
      <div className="mx-auto flex h-14 max-w-page items-center px-5 md:px-8">
        <Link
          href={localeHref("/", locale)}
          className="flex shrink-0 items-center gap-2"
          onClick={goHome}
          prefetch={false}
        >
          <span className="font-mono text-[15px] font-medium lowercase text-ink-0">omm</span>
          {version ? (
            <span className="rounded-sm border border-line-1 px-1.5 py-0.5 font-mono text-[11px] leading-none text-ink-3">
              {version}
            </span>
          ) : null}
        </Link>

        <nav className="ml-8 hidden items-center gap-6 lg:flex">
          {SECTION_HREFS.map((href, index) => (
            <a key={href} href={localeHref(href, locale)} className={LINK}>
              {t.sections[index]}
            </a>
          ))}
          <Link href={localeHref("/install", locale)} prefetch={false} className={LINK}>
            {t.installGuides}
          </Link>
          <Link href={localeHref("/commands", locale)} prefetch={false} className={LINK}>
            {t.commands}
          </Link>
          <Link href={localeHref("/assistant", locale)} prefetch={false} className={LINK}>
            {t.assistant}
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-6 lg:flex">
          <a href={REPO} className={LINK} target="_blank" rel="noreferrer">
            {t.github}
          </a>
          <LanguageToggle locale={locale} label={t.language} />
          <Link
            href={localeHref("/#install", locale)}
            className="focus-ring-neutral rounded-md bg-accent px-4 py-1.5 text-small font-medium text-accent-ink transition-colors duration-[120ms] ease-micro hover:bg-accent-press"
            prefetch={false}
          >
            {t.install}
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="nav-panel"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md border border-line-1 px-3 py-2 text-label text-ink-2 lg:hidden"
        >
          {open ? t.close : t.menu}
        </button>
      </div>

      {/* Mobile: plain full-width panel. No slide, no hamburger morph. */}
      {open ? (
        <div id="nav-panel" className="border-t border-line-0 bg-bg-0 lg:hidden">
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
              prefetch={false}
            >
              {t.installGuides}
            </Link>
            <Link
              href={localeHref("/commands", locale)}
              onClick={close}
              className="border-b border-line-0 py-3 text-small text-ink-2"
              prefetch={false}
            >
              {t.commands}
            </Link>
            <Link
              href={localeHref("/assistant", locale)}
              onClick={close}
              className="border-b border-line-0 py-3 text-small text-ink-2"
              prefetch={false}
            >
              {t.assistant}
            </Link>
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
              prefetch={false}
            >
              {t.install}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
