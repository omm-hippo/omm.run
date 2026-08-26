/**
 * Locale plumbing for the two-language site.
 *
 * English is the canonical, unprefixed site (`/`, `/install/windows`); Korean
 * lives under `/ko`. The app router segment is `[locale]`, so every English
 * request is rewritten to `/en/...` in `src/middleware.ts` and `/en/...` is
 * redirected back to the unprefixed path. Nothing in the app tree ever builds
 * an `/en` href — `localeHref` is the only place the prefix rule lives.
 */

export const LOCALES = ["en", "ko"] as const;

export type Locale = (typeof LOCALES)[number];

/** The locale served without a path prefix. */
export const DEFAULT_LOCALE: Locale = "en";

/** Set by the language toggle, read by the proxy. One year, path `/`. */
export const LOCALE_COOKIE = "omm_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** `<html lang>` and Open Graph `locale`. */
export const HTML_LANG: Record<Locale, string> = { en: "en", ko: "ko" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", ko: "ko_KR" };

/** Segmented-control labels. Deliberately not translated: each side is written
 *  in the language it switches to. */
export const LOCALE_LABEL: Record<Locale, string> = { en: "EN", ko: "KO" };
export const LOCALE_NAME: Record<Locale, string> = { en: "English", ko: "한국어" };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

function splitHash(path: string): [string, string] {
  const index = path.indexOf("#");
  return index === -1
    ? [path, ""]
    : [path.slice(0, index) || "/", path.slice(index)];
}

/**
 * Canonical path (always written unprefixed, the way the English site is
 * addressed) → the href for `locale`.
 *
 *   localeHref("/install/windows", "ko") === "/ko/install/windows"
 *   localeHref("/#install", "ko")        === "/ko#install"
 *   localeHref("/#install", "en")        === "/#install"
 */
export function localeHref(path: string, locale: Locale): string {
  const [pathname, hash] = splitHash(path);
  if (locale === DEFAULT_LOCALE) return `${pathname}${hash}`;
  const prefixed = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return `${prefixed}${hash}`;
}

/** A live `usePathname()` value → the canonical, unprefixed path. */
export function canonicalPath(pathname: string): string {
  const segments = pathname.split("/");
  const first = segments[1] ?? "";
  if (!isLocale(first)) return pathname || "/";
  const rest = segments.slice(2).join("/");
  return rest ? `/${rest}` : "/";
}

/** The same page in the other locale — what the language toggle links to. */
export function switchLocalePath(pathname: string, locale: Locale): string {
  return localeHref(canonicalPath(pathname), locale);
}

/**
 * `metadata.alternates` for a canonical path. `x-default` points at the
 * unprefixed English page, which is also what an unprefixed request serves.
 */
export function alternatesFor(path: string) {
  return {
    canonical: localeHref(path, DEFAULT_LOCALE),
    languages: {
      en: localeHref(path, "en"),
      ko: localeHref(path, "ko"),
      "x-default": localeHref(path, DEFAULT_LOCALE),
    },
  };
}
