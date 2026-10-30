import { notFound } from "next/navigation";

import SectionLayout from "@/components/shell/SectionLayout";
import { isLocale } from "@/i18n/config";

export default async function UseCasesLayout({
  children,
  params,
}: LayoutProps<"/[locale]/use-cases">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SectionLayout section="use-cases" locale={locale}>{children}</SectionLayout>;
}
