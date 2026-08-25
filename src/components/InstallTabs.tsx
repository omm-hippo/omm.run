"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState, useSyncExternalStore } from "react";

import CommandBlock from "@/components/install/CommandBlock";
import type { Slug } from "@/components/install/guides";
import { fill, type Dictionary } from "@/i18n/dictionaries";

type Method = "curl" | "irm" | "brew" | "pipx";

const METHODS: readonly Method[] = ["curl", "irm", "brew", "pipx"];

/** Verbatim from the omm README install section. */
const COMMAND: Record<Method, { readonly prompt: string; readonly command: string }> = {
  curl: { prompt: "$", command: "curl -fsSL https://omm.run/install.sh | sh" },
  irm: {
    prompt: "PS >",
    command:
      "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://omm.run/install.ps1 | iex",
  },
  brew: { prompt: "$", command: "brew install omm-hippo/omm/omm" },
  pipx: { prompt: "$", command: "pipx install omm-model" },
};

/** README "Requirements": Python 3.10+ and git have to exist before any
 *  install route can do anything. */
const DEPENDENCIES = [
  { label: "python.org/downloads", href: "https://www.python.org/downloads/" },
  { label: "git-scm.com/downloads", href: "https://git-scm.com/downloads" },
] as const;

const subscribeNever = () => () => {};
const isWindowsClient = () => /Windows/i.test(navigator.userAgent);
const isWindowsServer = () => false;

type Props = {
  readonly t: Dictionary["install"]["tabs"];
  readonly ui: Dictionary["ui"];
  readonly guides: readonly {
    readonly slug: Slug;
    readonly href: string;
    readonly label: string;
  }[];
};

export default function InstallTabs({ t, ui, guides }: Props) {
  const baseId = useId();
  const [manualMethod, setManualMethod] = useState<Method | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /** Server has no OS to go on and always picks `curl`; once hydrated,
   *  `isWindows` reflects the real browser and the default flips to `irm` —
   *  unless the visitor already picked a tab themselves. */
  const isWindows = useSyncExternalStore(subscribeNever, isWindowsClient, isWindowsServer);
  const method = manualMethod ?? (isWindows ? "irm" : "curl");

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  const onTabListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (step === 0) return;
      event.preventDefault();
      const current = METHODS.indexOf(method);
      const next = METHODS[(current + step + METHODS.length) % METHODS.length];
      setManualMethod(next);
      tabRefs.current[next]?.focus();
    },
    [method],
  );

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label={t.aria}
          onKeyDown={onTabListKeyDown}
          className="inline-flex gap-1 rounded-md border border-line-1 bg-bg-0 p-1"
        >
          {METHODS.map((id) => {
            const active = id === method;
            return (
              <button
                key={id}
                ref={(node) => {
                  tabRefs.current[id] = node;
                }}
                type="button"
                role="tab"
                id={tabId(id)}
                aria-selected={active}
                aria-controls={panelId(id)}
                tabIndex={active ? 0 : -1}
                onClick={() => setManualMethod(id)}
                className={`text-small rounded-md border-b-2 px-4 py-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] ${
                  active
                    ? "border-accent bg-bg-2 text-ink-0"
                    : "border-transparent text-ink-2 hover:bg-bg-3 hover:text-ink-0"
                }`}
              >
                {t.methods[id]}
              </button>
            );
          })}
        </div>
      </div>

      {/* All panels occupy the same grid cell, so the block reserves the
          height of the tallest one and the crossfade never moves the layout. */}
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)]">
        {METHODS.map((id) => {
          const active = id === method;
          return (
            <div
              key={id}
              id={panelId(id)}
              role="tabpanel"
              aria-labelledby={tabId(id)}
              aria-hidden={!active}
              inert={!active}
              className={`col-start-1 row-start-1 transition-opacity duration-[180ms] ease-[var(--ease-micro)] ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <CommandBlock
                prompt={COMMAND[id].prompt}
                command={COMMAND[id].command}
                label={fill(t.copyAria, { what: t.methods[id] })}
                ui={ui}
              />

              <ul className="mt-4 flex flex-col gap-2 text-left">
                {t[id].notes.map((note) => (
                  <li key={note} className="text-small text-ink-2">
                    {note}
                  </li>
                ))}
              </ul>

              <p className="text-small mt-2 text-left text-ink-2">
                {t.needThemFirst}{" "}
                {DEPENDENCIES.map((dependency, index) => (
                  <span key={dependency.href}>
                    {index > 0 ? " · " : ""}
                    <a
                      href={dependency.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono border-b border-line-1 pb-0.5 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
                    >
                      {dependency.label}
                    </a>
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-left">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="text-small border-b border-line-1 pb-0.5 text-ink-1 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
            prefetch={false}
          >
            {guide.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
