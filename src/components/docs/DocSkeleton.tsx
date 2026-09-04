const WIDTHS = ["92%", "84%", "88%", "62%", "80%", "74%", "90%", "58%"];

/** Suspense fallback while the README streams in at request time. */
export default function DocSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {WIDTHS.map((width, index) => (
        <div
          key={index}
          className="h-4 rounded bg-bg-2 motion-safe:animate-pulse"
          style={{ width }}
        />
      ))}
    </div>
  );
}
