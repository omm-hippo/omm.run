'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Native disclosure: keyboard accessible, works without JS, opens for deep links. */
export default function Disclosure({ id, title, children, defaultOpen = false, className = '' }: {
  id?: string; title: string; children?: ReactNode; defaultOpen?: boolean; className?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const revealTarget = () => {
      const node = ref.current;
      if (!node || !window.location.hash) return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch { return; }
      if (target && (node === target || node.contains(target) || target === node.closest('section[id]'))) node.open = true;
    };
    revealTarget();
    window.addEventListener('hashchange', revealTarget);
    return () => window.removeEventListener('hashchange', revealTarget);
  }, []);
  return <details ref={ref} id={id} open={defaultOpen || undefined} className={`disclosure ${className}`}>
    <summary><svg className="disclosure-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5 9 6 3 10.5Z" fill="currentColor" /></svg><span>{title}</span></summary>
    <div className="disclosure-body">{children}</div>
  </details>;
}
