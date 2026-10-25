import Link from "next/link";

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
    <section id="workspace" aria-labelledby="workspace-title" className="border-t border-line-0">
      <div className="mx-auto w-full max-w-page px-5 py-24 md:px-8">
        <p className="text-label">{t.label}</p>
        <h2 id="workspace-title" className="text-h2 mt-4 max-w-[26ch]">{t.heading}</h2>
        <p className="text-small mt-6 max-w-[68ch]">{t.body}</p>
        <ol className="mt-12 border-t border-line-0">
          {DESTINATIONS.map(({ id, command, href }, index) => (
            <li key={id} className="grid grid-cols-1 gap-4 border-b border-line-0 py-8 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-5">
                <p className="text-label text-accent" aria-hidden>{String(index + 1).padStart(2, "0")}</p>
                <h3 className="text-h3 mt-3">{t[id].title}</h3>
                <code className="text-terminal mt-4 block break-words text-ink-2">{command}</code>
              </div>
              <div className="md:col-span-7">
                <p className="max-w-[62ch]">{t[id].body}</p>
                <p className="text-small mt-3 max-w-[68ch]">{t[id].requirement}</p>
                <Link href={localeHref(href, locale)} prefetch={false} className="focus-ring-neutral text-small mt-5 inline-block border-b border-line-1 pb-0.5 text-ink-0 hover:border-accent">
                  {t[id].link} <span aria-hidden>→</span>
                </Link>
              </div>
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
