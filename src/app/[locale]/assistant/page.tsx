import { notFound, permanentRedirect } from 'next/navigation';
import { isLocale, localeHref } from '@/i18n/config';

/** Preserve old links while moving the assistant into the persistent dock. */
export default async function AssistantPage({ params }: PageProps<"/[locale]/assistant">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  permanentRedirect(localeHref('/?assistant=open', locale));
}
