import Link from "next/link";

import { fill, getDictionary } from "@/i18n/dictionaries";
import { localeHref, type Locale } from "@/i18n/config";

const REPO = "https://github.com/omm-hippo/omm";

/** Every href points at a file, section, or tab that exists in the omm repo.
 *  Labels live in the dictionary, in this order. */
const DOCS_HREFS = [
  { href: "/install/windows", internal: true },
  { href: "/install/macos", internal: true },
  { href: "/install/linux", internal: true },
  { href: "/docs/readme", internal: true },
  { href: "/docs/supported-platforms", internal: true },
  { href: "/docs/storage-location", internal: true },
  { href: "/docs/scripting", internal: true },
  { href: "/docs/local-ai-runners", internal: true },
] as const;

/** Command names are the product's own vocabulary — never translated.
 *  All entries now have a live `/commands/<slug>` doc page. */
const COMMANDS = [
  { label: "omm search", href: "/commands/search", internal: true },
  { label: "omm scan", href: "/commands/scan", internal: true },
  { label: "omm install", href: "/commands/install", internal: true },
  { label: "omm list", href: "/commands/list", internal: true },
  { label: "omm benchmark", href: "/commands/benchmark", internal: true },
  { label: "omm setting", href: "/commands/setting", internal: true },
] as const;

const PROJECT_HREFS = [
  `${REPO}/blob/main/CONTRIBUTING.md`,
  `${REPO}/blob/main/CODE_OF_CONDUCT.md`,
  `${REPO}/blob/main/SECURITY.md`,
  `${REPO}/blob/main/THIRD_PARTY_NOTICES.md`,
  `${REPO}/blob/main/LICENSE`,
] as const;

const SOURCE_HREFS = [
  REPO,
  `${REPO}/issues`,
  `${REPO}/releases`,
  `${REPO}/wiki`,
] as const;

const LINK_CLASS =
  "text-small text-ink-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:text-ink-0";

function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-label">{title}</h3>
      <ul className="mt-4 flex flex-col gap-2">{children}</ul>
    </div>
  );
}

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;

  // next.config resolves the Cloudflare/CI/local commit while building.
  const sha = process.env.OMM_BUILD_SHA?.slice(0, 7);

  return (
    <footer className="border-t border-line-0 bg-bg-0 py-16">
      <div className="mx-auto w-full max-w-page px-5 md:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="shrink-0 lg:w-64">
            <p className="font-mono font-medium lowercase text-ink-0">omm</p>
            <p className="text-small mt-2">{t.tagline}</p>
          </div>

          <nav
            aria-label={t.aria}
            className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4"
          >
            <Column title={t.docs.title}>
              {DOCS_HREFS.map((entry, index) => (
                <li key={entry.href}>
                  {entry.internal ? (
                    <Link
                      href={localeHref(entry.href, locale)}
                      className={LINK_CLASS}
                      prefetch={false}
                    >
                      {t.docs.links[index]}
                    </Link>
                  ) : (
                    <a href={entry.href} className={LINK_CLASS}>
                      {t.docs.links[index]}
                    </a>
                  )}
                </li>
              ))}
            </Column>

            <Column title={t.commands.title}>
              {COMMANDS.map((command) => (
                <li key={command.label}>
                  {command.internal ? (
                    <Link
                      href={localeHref(command.href, locale)}
                      className={`${LINK_CLASS} font-mono`}
                      prefetch={false}
                    >
                      {command.label}
                    </Link>
                  ) : (
                    <a href={command.href} className={`${LINK_CLASS} font-mono`}>
                      {command.label}
                    </a>
                  )}
                </li>
              ))}
            </Column>

            <Column title={t.project.title}>
              {PROJECT_HREFS.map((href, index) => (
                <li key={href}>
                  <a href={href} className={LINK_CLASS}>
                    {t.project.links[index]}
                  </a>
                </li>
              ))}
            </Column>

            <Column title={t.source.title}>
              {SOURCE_HREFS.map((href, index) => (
                <li key={href}>
                  <a href={href} className={LINK_CLASS}>
                    {t.source.links[index]}
                  </a>
                </li>
              ))}
            </Column>
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-line-0 pt-6">
          <span className="text-label">github.com/omm-hippo/omm</span>
          <span className="text-label">{t.license}</span>
          {sha ? (
            <span className="text-label">{fill(t.build, { sha })}</span>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
