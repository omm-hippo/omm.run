import Link from '@/components/PrefetchLink';
import { localeHref, type Locale } from '@/i18n/config';
import { getSiteCopy, getUseCases } from '@/i18n/site';

export default function UseCaseMenu({ locale, current }: { locale: Locale; current?: string }) {
  const t = getSiteCopy(locale);
  return <aside className="reading-sidebar"><nav aria-label={t.chooseUseCase}>
    <Link className="reading-sidebar-title" href={localeHref('/use-cases', locale)} aria-current={!current ? 'page' : undefined}>{t.chooseUseCase}</Link>
    {getUseCases(locale).map((guide) => <Link key={guide.slug} href={localeHref(`/use-cases/${guide.slug}`, locale)} aria-current={current === guide.slug ? 'page' : undefined}>{guide.title}</Link>)}
  </nav></aside>;
}
