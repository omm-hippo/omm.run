import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { isLocale } from '@/i18n/config';

export default async function UseCasesLayout({ children, params }: LayoutProps<'/[locale]/use-cases'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><Nav locale={locale} />{children}<Footer locale={locale} /></>;
}
