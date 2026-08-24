import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { isLocale } from "@/i18n/config";

export default async function CommandsLayout({
  children,
  params,
}: LayoutProps<"/[locale]/commands">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <Nav locale={locale} />
      {children}
      <Footer locale={locale} />
    </>
  );
}
