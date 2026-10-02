/**
 * The install guides, assembled.
 *
 * Content lives in two halves so a command exists exactly once across both
 * languages: `src/i18n/guides/base.ts` holds everything that is identical in
 * every locale (commands, prompt samples, dependency links, captured output,
 * runner names, the verbatim messages the installer prints and the file:line
 * each traces to), and `src/i18n/guides/{en,ko}.ts` hold the prose. This module
 * merges the two by index into the shape `GuidePage.tsx` renders.
 *
 * See design/FACTS.md, section "Install guide pages", for the product-repo
 * source behind every command, message and coverage claim.
 */

import type { Locale } from "@/i18n/config";
import { GUIDE_BASE, GUIDE_ORDER, type Slug } from "@/i18n/guides/base";
import { GUIDES_EN } from "@/i18n/guides/en";
import { GUIDES_KO } from "@/i18n/guides/ko";
import type { GuideTextSet } from "@/i18n/guides/shape";

export type { Slug };
export { GUIDE_ORDER };

const TEXT: Record<Locale, GuideTextSet> = { en: GUIDES_EN, ko: GUIDES_KO };

export type Command = {
  /** Shell prompt glyph rendered before the command; not part of the copy. */
  readonly prompt: string;
  readonly command: string;
  /** Optional line above the block, e.g. what the command is for. */
  readonly caption?: string;
};

/** One row of the "am I in the right program?" table. */
export type PromptSample = {
  readonly sample: string;
  readonly program: string;
  readonly ok: boolean;
};

export type Requirement = {
  readonly label: string;
  readonly body: string;
  /** Where to get the thing, when it is something the reader has to install. */
  readonly links: readonly { readonly label: string; readonly href: string }[] | null;
};

/** An install route other than the one the page leads with. */
export type AltInstall = {
  readonly heading: string;
  readonly body: string;
  readonly commands: readonly Command[];
  readonly notes: readonly string[];
};

export type AfterStep = {
  readonly step: string;
  readonly title: string;
  readonly body: string;
  readonly command: Command | null;
};

export type RunnerRow = {
  readonly runner: string;
  readonly how: string;
  readonly automated: boolean;
};

export type Trouble = {
  /** Verbatim message. Rendered in mono. */
  readonly see: string;
  readonly why: string;
  readonly fix: string;
  /** Where the string comes from, shown to the reader. */
  readonly source: string;
};

export type Guide = {
  readonly slug: Slug;
  readonly os: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heading: string;
  readonly lede: string;

  readonly app: {
    readonly heading: string;
    readonly body: string;
    readonly open: readonly string[];
    readonly samplesIntro: string;
    readonly samples: readonly PromptSample[];
    readonly notes: readonly string[];
  };

  readonly before: {
    readonly body: string;
    readonly requirements: readonly Requirement[];
  };

  readonly install: {
    readonly body: string;
    readonly command: Command;
    readonly notes: readonly string[];
    readonly alts: readonly AltInstall[];
  };

  readonly after: {
    readonly body: string;
    readonly steps: readonly AfterStep[];
    /** Real captured output, or null when no capture exists for this OS. */
    readonly capture: {
      readonly title: string;
      readonly text: string;
      readonly footnote: string;
    } | null;
    readonly scanFields: readonly string[] | null;
  };

  readonly runners: {
    readonly body: string;
    readonly rows: readonly RunnerRow[];
    readonly notes: readonly string[];
    readonly linking: readonly string[] | null;
  };

  readonly keeping: {
    readonly storageBody: string;
    readonly storageCommands: readonly Command[];
    readonly storageNotes: readonly string[];
    readonly completionBody: string;
    readonly completionCommand: Command;
    readonly uninstallBody: string;
    readonly uninstallCommand: Command;
    readonly uninstallNotes: readonly string[];
  };

  readonly trouble: readonly Trouble[];
};

/** Attaches the locale's captions to a base command list, position by position. */
function withCaptions(
  commands: readonly { readonly prompt: string; readonly command: string }[],
  captions: readonly (string | null)[],
): readonly Command[] {
  return commands.map((command, index) => {
    const caption = captions[index];
    return caption ? { ...command, caption } : { ...command };
  });
}

export function getGuide(slug: Slug, locale: Locale): Guide {
  const base = GUIDE_BASE[slug];
  const text = TEXT[locale][slug];

  return {
    slug: base.slug,
    os: base.os,
    metaTitle: text.metaTitle,
    metaDescription: text.metaDescription,
    heading: text.heading,
    lede: text.lede,

    app: {
      heading: text.app.heading,
      body: text.app.body,
      open: text.app.open,
      samplesIntro: text.app.samplesIntro,
      samples: base.app.samples.map((sample, index) => ({
        sample: sample.sample,
        ok: sample.ok,
        program: text.app.samples[index],
      })),
      notes: text.app.notes,
    },

    before: {
      body: text.before.body,
      requirements: base.before.requirements.map((requirement, index) => ({
        label: requirement.label,
        links: requirement.links,
        body: text.before.requirements[index],
      })),
    },

    install: {
      body: text.install.body,
      command: base.install.command,
      notes: text.install.notes,
      alts: base.install.alts.map((alt, index) => {
        const altText = text.install.alts[index];
        return {
          heading: altText.heading,
          body: altText.body,
          notes: altText.notes,
          commands: withCaptions(alt.commands, altText.captions),
        };
      }),
    },

    after: {
      body: text.after.body,
      steps: base.after.steps.map((step, index) => ({
        step: step.step,
        command: step.command,
        title: text.after.steps[index].title,
        body: text.after.steps[index].body,
      })),
      capture:
        base.after.capture && text.after.captureFootnote
          ? { ...base.after.capture, footnote: text.after.captureFootnote }
          : null,
      /* The eight field names print in English whatever the locale, because
         that is what `omm scan` writes; only the runner row is prose. */
      scanFields: base.after.scanFields
        ? text.after.scanRunnersRow
          ? [...base.after.scanFields, text.after.scanRunnersRow]
          : [...base.after.scanFields]
        : null,
    },

    runners: {
      body: text.runners.body,
      rows: base.runners.rows.map((row, index) => ({
        runner: row.runner,
        automated: row.automated,
        how: text.runners.rows[index],
      })),
      notes: text.runners.notes,
      linking: text.runners.linking,
    },

    keeping: {
      storageBody: text.keeping.storageBody,
      storageCommands: withCaptions(
        base.keeping.storageCommands,
        text.keeping.storageCaptions,
      ),
      storageNotes: text.keeping.storageNotes,
      completionBody: text.keeping.completionBody,
      completionCommand: base.keeping.completionCommand,
      uninstallBody: text.keeping.uninstallBody,
      uninstallCommand: base.keeping.uninstallCommand,
      uninstallNotes: text.keeping.uninstallNotes,
    },

    trouble: base.trouble.map((entry, index) => {
      const entryText = text.trouble[index];
      return {
        see: entryText.see ?? entry.see,
        source: entry.source,
        why: entryText.why,
        fix: entryText.fix,
      };
    }),
  };
}

export type GuideLink = {
  readonly slug: Slug;
  readonly os: string;
  /** Canonical (unprefixed) path — pass through `localeHref` before rendering. */
  readonly href: string;
  readonly summary: string;
};

/** Used by the chooser page, the Install section tabs, the nav and the footer. */
export function getGuideLinks(locale: Locale): readonly GuideLink[] {
  return GUIDE_ORDER.map((slug) => ({
    slug,
    os: GUIDE_BASE[slug].os,
    href: GUIDE_BASE[slug].href,
    summary: TEXT[locale][slug].summary,
  }));
}
