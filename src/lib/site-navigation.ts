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

export function sectionNavigation(group: 'docs' | 'models', locale: Locale) {
  const ko = locale === 'ko';
  return group === 'docs' ? [
    { href: '/docs', label: ko ? '문서 첫 화면' : 'Documentation' },
    { href: '/install', label: ko ? '설치' : 'Installation' },
    { href: '/commands', label: ko ? '명령어' : 'Commands' },
    { href: '/docs/troubleshooting', label: ko ? '문제 해결' : 'Troubleshooting' },
    { href: '/docs/faq', label: ko ? '자주 묻는 질문' : 'FAQ' },
    { href: '/assistant', label: ko ? '명령어 찾기' : 'Find a command' },
  ] : [
    { href: '/models', label: ko ? '모델 위키' : 'Model wiki' },
    { href: '/arena', label: ko ? '공개 리더보드' : 'Public leaderboard' },
    { href: '/leaderboard', label: ko ? '성능 분석' : 'Performance analysis' },
  ];
}
