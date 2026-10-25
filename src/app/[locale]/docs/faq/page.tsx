import Link from 'next/link';
import { notFound } from 'next/navigation';
import Disclosure from '@/components/Disclosure';
import DocumentText from '@/components/DocumentText';
import { isLocale, localeHref } from '@/i18n/config';
import { getExperience } from '@/i18n/experience';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/docs/faq'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getExperience(locale);
  return pageMetadata(t.faq, t.questions[0].body, '/docs/faq', locale);
}

export default async function FAQPage({ params }: PageProps<'/[locale]/docs/faq'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getExperience(locale);
  return <main className="site-reading reading-single"><article className="reading-article">
    <h1>{t.faq}</h1><p className="reading-intro">{locale === 'ko' ? '실행 위치, 모델 선택, 설치와 정보 공유에 관한 답변입니다.' : 'Answers about model execution, selection, installation and data sharing.'}</p>
    <div className="mt-8">{t.questions.map((question, index) => <Disclosure key={question.title} id={`faq-${index + 1}`} title={question.title} defaultOpen={index === 0}><DocumentText text={question.body} locale={locale} /></Disclosure>)}</div>
    <section><h2>{locale === 'ko' ? '더 자세히 확인하기' : 'Read more'}</h2>
      <ul className="document-link-list"><li><Link href={localeHref('/docs/troubleshooting', locale)} prefetch={false}>{locale === 'ko' ? '문제 해결 가이드' : 'Troubleshooting guide'}</Link></li><li><a href="https://github.com/omm-hippo/omm/blob/main/PRIVACY.md" target="_blank" rel="noreferrer">{locale === 'ko' ? '개인정보 문서' : 'Privacy document'} ↗</a></li></ul>
    </section>
  </article></main>;
}
