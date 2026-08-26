import Link from "next/link";

import CommandBlock from "@/components/install/CommandBlock";
import CommandCapture from "@/components/commands/CommandCapture";
import { getCommandLinks, type Command } from "@/components/commands/commands";
import Reveal from "@/components/Reveal";
import { localeHref, type Locale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";

const REPO = "https://github.com/omm-hippo/omm";

const SECTION_IDS = [
  "overview",
  "options",
  "examples",
  "capture",
  "related",
  "trouble",
] as const;

const SECTION_NUMBERS = ["01", "02", "03", "04", "05", "06"] as const;

function SectionHead({
  n,
  id,
  title,
  body,
}: {
  n: string;
  id: string;
  title: string;
  body?: string;
}) {
  return (
    <>
      <p className="text-label">
        <span className="text-ink-2">{n}</span>
        <span> / 06</span>
      </p>
      <h2 id={`${id}-title`} className="text-h2 mt-3">
        {title}
      </h2>
      {body ? <p className="text-lede mt-4 max-w-[62ch]">{body}</p> : null}
    </>
  );
}

function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="mt-6 flex flex-col border-t border-line-0">{children}</ul>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <li className="border-b border-line-0 py-4">{children}</li>;
}

export default function CommandDocPage({
  command,
  locale,
}: {
  command: Command;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.commands;
  const ui = dictionary.ui;
  const others = getCommandLinks(locale).filter((link) => link.slug !== command.slug);

  const sections = SECTION_IDS.map((id, index) => ({
    id,
    n: SECTION_NUMBERS[index],
    title: t.sections[index],
  }));

  return (
    <main>
      <section className="relative border-b border-line-0 bg-bg-0 pt-24 pb-16">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-page px-5 md:px-8">
          <nav aria-label={t.breadcrumbAria} className="text-label">
            <Link href={localeHref("/", locale)} className="hover:text-ink-1" prefetch={false}>
              omm
            </Link>
            <span className="text-ink-3"> / </span>
            <Link href={localeHref("/commands", locale)} className="hover:text-ink-1" prefetch={false}>
              commands
            </Link>
            <span className="text-ink-3"> / </span>
            <span className="text-ink-1">{command.slug}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 className="text-h2 font-mono">{command.heading}</h1>
              <p className="text-lede mt-5 max-w-[62ch]">{command.lede}</p>
            </div>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-label border-b border-transparent pb-0.5 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-1"
                >
                  {section.n} {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto w-full max-w-page px-5 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <nav aria-label={t.onThisPage} className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-14 py-12">
              <p className="text-label">{t.onThisPage}</p>
              <ul className="mt-4 flex flex-col">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-small block border-b border-line-0 py-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:text-ink-0"
                    >
                      <span className="font-mono text-ink-3">{section.n} </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="lg:col-span-8 lg:col-start-5">
            {/* 01 — overview */}
            <section
              id="overview"
              aria-labelledby="overview-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="01" id="overview" title={t.sections[0]} body={command.overviewBody} />
              </Reveal>
            </section>

            {/* 02 — options */}
            <section
              id="options"
              aria-labelledby="options-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="02" id="options" title={t.sections[1]} body={t.optionsIntro} />
                <Rows>
                  {command.options.map((option) => (
                    <Row key={option.name}>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,22ch)_minmax(0,14ch)_minmax(0,1fr)] sm:gap-6">
                        <code className="text-terminal text-ink-0">{option.name}</code>
                        <span className="text-table text-ink-3">
                          {option.argument ?? "—"}
                          <span className="block text-ink-2">
                            {t.optionsColumns.default}: {option.default}
                          </span>
                        </span>
                        <p className="text-small max-w-[62ch]">{option.description}</p>
                      </div>
                    </Row>
                  ))}
                </Rows>
              </Reveal>
            </section>

            {/* 03 — examples */}
            <section
              id="examples"
              aria-labelledby="examples-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="03" id="examples" title={t.sections[2]} body={t.examplesIntro} />
                <div className="mt-6 flex flex-col gap-6">
                  {command.examples.map((example) => (
                    <div key={example.command}>
                      <p className="text-small mb-2">{example.caption}</p>
                      <CommandBlock
                        prompt={example.prompt}
                        command={example.command}
                        label={example.command}
                        ui={ui}
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>

            {/* 04 — real captured run */}
            <section
              id="capture"
              aria-labelledby="capture-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="04" id="capture" title={t.sections[3]} />
                <div className="mt-8">
                  <CommandCapture
                    command={command.capture.title}
                    output={command.capture.text}
                    footnote={command.capture.footnote}
                    label={fill(t.captureAria, { command: command.capture.title })}
                  />
                </div>
              </Reveal>
            </section>

            {/* 05 — related commands */}
            <section
              id="related"
              aria-labelledby="related-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="05" id="related" title={t.sections[4]} />
                <ul className="mt-6 flex flex-col border-t border-line-0">
                  {command.related.map((entry) => (
                    <li key={entry.label} className="border-b border-line-0">
                      <a
                        href={entry.internal ? localeHref(entry.href, locale) : entry.href}
                        target={entry.internal ? undefined : "_blank"}
                        rel={entry.internal ? undefined : "noreferrer"}
                        className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                      >
                        <span className="text-terminal text-ink-0">{entry.label}</span>
                        <span className="text-small">{entry.blurb}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </section>

            {/* 06 — troubleshooting */}
            <section
              id="trouble"
              aria-labelledby="trouble-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="06" id="trouble" title={t.sections[5]} body={t.troubleBody} />
                <ol className="mt-6 flex flex-col border-t border-line-0">
                  {command.trouble.map((entry) => (
                    <li key={entry.see} className="border-b border-line-0 py-6">
                      <pre className="text-terminal overflow-x-auto text-ink-0">
                        <code>{entry.see}</code>
                      </pre>
                      <dl className="mt-4 flex flex-col gap-3">
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleWhy}</dt>
                          <dd className="text-small max-w-[68ch]">{entry.why}</dd>
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleFix}</dt>
                          <dd className="text-small max-w-[68ch] text-ink-1">{entry.fix}</dd>
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleSource}</dt>
                          <dd className="text-table text-ink-3">{entry.source}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ol>
                <p className="text-small mt-6 max-w-[68ch]">{t.stillStuck}</p>
              </Reveal>
            </section>

            {/* Where to go next */}
            <section aria-labelledby="elsewhere-title" className="py-8">
              <Reveal>
                <h2 id="elsewhere-title" className="text-label">
                  {t.elsewhere}
                </h2>
                <ul className="mt-6 flex flex-col border-t border-line-0">
                  {others.map((other) => (
                    <li key={other.slug} className="border-b border-line-0">
                      <Link
                        href={localeHref(other.href, locale)}
                        className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                        prefetch={false}
                      >
                        <span className="text-ink-0">{other.name}</span>
                        <span className="text-small">{other.summary}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="border-b border-line-0">
                    <a
                      href={`${REPO}#usage`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                    >
                      <span className="text-ink-0">README — Usage</span>
                      <span className="text-small">Every omm command, one line each.</span>
                    </a>
                  </li>
                </ul>
              </Reveal>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
