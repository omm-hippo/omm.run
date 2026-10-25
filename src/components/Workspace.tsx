import Link from "next/link";
import Disclosure from "@/components/Disclosure";
import DocumentText from "@/components/DocumentText";

import { localeHref, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const DESTINATIONS = [
  { id: "web", command: "omm web --open", href: "/commands/web" },
  { id: "rag", command: "omm rag", href: "/commands/rag" },
  { id: "agent", command: "omm setting agent", href: "/commands/setting#agent" },
  { id: "cluster", command: "omm cluster", href: "/commands/cluster" },
] as const;

export default function Workspace({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).workspace;

  return (
    <section id="workspace" aria-labelledby="workspace-title" className="explanatory-section border-t border-line-0">
      <div className="mx-auto w-full max-w-page px-5 py-24 md:px-8">
        <p className="text-label">{t.label}</p>
        <h2 id="workspace-title" className="text-h2 mt-4 max-w-[26ch]">{t.heading}</h2>
        <p className="text-small mt-6 max-w-[68ch]">{t.body}</p>
        <ol className="mt-8">
          {DESTINATIONS.map(({ id, command, href }, index) => (
            <li key={id}>
              <Disclosure id={`workspace-${id}`} title={`${String(index + 1).padStart(2, "0")} · ${t[id].title}`}>
                <code className="text-terminal text-ink-2">{command}</code>
                <DocumentText text={t[id].body} locale={locale} className="mt-4" />
                <DocumentText text={t[id].requirement} locale={locale} className="document-caption mt-3" />
                <Link href={localeHref(href, locale)} prefetch={false} className="home-inline-link">{t[id].link} →</Link>
              </Disclosure>
            </li>
          ))}
        </ol>
        <p className="text-small mt-8 max-w-[68ch]">
          {t.versionNote}{" "}
          <a href="https://github.com/omm-hippo/omm/releases" className="text-ink-1 underline decoration-line-1 underline-offset-4 hover:decoration-accent">{t.releases}</a>
        </p>
      </div>
    </section>
  );
}
