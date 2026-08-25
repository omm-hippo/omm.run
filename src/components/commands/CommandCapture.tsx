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
 * Two optional stages layer on top of the plain type-then-reveal flow, for
 * commands that stop at an interactive picker (omm setup's runner
 * checklist, omm recommend's model list):
 *
 * - A row block wrapped in `ROWS_START(targetIndex)` / `ROWS_END`, one row
 *   per line, animates a `❯ ` pointer walking from row 0 down to
 *   `targetIndex` — real arrow-key navigation, not just the final frame.
 * - `PICKER_PAUSE` anywhere in the output holds for ~2s with the cursor
 *   blinking once the pointer (or the plain typed command, if there's no
 *   row block) has settled, as if a reader were still looking at the
 *   screen, before revealing the rest.
 *
 * Neither marker appears in most commands' captures, which just reveal in
 * one step after typing.
 */

const CHAR_MS = 22; // plus or minus 8ms jitter, matches Terminal.tsx / DIRECTION.md section 3
const JITTER_MS = 8;
const PAUSE_MS = 420;
const THRESHOLD = 0.35;
const PICKER_PAUSE_MS = 2000;
const CURSOR_STEP_MS = 180;

const ROWS_BLOCK = /ROWS_START\((\d+)\)\n([\s\S]*?)\nROWS_END/;
const POINTER = "❯ "; // "❯ "
const NO_POINTER = "  ";

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

type Phase = "waiting" | "typing" | "cursor-walk" | "picker-hold" | "output";

type Props = {
  readonly command: string;
  readonly output: string;
  readonly footnote: string;
  /** Screen-reader label for the whole block — the typed/output text itself
   *  is `aria-hidden`, same pattern as `Terminal.tsx`. */
  readonly label: string;
};

/** Renders a `ROWS_START`/`ROWS_END` block with the pointer on `current`. */
function renderRows(rows: readonly string[], current: number): string {
  return rows.map((row, i) => `${i === current ? POINTER : NO_POINTER}${row}`).join("\n");
}

export default function CommandCapture({ command, output, footnote, label }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [tick, setTick] = useState(0);
  const [cursorRow, setCursorRow] = useState(0);

  const started = useSyncExternalStore(subscribeNever, isClient, isServer);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReduced, isServer);

  const rowsMatch = output.match(ROWS_BLOCK);
  const targetIndex = rowsMatch ? Number(rowsMatch[1]) : 0;
  const rows = rowsMatch ? rowsMatch[2].split("\n") : null;

  const pauseIndex = output.indexOf(PICKER_PAUSE);
  const beforePause = pauseIndex === -1 ? output : output.slice(0, pauseIndex);
  const afterPause = pauseIndex === -1 ? "" : output.slice(pauseIndex + PICKER_PAUSE.length);

  const settled = rows ? beforePause.replace(ROWS_BLOCK, renderRows(rows, targetIndex)) : beforePause;
  const walking = rows
    ? beforePause.replace(ROWS_BLOCK, renderRows(rows, Math.min(cursorRow, targetIndex)))
    : beforePause;

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
      const timer = window.setTimeout(() => {
        setPhase(rows && targetIndex > 0 ? "cursor-walk" : pauseIndex === -1 ? "output" : "picker-hold");
      }, PAUSE_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "cursor-walk") {
      if (cursorRow < targetIndex) {
        const timer = window.setTimeout(() => setCursorRow((r) => r + 1), CURSOR_STEP_MS);
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
  }, [phase, tick, command.length, cursorRow, targetIndex, rows, pauseIndex]);

  const done = reduced || phase === "output";
  const holding = !reduced && (phase === "picker-hold" || phase === "cursor-walk");
  const typed = done || holding ? command : command.slice(0, tick);
  const rowsFrame = phase === "cursor-walk" && !reduced ? walking : settled;

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
                {rowsFrame}
                {started ? <span className="omm-cursor" /> : null}
              </>
            ) : null}
            {done ? (
              <>
                {"\n\n"}
                {settled}
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
