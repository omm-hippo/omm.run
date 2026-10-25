import Disclosure from "@/components/Disclosure";
import { getExperience } from "@/i18n/experience";
import InstallTabs from "@/components/InstallTabs";
import Reveal from "@/components/Reveal";
import QuickStart from "@/components/install/QuickStart";
import { getGuideLinks } from "@/components/install/guides";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { localeHref, type Locale } from "@/i18n/config";

export default function Install({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.install;
  const guides = getGuideLinks(locale).map((link) => ({
    href: localeHref(link.href, locale),
    label: fill(t.tabs.guideLink, { os: link.os }),
    slug: link.slug,
  }));

  return (
    <section
      id="install"
      className="relative border-t border-line-0 bg-bg-0 py-32"
    >
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto w-full max-w-page px-5 md:px-8">
        <div className="mx-auto max-w-[880px]">
          <Reveal className="text-center">
            <p className="text-label">{t.label}</p>
            <h2 className="text-h2 mt-4">{t.heading}</h2>
            <p className="text-lede mx-auto mt-6 max-w-[640px]">{t.lede}</p>
          </Reveal>

          <div className="mt-12">
            <InstallTabs t={t.tabs} ui={dictionary.ui} guides={guides} />
          </div>

          <Disclosure id="installer-details" title={getExperience(locale).technical} className="mt-10">
            <ol className="mt-6 flex flex-col">
              {t.steps.map((item, index) => (
                <li
                  key={item.title}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-line-0 py-4 first:border-t"
                >
                  <span className="text-terminal text-ink-3" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-terminal text-left">
                    <span className="text-ink-0">{item.title}</span>
                    <span className="text-ink-2"> — {item.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Disclosure>
          <Disclosure title={t.quickStart.heading}><QuickStart locale={locale} /></Disclosure>
        </div>
      </div>
    </section>
  );
}
