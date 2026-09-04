const REPO = "https://github.com/omm-hippo/omm#readme";

/**
 * Shown when the README can't be fetched or the target section is gone. The
 * page keeps its chrome; only the body is replaced.
 */
export default function DocFallback({
  text,
}: {
  text: { readonly title: string; readonly body: string };
}) {
  return (
    <div className="rounded-lg border border-line-0 bg-bg-1 p-6">
      <p className="text-label text-term-warn">{text.title}</p>
      <p className="text-small mt-3 max-w-[60ch]">{text.body}</p>
      <a
        href={REPO}
        target="_blank"
        rel="noreferrer"
        className="text-small mt-4 inline-block border-b border-line-1 text-ink-1 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0"
      >
        github.com/omm-hippo/omm
      </a>
    </div>
  );
}
