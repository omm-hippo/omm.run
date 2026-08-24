import CommandCapture from "@/components/commands/CommandCapture";
import type { Slug } from "@/components/commands/commands";

type Props = {
  readonly slug: Slug;
  readonly command: string;
  readonly output: string;
  readonly footnote: string;
  readonly label: string;
  readonly transcriptLabel: string;
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
  command,
  output,
  footnote,
  label,
  transcriptLabel,
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

      <p className="text-small">
        <a
          href={`${base}.txt`}
          target="_blank"
          rel="noreferrer"
          className="border-b border-line-1 text-ink-1 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
        >
          {transcriptLabel}
        </a>
      </p>

      <CommandCapture
        command={command}
        output={output}
        footnote={footnote}
        label={label}
      />
    </div>
  );
}
