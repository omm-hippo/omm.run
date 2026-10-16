import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

/** Remembers a language the visitor picked explicitly (EN/KO toggle, `/ko` link). */
export const LOCALE_COOKIE = "omm-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Primary subtags of every language the browser lists with q > 0. */
function acceptedLanguages(header: string): string[] {
  const tags: string[] = [];
  for (const part of header.split(",")) {
    const [range, ...params] = part.trim().split(";");
    const tag = range?.trim().toLowerCase();
    if (!tag || tag === "*") continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    if (q !== undefined && !(Number(q.slice(2)) > 0)) continue;
    tags.push(tag.split("-")[0]!);
  }
  return tags;
}

/**
 * Pick the language for a visitor who has not been routed by URL.
 *
 *   1. A saved choice wins.
 *   2. Korean if the browser lists Korean at all, or the request comes from KR.
 *   3. English if the browser or region says anything else.
 *   4. No signal (bots, bare fetches) → the default locale.
 */
export function detectLocale(input: {
  cookie?: string | null;
  acceptLanguage?: string | null;
  country?: string | null;
}): Locale {
  if (input.cookie && isLocale(input.cookie)) return input.cookie;

  const languages = input.acceptLanguage ? acceptedLanguages(input.acceptLanguage) : [];
  const country = input.country?.trim().toUpperCase();
  const knownCountry = country && country !== "XX" && country !== "T1" ? country : null;

  if (languages.includes("ko") || knownCountry === "KR") return "ko";
  if (languages.length > 0 || knownCountry) return "en";
  return DEFAULT_LOCALE;
}

const CRAWLER = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless/iu;

export function isCrawler(userAgent: string | null): boolean {
  return userAgent !== null && CRAWLER.test(userAgent);
}
