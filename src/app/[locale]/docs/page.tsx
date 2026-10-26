import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResourceLinks from '@/components/ResourceLinks';
import { isLocale, localeHref } from '@/i18n/config';
import { getSiteCopy } from '@/i18n/site';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/docs'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteCopy(locale);
  return pageMetadata(t.docsTitle, t.docsIntro, '/docs', locale);
}

export default async function DocsIndex({ params }: PageProps<'/[locale]/docs'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteCopy(locale);
  return <main className="site-index">
    <header className="site-page-heading"><h1>{t.docsTitle}</h1><p>{t.docsIntro}</p></header>
    <div className="docs-directory">{t.docsSections.map((section) => <section key={section.title}>
      <h2>{section.title}</h2><p>{section.body}</p>
      <ul>{section.links.map((link) => <li key={link.href}>{link.href.startsWith("#") ? <a href={link.href}>{link.label} <span aria-hidden>→</span></a> : <Link href={localeHref(link.href, locale)} prefetch={false}>{link.label} <span aria-hidden>→</span></Link>}</li>)}</ul>
    </section>)}</div>
    <ResourceLinks locale={locale} compact />
  </main>;
}
