import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import NotionReading from '@/components/NotionReading';
import { isLocale } from '@/i18n/config';
import { getSiteCopy } from '@/i18n/site';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/news'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteCopy(locale);
  return pageMetadata(t.newsTitle, t.newsIntro, '/news', locale);
}

export default async function NewsPage({ params }: PageProps<'/[locale]/news'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteCopy(locale);
  return <><Nav locale={locale} /><main className="site-reading reading-single"><article className="reading-article">
    <h1>{t.newsTitle}</h1><p className="reading-intro">{t.newsIntro}</p>
    <ul className="topic-list">{t.newsLinks.map((link) => <li key={link.href}><a href={link.href} target="_blank" rel="noreferrer"><h2>{link.title}</h2><p>{link.body}</p><span aria-hidden>↗</span></a></li>)}</ul>
    <NotionReading locale={locale} />
  </article></main><Footer locale={locale} /></>;
}
