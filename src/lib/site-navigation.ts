import { canonicalPath, type Locale } from '../i18n/config';

export type NavigationGroup = 'intro' | 'use-cases' | 'models' | 'docs' | 'news';

export function navigationGroup(pathname: string): NavigationGroup | null {
  const path = canonicalPath(pathname).split(/[?#]/u)[0].replace(/\/$/u, '') || '/';
  if (path === '/') return 'intro';
  if (/^\/use-cases(?:\/|$)/u.test(path)) return 'use-cases';
  if (/^\/(?:models|arena|leaderboard)(?:\/|$)/u.test(path)) return 'models';
  if (/^\/(?:docs|install|commands|assistant)(?:\/|$)/u.test(path)) return 'docs';
  if (/^\/news(?:\/|$)/u.test(path)) return 'news';
  return null;
}

export function primaryNavigation(locale: Locale) {
  const labels = locale === 'ko'
    ? ['소개', '활용법', '모델', '문서', '소식']
    : ['Overview', 'Use cases', 'Models', 'Docs', 'News'];
  return (['intro', 'use-cases', 'models', 'docs', 'news'] as const).map((id, index) => ({
    id,
    href: ['/', '/use-cases', '/models', '/docs', '/news'][index],
    label: labels[index],
  }));
}
