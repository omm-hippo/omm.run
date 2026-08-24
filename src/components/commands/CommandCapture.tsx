"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * A documented terminal example (see `src/i18n/commands/base.ts`), typed into
 * view the way `Terminal.tsx` types the homepage demo. Some source entries are
 * literal captures and others are explicitly labeled format-accurate
 * reproductions in their footnote. The animation is triggered once this block scrolls into view
 * (`Reveal.tsx`'s IntersectionObserver, not on-mount) and never replays once
 * played, since it sits mid-page rather than above the fold.
 */

const CHAR_MS = 22; // ±8ms jitter, matches Terminal.tsx / DIRECTION.md §3
const JITTER_MS = 8;
const PAUSE_MS = 420;
const THRESHOLD = 0.35;

const CURSOR_CSS = `
@keyframes omm-cursor { 0% { opacity: 1 } 50% { opacity: 0 } }
.omm-cursor {
  display: inline-block;
  width: 1ch;
  height: 1.15em;
  vertical-align: text-bottom;
  background-color: var(--accent);
  animation: omm-cursor 600ms step-end infinite;
}
@media (prefers-reduced-motion: reduce) { .omm-cursor { animation: none } }
`;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const noop = () => {};
const isServer = () => false;
const isClient = () => true;
const subscribeNever = () => noop;
const prefersReduced = () => window.matchMedia(REDUCED_MOTION).matches;
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

type Phase = "waiting" | "typing" | "output";

type Props = {
  readonly command: string;
  readonly output: string;
  readonly footnote: string;
  /** Screen-reader label for the documented example — the typed/output text itself
   *  is `aria-hidden`, same pattern as `Terminal.tsx`. */
  readonly label: string;
};

export default function CommandCapture({ command, output, footnote, label }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [tick, setTick] = useState(0);

  const started = useSyncExternalStore(subscribeNever, isClient, isServer);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReduced, isServer);

  // DIRECTION.md §3: under prefers-reduced-motion, skip straight to the
  // final frame and never start an observer or a timer.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((candidate) => candidate.isIntersecting);
        if (!entry) return;
        observer.disconnect();
        setPhase("typing");
      },
      { threshold: THRESHOLD },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (phase !== "typing") return;
    if (tick < command.length) {
      const timer = window.setTimeout(
        () => setTick((t) => t + 1),
        CHAR_MS + (Math.random() * 2 - 1) * JITTER_MS,
      );
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setPhase("output"), PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, tick, command.length]);

  const done = reduced || phase === "output";
  const typed = done ? command : command.slice(0, tick);

  return (
    <div ref={rootRef}>
      <div
        role="img"
        aria-label={label}
        className="relative overflow-hidden rounded-lg border border-line-1 bg-bg-1"
      >
        <style href="omm-terminal-cursor" precedence="default">
          {CURSOR_CSS}
        </style>

        <div className="flex h-[34px] items-center gap-2 border-b border-line-0 bg-bg-2 px-4">
          <span className="h-2 w-2 rounded-full bg-ink-3" />
          <span className="h-2 w-2 rounded-full bg-line-1" />
          <span className="h-2 w-2 rounded-full bg-line-1" />
        </div>

        <pre aria-hidden="true" className="text-terminal overflow-x-auto p-5 text-ink-1">
          <code>
            <span className="text-accent">$ </span>
            <span className="text-ink-0">{typed}</span>
            {started && !done ? <span className="omm-cursor" /> : null}
            {done ? (
              <>
                {"\n\n"}
                {output}
                {"\n\n"}
                <span className="text-accent">$ </span>
                {started ? <span className="omm-cursor" /> : null}
              </>
            ) : null}
          </code>
        </pre>
      </div>

      <p className="text-small mt-3 max-w-[68ch] text-ink-3">{footnote}</p>
    </div>
  );
}
