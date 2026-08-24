import { getCommand, getCommandLinks } from "@/components/commands/commands";
import type { CommandSearchIndexItem } from "@/components/commands/commandSearchLogic";
import type { Locale } from "@/i18n/config";

/**
 * Builds the locale-specific client index from the same structured content
 * rendered by every reference page. That keeps option and error searches in
 * sync with the docs without shipping both full translation files to the
 * browser.
 */
export function getCommandSearchIndex(
  locale: Locale,
): readonly CommandSearchIndexItem[] {
  return getCommandLinks(locale).map((link) => {
    const command = getCommand(link.slug, locale);

    return {
      slug: link.slug,
      name: link.name,
      href: link.href,
      summary: link.summary,
      fields: {
        name: [link.name, link.slug],
        summary: [link.summary],
        use: [
          command.lede,
          command.overviewBody,
          ...command.examples.flatMap((example) => [
            example.caption,
            example.command,
          ]),
          ...command.related.flatMap((related) => [
            related.label,
            related.blurb,
          ]),
        ],
        options: command.options.flatMap((option) => [
          option.name,
          option.argument ?? "",
          option.default,
          option.description,
        ]),
        errors: command.trouble.flatMap((entry) => [
          entry.see,
          entry.why,
          entry.fix,
        ]),
      },
    };
  });
}
