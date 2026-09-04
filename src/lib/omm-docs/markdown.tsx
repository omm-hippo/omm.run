import { Fragment, type CSSProperties, type ReactNode } from "react";
import { marked, type Token, type Tokens } from "marked";

/**
 * Renders README markdown as React elements styled with the site's design
 * tokens. It walks `marked`'s token tree rather than emitting an HTML string,
 * so there is no `dangerouslySetInnerHTML` and every element is ours.
 *
 * Unhandled tokens fall back to their raw text — an unexpected construct
 * upstream degrades to plain text, it never throws.
 */

const REPO_ROOT = "https://github.com/omm-hippo/omm";
const REPO_BLOB = `${REPO_ROOT}/blob/main/`;
const SITE_HOSTS = new Set(["omm.run", "www.omm.run"]);

const LINK_CLASS =
  "border-b border-line-1 text-ink-1 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-0";
const BLOCK = "mt-5 first:mt-0";
const ADMONITION = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;
const BADGE_HREF = /img\.shields\.io|badge\.svg|\/badge(?:$|[/?#])/i;
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  "#x27": "'",
};

function decode(text: string): string {
  return text.replace(
    /&(amp|lt|gt|quot|#39|#x27);/g,
    (whole, name: string) => ENTITIES[name] ?? whole,
  );
}

type RenderOptions = {
  /** Drop a leading heading — the page chrome already shows the title. */
  skipLeadingHeading?: boolean;
};

export function renderMarkdown(
  markdown: string,
  options: RenderOptions = {},
): ReactNode {
  let tokens = marked.lexer(markdown);
  if (options.skipLeadingHeading) {
    const first = tokens.findIndex((token) => token.type !== "space");
    if (first !== -1 && tokens[first].type === "heading") {
      tokens = tokens.slice(first + 1) as typeof tokens;
    }
  }
  return <div className="text-[15px] leading-[1.72] text-ink-1">{renderBlocks(tokens)}</div>;
}

function renderBlocks(tokens: Token[]): ReactNode {
  return tokens.map((token, index) => (
    <Fragment key={index}>{renderBlock(token)}</Fragment>
  ));
}

function renderBlock(token: Token): ReactNode {
  switch (token.type) {
    case "space":
    case "def":
      return null;

    case "heading": {
      const heading = token as Tokens.Heading;
      const inner = renderInline(heading.tokens);
      if (heading.depth <= 2) {
        return <h2 className="text-h2 mt-12 first:mt-0">{inner}</h2>;
      }
      if (heading.depth === 3) {
        return <h3 className="text-h3 mt-10 first:mt-0">{inner}</h3>;
      }
      return (
        <p className="mt-8 font-semibold text-ink-0 first:mt-0">{inner}</p>
      );
    }

    case "paragraph": {
      const paragraph = token as Tokens.Paragraph;
      if (isBadgeParagraph(paragraph)) return null;
      return <p className={BLOCK}>{renderInline(paragraph.tokens)}</p>;
    }

    case "text": {
      const text = token as Tokens.Text;
      return (
        <p className={BLOCK}>
          {text.tokens ? renderInline(text.tokens) : decode(text.text)}
        </p>
      );
    }

    case "code": {
      const code = token as Tokens.Code;
      const lang = code.lang?.trim().split(/\s+/)[0];
      return (
        <div
          className={`${BLOCK} overflow-hidden rounded-lg border border-line-0 bg-bg-1`}
        >
          {lang ? (
            <div className="border-b border-line-0 bg-bg-2 px-4 py-1.5">
              <span className="text-label">{lang}</span>
            </div>
          ) : null}
          <pre className="text-terminal overflow-x-auto p-4 text-ink-1">
            <code>{code.text}</code>
          </pre>
        </div>
      );
    }

    case "blockquote":
      return <Blockquote token={token as Tokens.Blockquote} />;

    case "list":
      return <MarkedList token={token as Tokens.List} />;

    case "table":
      return <MarkedTable token={token as Tokens.Table} />;

    case "hr":
      return <hr className="mt-8 border-line-0" />;

    case "html":
      return null;

    default:
      return "text" in token && typeof token.text === "string" ? (
        <p className={BLOCK}>{decode(token.text)}</p>
      ) : null;
  }
}

function renderInline(tokens: Token[] | undefined): ReactNode {
  if (!tokens) return null;
  return tokens.map((token, index) => (
    <Fragment key={index}>{renderInlineToken(token)}</Fragment>
  ));
}

function renderInlineToken(token: Token): ReactNode {
  switch (token.type) {
    case "text": {
      const text = token as Tokens.Text;
      return text.tokens ? renderInline(text.tokens) : decode(text.text);
    }
    case "escape":
      return (token as Tokens.Escape).text;
    case "strong":
      return (
        <strong className="font-semibold text-ink-0">
          {renderInline((token as Tokens.Strong).tokens)}
        </strong>
      );
    case "em":
      return <em>{renderInline((token as Tokens.Em).tokens)}</em>;
    case "del":
      return <del>{renderInline((token as Tokens.Del).tokens)}</del>;
    case "codespan":
      return (
        <code className="rounded-sm bg-bg-1 px-1 font-mono text-[0.9em] text-ink-0">
          {decode((token as Tokens.Codespan).text)}
        </code>
      );
    case "br":
      return <br />;
    case "link":
      return <MarkedLink token={token as Tokens.Link} />;
    case "image":
      return renderImage(token as Tokens.Image);
    case "html":
      return null;
    default:
      return "text" in token && typeof token.text === "string"
        ? decode(token.text)
        : null;
  }
}

function resolveHref(href: string): { href: string; external: boolean } {
  if (/^(https?:)?\/\//i.test(href)) {
    try {
      const url = new URL(href, "https://placeholder.invalid");
      if (SITE_HOSTS.has(url.hostname)) {
        return { href: url.pathname + url.search + url.hash, external: false };
      }
    } catch {
      // fall through
    }
    return { href, external: true };
  }
  if (href.startsWith("#")) {
    return { href: `${REPO_ROOT}#${href.slice(1)}`, external: true };
  }
  if (href.startsWith("mailto:")) return { href, external: true };
  return { href: REPO_BLOB + href.replace(/^\.\//, ""), external: true };
}

function MarkedLink({ token }: { token: Tokens.Link }) {
  const { href, external } = resolveHref(token.href);
  const children = renderInline(token.tokens) ?? decode(token.text);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={LINK_CLASS}
        title={token.title ?? undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <a href={href} className={LINK_CLASS} title={token.title ?? undefined}>
      {children}
    </a>
  );
}

function renderImage(token: Tokens.Image): ReactNode {
  if (BADGE_HREF.test(token.href)) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- upstream README image, host + dimensions unknown
    <img
      src={token.href}
      alt={token.text}
      title={token.title ?? undefined}
      loading="lazy"
      className="inline-block max-w-full align-middle"
    />
  );
}

function isBadgeParagraph(paragraph: Tokens.Paragraph): boolean {
  return paragraph.tokens.every((token) => {
    if (token.type === "image") return true;
    if (token.type === "space" || token.type === "br") return true;
    if (token.type === "text") return token.raw.trim() === "";
    if (token.type === "link") {
      return (token as Tokens.Link).tokens.every(
        (child) =>
          child.type === "image" ||
          (child.type === "text" && child.raw.trim() === ""),
      );
    }
    return false;
  });
}

function Blockquote({ token }: { token: Tokens.Blockquote }) {
  let body = token.tokens;
  let kind: string | null = null;

  const [first, ...rest] = token.tokens;
  if (first?.type === "paragraph") {
    const match = ADMONITION.exec((first as Tokens.Paragraph).text);
    if (match) {
      kind = match[1].toUpperCase();
      const stripped = (first as Tokens.Paragraph).text
        .replace(ADMONITION, "")
        .trim();
      body = stripped ? [...marked.lexer(stripped), ...rest] : rest;
    }
  }

  return (
    <blockquote className={`${BLOCK} border-l-2 border-line-2 pl-4 text-ink-2`}>
      {kind ? <p className="text-label mb-2 text-accent">{kind}</p> : null}
      {renderBlocks(body)}
    </blockquote>
  );
}

function MarkedList({
  token,
  nested = false,
}: {
  token: Tokens.List;
  nested?: boolean;
}) {
  const Tag = token.ordered ? "ol" : "ul";
  const start =
    token.ordered && typeof token.start === "number" && token.start !== 1
      ? token.start
      : undefined;
  return (
    <Tag
      start={start}
      className={`${nested ? "mt-1.5" : BLOCK} flex flex-col gap-1.5 ${
        token.ordered ? "list-decimal" : "list-disc"
      } pl-5 marker:text-ink-3`}
    >
      {token.items.map((item, index) => (
        <li key={index} className="pl-1">
          {renderListItem(item)}
        </li>
      ))}
    </Tag>
  );
}

function renderListItem(item: Tokens.ListItem): ReactNode {
  return item.tokens.map((token, index) => {
    if (token.type === "list") {
      return (
        <MarkedList key={index} token={token as Tokens.List} nested />
      );
    }
    if (token.type === "text") {
      const text = token as Tokens.Text;
      return (
        <Fragment key={index}>
          {text.tokens ? renderInline(text.tokens) : decode(text.text)}
        </Fragment>
      );
    }
    if (token.type === "paragraph") {
      return (
        <Fragment key={index}>
          {renderInline((token as Tokens.Paragraph).tokens)}
        </Fragment>
      );
    }
    return <Fragment key={index}>{renderBlock(token)}</Fragment>;
  });
}

function alignStyle(
  align: "center" | "left" | "right" | null,
): CSSProperties | undefined {
  return align ? { textAlign: align } : undefined;
}

function MarkedTable({ token }: { token: Tokens.Table }) {
  return (
    <div className={`${BLOCK} overflow-x-auto`}>
      <table className="w-full border-collapse text-left text-small">
        <thead>
          <tr className="border-b border-line-1">
            {token.header.map((cell, index) => (
              <th
                key={index}
                className="text-label px-3 py-2 align-bottom"
                style={alignStyle(cell.align)}
              >
                {renderInline(cell.tokens)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {token.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line-0 align-top">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-3 py-2"
                  style={alignStyle(cell.align)}
                >
                  {renderInline(cell.tokens)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
