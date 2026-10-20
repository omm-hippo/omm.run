import Link from "next/link";

import CommandBlock from "@/components/install/CommandBlock";
import { localeHref, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const STEPS = [
  { command: "omm setup", href: "/commands/setup" },
  { command: "omm recommend", href: "/commands/recommend" },
  { command: "omm list", href: "/commands/list" },
  { command: "omm verify <name>", href: "/commands/verify" },
  { command: "omm run <name>", href: "/commands/run" },
] as const;

export default function QuickStart({ locale }: { locale: Locale }) {
  const { install, ui } = getDictionary(locale);
  const t = install.quickStart;

  return (
    <div className="mt-12 border-t border-line-0 pt-8">
      <h3 className="text-h3">{t.heading}</h3>
      <p className="text-small mt-4 max-w-[68ch]">{t.body}</p>
      <ol className="mt-6 border-t border-line-0">
        {STEPS.map((step, index) => (
          <li key={step.href} className="grid grid-cols-1 gap-2 border-b border-line-0 py-4 sm:grid-cols-[minmax(0,22ch)_minmax(0,1fr)] sm:gap-6">
            <Link href={localeHref(step.href, locale)} prefetch={false} className="font-mono text-ink-0 underline decoration-line-1 underline-offset-4 hover:decoration-accent">
              {step.command}
            </Link>
            <p className="text-small">{t.steps[index]}</p>
          </li>
        ))}
      </ol>
      <p className="text-small mt-8">{t.webBody}</p>
      <div className="mt-4">
        <CommandBlock prompt="$" command="omm web --open" label={t.webLabel} ui={ui} />
      </div>
      <Link href={localeHref("/commands/web", locale)} prefetch={false} className="text-small mt-4 inline-block border-b border-line-1 pb-0.5 text-ink-1 hover:border-accent">
        {t.webLink} →
      </Link>
      <p className="text-small mt-4">{t.trouble}</p>
    </div>
  );
}
