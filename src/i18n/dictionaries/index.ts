import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { ko } from "@/i18n/dictionaries/ko";
import type { Widen } from "@/i18n/widen";

/** English is the shape of record; Korean is checked against it. */
export type Dictionary = Widen<typeof en>;

const DICTIONARIES: Record<Locale, Dictionary> = { en, ko };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/**
 * Fills `{name}` placeholders. Korean and English put the same values in
 * different positions ("Runners on Windows" / "Windows의 러너"), which is the
 * whole reason the strings carry placeholders instead of being concatenated.
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
