/**
 * Korean is the only site language, published without a URL prefix.
 * The app router retains its `[locale]` segment internally; middleware maps
 * public paths to `/ko/...` and redirects old `/en` and `/ko` links.
 */

export const LOCALES = ["ko"] as const;

export type Locale = (typeof LOCALES)[number];

/** The locale served without a path prefix. */
export const DEFAULT_LOCALE: Locale = "ko";

/** `<html lang>` and Open Graph `locale`. */
export const HTML_LANG: Record<Locale, string> = { ko: "ko" };
export const OG_LOCALE: Record<Locale, string> = { ko: "ko_KR" };

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
 * Canonical path → the public Korean href, with query and fragment intact.
 *
 *   localeHref("/install/windows", "ko") === "/install/windows"
 *   localeHref("/#install", "ko")        === "/#install"
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
  if (first !== "en" && first !== "ko") return pathname || "/";
  const rest = segments.slice(2).join("/");
  return rest ? `/${rest}` : "/";
}

/** A single canonical page; there are no alternate-language pages. */
export function alternatesFor(path: string) {
  return {
    canonical: localeHref(path, DEFAULT_LOCALE),
  };
}
