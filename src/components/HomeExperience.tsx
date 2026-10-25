import Link from 'next/link';
import Disclosure from './Disclosure';
import DocumentText from './DocumentText';
import RichTextBlocks from './RichTextBlocks';
import FlowPreview from './FlowPreview';
import ResourceLinks from './ResourceLinks';
import Runners from './Runners';
import Features from './Features';
import Workspace from './Workspace';
import Install from './Install';
import { localeHref, type Locale } from '@/i18n/config';
import { getExperience } from '@/i18n/experience';
import { getDictionary } from '@/i18n/dictionaries';

export default function HomeExperience({ locale }: { locale: Locale }) {
  const t = getExperience(locale);
  const dictionary = getDictionary(locale);
  return <main className="home-experience">
    <section className="home-hero">
      <h1>{t.heading.map((line) => <span key={line}>{line}</span>)}</h1>
      <p>{t.intro}</p><div className="home-actions"><a href="#install" className="home-primary">{t.install} →</a><Link href={localeHref('/models', locale)} prefetch={false}>{t.explore} →</Link></div>
      <FlowPreview locale={locale} />
    </section>
    <section id="how-it-works" className="home-steps" aria-label={locale === 'ko' ? '시작하는 세 단계' : 'Three steps to start'}>
      {t.steps.map((step, index) => <div key={step.title}><span className="home-step-index">0{index + 1}</span><h2>{step.title}</h2><p>{step.body}</p><Link href={localeHref(['/models', '/install', '/commands/web'][index], locale)} prefetch={false}>{step.link}</Link></div>)}
    </section>
    <section id="features" className="home-story"><span id="problem" className="scroll-mt-20" />
      <div><h2>{t.storyTitle}</h2><DocumentText text={t.storyBody} locale={locale} />
        <Disclosure id="memory-fit" title={t.memory}><RichTextBlocks segments={dictionary.features.localfit.body} locale={locale} /><Link href={localeHref('/commands/fit', locale)} prefetch={false} className="home-inline-link">omm fit →</Link></Disclosure>
      </div><figure><div className="simple-link-map" role="img" aria-label={locale === 'ko' ? '중앙 모델 파일을 지원 러너에 연결하는 예시' : 'Example model hub linked to supported runners'}><div className="simple-link-hub"><span>GGUF</span><strong>{locale === 'ko' ? '모델 파일 한곳에' : 'One model hub'}</strong><code>~/.omm/models</code></div><div className="simple-link-runners">{['Ollama', 'LM Studio', 'Jan'].map((runner) => <div key={runner}>{runner}<span>{locale === 'ko' ? '지원 러너 예시' : 'Supported runner example'}</span></div>)}</div></div><figcaption>{t.storyNote}</figcaption></figure>
    </section>
    <div className="home-reading-details"><Disclosure title={t.advanced}><Features locale={locale} /></Disclosure><Disclosure title={t.runners}><Runners locale={locale} /></Disclosure></div>
    <div className="home-reading-details"><Disclosure title={dictionary.workspace.heading}><Workspace locale={locale} /></Disclosure></div>
    <ResourceLinks locale={locale} />
    <section id="faq" className="home-faq"><h2>{t.faq}</h2>{t.questions.map((question, index) => <Disclosure id={`faq-${index + 1}`} title={question.title} defaultOpen={index === 0} key={question.title}><DocumentText text={question.body} locale={locale} />{index === 4 ? <a href="https://github.com/omm-hippo/omm/blob/main/PRIVACY.md" target="_blank" rel="noreferrer" className="home-inline-link">{locale === 'ko' ? '개인정보 문서' : 'Privacy document'} ↗</a> : null}</Disclosure>)}</section>
    <Install locale={locale} />
  </main>;
}
