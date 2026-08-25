"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { PICKER_PAUSE } from "@/i18n/commands/base";

/**
 * A real captured command and its real captured output (see
 * `src/i18n/commands/base.ts`), typed into view the way `Terminal.tsx` types
 * the homepage demo — except triggered once this block scrolls into view
 * (`Reveal.tsx`'s IntersectionObserver, not on-mount) and never replays once
 * played, since it sits mid-page rather than above the fold.
 *
 * Commands that stop at an interactive picker (omm setup's runner
 * checklist, omm recommend's model list) can embed `PICKER_PAUSE` in their
 * captured `output` string, right after the rendered picker screen. The
 * block reveals up to that marker, holds ~2s with the cursor blinking as if
 * a reader were still looking at the options, then reveals the rest. Every
 * other command's output has no marker and reveals in one step.
 */

const CHAR_MS = 22; // plus or minus 8ms jitter, matches Terminal.tsx / DIRECTION.md section 3
const JITTER_MS = 8;
const PAUSE_MS = 420;
const THRESHOLD = 0.35;

const PICKER_PAUSE_MS = 2000;

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

type Phase = "waiting" | "typing" | "picker-hold" | "output";

type Props = {
  readonly command: string;
  readonly output: string;
  readonly footnote: string;
  /** Screen-reader label for the whole block — the typed/output text itself
   *  is `aria-hidden`, same pattern as `Terminal.tsx`. */
  readonly label: string;
};

export default function CommandCapture({ command, output, footnote, label }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [tick, setTick] = useState(0);

  const started = useSyncExternalStore(subscribeNever, isClient, isServer);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReduced, isServer);

  const pauseIndex = output.indexOf(PICKER_PAUSE);
  const beforePause = pauseIndex === -1 ? output : output.slice(0, pauseIndex);
  const afterPause = pauseIndex === -1 ? "" : output.slice(pauseIndex + PICKER_PAUSE.length);

  // DIRECTION.md section 3: under prefers-reduced-motion, skip straight to
  // the final frame and never start an observer or a timer.
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
    if (phase === "typing") {
      if (tick < command.length) {
        const timer = window.setTimeout(
          () => setTick((t) => t + 1),
          CHAR_MS + (Math.random() * 2 - 1) * JITTER_MS,
        );
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(
        () => setPhase(pauseIndex === -1 ? "output" : "picker-hold"),
        PAUSE_MS,
      );
      return () => window.clearTimeout(timer);
    }
    if (phase === "picker-hold") {
      const timer = window.setTimeout(() => setPhase("output"), PICKER_PAUSE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [phase, tick, command.length, pauseIndex]);

  const done = reduced || phase === "output";
  const holding = !reduced && phase === "picker-hold";
  const typed = done || holding ? command : command.slice(0, tick);

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
            {started && !done && !holding ? <span className="omm-cursor" /> : null}
            {holding ? (
              <>
                {"\n\n"}
                {beforePause}
                {started ? <span className="omm-cursor" /> : null}
              </>
            ) : null}
            {done ? (
              <>
                {"\n\n"}
                {beforePause}
                {afterPause}
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
