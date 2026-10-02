/**
 * Korean is the default, unprefixed site; English is published under `/en`.
 * The app router retains its `[locale]` segment internally. Middleware maps
 * public Korean paths to `/ko/...` and redirects legacy `/ko` links.
 */

export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** The locale served without a path prefix. */
export const DEFAULT_LOCALE: Locale = "ko";

/** `<html lang>` and Open Graph `locale`. */
export const HTML_LANG: Record<Locale, string> = { ko: "ko", en: "en" };
export const OG_LOCALE: Record<Locale, string> = { ko: "ko_KR", en: "en_US" };
export const LOCALE_LABEL: Record<Locale, string> = { ko: "KO", en: "EN" };
export const LOCALE_NAME: Record<Locale, string> = { ko: "한국어", en: "English" };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

function splitPath(path: string): [string, string] {
  const index = path.search(/[?#]/u);
  return index === -1
    ? [path, ""]
    : [path.slice(0, index) || "/", path.slice(index)];
}

/**
 * Canonical path → the public locale href, with query and fragment intact.
 *
 *   localeHref("/install/windows", "ko") === "/install/windows"
 *   localeHref("/#install", "ko")        === "/#install"
 *   localeHref("/#install", "en")        === "/en#install"
 */
export function localeHref(path: string, locale: Locale): string {
  const [pathname, suffix] = splitPath(path);
  const canonical = canonicalPath(pathname);
  if (locale === DEFAULT_LOCALE) return `${canonical}${suffix}`;
  const prefixed = canonical === "/" ? `/${locale}` : `/${locale}${canonical}`;
  return `${prefixed}${suffix}`;
}

/** A live `usePathname()` value → the canonical, unprefixed path. */
export function canonicalPath(pathname: string): string {
  const segments = pathname.split("/");
  const first = segments[1] ?? "";
  if (first !== "en" && first !== "ko") return pathname || "/";
  const rest = segments.slice(2).join("/");
  return rest ? `/${rest}` : "/";
}

/** Switch languages on the same page without losing a query or fragment. */
export function switchLocalePath(pathname: string, locale: Locale): string {
  return localeHref(pathname, locale);
}

/** Each translation has its own canonical URL; Korean is the default. */
export function alternatesFor(path: string, locale: Locale = DEFAULT_LOCALE) {
  return {
    canonical: localeHref(path, locale),
    languages: {
      ko: localeHref(path, "ko"),
      en: localeHref(path, "en"),
      "x-default": localeHref(path, DEFAULT_LOCALE),
    },
  };
}
