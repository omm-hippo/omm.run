'use client';
import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { localeHref, type Locale } from '@/i18n/config';
import { getExperience } from '@/i18n/experience';

export default function FlowPreview({ locale }: { locale: Locale }) {
  const t = getExperience(locale);
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const changeTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % 3;
    else if (event.key === 'ArrowLeft') next = (index + 2) % 3;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 2;
    else return;
    event.preventDefault(); setActive(next); buttons.current[next]?.focus();
  };
  return <div className="flow-preview">
    <div className="flow-preview-bar"><span className="font-mono">omm</span><p>{t.preview}</p></div>
    <div className="flow-preview-layout">
      <div className="flow-tabs" role="tablist" aria-label={locale === 'ko' ? '사용 흐름 예시' : 'Workflow example'}>
        {t.tabs.map((tab, index) => <button ref={(node) => { buttons.current[index] = node; }} key={tab} type="button" role="tab" id={`${id}-tab-${index}`} aria-selected={active === index} aria-controls={`${id}-panel-${index}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => changeTab(event, index)}><span className="flow-step-number">0{index + 1}</span>{tab}</button>)}
      </div>
      {t.tabs.map((tab, index) => <div role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={active !== index} key={tab} className="flow-panel" tabIndex={0}>
        <h2>{tab}</h2><p className="flow-panel-intro">{t.previewIntro[index]}</p>
        {index === 0 ? <div className="flow-model-table"><div className="flow-model-header"><span>{t.previewModel}</span><span>{t.previewUse}</span><span>{t.previewSize}</span></div>
          {[['Qwen3-8B', 'qwen3-8b', '8.2B'], ['Gemma 3 4B IT', 'gemma-3-4b-it', '4B']].map(([name, slug, size], row) => <div className="flow-model-row" key={slug}><div><strong>{name}</strong><Link href={localeHref('/models', locale)} prefetch={false}>{t.viewWiki}</Link></div><span>{t.uses[row]}</span><span className="font-mono">{size}</span></div>)}
        </div> : <><ol className="flow-stage-list">{(index === 1 ? t.installPreview : t.chatPreview).map((label, stage) => <li key={label}><span>0{stage + 1}</span>{label}</li>)}</ol><Link className="flow-next-link" href={localeHref(index === 1 ? '/install' : '/commands/web', locale)} prefetch={false}>{index === 1 ? t.steps[1].link : t.steps[2].link}</Link></>}
      </div>)}
    </div>
  </div>;
}
