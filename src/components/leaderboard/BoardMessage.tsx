/** Unpublished / error states: a sentence and the omm arena call to action.
 *  Never a number - nothing here may look like data. */
export default function BoardMessage({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="mb-24 border-y border-line-1 py-12">
      <h2 className="text-[22px] font-medium text-ink-0">{title}</h2>
      <p className="mt-3 max-w-[65ch] text-ink-2">{body}</p>
      <code className="mt-6 block font-mono text-[14px] text-accent">omm arena</code>
    </div>
  );
}
