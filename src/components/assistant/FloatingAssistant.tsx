'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { canonicalPath, localeHref, type Locale } from '@/i18n/config';
import type { AssistantCommandCard } from './types';
import AssistantIcon, { AssistantMark } from './AssistantIcon';

const AssistantClient = dynamic(() => import('./AssistantClient'), { ssr: false, loading: () => <p role="status">…</p> });
const COPY = {
  ko: { open: 'OMM AI 도우미 열기', close: '도우미 닫기', title: 'OMM AI 도우미', newChat: '새 AI 채팅', expand: '크게 보기', collapse: '작게 보기', loading: '명령어 문서 불러오는 중…', error: '문서를 불러오지 못했습니다.', retry: '다시 불러오기', search: '명령어 검색', page: '현재 문서' },
  en: { open: 'Open OMM AI assistant', close: 'Close assistant', title: 'OMM AI assistant', newChat: 'New AI chat', expand: 'Expand assistant', collapse: 'Compact assistant', loading: 'Loading command documentation…', error: 'Documentation could not be loaded.', retry: 'Try again', search: 'Search commands', page: 'Current document' },
};

function validCards(value: unknown): value is { cards: AssistantCommandCard[] } {
  if (typeof value !== 'object' || value === null || !('cards' in value) || !Array.isArray(value.cards) || (value.cards.length === 0 || value.cards.length > 80)) return false;
  return value.cards.every((card) => card && typeof card.id === 'string' && /^[a-z][a-z0-9-]*$/u.test(card.id)
    && card.href === `/commands/${card.id}` && ['name','summary','example'].every((key) => typeof card[key] === 'string' && card[key].length <= 4096)
    && Array.isArray(card.options) && card.options.every((option: unknown) => typeof option === 'string')
    && Number.isInteger(card.remainingOptionCount) && card.remainingOptionCount >= 0 && [null,'inspect','caution','high-impact'].includes(card.risk));
}

export default function FloatingAssistant({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conversation, setConversation] = useState(0);
  const [cards, setCards] = useState<readonly AssistantCommandCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  const loadCatalog = useCallback(async () => {
    if (pending.current) return;
    pending.current = true; setLoading(true); setFailed(false);
    controller.current = new AbortController();
    try {
      const response = await fetch(`/api/assistant/catalog?locale=${locale}`, { signal: controller.current.signal });
      if (!response.ok) throw new Error('catalog_unavailable');
      const value: unknown = await response.json();
      if (!validCards(value)) throw new Error('invalid_catalog');
      setCards(value.cards);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setFailed(true);
    } finally { pending.current = false; setLoading(false); }
  }, [locale]);

  const openDock = useCallback(() => {
    setOpen(true); setMounted(true);
    if (!cards) void loadCatalog();
  }, [cards, loadCatalog]);
  const closeDock = () => {
    setOpen(false);
    const url = new URL(window.location.href);
    let changed = false;
    if (url.hash === '#omm-assistant') { url.hash = ''; changed = true; }
    if (url.searchParams.get('assistant') === 'open') { url.searchParams.delete('assistant'); changed = true; }
    if (changed) history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    requestAnimationFrame(() => launcher.current?.focus());
  };
  useEffect(() => {
    const handleLink = () => {
      const url = new URL(window.location.href);
      if (url.hash === '#omm-assistant' || url.searchParams.get('assistant') === 'open') openDock();
    };
    const timer = window.setTimeout(handleLink, 0);
    window.addEventListener('hashchange', handleLink);
    return () => { window.clearTimeout(timer); window.removeEventListener('hashchange', handleLink); };
  }, [openDock]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!open || !cards) return;
    const frame = requestAnimationFrame(() => panel.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, cards]);

  const slug = canonicalPath(pathname).match(/^\/commands\/([a-z0-9-]+)$/u)?.[1];
  const context = cards?.find((card) => card.id === slug);
  return <div className="assistant-dock">
    {mounted ? <section ref={panel} id="omm-assistant-panel" role="dialog" aria-label={t.title} hidden={!open} className={`assistant-dock-panel${expanded ? " assistant-dock-expanded" : ""}`} onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); closeDock(); } }}>
      <header className="assistant-dock-header">
        <div className="assistant-dock-title"><AssistantMark /><h2>{t.newChat}</h2></div>
        <div className="assistant-header-actions">
          <button type="button" onClick={() => setConversation((current) => current + 1)} aria-label={t.newChat} title={t.newChat} disabled={!cards}><AssistantIcon name="new" /></button>
          <button type="button" className="assistant-expand-control" onClick={() => setExpanded((current) => !current)} aria-label={expanded ? t.collapse : t.expand} title={expanded ? t.collapse : t.expand} aria-pressed={expanded}><AssistantIcon name={expanded ? 'collapse' : 'expand'} /></button>
          <button type="button" onClick={closeDock} aria-label={t.close} title={t.close}><AssistantIcon name="close" /></button>
        </div>
      </header>
      <div className="assistant-dock-content">
        {context ? <p className="assistant-page-context">{t.page} · {context.name}</p> : null}
        {loading ? <p role="status">{t.loading}</p> : null}
        {failed ? <div role="status"><p>{t.error}</p><button type="button" onClick={() => void loadCatalog()} className="home-inline-link">{t.retry}</button><Link href={localeHref('/commands', locale)} prefetch={false} className="home-inline-link">{t.search} →</Link></div> : null}
        {cards ? <AssistantClient key={conversation} cards={cards} locale={locale} compact contextCommand={context?.id} /> : null}
      </div>
    </section> : null}
    <button ref={launcher} id="omm-assistant" type="button" hidden={open} className="assistant-launcher" aria-label={open ? t.close : t.open} aria-expanded={open} aria-controls={mounted ? "omm-assistant-panel" : undefined} onClick={() => open ? closeDock() : openDock()}><AssistantMark /><span>OMM AI</span></button>
  </div>;
}
