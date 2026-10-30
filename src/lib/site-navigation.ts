import { canonicalPath, type Locale } from '../i18n/config';

export type NavigationGroup = 'intro' | 'use-cases' | 'commands' | 'docs' | 'models' | 'news';

/** Sections whose pages share the sidebar shell (`SectionLayout`). A sidebar
 *  only lists links of its own section; anything else is linked from the body. */
export type ShellSection = Extract<NavigationGroup, 'use-cases' | 'commands' | 'docs'>;

export function navigationGroup(pathname: string): NavigationGroup | null {
  const path = canonicalPath(pathname).split(/[?#]/u)[0].replace(/\/$/u, '') || '/';
  if (path === '/') return 'intro';
  if (/^\/use-cases(?:\/|$)/u.test(path)) return 'use-cases';
  if (/^\/commands(?:\/|$)/u.test(path)) return 'commands';
  if (/^\/(?:models|arena|leaderboard)(?:\/|$)/u.test(path)) return 'models';
  if (/^\/(?:docs|install|assistant)(?:\/|$)/u.test(path)) return 'docs';
  if (/^\/news(?:\/|$)/u.test(path)) return 'news';
  return null;
}

export function primaryNavigation(locale: Locale) {
  const labels = locale === 'ko'
    ? ['소개', '활용법', '명령어', '문서', '모델', '소식']
    : ['Overview', 'Use cases', 'Commands', 'Docs', 'Models', 'News'];
  return (['intro', 'use-cases', 'commands', 'docs', 'models', 'news'] as const).map((id, index) => ({
    id,
    href: ['/', '/use-cases', '/commands', '/docs', '/models', '/news'][index],
    label: labels[index],
  }));
}
