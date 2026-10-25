import Link from 'next/link';
import { localeHref, type Locale } from '@/i18n/config';
import { getSiteCopy, getUseCases } from '@/i18n/site';

export default function UseCaseMenu({ locale, current }: { locale: Locale; current?: string }) {
  const t = getSiteCopy(locale);
  return <aside className="reading-sidebar"><nav aria-label={t.chooseUseCase}>
    <Link className="reading-sidebar-title" href={localeHref('/use-cases', locale)} prefetch={false} aria-current={!current ? 'page' : undefined}>{t.chooseUseCase}</Link>
    {getUseCases(locale).map((guide) => <Link key={guide.slug} href={localeHref(`/use-cases/${guide.slug}`, locale)} prefetch={false} aria-current={current === guide.slug ? 'page' : undefined}>{guide.title}</Link>)}
  </nav></aside>;
}
