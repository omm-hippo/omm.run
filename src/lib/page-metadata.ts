import type { Metadata } from 'next';
import { alternatesFor, localeHref, OG_LOCALE, type Locale } from '../i18n/config';

export function pageMetadata(title: string, description: string, path: string, locale: Locale): Metadata {
  return {
    title: `${title} — OMM`, description, alternates: alternatesFor(path, locale),
    openGraph: { title, description, url: localeHref(path, locale), locale: OG_LOCALE[locale], type: 'website' },
  };
}
