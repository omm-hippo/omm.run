import Disclosure from "@/components/Disclosure";
import { getExperience } from "@/i18n/experience";
import InstallTabs from "@/components/InstallTabs";
import QuickStart from "@/components/install/QuickStart";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";

/** The install page leads with this: one command, then what to run next. */
export default function Install({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.install;

  return (
    <section id="install" className="pb-16">
      <div>
        <p className="text-label">{t.label}</p>
        <h1 className="text-h2 mt-4">{t.heading}</h1>
        <p className="text-lede mt-6 max-w-[640px]">{t.lede}</p>
      </div>

      <div className="mt-10">
        <InstallTabs t={t.tabs} ui={dictionary.ui} />
      </div>

      <QuickStart locale={locale} />

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
    </section>
  );
}
