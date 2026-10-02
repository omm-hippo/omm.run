import type { Locale } from "@/i18n/config";
import { ko } from "@/i18n/dictionaries/ko";
import type { Widen } from "@/i18n/widen";

/** Korean copy defines the site's dictionary shape. */
export type Dictionary = Widen<typeof ko>;

const DICTIONARIES: Record<Locale, Dictionary> = { ko };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/**
 * Fills `{name}` placeholders without coupling prose to value order.
 */
export function fill(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? values[key] : match,
  );
}

/** One segment of a rich body: plain text, or an inline `<code>` run. */
export type RichSegment = string | { readonly code: string };
