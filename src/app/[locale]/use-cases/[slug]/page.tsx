import Link from 'next/link';
import { notFound } from 'next/navigation';
import Disclosure from '@/components/Disclosure';
import Features from '@/components/Features';
import Runners from '@/components/Runners';
import UseCaseMenu from '@/components/UseCaseMenu';
import NotionReading from '@/components/NotionReading';
import { isLocale, localeHref } from '@/i18n/config';
import { getSiteCopy, getUseCase, USE_CASE_SLUGS } from '@/i18n/site';
import { getExperience } from '@/i18n/experience';
import { pageMetadata } from '@/lib/page-metadata';

export function generateStaticParams() { return USE_CASE_SLUGS.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: PageProps<'/[locale]/use-cases/[slug]'>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const guide = getUseCase(slug, locale);
  if (!guide) notFound();
  return pageMetadata(guide.title, guide.summary, `/use-cases/${slug}`, locale);
}

const RELATED: Record<string, string[]> = {
  'model-management': ['why-omm', 'choosing-models', 'runners-and-omm'],
  'local-chat': ['runners-and-omm'],
  'document-search': ['document-search'],
  'mac-cluster': ['mac-cluster'],
};

export default async function UseCasePage({ params }: PageProps<'/[locale]/use-cases/[slug]'>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const guide = getUseCase(slug, locale);
  if (!guide) notFound();
  const t = getSiteCopy(locale);
  const experience = getExperience(locale);
  return <main className="site-reading">
    <UseCaseMenu locale={locale} current={slug} />
    <article className="reading-article">
      <h1>{guide.title}</h1><p className="reading-intro">{guide.summary}</p>
      <nav className="reading-toc" aria-label={locale === 'ko' ? '이 페이지 목차' : 'On this page'}>
        <a href="#requirements">{t.requirementsTitle}</a><a href="#steps">{t.stepsTitle}</a><a href="#result">{t.resultTitle}</a>
      </nav>
      <section id="requirements"><h2>{t.requirementsTitle}</h2><p>{guide.requirement}</p></section>
      <section id="steps"><h2>{t.stepsTitle}</h2><ol className="reading-steps">{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      <section id="result"><h2>{t.resultTitle}</h2><p>{guide.result}</p></section>
      <section><h2>{t.nextTitle}</h2><code className="reading-command">{guide.command}</code><Link className="home-inline-link" href={localeHref(guide.href, locale)} prefetch={false}>{guide.link} →</Link></section>
      {slug === 'model-management' ? <div className="reading-technical">
        <Disclosure title={experience.advanced}><Features locale={locale} /></Disclosure>
        <Disclosure title={experience.runners}><Runners locale={locale} /></Disclosure>
      </div> : null}
      <NotionReading locale={locale} ids={RELATED[slug] ?? []} />
      <p className="reading-note">{t.versionNote}</p>
    </article>
  </main>;
}
