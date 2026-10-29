import Link from 'next/link';
import { localeHref, type Locale } from '@/i18n/config';
import { getSiteCopy } from '@/i18n/site';

/** Sidebar for /docs/* pages. Same groups as the /docs index, so the two never drift. */
export default function DocsMenu({ locale, current }: { locale: Locale; current?: string }) {
  const t = getSiteCopy(locale);
  return <aside className="reading-sidebar docs-menu"><nav aria-label={t.docsMenu}>
    <Link className="reading-sidebar-title" href={localeHref('/docs', locale)} prefetch={false}>{t.docsMenu}</Link>
    {t.docsSections.map((section) => <div key={section.title} className="docs-menu-group">
      <p>{section.title}</p>
      {section.links.map((link) => <Link key={link.href} href={localeHref(link.href, locale)} prefetch={false} aria-current={current === link.href ? 'page' : undefined}>
        {link.label}{link.english ? <span className="docs-menu-tag">{t.englishTag}</span> : null}
      </Link>)}
    </div>)}
  </nav></aside>;
}
