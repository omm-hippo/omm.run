"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import CommandBlock from "@/components/install/CommandBlock";
import type { Slug } from "@/components/install/guides";
import { fill, type Dictionary } from "@/i18n/dictionaries";

type Platform = {
  readonly id: "unix" | "windows";
  /** OS names, not prose — the same on every locale. */
  readonly label: string;
  /** Shell prompt glyph shown before the command; not part of what is copied. */
  readonly prompt: string;
  /** Verbatim from the omm README install section. */
  readonly command: string;
  /** Other install routes the README documents for this platform, in the same
   *  order as the captions in the dictionary. */
  readonly alternatives: readonly string[];
  /** Which per-OS guides this tab links to. */
  readonly guides: readonly Slug[];
};

/** README "Requirements" on both OS paths: Python 3.10+ and git have to exist
 *  before the one-liner can do anything. */
const DEPENDENCIES = [
  { label: "python.org/downloads", href: "https://www.python.org/downloads/" },
  { label: "git-scm.com/downloads", href: "https://git-scm.com/downloads" },
] as const;

const PLATFORMS: readonly Platform[] = [
  {
    id: "unix",
    label: "macOS / Linux",
    prompt: "$",
    command:
      "curl -fsSL https://omm.run/install.sh | sh",
    alternatives: [
      "brew install omm-hippo/omm/omm",
      "pipx install omm-model",
    ],
    guides: ["macos", "linux"],
  },
  {
    id: "windows",
    label: "Windows",
    prompt: "PS >",
    command:
      "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://omm.run/install.ps1 | iex",
    alternatives: ["pipx install omm-model"],
    guides: ["windows"],
  },
];

const COPIED_MS = 1200;

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
  const [activeId, setActiveId] = useState<string>(PLATFORMS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(
    () => () => {
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
    },
    [],
  );

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  const copy = useCallback(async (platform: Platform) => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(platform.command);
    } catch {
      return;
    }
    if (copyTimer.current !== null) clearTimeout(copyTimer.current);
    setCopiedId(platform.id);
    copyTimer.current = setTimeout(() => setCopiedId(null), COPIED_MS);
  }, []);

  const onTabListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (step === 0) return;
      event.preventDefault();
      const current = PLATFORMS.findIndex((p) => p.id === activeId);
      const next =
        PLATFORMS[(current + step + PLATFORMS.length) % PLATFORMS.length];
      setActiveId(next.id);
      tabRefs.current[next.id]?.focus();
    },
    [activeId],
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
          {PLATFORMS.map((platform) => {
            const active = platform.id === activeId;
            return (
              <button
                key={platform.id}
                ref={(node) => {
                  tabRefs.current[platform.id] = node;
                }}
                type="button"
                role="tab"
                id={tabId(platform.id)}
                aria-selected={active}
                aria-controls={panelId(platform.id)}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveId(platform.id)}
                className={`text-small rounded-md border-b-2 px-4 py-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] ${
                  active
                    ? "border-accent bg-bg-2 text-ink-0"
                    : "border-transparent text-ink-2 hover:bg-bg-3 hover:text-ink-0"
                }`}
              >
                {platform.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Both panels occupy the same grid cell, so the block reserves the height
          of the taller one and the 180ms crossfade never moves the layout. */}
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)]">
        {PLATFORMS.map((platform) => {
          const active = platform.id === activeId;
          const copied = copiedId === platform.id;
          const copy_ = t[platform.id];
          const platformGuides = guides.filter((guide) =>
            platform.guides.includes(guide.slug),
          );
          return (
            <div
              key={platform.id}
              id={panelId(platform.id)}
              role="tabpanel"
              aria-labelledby={tabId(platform.id)}
              aria-hidden={!active}
              inert={!active}
              className={`col-start-1 row-start-1 transition-opacity duration-[180ms] ease-[var(--ease-micro)] ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="flex items-start gap-4 rounded-lg border border-line-0 bg-bg-1 p-4">
                <pre className="text-terminal min-w-0 flex-1 overflow-x-auto py-2 text-left">
                  <code>
                    <span className="text-accent select-none">
                      {platform.prompt}{" "}
                    </span>
                    <span className="text-ink-0">{platform.command}</span>
                  </code>
                </pre>
                <button
                  type="button"
                  onClick={() => void copy(platform)}
                  aria-label={fill(t.copyAria, { what: platform.label })}
                  className="text-label shrink-0 rounded-md border border-line-1 px-3 py-2 text-ink-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-3 hover:text-ink-0"
                >
                  <span aria-live="polite">{copied ? ui.copied : ui.copy}</span>
                </button>
              </div>

              <ul className="mt-4 flex flex-col gap-2 text-left">
                {copy_.notes.map((note) => (
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

              <div className="mt-8 border-t border-line-0 pt-6 text-left">
                <p className="text-label">{t.otherWays}</p>
                <div className="mt-4 flex flex-col gap-4">
                  {platform.alternatives.map((command, index) => (
                    <div key={command}>
                      <p className="text-small mb-2">
                        {copy_.alternatives[index]}
                      </p>
                      <CommandBlock
                        prompt={platform.prompt}
                        command={command}
                        label={command}
                        tone="secondary"
                        ui={ui}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-left">
                {platformGuides.map((guide) => (
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
        })}
      </div>
    </div>
  );
}
