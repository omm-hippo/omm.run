/**
 * The command doc pages, assembled.
 *
 * Content lives in two halves so a command exists exactly once across both
 * languages: `src/i18n/commands/base.ts` holds everything identical in every
 * locale (options, example commands, captured output, verbatim errors and
 * their file:line), and `src/i18n/commands/{en,ko}.ts` hold the prose. This
 * module merges the two by index into the shape `CommandDocPage.tsx` renders.
 *
 * See design/FACTS.md, section "Command doc pages", for the product-repo
 * source behind every command, message and coverage claim.
 */

import type { Locale } from "@/i18n/config";
import {
  COMMAND_BASE,
  COMMAND_ORDER,
  COMMAND_RISK,
  type Example,
  type Option,
  type CommandRisk,
  type Slug,
} from "@/i18n/commands/base";
import { COMMANDS_EN } from "@/i18n/commands/en";
import { COMMANDS_KO } from "@/i18n/commands/ko";
import type { CommandTextSet } from "@/i18n/commands/shape";

export type { Slug };
export { COMMAND_ORDER };

const TEXT: Record<Locale, CommandTextSet> = { en: COMMANDS_EN, ko: COMMANDS_KO };

export type OptionRow = Option & { readonly description: string };
export type ExampleRow = Example & { readonly caption: string };
export type TroubleRow = {
  readonly see: string;
  readonly source: string;
  readonly why: string;
  readonly fix: string;
};
export type RelatedRow = {
  readonly label: string;
  readonly href: string;
  readonly internal: boolean;
  readonly blurb: string;
};

export type Command = {
  readonly slug: Slug;
  readonly name: string;
  readonly href: string;
  readonly risk: CommandRisk;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heading: string;
  readonly lede: string;
  readonly summary: string;
  readonly overviewBody: string;
  readonly options: readonly OptionRow[];
  readonly examples: readonly ExampleRow[];
  readonly capture: { readonly title: string; readonly text: string; readonly footnote: string };
  readonly trouble: readonly TroubleRow[];
  readonly related: readonly RelatedRow[];
};

export function getCommand(slug: Slug, locale: Locale): Command {
  const base = COMMAND_BASE[slug];
  const text = TEXT[locale][slug];

  return {
    slug: base.slug,
    name: base.name,
    href: base.href,
    risk: COMMAND_RISK[slug],
    metaTitle: text.metaTitle,
    metaDescription: text.metaDescription,
    heading: text.heading,
    lede: text.lede,
    summary: text.summary,
    overviewBody: text.overviewBody,

    options: base.options.map((option, index) => ({
      ...option,
      description: text.optionDescriptions[index],
    })),

    examples: base.examples.map((example, index) => ({
      ...example,
      caption: text.exampleCaptions[index],
    })),

    capture: { ...base.capture, footnote: text.captureFootnote },

    trouble: base.trouble.map((entry, index) => ({
      ...entry,
      why: text.trouble[index].why,
      fix: text.trouble[index].fix,
    })),

    related: base.related.map((entry, index) => ({
      ...entry,
      blurb: text.relatedBlurbs[index],
    })),
  };
}

export type CommandLink = {
  readonly slug: Slug;
  readonly name: string;
  readonly href: string;
  readonly summary: string;
};

/** Used by the `/commands` chooser page. */
export function getCommandLinks(locale: Locale): readonly CommandLink[] {
  return COMMAND_ORDER.map((slug) => ({
    slug,
    name: COMMAND_BASE[slug].name,
    href: COMMAND_BASE[slug].href,
    summary: TEXT[locale][slug].summary,
  }));
}
