import type { ReactNode } from 'react';

export type AssistantIconName = 'new' | 'expand' | 'collapse' | 'close' | 'search' | 'shield' | 'send' | 'model' | 'install' | 'connect' | 'check';

const paths: Record<AssistantIconName, ReactNode> = {
  new: <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H9l-6 2 1.8-5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M12.5 7.5v8m-4-4h8"/></>,
  expand: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></>,
  collapse: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>,
  close: <path d="m5 5 7 7-7 7m8-14 7 7-7 7"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  shield: <><path d="m12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6l8-3Z"/><path d="m8.5 11.5 2.5 2.5 4.5-5"/></>,
  send: <path d="M12 20V4m-6 6 6-6 6 6"/>,
  model: <><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5.5 5.5M10 7v6m-3-3h6"/></>,
  install: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></>,
  connect: <><path d="m10 13 4-4m-6 6-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 2 1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" transform="translate(1 1)"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
};

export default function AssistantIcon({ name }: { name: AssistantIconName }) {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

/** Shared OMM headset mark; keep the brand consistent with the launcher. */
export function AssistantMark() {
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M10 29v-7a14 14 0 0 1 28 0v7M9 25H6v10h7V24H9Zm30 0h3v10h-7V24h4ZM36 35c0 5-5 7-10 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 31c-3-2-4-5-4-8a11 11 0 0 1 22 0c0 3-1 6-4 8h-4l2-4a6 6 0 1 0-10 0l2 4h-4Z" fill="currentColor"/><circle cx="20" cy="21" r="1.4" fill="#191919"/><circle cx="28" cy="21" r="1.4" fill="#191919"/></svg>;
}
