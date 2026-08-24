import Link from "next/link";

import CommandBlock from "@/components/install/CommandBlock";
import {
  getGuideLinks,
  type Command,
  type Guide,
} from "@/components/install/guides";
import Reveal from "@/components/Reveal";
import { localeHref, type Locale } from "@/i18n/config";
import { fill, getDictionary, type Dictionary } from "@/i18n/dictionaries";

const REPO = "https://github.com/omm-hippo/omm";
const WIKI = `${REPO}/wiki`;

/** Anchor ids are part of the URL, so they stay English in every locale. */
const SECTION_IDS = [
  "which-app",
  "before",
  "install",
  "verification",
  "after",
  "runners",
  "keeping",
  "trouble",
] as const;

const SECTION_NUMBERS = ["01", "02", "03", "04", "05", "06", "07", "08"] as const;

function SectionHead({
  n,
  id,
  title,
  body,
  os,
}: {
  n: string;
  id: string;
  title: string;
  body?: string;
  os: string;
}) {
  return (
    <>
      <p className="text-label">
        <span className="text-ink-2">{n}</span>
        <span> / 08 · {os}</span>
      </p>
      <h2 id={`${id}-title`} className="text-h2 mt-3">
        {title}
      </h2>
      {body ? <p className="text-lede mt-4 max-w-[62ch]">{body}</p> : null}
    </>
  );
}

/** Hairline-separated rows. Used for requirements, notes and runner coverage —
 *  deliberately not a card grid (design/DIRECTION.md §5.7). */
function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="mt-6 flex flex-col border-t border-line-0">{children}</ul>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <li className="border-b border-line-0 py-4">{children}</li>;
}

function LinkRow({
  links,
}: {
  links: readonly { readonly label: string; readonly href: string }[];
}) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="text-table border-b border-line-1 pb-0.5 text-ink-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function NoteList({ notes }: { notes: readonly string[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {notes.map((note) => (
        <li key={note} className="text-small max-w-[68ch]">
          {note}
        </li>
      ))}
    </ul>
  );
}

function CommandGroup({
  items,
  label,
  tone,
  ui,
}: {
  items: readonly Command[];
  label: string;
  tone?: "primary" | "secondary";
  ui: Dictionary["ui"];
}) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.command}>
          {item.caption ? (
            <p className="text-small mb-2">{item.caption}</p>
          ) : null}
          <CommandBlock
            prompt={item.prompt}
            command={item.command}
            label={`${label} — ${item.command}`}
            tone={tone}
            ui={ui}
          />
        </div>
      ))}
    </div>
  );
}

export default function GuidePage({
  guide,
  locale,
}: {
  guide: Guide;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.guide;
  const ui = dictionary.ui;
  const others = getGuideLinks(locale).filter(
    (link) => link.slug !== guide.slug,
  );

  const sections = SECTION_IDS.map((id, index) => ({
    id,
    n: SECTION_NUMBERS[index],
    title: t.sections[index],
  }));

  return (
    <main>
      {/* Header. `.grid-bg` bookends the landing page's Install section, which
          this page is the long form of. */}
      <section className="relative border-b border-line-0 bg-bg-0 pt-24 pb-16">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-page px-5 md:px-8">
          <nav aria-label={t.breadcrumbAria} className="text-label">
            <Link href={localeHref("/", locale)} className="hover:text-ink-1" prefetch={false}>
              omm
            </Link>
            <span className="text-ink-3"> / </span>
            <Link
              href={localeHref("/install", locale)}
              className="hover:text-ink-1"
              prefetch={false}
            >
              install
            </Link>
            <span className="text-ink-3"> / </span>
            <span className="text-ink-1">{guide.slug}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 className="text-h2">{guide.heading}</h1>
              <p className="text-lede mt-5 max-w-[62ch]">{guide.lede}</p>
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
          {/* Left rail: an index that stays put while the reader scrolls. It is
              also what pushes the body copy off the container's midpoint. */}
          <nav
            aria-label={t.onThisPage}
            className="hidden lg:col-span-3 lg:block"
          >
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
            {/* 01 — which app to open */}
            <section
              id="which-app"
              aria-labelledby="which-app-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="01"
                  os={guide.os}
                  id="which-app"
                  title={guide.app.heading}
                  body={guide.app.body}
                />
                <Rows>
                  {guide.app.open.map((line) => (
                    <Row key={line}>
                      <p className="max-w-[68ch]">{line}</p>
                    </Row>
                  ))}
                </Rows>

                <p className="text-small mt-8">{guide.app.samplesIntro}</p>
                <ul className="mt-4 flex flex-col border-t border-line-0">
                  {guide.app.samples.map((sample) => (
                    <li
                      key={sample.sample}
                      className="grid grid-cols-1 gap-1 border-b border-line-0 py-3 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-4"
                    >
                      <code className="text-terminal text-ink-0">
                        {sample.sample}
                      </code>
                      <span
                        className={`text-small ${sample.ok ? "text-ink-1" : "text-ink-2"}`}
                      >
                        {sample.ok ? "" : t.notThisOne}
                        {sample.program}
                      </span>
                    </li>
                  ))}
                </ul>
                <NoteList notes={guide.app.notes} />
              </Reveal>
            </section>

            {/* 02 — before you start */}
            <section
              id="before"
              aria-labelledby="before-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="02"
                  os={guide.os}
                  id="before"
                  title={t.sections[1]}
                  body={guide.before.body}
                />
                <Rows>
                  {guide.before.requirements.map((requirement) => (
                    <Row key={requirement.label}>
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,24ch)_minmax(0,1fr)] sm:gap-6">
                        <span className="text-terminal text-ink-0">
                          {requirement.label}
                        </span>
                        <div className="max-w-[68ch]">
                          <span className="text-small">{requirement.body}</span>
                          {requirement.links ? (
                            <LinkRow links={requirement.links} />
                          ) : null}
                        </div>
                      </div>
                    </Row>
                  ))}
                </Rows>
              </Reveal>
            </section>

            {/* 03 — install */}
            <section
              id="install"
              aria-labelledby="install-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="03"
                  os={guide.os}
                  id="install"
                  title={t.sections[2]}
                  body={guide.install.body}
                />
                <div className="mt-6">
                  <CommandBlock
                    prompt={guide.install.command.prompt}
                    command={guide.install.command.command}
                    label={fill(t.installCommandAria, { os: guide.os })}
                    ui={ui}
                  />
                </div>
                <NoteList notes={guide.install.notes} />

                {guide.install.alts.map((alt) => (
                  <div key={alt.heading}>
                    <h3 className="text-h3 mt-12">{alt.heading}</h3>
                    <p className="text-small mt-3 max-w-[68ch]">{alt.body}</p>
                    <CommandGroup
                      items={alt.commands}
                      label={`${guide.os} — ${alt.heading}`}
                      tone="secondary"
                      ui={ui}
                    />
                    <NoteList notes={alt.notes} />
                  </div>
                ))}
              </Reveal>
            </section>

            {/* 04 — what the installer does */}
            <section
              id="verification"
              aria-labelledby="verification-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="04"
                  os={guide.os}
                  id="verification"
                  title={t.sections[3]}
                  body={t.verificationBody}
                />
                <ol className="mt-6 flex flex-col">
                  {dictionary.install.steps.map((item, index) => (
                    <li
                      key={item.title}
                      className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-line-0 py-4 first:border-t"
                    >
                      <span className="text-terminal text-ink-3" aria-hidden>
                        {SECTION_NUMBERS[index]}
                      </span>
                      <span className="text-terminal">
                        <span className="text-ink-0">{item.title}</span>
                        <span className="text-ink-2"> — {item.body}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="text-small mt-4 max-w-[68ch]">
                  {t.verificationNote}
                </p>
              </Reveal>
            </section>

            {/* 05 — after install */}
            <section
              id="after"
              aria-labelledby="after-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="05"
                  os={guide.os}
                  id="after"
                  title={t.sections[4]}
                  body={guide.after.body}
                />
                <ol className="mt-6 flex flex-col gap-8">
                  {guide.after.steps.map((step) => (
                    <li key={step.step}>
                      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                        <span className="text-terminal text-ink-3" aria-hidden>
                          {step.step}
                        </span>
                        <div>
                          <p className="text-terminal text-ink-0">{step.title}</p>
                          <p className="text-small mt-2 max-w-[68ch]">
                            {step.body}
                          </p>
                          {step.command ? (
                            <div className="mt-4">
                              <CommandBlock
                                prompt={step.command.prompt}
                                command={step.command.command}
                                label={step.command.command}
                                ui={ui}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                {guide.after.capture ? (
                  <figure className="mt-8">
                    <div className="overflow-hidden rounded-lg border border-line-1 bg-bg-1">
                      <div className="border-b border-line-0 bg-bg-2 px-4 py-2">
                        <span className="text-label">
                          {guide.after.capture.title}
                        </span>
                      </div>
                      <pre className="text-terminal overflow-x-auto p-5 text-ink-1">
                        <code>{guide.after.capture.text}</code>
                      </pre>
                    </div>
                    <figcaption className="text-small mt-3 max-w-[68ch] text-ink-3">
                      {guide.after.capture.footnote}
                    </figcaption>
                  </figure>
                ) : null}

                {guide.after.scanFields ? (
                  <div className="mt-8">
                    <p className="text-label">{t.scanReports}</p>
                    <ul className="mt-4 flex flex-col border-t border-line-0">
                      {guide.after.scanFields.map((field) => (
                        <li
                          key={field}
                          className="text-terminal border-b border-line-0 py-2 text-ink-1"
                        >
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Reveal>
            </section>

            {/* 06 — runners */}
            <section
              id="runners"
              aria-labelledby="runners-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="06"
                  os={guide.os}
                  id="runners"
                  title={fill(t.runnersHeading, { os: guide.os })}
                  body={guide.runners.body}
                />
                <ul className="mt-6 flex flex-col border-t border-line-0">
                  {guide.runners.rows.map((row) => (
                    <li
                      key={row.runner}
                      className="grid grid-cols-1 gap-1 border-b border-line-0 py-3 sm:grid-cols-[minmax(0,24ch)_minmax(0,1fr)] sm:gap-6"
                    >
                      <span className="font-medium text-ink-0">{row.runner}</span>
                      <span
                        className={`text-table ${row.automated ? "text-ink-1" : "text-ink-3"}`}
                      >
                        {row.how}
                      </span>
                    </li>
                  ))}
                </ul>
                <NoteList notes={guide.runners.notes} />

                {guide.runners.linking ? (
                  <div className="mt-10">
                    <h3 className="text-h3">{t.linkingHeading}</h3>
                    <Rows>
                      {guide.runners.linking.map((line) => (
                        <Row key={line}>
                          <p className="text-small max-w-[68ch]">{line}</p>
                        </Row>
                      ))}
                    </Rows>
                  </div>
                ) : null}
              </Reveal>
            </section>

            {/* 07 — storage, completion, uninstall */}
            <section
              id="keeping"
              aria-labelledby="keeping-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="07"
                  os={guide.os}
                  id="keeping"
                  title={t.sections[6]}
                />

                <h3 className="text-h3 mt-8">{t.storageHeading}</h3>
                <p className="text-small mt-3 max-w-[68ch]">
                  {guide.keeping.storageBody}
                </p>
                <CommandGroup
                  items={guide.keeping.storageCommands}
                  label={t.storageAria}
                  ui={ui}
                />
                <NoteList notes={guide.keeping.storageNotes} />

                <h3 className="text-h3 mt-12">{t.completionHeading}</h3>
                <p className="text-small mt-3 max-w-[68ch]">
                  {guide.keeping.completionBody}
                </p>
                <div className="mt-6">
                  <CommandBlock
                    prompt={guide.keeping.completionCommand.prompt}
                    command={guide.keeping.completionCommand.command}
                    label={t.completionAria}
                    ui={ui}
                  />
                </div>

                <h3 className="text-h3 mt-12">{t.uninstallHeading}</h3>
                <p className="text-small mt-3 max-w-[68ch]">
                  {guide.keeping.uninstallBody}
                </p>
                <div className="mt-6">
                  <CommandBlock
                    prompt={guide.keeping.uninstallCommand.prompt}
                    command={guide.keeping.uninstallCommand.command}
                    label={t.uninstallAria}
                    ui={ui}
                  />
                </div>
                <NoteList notes={guide.keeping.uninstallNotes} />
              </Reveal>
            </section>

            {/* 08 — troubleshooting */}
            <section
              id="trouble"
              aria-labelledby="trouble-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead
                  n="08"
                  os={guide.os}
                  id="trouble"
                  title={t.sections[7]}
                  body={t.troubleBody}
                />
                <ol className="mt-6 flex flex-col border-t border-line-0">
                  {guide.trouble.map((entry) => (
                    <li key={entry.see} className="border-b border-line-0 py-6">
                      <pre className="text-terminal overflow-x-auto text-ink-0">
                        <code>{entry.see}</code>
                      </pre>
                      <dl className="mt-4 flex flex-col gap-3">
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleWhy}</dt>
                          <dd className="text-small max-w-[68ch]">
                            {entry.why}
                          </dd>
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleFix}</dt>
                          <dd className="text-small max-w-[68ch] text-ink-1">
                            {entry.fix}
                          </dd>
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleSource}</dt>
                          <dd className="text-table text-ink-3">
                            {entry.source}
                          </dd>
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
                        <span className="text-ink-0">
                          {fill(t.installOn, { os: other.os })}
                        </span>
                        <span className="text-small">{other.summary}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="border-b border-line-0">
                    <a
                      href={REPO}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                    >
                      <span className="text-ink-0">{t.repo.title}</span>
                      <span className="text-small">{t.repo.body}</span>
                    </a>
                  </li>
                  <li className="border-b border-line-0">
                    <a
                      href={WIKI}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                    >
                      <span className="text-ink-0">{t.wiki.title}</span>
                      <span className="text-small">{t.wiki.body}</span>
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
