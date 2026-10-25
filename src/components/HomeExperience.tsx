import Link from 'next/link';
import FlowPreview from './FlowPreview';
import { localeHref, type Locale } from '@/i18n/config';
import { getExperience } from '@/i18n/experience';
import { getSiteCopy } from '@/i18n/site';

export default function HomeExperience({ locale }: { locale: Locale }) {
  const t = getExperience(locale);
  const copy = getSiteCopy(locale);
  return <main className="home-experience">
    <section className="home-hero">
      <h1>{t.heading.map((line) => <span key={line}>{line}</span>)}</h1>
      <p>{t.intro}</p>
      <div className="home-actions"><Link href={localeHref('/install', locale)} prefetch={false} className="home-primary">{t.install} →</Link><Link href={localeHref('/use-cases', locale)} prefetch={false}>{t.explore} →</Link></div>
      <div id="how-it-works" className="scroll-mt-20"><FlowPreview locale={locale} /></div>
    </section>
    <section id="features" className="home-benefits">
      <h2>{copy.benefitsTitle}</h2>
      <div>{copy.benefits.map((benefit) => <article key={benefit.href}>
        <h3>{benefit.title}</h3><p>{benefit.body}</p><Link href={localeHref(benefit.href, locale)} prefetch={false}>{benefit.link} →</Link>
      </article>)}</div>
    </section>
    <section id="install" className="home-start">
      <h2>{copy.startTitle}</h2><p>{copy.startBody}</p>
      <div className="home-actions"><Link href={localeHref('/install', locale)} className="home-primary" prefetch={false}>{t.install} →</Link><Link href={localeHref('/docs', locale)} prefetch={false}>{locale === 'ko' ? '문서에서 찾아보기' : 'Browse documentation'} →</Link></div>
      <div className="home-shortcuts">
        <Link id="workspace" href={localeHref('/use-cases', locale)} prefetch={false}>{locale === 'ko' ? '활용법' : 'Use cases'}</Link>
        <Link id="runners" href={localeHref('/docs/local-ai-runners', locale)} prefetch={false}>{locale === 'ko' ? '지원 앱' : 'Supported apps'}</Link>
        <Link id="faq" href={localeHref('/docs/faq', locale)} prefetch={false}>{locale === 'ko' ? '자주 묻는 질문' : 'FAQ'}</Link>
      </div>
    </section>
  </main>;
}
