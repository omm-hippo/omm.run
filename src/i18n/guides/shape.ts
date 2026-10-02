/**
 * The translatable half of an install guide.
 *
 * Lists that merge onto `GUIDE_BASE` by index are typed as tuples derived from
 * the base, so dropping a troubleshooting entry — or adding one to Korean that
 * has no English counterpart — is a compile error rather than a page that
 * renders the wrong fix under the wrong message.
 */

import type { GuideBase, Slug } from "@/i18n/guides/base";

/** One text entry per element of the base tuple, same length. */
type Aligned<TBase, TText> = { readonly [K in keyof TBase]: TText };

export type TroubleText = {
  /**
   * Only for entries whose `see` describes an absence rather than quoting a
   * printed message ("Nothing at all…"). Everywhere else the verbatim English
   * string in the base is what the reader will actually see on their screen,
   * so it is never translated.
   */
  readonly see?: string;
  readonly why: string;
  readonly fix: string;
};

export type AltInstallText = {
  readonly heading: string;
  readonly body: string;
  /** One entry per command in the base; `null` where the block has no caption. */
  readonly captions: readonly (string | null)[];
  readonly notes: readonly string[];
};

export type AfterStepText = {
  readonly title: string;
  readonly body: string;
};

export type GuideText<S extends Slug> = {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heading: string;
  readonly lede: string;
  /** One-line summary used by the chooser page and the "Elsewhere" list. */
  readonly summary: string;

  readonly app: {
    readonly heading: string;
    readonly body: string;
    readonly open: readonly string[];
    readonly samplesIntro: string;
    /** What program each prompt sample belongs to. */
    readonly samples: Aligned<GuideBase[S]["app"]["samples"], string>;
    readonly notes: readonly string[];
  };

  readonly before: {
    readonly body: string;
    readonly requirements: Aligned<
      GuideBase[S]["before"]["requirements"],
      string
    >;
  };

  readonly install: {
    readonly body: string;
    readonly notes: readonly string[];
    readonly alts: Aligned<GuideBase[S]["install"]["alts"], AltInstallText>;
  };

  readonly after: {
    readonly body: string;
    readonly steps: Aligned<GuideBase[S]["after"]["steps"], AfterStepText>;
    /** `null` on the guides whose base carries no captured output. */
    readonly captureFootnote: string | null;
    /** The one `omm scan` row that is prose rather than a field name. */
    readonly scanRunnersRow: string | null;
  };

  readonly runners: {
    readonly body: string;
    /** How each runner is installed on this OS. */
    readonly rows: Aligned<GuideBase[S]["runners"]["rows"], string>;
    readonly notes: readonly string[];
    /** Only Windows explains the hard-link → symlink → copy fallback. */
    readonly linking: readonly string[] | null;
  };

  readonly keeping: {
    readonly storageBody: string;
    /** One caption per storage command; `null` where the block has none. */
    readonly storageCaptions: readonly (string | null)[];
    readonly storageNotes: readonly string[];
    readonly completionBody: string;
    readonly uninstallBody: string;
    readonly uninstallNotes: readonly string[];
  };

  readonly trouble: Aligned<GuideBase[S]["trouble"], TroubleText>;
};

export type GuideTextSet = { readonly [S in Slug]: GuideText<S> };
