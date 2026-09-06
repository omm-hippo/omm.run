import { marked, type Tokens } from "marked";

import { OmmDocsSectionMissing } from "./errors";

/** Slice a heading and its descendants using the same parser as the renderer.
 * This keeps fenced/indented code and alternate heading syntax consistent. */
export function extractSection(markdown: string, heading: string): string {
  const target = heading.trim().toLowerCase();
  const tokens = marked.lexer(markdown);
  const start = tokens.findIndex(
    (token) => token.type === "heading" && token.text.trim().toLowerCase() === target,
  );
  if (start === -1) throw new OmmDocsSectionMissing(heading);

  const level = (tokens[start] as Tokens.Heading).depth;
  const next = tokens.findIndex(
    (token, index) => index > start && token.type === "heading" && token.depth <= level,
  );
  return tokens
    .slice(start, next === -1 ? undefined : next)
    .map((token) => token.raw)
    .join("")
    .trim();
}
