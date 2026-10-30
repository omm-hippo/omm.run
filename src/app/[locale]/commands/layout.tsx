import { notFound } from "next/navigation";

import SectionLayout from "@/components/shell/SectionLayout";
import { isLocale } from "@/i18n/config";

export default async function CommandsLayout({
  children,
  params,
}: LayoutProps<"/[locale]/commands">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SectionLayout section="commands" locale={locale}>{children}</SectionLayout>;
}
