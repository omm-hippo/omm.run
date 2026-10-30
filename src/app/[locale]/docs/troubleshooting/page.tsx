import Link from 'next/link';
import { notFound } from 'next/navigation';
import Disclosure from '@/components/Disclosure';
import DocumentText from '@/components/DocumentText';
import PageToc from '@/components/shell/PageToc';
import { isLocale, localeHref } from '@/i18n/config';
import { getExperience } from '@/i18n/experience';
import { pageMetadata } from '@/lib/page-metadata';

function content(ko: boolean) {
  return ko ? {
    title: '막힌 지점부터 확인하세요.', intro: '오류가 난 단계에 맞춰 상태와 설정을 확인하세요. 다시 설치하기 전에 오류 메시지와 현재 설정을 먼저 살펴보세요.',
    topics: [
      { title: 'omm 명령이 실행되지 않아요', body: '설치에 사용한 터미널을 새로 열고 다시 확인하세요. 운영체제별 가이드에서 설치 경로와 PATH 설정을 확인할 수 있습니다.', href: '/install', link: '설치 가이드' },
      { title: '모델이 실행되지 않아요', body: 'omm doctor로 환경을 점검하고 omm fit으로 메모리 추정을 확인하세요. 실행 앱이 지원하는 파일인지, 해당 앱에서 모델이 인식되는지도 확인하세요.', href: '/commands/doctor', link: '환경 점검 명령어' },
      { title: '로컬 대화 화면이 서버에 연결되지 않아요', body: 'Ollama 또는 LM Studio의 로컬 API가 켜져 있는지 확인하세요. 작업 화면에 표시된 서버 주소와 모델 이름을 확인하고, 앱 자체에서도 모델이 응답하는지 확인하세요.', href: '/use-cases/local-chat', link: '로컬 대화 준비 순서' },
      { title: '문서 검색 결과가 없거나 원문과 달라요', body: '파일이 컬렉션에 추가되고 처리되었는지 먼저 확인하세요. 짧은 검색어로 다시 찾고, 파일명·페이지·원문 구간이 일치하는지 확인하세요.', href: '/commands/rag', link: '문서 검색 명령어' },
    ], doctor: '어디서 막혔는지 모르겠다면 omm doctor부터 실행하세요. 설치·연결 상태를 한 번에 점검하고 문제를 나열합니다.', doctorLink: '상태 점검 (omm doctor)',
    report: '해결되지 않았다면', reportBody: '운영체제, OMM 버전, 실행한 명령과 오류 메시지를 함께 남겨 주세요. 토큰·비밀번호와 개인 문서 내용은 지우고 공유하세요.', reportLink: 'GitHub에 문제 제보하기',
  } : {
    title: 'Start where the problem happened.', intro: 'Check the state and settings for the failing step. Read the error and your current configuration before reinstalling.',
    topics: [
      { title: 'The omm command does not run', body: 'Open a new terminal after installation. Check the installation path and PATH instructions in the guide for your OS.', href: '/install', link: 'Installation guide' },
      { title: 'The model does not run', body: 'Check the environment with omm doctor and estimate memory fit with omm fit. Verify that the app supports the file and recognizes the model.', href: '/commands/doctor', link: 'Diagnostic commands' },
      { title: 'Local chat cannot connect to the server', body: 'Enable the local API in Ollama or LM Studio. Check the server address and model in the workspace, then verify a response in the runner itself.', href: '/use-cases/local-chat', link: 'Local chat setup' },
      { title: 'Document search has no results or the source is wrong', body: 'Check that the collection processed the file. Try a short query, then verify the filename, page and original passage.', href: '/commands/rag', link: 'Document search commands' },
    ], doctor: 'Not sure where it broke? Run omm doctor first. It checks installation and connections in one pass and lists any problems.', doctorLink: 'Run diagnostics (omm doctor)',
    report: 'Still having trouble?', reportBody: 'Include your OS, OMM version, command and error message. Remove tokens, passwords and private document content before sharing.', reportLink: 'Report an issue on GitHub',
  };
}

export async function generateMetadata({ params }: PageProps<'/[locale]/docs/troubleshooting'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content(locale === 'ko');
  return pageMetadata(t.title, t.intro, '/docs/troubleshooting', locale);
}

export default async function TroubleshootingPage({ params }: PageProps<'/[locale]/docs/troubleshooting'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content(locale === 'ko');
  const faq = getExperience(locale);
  return <main className="section-page"><article className="reading-article">
    <h1>{t.title}</h1><p className="reading-intro">{t.intro}</p>
    <p className="reading-callout">{t.doctor} <Link className="home-inline-link" href={localeHref('/commands/doctor', locale)} prefetch={false}>{t.doctorLink} →</Link></p>
    {t.topics.map((topic, index) => <section key={topic.href} id={`issue-${index + 1}`}><h2>{topic.title}</h2><p>{topic.body}</p><Link className="home-inline-link" href={localeHref(topic.href, locale)} prefetch={false}>{topic.link} →</Link></section>)}
    <section id="faq"><h2>{faq.faq}</h2>{faq.questions.map((question, index) => <Disclosure key={question.title} id={`faq-${index + 1}`} title={question.title}><DocumentText text={question.body} locale={locale} /></Disclosure>)}
      <p className="mt-4"><a className="home-inline-link" href="https://github.com/omm-hippo/omm/blob/main/PRIVACY.md" target="_blank" rel="noreferrer">{locale === 'ko' ? '개인정보 문서' : 'Privacy document'} ↗</a></p></section>
    <section><h2>{t.report}</h2><p>{t.reportBody}</p><a className="home-inline-link" href="https://github.com/omm-hippo/omm/issues/new" target="_blank" rel="noreferrer">{t.reportLink} ↗</a></section>
  </article><PageToc label={locale === 'ko' ? '문제별 바로가기' : 'Troubleshooting topics'} items={[...t.topics.map((topic, index) => ({ id: `issue-${index + 1}`, title: topic.title })), { id: 'faq', title: faq.faq }]} /></main>;
}
