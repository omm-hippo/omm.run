import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  OmmDocsSectionMissing,
  OmmDocsUnavailable,
} from "@/lib/omm-docs/errors";
import { renderMarkdown } from "@/lib/omm-docs/markdown";
import { extractSection } from "@/lib/omm-docs/section";
import { fetchReadme, type DocSource } from "@/lib/omm-docs/source";

import DocFallback from "./DocFallback";

/**
 * Fetches the README at request time and renders it (or one section of it).
 * The caller wraps this in `<Suspense>`; the two doc errors are caught here
 * and shown as a fallback panel.
 */
export default async function DocBody({
  locale,
  section,
  source = "readme",
}: {
  locale: Locale;
  /** Heading text to slice out; omitted for the full README. */
  section?: string;
  source?: DocSource;
}) {
  const t = getDictionary(locale).docs;

  try {
    const readme = await fetchReadme(source);
    const markdown = section ? extractSection(readme, section) : readme;
    return renderMarkdown(markdown, { skipLeadingHeading: true, sourcePath: source === "install" ? "docs/install.md" : "README.md" });
  } catch (error) {
    if (
      error instanceof OmmDocsUnavailable ||
      error instanceof OmmDocsSectionMissing
    ) {
      return <DocFallback text={t.unavailable} />;
    }
    throw error;
  }
}
