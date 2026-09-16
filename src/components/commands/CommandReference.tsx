/**
 * The verbatim CLI reference for one command.
 *
 * Every string with technical weight here — usage line, argument names, flags,
 * defaults, help text — comes from `src/data/commands.json` and is rendered as
 * the CLI prints it. Only the labels around it come from the dictionary, so a
 * Korean reader sees Korean headings above English flags, which is what they
 * will actually type.
 */

import {
  flagLabel,
  ownOptions,
  sharedFlags,
  type ReferenceEntry,
} from "@/lib/commands/reference";
import { fill, type Dictionary } from "@/i18n/dictionaries";

const REPO = "https://github.com/omm-hippo/omm";

/** "1 sub-command" / "3 sub-commands" — English needs both, Korean does not. */
export function subcommandLabel(
  t: Dictionary["commandReference"],
  count: number,
): string {
  return count === 1
    ? t.subcommandCountOne
    : fill(t.subcommandCount, { count: String(count) });
}

function Usage({ usage }: { usage: string }) {
  return (
    <pre className="text-terminal mt-4 overflow-x-auto border border-line-0 bg-bg-1 px-4 py-3 text-ink-0">
      <code>{usage}</code>
    </pre>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-label mt-10">{children}</h3>;
}

function OptionRows({
  entry,
  t,
}: {
  entry: ReferenceEntry;
  t: Dictionary["commandReference"];
}) {
  const options = ownOptions(entry);

  if (options.length === 0) {
    return <p className="text-small mt-4 max-w-[62ch]">{t.noOptions}</p>;
  }

  return (
    <ul className="mt-4 flex flex-col border-t border-line-0">
      {options.map((option) => (
        <li key={option.flags.join(" ")} className="border-b border-line-0 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,24ch)_minmax(0,14ch)_minmax(0,1fr)] sm:gap-6">
            <code className="text-terminal text-ink-0">{flagLabel(option)}</code>
            <span className="text-table text-ink-3">
              {t.columns.default}: {option.default ?? t.empty}
            </span>
            <p className="text-small max-w-[62ch]">{option.help || t.empty}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function CommandReference({
  entry,
  subs,
  t,
  version,
  showReadmeLink = false,
}: {
  entry: ReferenceEntry;
  subs: readonly ReferenceEntry[];
  t: Dictionary["commandReference"];
  version: string;
  showReadmeLink?: boolean;
}) {
  const shared = sharedFlags();
  const name = entry.path[0];

  return (
    <div>
      <p className="text-small mt-4 max-w-[68ch]">
        {fill(t.intro, { command: name })}
      </p>

      <Heading>{t.usage}</Heading>
      <Usage usage={entry.usage} />

      {entry.aliases.length > 0 ? (
        <p className="text-small mt-3">
          {fill(t.aliases, { aliases: entry.aliases.join(", ") })}
        </p>
      ) : null}

      {entry.description ? (
        <p className="text-small mt-6 max-w-[68ch] whitespace-pre-line">
          {entry.description}
        </p>
      ) : null}

      {entry.arguments.length > 0 ? (
        <>
          <Heading>{t.arguments}</Heading>
          <ul className="mt-4 flex flex-col border-t border-line-0">
            {entry.arguments.map((argument) => (
              <li key={argument.name} className="border-b border-line-0 py-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,24ch)_minmax(0,14ch)_minmax(0,1fr)] sm:gap-6">
                  <code className="text-terminal text-ink-0">{argument.name}</code>
                  <span className="text-table text-ink-3">
                    {argument.required ? t.required : t.optional}
                  </span>
                  <p className="text-small max-w-[62ch]">
                    {argument.help || t.empty}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Heading>{t.options}</Heading>
      <OptionRows entry={entry} t={t} />

      {subs.length > 0 ? (
        <>
          <Heading>
            {t.subcommands}
            <span className="text-ink-3">
              {" · "}
              {subcommandLabel(t, subs.length)}
            </span>
          </Heading>
          <div className="mt-4 flex flex-col border-t border-line-0">
            {subs.map((sub) => (
              <section
                key={sub.path.join(" ")}
                id={sub.path[1]}
                className="scroll-mt-14 border-b border-line-0 py-6"
              >
                <h4 className="text-terminal text-ink-0">
                  {`omm ${sub.path.join(" ")}`}
                </h4>
                {sub.summary ? (
                  <p className="text-small mt-2 max-w-[68ch]">{sub.summary}</p>
                ) : null}
                <Usage usage={sub.usage} />
                {sub.description ? (
                  <p className="text-small mt-4 max-w-[68ch] whitespace-pre-line">
                    {sub.description}
                  </p>
                ) : null}
                <OptionRows entry={sub} t={t} />
              </section>
            ))}
          </div>
        </>
      ) : null}

      {shared.length > 0 ? (
        <>
          <Heading>{t.sharedFlags}</Heading>
          <p className="text-small mt-4 max-w-[68ch]">
            {fill(t.sharedFlagsBody, { flags: shared.join(", ") })}
          </p>
        </>
      ) : null}

      <p className="text-label mt-10">{fill(t.generated, { version })}</p>

      {showReadmeLink ? (
        <ul className="mt-6 flex flex-col border-t border-line-0">
          <li className="border-b border-line-0">
            <a
              href={`${REPO}#usage`}
              target="_blank"
              rel="noreferrer"
              className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
            >
              <span className="text-ink-0">{t.readmeTitle}</span>
              <span className="text-small">{t.readmeBlurb}</span>
            </a>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
