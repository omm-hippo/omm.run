'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { canonicalPath, localeHref, type Locale } from '@/i18n/config';
import { sectionNavigation } from '@/lib/site-navigation';

export default function SectionNav({ locale, group }: { locale: Locale; group: 'docs' | 'models' }) {
  const path = canonicalPath(usePathname());
  return <nav className="section-nav" aria-label={locale === 'ko' ? `${group === 'docs' ? '문서' : '모델'} 하위 메뉴` : `${group} sections`}>
    <div>{sectionNavigation(group, locale).map((item) => {
      const active = path === item.href || (item.href !== '/docs' && path.startsWith(`${item.href}/`));
      return <Link key={item.href} href={localeHref(item.href, locale)} prefetch={false} aria-current={active ? 'page' : undefined}>{item.label}</Link>;
    })}</div>
  </nav>;
}
