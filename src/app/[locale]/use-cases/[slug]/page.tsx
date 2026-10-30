import Link from 'next/link';
import { notFound } from 'next/navigation';
import Disclosure from '@/components/Disclosure';
import Features from '@/components/Features';
import Runners from '@/components/Runners';
import NotionReading from '@/components/NotionReading';
import CommandBlock from '@/components/install/CommandBlock';
import PageToc from '@/components/shell/PageToc';
import { isLocale, localeHref } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getSiteCopy } from '@/i18n/site';
import { getGuideCopy, getUseCase, USE_CASE_SLUGS } from '@/i18n/use-cases';
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

/** Prose with `backticks` around commands, paths and CLI output. */
function Rich({ text }: { text: string }) {
  return <>{text.split('`').map((part, index) => index % 2 ? <code key={index}>{part}</code> : part)}</>;
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
  const g = getGuideCopy(locale);
  const ui = getDictionary(locale).ui;
  const experience = getExperience(locale);
  const toc = [
    { id: 'requirements', title: t.requirementsTitle },
    ...guide.steps.map((step, index) => ({ id: `step-${index + 1}`, title: step.title, n: String(index + 1).padStart(2, '0') })),
    { id: 'verify', title: g.verify },
    { id: 'trouble', title: g.trouble },
    ...(guide.undo ? [{ id: 'undo', title: g.undo }] : []),
  ];
  return <main className="section-page">
    <article className="reading-article">
      <h1>{guide.title}</h1><p className="reading-intro">{guide.summary}</p>
      <p className="reading-callout"><strong className="text-ink-0">{g.outcome}</strong> <Rich text={guide.outcome} /></p>

      <section id="requirements"><h2>{t.requirementsTitle}</h2>
        <ul className="guide-list">{guide.requirements.map((item) => <li key={item}><Rich text={item} /></li>)}</ul>
      </section>

      <section id="steps" aria-label={t.stepsTitle}>
        {guide.steps.map((step, index) => <div key={step.title} id={`step-${index + 1}`} className="guide-step">
          <p className="guide-step-meta"><span className="font-mono">{String(index + 1).padStart(2, '0')}</span>{step.where ? <span className="guide-where">{step.where}</span> : null}</p>
          <h2>{step.title}</h2>
          <p><Rich text={step.body} /></p>
          {step.commands?.map((command) => <div key={command} className="mt-4"><CommandBlock prompt="$" command={command} label={command} tone="secondary" ui={ui} /></div>)}
          {step.notes ? <ul className="guide-list">{step.notes.map((note) => <li key={note}><Rich text={note} /></li>)}</ul> : null}
          {step.check ? <p className="guide-check"><strong>{g.check}</strong> <Rich text={step.check} /></p> : null}
          {step.ref ? <Link className="home-inline-link" href={localeHref(step.ref.href, locale)} prefetch={false}>{step.ref.label} →</Link> : null}
        </div>)}
      </section>

      <section id="verify"><h2>{g.verify}</h2>
        <ul className="guide-list">{guide.verify.map((item) => <li key={item}><Rich text={item} /></li>)}</ul>
      </section>

      <section id="trouble"><h2>{g.trouble}</h2>
        <dl className="guide-trouble">{guide.troubles.map((item) => <div key={item.message}>
          <dt><code>{item.message}</code></dt>
          <dd><Rich text={item.fix} />{item.href ? <> <Link className="home-inline-link" href={localeHref(item.href, locale)} prefetch={false}>{g.more} →</Link></> : null}</dd>
        </div>)}</dl>
      </section>

      {guide.undo ? <section id="undo"><h2>{g.undo}</h2><p><Rich text={guide.undo.body} /></p>
        {guide.undo.commands.map((command) => <div key={command} className="mt-4"><CommandBlock prompt="$" command={command} label={command} tone="secondary" ui={ui} /></div>)}
      </section> : null}

      <section><h2>{t.nextTitle}</h2>
        <ul className="guide-list">{guide.references.map((ref) => <li key={ref.href}><Link className="home-inline-link" href={localeHref(ref.href, locale)} prefetch={false}>{ref.label} →</Link></li>)}</ul>
      </section>
      {slug === 'model-management' ? <div className="reading-technical">
        <Disclosure title={experience.advanced}><Features locale={locale} /></Disclosure>
        <Disclosure title={experience.runners}><Runners locale={locale} /></Disclosure>
      </div> : null}
      <NotionReading locale={locale} ids={RELATED[slug] ?? []} />
      <p className="reading-note">{t.versionNote}</p>
    </article>
    <PageToc label={g.onThisPage} items={toc} />
  </main>;
}
