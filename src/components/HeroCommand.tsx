"use client";

import { useEffect, useRef, useState } from "react";

/** Verbatim from design/FACTS.md (README install line, macOS/Linux). */
const COMMAND =
  "curl -fsSL https://omm.run/install.sh | sh";

export default function HeroCommand({
  copy: copyLabel,
  copied: copiedLabel,
}: {
  readonly copy: string;
  readonly copied: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(COMMAND);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-line-0 bg-bg-2 px-3 py-2">
      <code className="min-w-0 flex-1 break-all font-mono text-[12.5px] leading-relaxed text-ink-1">
        <span className="text-accent">$ </span>
        {COMMAND}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-sm border border-line-1 px-2 py-1 font-mono text-[11px] text-ink-2 transition-colors duration-[120ms] ease-micro hover:bg-bg-3 hover:text-ink-0"
      >
        <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}
