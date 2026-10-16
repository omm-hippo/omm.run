"use client";

import { useState } from "react";

/** A command line with a copy button. The only client code on /leaderboard. */
export default function CopyCommand({
  command,
  copyLabel,
  copiedLabel,
  variant = "line",
}: {
  command: string;
  copyLabel: string;
  copiedLabel: string;
  variant?: "line" | "button";
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(command).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  };
  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={copy}
        className="mt-2 block w-full rounded-md bg-accent px-3 py-2 text-center text-[14px] font-semibold text-accent-ink hover:bg-accent-press"
      >
        {copied ? copiedLabel : command}
      </button>
    );
  }
  return (
    <div className="mt-4 flex items-center justify-between gap-2 rounded-md border border-line-1 bg-bg-0 p-2.5 font-mono text-[12px] text-ink-1">
      <code className="min-w-0 break-all">
        <span className="text-accent">$</span> {command}
      </code>
      <button type="button" onClick={copy} className="shrink-0 text-ink-2 hover:text-ink-0">
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
