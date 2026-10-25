"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import {
  LOCALES,
  LOCALE_LABEL,
  LOCALE_NAME,
  HTML_LANG,
  localeHref,
  canonicalPath,
  switchLocalePath,
  type Locale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/detect";
import { publishedVersion, PYPI_RELEASE_URL } from "@/lib/site-metadata";

const REPO = "https://github.com/omm-hippo/omm";

const VERSION_STORAGE_KEY = "omm:pypi-version";
const VERSION_TTL_MS = 6 * 60 * 60 * 1000;

/* Every section has its own layout, so Nav remounts on each page change.
   Module state outlives the remount and localStorage outlives the tab: the
   badge renders at once and subscribers re-render only when it changes. */
let version: string | null = null;
let fetchedAt = 0;
let hydratedFromStorage = false;
let inflight = false;
const listeners = new Set<() => void>();

function loadStoredVersion() {
  if (hydratedFromStorage) return;
  hydratedFromStorage = true;
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(VERSION_STORAGE_KEY) ?? "null");
    if (typeof stored === "object" && stored !== null && "v" in stored && "t" in stored) {
      const { v, t } = stored;
      // Storage is user-writable: accept only the exact shape we write.
      if (typeof v === "string" && /^v\d+\.\d+\.\d+$/u.test(v) && typeof t === "number") {
        version = v;
        fetchedAt = t;
      }
    }
  } catch {
    // Storage can be blocked; fall back to fetching.
  }
}

function refreshVersion() {
  loadStoredVersion();
  if (inflight || Date.now() - fetchedAt < VERSION_TTL_MS) return;
  inflight = true;
  fetch(PYPI_RELEASE_URL)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data: unknown) => {
      // Main can be ahead of release. Show only PyPI's confirmed package version.
      const next = publishedVersion(data);
      if (next === null) return;
      fetchedAt = Date.now();
      try {
        localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify({ v: next, t: fetchedAt }));
      } catch {
        // Not persisting only costs one refetch on the next visit.
      }
      if (next !== version) {
        version = next;
        listeners.forEach((notify) => notify());
      }
    })
    .catch(() => {
      // A missing badge is preferable to claiming an unverified version.
    })
    .finally(() => {
      inflight = false;
    });
}

function subscribeVersion(notify: () => void) {
  listeners.add(notify);
  refreshVersion();
  return () => {
    listeners.delete(notify);
  };
}

function getVersionSnapshot(): string | null {
  loadStoredVersion();
  return version;
}

function useLiveVersion(): string | null {
  // The server snapshot is null so hydration matches the prerendered HTML.
  return useSyncExternalStore(subscribeVersion, getVersionSnapshot, () => null);
}

/** Section ids are owned by the other section components. */
/* Absolute so the same nav works from /install/* as well as from "/". */
const SECTION_HREFS = ["/#how-it-works"] as const;

const LINK =
  "border-b border-transparent pb-0.5 text-small text-ink-2 transition-colors duration-[120ms] ease-micro hover:border-accent hover:text-ink-0";

/** EN / KO segmented control — same geometry as the Install tabs (§4.6). */
function LanguageToggle({
  locale,
  label,
  className = "",
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();

  // Document navigation keeps the fragment intact when crossing between the
  // rewritten Korean route and the explicit English route.
  const updateHref = (anchor: HTMLAnchorElement, candidate: Locale) => {
    anchor.href = switchLocalePath(
      window.location.pathname + window.location.search + window.location.hash,
      candidate,
    );
  };

  return (
    <div
      aria-label={label}
      className={`inline-flex gap-1 rounded-md border border-line-1 bg-bg-0 p-1 ${className}`}
    >
      {LOCALES.map((candidate) => {
        const active = candidate === locale;
        return (
          <a
            key={candidate}
            href={switchLocalePath(pathname, candidate)}
            /* hrefLang describes the destination. No `lang` here: both chips
               are Latin, and marking one of them Korean would hand it the
               `:lang(ko)` tracking and make the pair look uneven. */
            hrefLang={HTML_LANG[candidate]}
            aria-current={active ? "true" : undefined}
            title={LOCALE_NAME[candidate]}
            onClick={(event) => {
              // Remember the pick so browser-language detection does not override it.
              document.cookie = `${LOCALE_COOKIE}=${candidate}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
              updateHref(event.currentTarget, candidate);
            }}
            onAuxClick={(event) => updateHref(event.currentTarget, candidate)}
            onContextMenu={(event) => updateHref(event.currentTarget, candidate)}
            className={`text-label rounded-md border-b-2 px-2.5 py-1.5 transition-colors duration-[120ms] ease-[var(--ease-micro)] ${
              active
                ? "border-accent bg-bg-2 text-ink-0"
                : "border-transparent text-ink-2 hover:bg-bg-3 hover:text-ink-0"
            }`}
          >
            {LOCALE_LABEL[candidate]}
          </a>
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
  const modelsPath = canonicalPath(pathname);
  const modelsActive = modelsPath === "/models" || modelsPath.startsWith("/models/");
  const arenaActive = modelsPath === "/arena";

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

        <nav className="ml-8 hidden items-center gap-6 xl:flex">
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
          <Link href={localeHref("/models", locale)} prefetch={false} className={modelsActive ? "border-b border-accent pb-0.5 text-small text-ink-0 transition-colors duration-[120ms] ease-micro" : LINK} aria-current={modelsActive ? "page" : undefined}>
            {t.models}
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-6 xl:flex">
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
          className="ml-auto rounded-md border border-line-1 px-3 py-2 text-label text-ink-2 xl:hidden"
        >
          {open ? t.close : t.menu}
        </button>
      </div>

      {/* Mobile: plain full-width panel. No slide, no hamburger morph. */}
      {open ? (
        <div id="nav-panel" className="border-t border-line-0 bg-bg-0 xl:hidden">
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
              href={localeHref("/models", locale)}
              onClick={close}
              className={`border-b border-line-0 py-3 text-small ${modelsActive ? "text-accent" : "text-ink-2"}`}
              aria-current={modelsActive ? "page" : undefined}
              prefetch={false}
            >
              {t.models}
            </Link>
            <Link
              href={localeHref("/assistant", locale)}
              onClick={close}
              className="border-b border-line-0 py-3 text-small text-ink-2"
              prefetch={false}
            >
              {t.assistant}
            </Link>
            <Link href={localeHref("/arena", locale)} onClick={close} prefetch={false} className={`border-b border-line-0 py-3 text-small ${arenaActive ? "text-accent" : "text-ink-2"}`} aria-current={arenaActive ? "page" : undefined}>
              {locale === "ko" ? "리더보드" : "Leaderboard"}
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
