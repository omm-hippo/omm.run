import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import type { Locale } from "@/i18n/config";
import { sectionMenu } from "@/lib/section-menus";
import type { ShellSection } from "@/lib/site-navigation";

import SectionSidebar from "./SectionSidebar";

/**
 * The one frame for use cases, commands and docs: section sidebar on the
 * left, the page on the right. Pages render `<main className="section-page">`
 * with an article and, optionally, a `PageToc` after it.
 */
export default function SectionLayout({ section, locale, children }: {
  section: ShellSection;
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav locale={locale} />
      <div className="section-shell">
        <SectionSidebar
          locale={locale}
          menu={sectionMenu(section, locale)}
          toggleLabels={locale === "ko" ? { open: "메뉴 열기", close: "메뉴 닫기" } : { open: "Open menu", close: "Close menu" }}
        />
        {children}
      </div>
      <Footer locale={locale} />
    </>
  );
}
