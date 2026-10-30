import { notFound } from "next/navigation";

import SectionLayout from "@/components/shell/SectionLayout";
import { isLocale } from "@/i18n/config";

export default async function InstallLayout({
  children,
  params,
}: LayoutProps<"/[locale]/install">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SectionLayout section="docs" locale={locale}>{children}</SectionLayout>;
}
