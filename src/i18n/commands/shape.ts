/**
 * The translatable half of a command doc page. Lists that merge onto
 * `COMMAND_BASE` by index are typed as tuples derived from the base, so
 * dropping a troubleshooting entry — or adding one to Korean that has no
 * English counterpart — is a compile error rather than a page that renders
 * the wrong fix under the wrong message.
 */

import type { CommandBase, Slug } from "@/i18n/commands/base";

/** One text entry per element of the base tuple, same length. */
type Aligned<TBase, TText> = { readonly [K in keyof TBase]: TText };

export type TroubleText = {
  readonly why: string;
  readonly fix: string;
};

export type CommandText<S extends Slug> = {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heading: string;
  readonly lede: string;
  /** One-line summary used by the `/commands` chooser page. */
  readonly summary: string;

  readonly overviewBody: string;

  /** One description per element of `COMMAND_BASE[S].options`. */
  readonly optionDescriptions: Aligned<CommandBase[S]["options"], string>;

  /** One caption per element of `COMMAND_BASE[S].examples`. */
  readonly exampleCaptions: Aligned<CommandBase[S]["examples"], string>;

  readonly captureFootnote: string;

  /** One why/fix pair per element of `COMMAND_BASE[S].trouble`. */
  readonly trouble: Aligned<CommandBase[S]["trouble"], TroubleText>;

  /** One blurb per element of `COMMAND_BASE[S].related`. */
  readonly relatedBlurbs: Aligned<CommandBase[S]["related"], string>;
};

export type CommandTextSet = { readonly [S in Slug]: CommandText<S> };
