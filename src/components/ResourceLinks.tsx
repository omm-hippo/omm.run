import Link from 'next/link';
import { localeHref, type Locale } from '@/i18n/config';
import { getExperience } from '@/i18n/experience';

export default function ResourceLinks({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const t = getExperience(locale);
  const rows = [
    { href: localeHref('/models', locale), file: false },
    { href: localeHref('/install', locale), file: false },
    { href: `/resources/omm-first-steps-${locale}.txt`, file: true },
    { href: `/resources/omm-model-checklist-${locale}.md`, file: true },
    { href: `/api/models?locale=${locale}`, file: true, name: `omm-model-wiki-${locale}.json` },
    { href: '#omm-assistant', file: false },
    { href: localeHref('/arena', locale), file: false },
  ];
  return <section id={compact ? undefined : 'resources'} className={compact ? 'related-resources' : 'home-resources'} aria-label={t.resources}>
    <h2>{compact ? t.fileLinks : t.resources}</h2><p>{t.resourceBody}</p>
    <ul>{rows.slice(compact ? 2 : 0, compact ? 5 : undefined).map((row, index) => {
      const position = compact ? index + 2 : index;
      return <li key={row.href}>{row.file ? <a href={row.href} download={row.name ?? true}><span>{t.resourceTitles[position]}</span><span aria-hidden>↓</span></a> : row.href.startsWith("#") ? <a href={row.href}><span>{t.resourceTitles[position]}</span><span aria-hidden>↗</span></a> : <Link href={row.href} prefetch={false}><span>{t.resourceTitles[position]}</span><span aria-hidden>↗</span></Link>}{!compact ? <p>{t.resourceBodies[position]}</p> : null}</li>;
    })}</ul>
  </section>;
}
