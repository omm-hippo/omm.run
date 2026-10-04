import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function ArenaLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><Nav locale={locale} />{children}<Footer locale={locale} /></>;
}
