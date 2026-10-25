import SectionNav from "@/components/SectionNav";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { isLocale } from "@/i18n/config";

export default async function LeaderboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <Nav locale={locale} /><SectionNav locale={locale} group="models" />
      {children}
      <Footer locale={locale} />
    </>
  );
}
