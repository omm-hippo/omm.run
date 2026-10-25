import Link from 'next/link';
import { notFound } from 'next/navigation';
import UseCaseMenu from '@/components/UseCaseMenu';
import { isLocale, localeHref } from '@/i18n/config';
import { getSiteCopy, getUseCases } from '@/i18n/site';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/use-cases'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteCopy(locale);
  return pageMetadata(t.useCasesTitle, t.useCasesIntro, '/use-cases', locale);
}

export default async function UseCasesPage({ params }: PageProps<'/[locale]/use-cases'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSiteCopy(locale);
  return <main className="site-reading">
    <UseCaseMenu locale={locale} />
    <article className="reading-article">
      <h1>{t.useCasesTitle}</h1><p className="reading-intro">{t.useCasesIntro}</p>
      <ul className="topic-list">{getUseCases(locale).map((guide) => <li key={guide.slug}>
        <Link href={localeHref(`/use-cases/${guide.slug}`, locale)} prefetch={false}><h2>{guide.title}</h2><p>{guide.summary}</p><span aria-hidden>→</span></Link>
      </li>)}</ul>
      <p className="reading-note">{t.versionNote}</p>
    </article>
  </main>;
}
