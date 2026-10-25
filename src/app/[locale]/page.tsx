import { notFound } from "next/navigation";

import Nav from "@/components/Nav";
import HomeExperience from "@/components/HomeExperience";
import Footer from "@/components/Footer";
import { isLocale } from "@/i18n/config";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <Nav locale={locale} />
      <HomeExperience locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
