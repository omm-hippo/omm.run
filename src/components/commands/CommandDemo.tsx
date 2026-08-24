import CommandCapture from "@/components/commands/CommandCapture";
import type { Slug } from "@/components/commands/commands";

type Props = {
  readonly slug: Slug;
  readonly recordedCommand: string;
  readonly recordedExitCode: number;
  readonly documentedCommand: string;
  readonly documentedOutput: string;
  readonly documentedFootnote: string;
  readonly label: string;
  readonly documentedLabel: string;
  readonly transcriptLabel: string;
  readonly recordedCommandLabel: string;
  readonly exitCodeLabel: string;
  readonly safeSuccessNote: string;
  readonly safeGuardNote: string;
  readonly documentedCaptureLabel: string;
};

/**
 * A self-hosted recording of the real CLI process plus its text transcript.
 *
 * The video deliberately does not autoplay: terminal output can move quickly,
 * and readers should choose when to start it. The exact real-process transcript
 * is linked beside the recording, while the longer documented capture remains
 * visible below it.
 */
export default function CommandDemo({
  slug,
  recordedCommand,
  recordedExitCode,
  documentedCommand,
  documentedOutput,
  documentedFootnote,
  label,
  documentedLabel,
  transcriptLabel,
  recordedCommandLabel,
  exitCodeLabel,
  safeSuccessNote,
  safeGuardNote,
  documentedCaptureLabel,
}: Props) {
  const base = `/demos/commands/${slug}`;

  return (
    <div className="flex flex-col gap-5">
      <video
        controls
        muted
        playsInline
        preload="metadata"
        poster={`${base}.png`}
        aria-label={label}
        className="aspect-video w-full rounded-lg border border-line-1 bg-bg-1 object-contain"
      >
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>

      <div className="border-l-2 border-accent pl-4">
        <p className="text-label">{recordedCommandLabel}</p>
        <code className="text-terminal mt-2 block overflow-x-auto text-ink-0">
          {recordedCommand}
        </code>
        <p className="text-small mt-3">
          {exitCodeLabel}: <code className="text-ink-1">{recordedExitCode}</code>
          {" · "}
          {recordedExitCode === 0 ? safeSuccessNote : safeGuardNote}
        </p>
        <p className="text-small mt-3">
          <a
            href={`${base}.txt`}
            target="_blank"
            rel="noreferrer"
            className="border-b border-line-1 text-ink-1 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
          >
            {transcriptLabel}
          </a>
        </p>
      </div>

      <p className="text-label mt-3">{documentedCaptureLabel}</p>
      <CommandCapture
        command={documentedCommand}
        output={documentedOutput}
        footnote={documentedFootnote}
        label={documentedLabel}
      />
    </div>
  );
}
