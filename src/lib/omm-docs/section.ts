import { OmmDocsSectionMissing } from "./errors";

const HEADING = /^(#{1,6})\s+(.+?)\s*$/;
const FENCE = /^\s*(```|~~~)/;

/**
 * Slice one section out of a markdown document: from the first heading whose
 * text matches `heading` (trimmed, case-insensitive) down to the next heading
 * of the same or a higher level, or the end of the document.
 *
 * Fenced code blocks are skipped so a `# comment` line inside a shell snippet
 * is never mistaken for a heading.
 */
export function extractSection(markdown: string, heading: string): string {
  const target = heading.trim().toLowerCase();
  const lines = markdown.split("\n");

  let start = -1;
  let level = 0;
  let inFence = false;

  for (let i = 0; i < lines.length; i += 1) {
    if (FENCE.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = HEADING.exec(lines[i]);
    if (match && match[2].trim().toLowerCase() === target) {
      start = i;
      level = match[1].length;
      break;
    }
  }

  if (start === -1) throw new OmmDocsSectionMissing(heading);

  let end = lines.length;
  inFence = false;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (FENCE.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = HEADING.exec(lines[i]);
    if (match && match[1].length <= level) {
      end = i;
      break;
    }
  }

  return lines.slice(start, end).join("\n").trim();
}
