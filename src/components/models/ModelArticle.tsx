import Link from 'next/link';
import Disclosure from '@/components/Disclosure';
import DocumentText from '@/components/DocumentText';
import ResourceLinks from '@/components/ResourceLinks';
import CommandBlock from '@/components/install/CommandBlock';
import { localeHref, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getModelDictionary } from '@/i18n/models';
import { rawWeightIllustration } from '@/lib/models/memory';
import type { ModelView } from '@/lib/models/types';
import { ModelFacts } from './ModelFacts';

function Claims({ claims, model, locale }: { claims: ModelView['strengths']; model: ModelView; locale: Locale }) {
  const t = getModelDictionary(locale);
  return <ul className="document-list">{claims.map((claim, index) => {
    const source = model.sources.find((item) => item.id === claim.sourceId);
    return <li key={index}><p>{claim.text}</p><p className="document-caption">{claim.basis === 'publisher' ? t.publisherClaim : t.editorial}{source ? <> · <a href={source.url} target="_blank" rel="noreferrer">{t.repository} ↗</a></> : null}</p></li>;
  })}</ul>;
}

export default function ModelArticle({ model, locale }: { model: ModelView; locale: Locale }) {
  const t = getModelDictionary(locale);
  const ui = getDictionary(locale).ui;
  const sections = [['overview', t.chooseWhen], ['use-example', t.example], ['strengths', t.strengths], ['cautions', t.cautions], ['runtime', t.runtime], ['sources', t.officialSources], ['reference-files', locale === 'ko' ? '참고 파일' : 'Reference files']] as const;
  return <main className="document-page model-document"><div className="document-reader">
    <article className="document-article">
      <header><Link href={localeHref('/models', locale)} prefetch={false} className="document-caption">← {t.back}</Link><h1>{model.name}</h1><p className="document-intro">{model.summary}</p><ModelFacts model={model} locale={locale} /><p className="document-caption mt-3">{t.lastReviewed} · <time dateTime={model.reviewedAt}>{model.reviewedAt}</time> · <a href="#sources">{t.officialSources} ↓</a></p></header>
      <section id="overview"><h2>{t.chooseWhen}</h2><div className="document-callout"><DocumentText text={model.chooseWhen} locale={locale} /><p className="document-caption">{t.editorial}</p></div></section>
      <section id="use-example"><h2>{t.example}</h2><p className="document-caption">{t.exampleNote}</p><div className="document-callout mt-4"><h3>{t.examplePrompt}</h3><p>{model.example.prompt}</p></div><h3 className="mt-5">{t.exampleCheck}</h3><DocumentText text={model.example.check} locale={locale} /></section>
      <section id="strengths"><h2>{t.strengths}</h2><Claims claims={model.strengths} model={model} locale={locale} /></section>
      <section id="cautions"><h2>{t.cautions}</h2><Claims claims={model.cautions} model={model} locale={locale} /><p className="document-caption mt-4">{t.evidenceNote}</p></section>
      <Disclosure id="runtime" title={t.runtime}><DocumentText text={model.runtimeNote} locale={locale} /><p className="document-caption mt-4">{t.rawWeightNote}</p><div className="document-table-wrap"><table><thead><tr><th scope="col">{locale === 'ko' ? '계산용 정밀도' : 'Illustrative precision'}</th><th scope="col">{locale === 'ko' ? '순수 가중치 계산값' : 'Raw weight calculation'}</th></tr></thead><tbody>{([4,8,16] as const).map((bits) => <tr key={bits}><th scope="row">{bits}-bit</th><td>{new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(rawWeightIllustration(model.parameterScaleB, bits))} GB</td></tr>)}</tbody></table></div></Disclosure>
      <section id="try"><h2>{t.handoffHeading}</h2><DocumentText text={t.handoffBody} locale={locale} /><div className="mt-5"><CommandBlock prompt="$" command={`omm search "${model.name}"`} label={t.searchCommand} ui={ui} /></div><ul className="document-link-list">{[['search', t.searchCommand], ['fit', t.fitCommand], ['benchmark', t.benchmarkCommand]].map(([slug,label]) => <li key={slug}><Link href={localeHref(`/commands/${slug}`, locale)} prefetch={false}>{label} →</Link></li>)}</ul></section>
      <Disclosure id="sources" title={t.officialSources}><ul className="document-list">{model.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p className="document-caption">{t.reviewed} · {source.accessedAt}</p></li>)}</ul><p className="document-caption mt-5">{t.openWeightsNote}</p><a className="document-caption mt-4 inline-block" href={`/api/models?locale=${locale}&id=${model.id}`} download={`${model.id}-${locale}.json`}>{t.json} ↓</a></Disclosure>
      <section id="reference-files"><ResourceLinks locale={locale} compact /></section>
    </article>
    <aside className="document-toc"><nav aria-label={locale === 'ko' ? '이 페이지 내용' : 'On this page'}><p>{locale === 'ko' ? '이 페이지 내용' : 'On this page'}</p><ul>{sections.map(([id,label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul></nav></aside>
  </div></main>;
}
