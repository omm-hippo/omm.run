/** "On this page" — always the right-hand column of a `section-page`. */
export default function PageToc({ label, items }: {
  label: string;
  items: readonly { id: string; title: string; n?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <nav className="page-toc" aria-label={label}>
      <p>{label}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>
              {item.n ? <span className="font-mono text-ink-3">{item.n} </span> : null}
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
