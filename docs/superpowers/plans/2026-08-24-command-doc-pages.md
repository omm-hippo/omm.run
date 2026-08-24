# Command doc pages (search slice) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/commands` (chooser) and `/commands/search` (full doc page) — the first command doc page from issue #6, template proven on one real command before repeating for the other five.

**Architecture:** Parallel content tree `src/i18n/commands/{base,shape,en,ko}.ts` + assembly module `src/components/commands/commands.ts`, mirroring the existing `src/i18n/guides/` + `src/components/install/guides.ts` pattern exactly. Rendering reuses `src/components/install/CommandBlock.tsx` verbatim and copies `GuidePage.tsx`'s section/typography conventions into a new `CommandDocPage.tsx` (different section set, same visual language). Routes under `src/app/[locale]/commands/...` mirror `src/app/[locale]/install/...`.

**Tech Stack:** Next.js App Router (typed routes), React Server Components, TypeScript, Tailwind utility classes against the site's design tokens (no test runner in this repo — verification is `tsc`/`next build` + manual browser check, same as every other page in this codebase).

**Spec:** `docs/superpowers/specs/2026-08-24-command-doc-pages-design.md`

## Global Constraints

- Content must trace to a real source: `~/Project/Localfit` (`src/omm/cli.py:6293-6467`, `README.md:331,354,401-403`) or a real capture taken on this dev machine 2026-08-24. No invented numbers, flags, or error text (`design/FACTS.md` house rule).
- Korean pages translate prose only — commands, flags, file paths, and verbatim printed messages stay in English on `/ko` too (`design/FACTS.md`, "Korean locale" section).
- Visual language: reuse existing tokens/classes only (`text-h2`, `text-lede`, `text-label`, `text-small`, `text-table`, `text-terminal`, `bg-bg-0/1/2/3`, `text-ink-0..3`, `border-line-0/1`, `--ease-micro` 120ms transitions, `rounded-lg`/`rounded-md`, no shadows except focus rings, `Reveal` for entrance motion). No new colors, no new radii, no cards-with-shadow.
- No test framework exists in this repo. "Verify" steps below mean `npx tsc --noEmit` (or `npm run build`) passing and, for the last task, a manual check in `npm run dev`.
- Every new/changed TypeScript file must satisfy the existing `Aligned<TBase, TText>` compile-time check pattern so a missing Korean or English string is a type error, not a silent gap.

---

### Task 1: Command content — language-independent facts and prose

**Files:**
- Create: `src/i18n/commands/base.ts`
- Create: `src/i18n/commands/shape.ts`
- Create: `src/i18n/commands/en.ts`
- Create: `src/i18n/commands/ko.ts`

**Interfaces:**
- Produces: `Slug` (`"search"`), `COMMAND_ORDER: readonly Slug[]`, `COMMAND_BASE: Record<Slug, ...>`, `CommandBase` type (`= typeof COMMAND_BASE`), `CommandText<S>` type, `CommandTextSet` type, `COMMANDS_EN: CommandTextSet`, `COMMANDS_KO: CommandTextSet`. Task 2 imports all of these.

- [ ] **Step 1: Write `src/i18n/commands/base.ts`**

```ts
/**
 * The command-doc-page facts that are identical in every locale: options,
 * example commands, the captured terminal output, and the verbatim errors
 * with their file:line source. Prose lives in `./en.ts` and `./ko.ts` and is
 * merged onto this by index in `src/components/commands/commands.ts`.
 *
 * See design/FACTS.md, section "Command doc pages", for the product-repo
 * source behind every option, message and captured line below.
 */

export type Slug = "search";

export const COMMAND_ORDER: readonly Slug[] = ["search"];

export type Option = {
  readonly name: string;
  readonly argument: string | null;
  readonly default: string;
};

export type Example = {
  readonly prompt: string;
  readonly command: string;
};

export type Trouble = {
  /** Verbatim message (or a real captured instance of one with a variable
   *  segment). Rendered in mono. */
  readonly see: string;
  /** Where the string comes from, shown to the reader. */
  readonly source: string;
};

export type Related = {
  readonly label: string;
  readonly href: string;
  readonly internal: boolean;
};

export const COMMAND_BASE = {
  search: {
    slug: "search",
    name: "omm search",
    href: "/commands/search",

    options: [
      { name: "<query>", argument: null, default: "required" },
      { name: "--skip-unfit", argument: null, default: "off" },
      { name: "--limit", argument: "N", default: "no limit" },
      {
        name: "--provider",
        argument: "curated | huggingface | modelscope",
        default: "all three",
      },
      { name: "--skip-ms", argument: null, default: "off" },
      { name: "--json", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm search qwen" },
      { prompt: "$", command: "omm search qwen --limit 3" },
      { prompt: "$", command: "omm search qwen --skip-unfit" },
      { prompt: "$", command: "omm search qwen --provider huggingface" },
      { prompt: "$", command: "omm search qwen --json | jq '.[0]'" },
    ],

    capture: {
      title: "omm search qwen --limit 5",
      text: `==> DeepSeek
  [1] ms:Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF  2,438 downloads on ModelScope

==> Other
  [2] unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF  (predicted not to run on this hardware)
  [3] JonathanColetti/Qwen3.8-27B-Uncensored-GGUF  (predicted not to run on this hardware)
  [4] MaziyarPanahi/Qwen3-4B-GGUF  346,358 downloads on HuggingFace
  [5] bartowski/Qwen2.5-7B-Instruct-GGUF  309,173 downloads on HuggingFace

Install with: omm install <number>  (e.g. omm install 1)`,
    },

    trouble: [
      {
        see: "--provider must be one of: curated, huggingface, modelscope (got 'bogus').",
        source: "src/omm/cli.py:6320-6323",
      },
      {
        see: "--skip-ms conflicts with --provider modelscope.",
        source: "src/omm/cli.py:6326",
      },
      {
        see: "No models found matching 'zzzznonexistentmodelxyz'.",
        source: "src/omm/cli.py:6362",
      },
    ],

    related: [
      {
        label: "omm install",
        href: "https://github.com/omm-hippo/omm#install--manage-models",
        internal: false,
      },
      {
        label: "omm recommend",
        href: "https://github.com/omm-hippo/omm#setup--discovery",
        internal: false,
      },
    ],
  },
} as const satisfies Record<
  Slug,
  {
    slug: Slug;
    name: string;
    href: string;
    options: readonly Option[];
    examples: readonly Example[];
    capture: { title: string; text: string };
    trouble: readonly Trouble[];
    related: readonly Related[];
  }
>;

export type CommandBase = typeof COMMAND_BASE;
```

- [ ] **Step 2: Write `src/i18n/commands/shape.ts`**

```ts
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
```

- [ ] **Step 3: Write `src/i18n/commands/en.ts`**

```ts
/**
 * English copy for the command doc pages. Commands, flags, file paths and
 * verbatim printed messages live in `./base.ts`, never here — see that
 * file's header.
 */

import type { CommandTextSet } from "@/i18n/commands/shape";

export const COMMANDS_EN: CommandTextSet = {
  search: {
    metaTitle: "omm search — find a model",
    metaDescription:
      "Full reference for omm search: every flag, five real examples from basic to scripted, a real captured run, and the three errors it actually prints.",
    heading: "omm search",
    lede: "Search omm's curated catalog, your cached candidates, and HuggingFace and ModelScope, all in one query.",
    summary: "Find a model across the curated catalog, HuggingFace and ModelScope.",

    overviewBody:
      "Reach for search before install: it is how you find the exact repo reference or numeric index that install accepts. Results are grouped by model family, numbered in the terminal, and models this hardware is predicted not to run print in red instead of being hidden — unless --skip-unfit says otherwise. The numbers search prints are only valid in the terminal that ran it: the next search or list run renumbers everything.",

    optionDescriptions: [
      "The text to search for. Matched against the curated/cached catalog first, then HuggingFace and ModelScope.",
      "If this hardware is predicted not to run a model, omit it from the results instead of listing it in red.",
      "Show at most this many results.",
      "Only show results from this source: curated (omm's built-in/cached catalog, not a real host), huggingface, or modelscope.",
      "Don't query ModelScope. Its results need one extra network request per candidate repo, which can noticeably slow down search.",
      "Print structured JSON to stdout instead of a formatted list — the only thing written to stdout, so it's safe to pipe.",
    ],

    exampleCaptions: [
      "Plain search — results grouped by family, numbered for the install command that follows.",
      "Cap the result count.",
      "Drop anything predicted not to run on this machine instead of showing it in red.",
      "Only HuggingFace results, skipping the curated catalog and ModelScope.",
      "JSON output piped to jq — safe because --json is the only thing search writes to stdout.",
    ],

    captureFootnote:
      "Real omm search qwen --limit 5 capture, 2026-08-24, this dev machine. HuggingFace and ModelScope rankings change constantly, so a fresh run will list different repos.",

    trouble: [
      {
        why: "--provider only accepts three values, and this run passed something else.",
        fix: "Use one of curated, huggingface, or modelscope.",
      },
      {
        why: "--skip-ms says don't query ModelScope; --provider modelscope says show only ModelScope results. Those cancel each other out.",
        fix: "Drop --skip-ms, or point --provider at curated or huggingface instead.",
      },
      {
        why: "None of the curated catalog, your cached candidates, HuggingFace, or ModelScope had anything matching this query.",
        fix: "Try a shorter or differently spelled query — search matches by name, not by exact repo ID.",
      },
    ],

    relatedBlurbs: [
      "Install by the number or repo reference search just printed.",
      "Don't know what to search for? recommend picks a model that fits this machine for you.",
    ],
  },
};
```

- [ ] **Step 4: Write `src/i18n/commands/ko.ts`**

```ts
/**
 * Korean copy for the command doc pages. Translation of the English page —
 * commands, flags, file paths and verbatim printed messages stay in English,
 * per design/FACTS.md's "Korean locale" section.
 */

import type { CommandTextSet } from "@/i18n/commands/shape";

export const COMMANDS_KO: CommandTextSet = {
  search: {
    metaTitle: "omm search — 모델 찾기",
    metaDescription:
      "omm search 전체 레퍼런스: 모든 옵션, 초급부터 스크립팅까지 실제 예제 5개, 실제 캡처한 실행 결과, 그리고 실제로 출력되는 에러 3가지.",
    heading: "omm search",
    lede: "omm의 큐레이션 카탈로그, 캐시된 후보, HuggingFace, ModelScope를 한 번의 검색으로 조회합니다.",
    summary: "큐레이션 카탈로그, HuggingFace, ModelScope에서 모델을 한 번에 찾습니다.",

    overviewBody:
      "install 전에 먼저 쓰는 명령입니다. install이 받는 정확한 저장소 참조나 번호를 여기서 찾습니다. 결과는 모델 계열별로 묶여 터미널에 번호가 매겨지고, 이 하드웨어에서 못 돌아갈 걸로 예측되는 모델은 감춰지는 대신 빨간색으로 표시됩니다 — --skip-unfit을 주면 그때는 아예 제외됩니다. search가 매긴 번호는 그 명령을 실행한 터미널 안에서만 유효합니다: 다음 search나 list를 실행하면 번호가 다시 매겨집니다.",

    optionDescriptions: [
      "검색할 텍스트. 큐레이션/캐시 카탈로그를 먼저 매칭한 다음 HuggingFace, ModelScope 순으로 찾습니다.",
      "이 하드웨어에서 못 돌아갈 걸로 예측되는 모델을 빨간색으로 보여주는 대신 결과에서 아예 뺍니다.",
      "결과를 이 개수까지만 보여줍니다.",
      "이 출처의 결과만 보여줍니다: curated(실제 호스트가 아닌 omm 내장/캐시 카탈로그), huggingface, modelscope 중 하나.",
      "ModelScope는 조회하지 않습니다. ModelScope 결과는 후보 저장소마다 네트워크 요청이 하나씩 더 필요해서 검색이 눈에 띄게 느려질 수 있습니다.",
      "정돈된 목록 대신 구조화된 JSON을 표준출력으로 찍습니다 — search가 표준출력에 쓰는 유일한 것이라 파이프로 안전하게 연결할 수 있습니다.",
    ],

    exampleCaptions: [
      "기본 검색 — 계열별로 묶여 번호가 매겨집니다. 이 번호를 install에 그대로 넘길 수 있습니다.",
      "결과 개수를 제한합니다.",
      "이 머신에서 못 돌아갈 걸로 예측되는 모델은 빨간색 표시 대신 아예 뺍니다.",
      "큐레이션 카탈로그와 ModelScope는 건너뛰고 HuggingFace 결과만 봅니다.",
      "JSON 출력을 jq로 연결합니다 — search가 표준출력에 쓰는 게 --json뿐이라 안전합니다.",
    ],

    captureFootnote:
      "2026-08-24, 이 개발 머신에서 실제로 실행한 omm search qwen --limit 5 캡처입니다. HuggingFace·ModelScope 순위는 계속 바뀌므로 다시 실행하면 다른 저장소가 나옵니다.",

    trouble: [
      {
        why: "--provider는 세 값 중 하나만 받는데, 이번 실행에서는 다른 값을 줬습니다.",
        fix: "curated, huggingface, modelscope 중 하나를 쓰세요.",
      },
      {
        why: "--skip-ms는 ModelScope를 조회하지 말라는 뜻이고, --provider modelscope는 ModelScope 결과만 보여달라는 뜻입니다. 서로 상쇄됩니다.",
        fix: "--skip-ms를 빼거나, --provider를 curated나 huggingface로 바꾸세요.",
      },
      {
        why: "큐레이션 카탈로그, 캐시된 후보, HuggingFace, ModelScope 어디에도 이 검색어와 일치하는 게 없었습니다.",
        fix: "더 짧거나 다르게 쓴 검색어를 시도하세요 — search는 정확한 저장소 ID가 아니라 이름으로 매칭합니다.",
      },
    ],

    relatedBlurbs: [
      "search가 방금 출력한 번호나 저장소 참조로 설치합니다.",
      "뭘 찾아야 할지 모르겠다면, recommend가 이 머신에 맞는 모델을 대신 골라줍니다.",
    ],
  },
};
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/i18n/commands/*`. (Errors elsewhere in the tree, if any, are pre-existing — confirm by running the same command on a clean checkout if unsure.)

- [ ] **Step 6: Commit**

```bash
git add src/i18n/commands/
git commit -m "$(cat <<'EOF'
feat: add search command doc content (base facts + en/ko prose)

Options, examples, a real captured omm search run, and three real captured
error messages, sourced from the omm product repo's cli.py and a live run
against it (see design/FACTS.md, "Command doc pages" section, added next).
EOF
)"
```

---

### Task 2: Assembly module

**Files:**
- Create: `src/components/commands/commands.ts`

**Interfaces:**
- Consumes: everything Task 1 produces (`Slug`, `COMMAND_ORDER`, `COMMAND_BASE`, `COMMANDS_EN`, `COMMANDS_KO`).
- Produces: `type Command` (assembled per-locale shape), `getCommand(slug: Slug, locale: Locale): Command`, `type CommandLink`, `getCommandLinks(locale: Locale): readonly CommandLink[]`. Task 4 (pages) imports both functions and `type Command`.

- [ ] **Step 1: Write `src/components/commands/commands.ts`**

```ts
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
  type Example,
  type Option,
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
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heading: string;
  readonly lede: string;
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
    metaTitle: text.metaTitle,
    metaDescription: text.metaDescription,
    heading: text.heading,
    lede: text.lede,
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
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/components/commands/commands.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/components/commands/commands.ts
git commit -m "feat: add command doc page assembly module"
```

---

### Task 3: Dictionary additions (UI chrome strings)

**Files:**
- Modify: `src/i18n/dictionaries/en.ts` (append two top-level keys after `guide`)
- Modify: `src/i18n/dictionaries/ko.ts` (same, matching shape)

**Interfaces:**
- Produces: `Dictionary["commandsChooser"]`, `Dictionary["commands"]` (both flow through the existing `Widen<typeof en>` mechanism — no changes needed to `src/i18n/dictionaries/index.ts` or `src/i18n/widen.ts`). Task 4 reads `getDictionary(locale).commandsChooser` and `getDictionary(locale).commands`.

- [ ] **Step 1: Append to `src/i18n/dictionaries/en.ts`**

Insert after the `guide: { ... }` block (before the closing `} as const;` on the final line):

```ts
  commandsChooser: {
    metaTitle: "omm commands",
    metaDescription:
      "Full reference pages for omm's commands: every flag, real examples from basic to scripted, a real captured run, and the errors each one actually prints.",
    label: "Commands",
    heading: "Pick the command you want the full reference for.",
    lede: "Each page covers what the command is for and when to reach for it, every flag, five real examples, a real captured run, and the errors it actually prints with what to do about them.",
  },

  commands: {
    breadcrumbAria: "Breadcrumb",
    onThisPage: "On this page",
    sections: [
      "Overview",
      "Options",
      "Examples",
      "A real run",
      "Related commands",
      "If something goes wrong",
    ],
    optionsIntro: "Every flag this command accepts, and what it defaults to when you leave it out.",
    optionsColumns: { flag: "Flag", argument: "Argument", default: "Default" },
    examplesIntro: "From a plain search to something you'd put in a script.",
    troubleBody:
      "Every message below is one this command actually prints. Find yours, read why it happened, then do the last line.",
    troubleWhy: "why",
    troubleFix: "what to do",
    troubleSource: "source",
    stillStuck:
      "Still stuck? Open an issue with the exact message you saw.",
    comingSoon: "coming soon",
    elsewhere: "All commands",
  },
```

- [ ] **Step 2: Append to `src/i18n/dictionaries/ko.ts`**

Insert after the `guide: { ... }` block (before the closing `} as const satisfies Dictionary;` on the final line):

```ts
  commandsChooser: {
    metaTitle: "omm 명령어",
    metaDescription:
      "omm 명령어별 전체 레퍼런스 페이지: 모든 옵션, 초급부터 스크립팅까지 실제 예제, 실제 캡처한 실행 결과, 각 명령이 실제로 출력하는 에러까지 다룹니다.",
    label: "명령어",
    heading: "전체 레퍼런스를 볼 명령어를 고르세요.",
    lede: "각 페이지는 명령이 무엇을 위한 것이고 언제 쓰는지, 모든 옵션, 실제 예제 5개, 실제 캡처한 실행 결과, 그리고 실제로 출력되는 에러와 대처법까지 다룹니다.",
  },

  commands: {
    breadcrumbAria: "탐색 경로",
    onThisPage: "이 페이지의 내용",
    sections: [
      "개요",
      "옵션",
      "예제",
      "실제 실행 예시",
      "관련 명령어",
      "문제가 생겼다면",
    ],
    optionsIntro: "이 명령이 받는 모든 옵션과, 생략했을 때의 기본값입니다.",
    optionsColumns: { flag: "옵션", argument: "인자", default: "기본값" },
    examplesIntro: "기본 검색부터 스크립트에 넣을 만한 형태까지.",
    troubleBody:
      "아래 메시지는 모두 이 명령이 실제로 출력하는 것들입니다. 해당하는 메시지를 찾아 원인을 읽고, 마지막 줄대로 하면 됩니다.",
    troubleWhy: "원인",
    troubleFix: "대처",
    troubleSource: "출처",
    stillStuck: "그래도 해결되지 않는다면, 화면에 뜬 메시지 그대로를 첨부해 이슈를 등록하세요.",
    comingSoon: "준비 중",
    elsewhere: "전체 명령어",
  },
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors — in particular, no "Property is missing in type" error pointing at `ko.ts`'s `as const satisfies Dictionary` line, which is what would fire if the two files' shapes drifted.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/dictionaries/en.ts src/i18n/dictionaries/ko.ts
git commit -m "feat: add dictionary strings for command doc pages"
```

---

### Task 4: Page components and routes

**Files:**
- Create: `src/components/commands/CommandDocPage.tsx`
- Create: `src/app/[locale]/commands/layout.tsx`
- Create: `src/app/[locale]/commands/page.tsx`
- Create: `src/app/[locale]/commands/search/page.tsx`

**Interfaces:**
- Consumes: `getCommand`, `getCommandLinks`, `type Command` from Task 2; `CommandBlock` from `src/components/install/CommandBlock.tsx` (existing, unmodified); `Dictionary["commands"]` / `Dictionary["commandsChooser"]` from Task 3; `Reveal` from `src/components/Reveal.tsx` (existing).

- [ ] **Step 1: Write `src/components/commands/CommandDocPage.tsx`**

```tsx
import Link from "next/link";

import CommandBlock from "@/components/install/CommandBlock";
import { getCommandLinks, type Command } from "@/components/commands/commands";
import Reveal from "@/components/Reveal";
import { localeHref, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const REPO = "https://github.com/omm-hippo/omm";

const SECTION_IDS = [
  "overview",
  "options",
  "examples",
  "capture",
  "related",
  "trouble",
] as const;

const SECTION_NUMBERS = ["01", "02", "03", "04", "05", "06"] as const;

function SectionHead({
  n,
  id,
  title,
  body,
}: {
  n: string;
  id: string;
  title: string;
  body?: string;
}) {
  return (
    <>
      <p className="text-label">
        <span className="text-ink-2">{n}</span>
        <span> / 06</span>
      </p>
      <h2 id={`${id}-title`} className="text-h2 mt-3">
        {title}
      </h2>
      {body ? <p className="text-lede mt-4 max-w-[62ch]">{body}</p> : null}
    </>
  );
}

function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="mt-6 flex flex-col border-t border-line-0">{children}</ul>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <li className="border-b border-line-0 py-4">{children}</li>;
}

export default function CommandDocPage({
  command,
  locale,
}: {
  command: Command;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.commands;
  const ui = dictionary.ui;
  const others = getCommandLinks(locale).filter((link) => link.slug !== command.slug);

  const sections = SECTION_IDS.map((id, index) => ({
    id,
    n: SECTION_NUMBERS[index],
    title: t.sections[index],
  }));

  return (
    <main>
      <section className="relative border-b border-line-0 bg-bg-0 pt-24 pb-16">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-page px-5 md:px-8">
          <nav aria-label={t.breadcrumbAria} className="text-label">
            <Link href={localeHref("/", locale)} className="hover:text-ink-1">
              omm
            </Link>
            <span className="text-ink-3"> / </span>
            <Link href={localeHref("/commands", locale)} className="hover:text-ink-1">
              commands
            </Link>
            <span className="text-ink-3"> / </span>
            <span className="text-ink-1">{command.slug}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 className="text-h2 font-mono">{command.heading}</h1>
              <p className="text-lede mt-5 max-w-[62ch]">{command.lede}</p>
            </div>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-label border-b border-transparent pb-0.5 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:border-accent hover:text-ink-1"
                >
                  {section.n} {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto w-full max-w-page px-5 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <nav aria-label={t.onThisPage} className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-14 py-12">
              <p className="text-label">{t.onThisPage}</p>
              <ul className="mt-4 flex flex-col">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-small block border-b border-line-0 py-2 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:text-ink-0"
                    >
                      <span className="font-mono text-ink-3">{section.n} </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="lg:col-span-8 lg:col-start-5">
            {/* 01 — overview */}
            <section
              id="overview"
              aria-labelledby="overview-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="01" id="overview" title={t.sections[0]} body={command.overviewBody} />
              </Reveal>
            </section>

            {/* 02 — options */}
            <section
              id="options"
              aria-labelledby="options-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="02" id="options" title={t.sections[1]} body={t.optionsIntro} />
                <Rows>
                  {command.options.map((option) => (
                    <Row key={option.name}>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,22ch)_minmax(0,14ch)_minmax(0,1fr)] sm:gap-6">
                        <code className="text-terminal text-ink-0">{option.name}</code>
                        <span className="text-table text-ink-3">
                          {option.argument ?? "—"}
                          <span className="block text-ink-2">{t.optionsColumns.default}: {option.default}</span>
                        </span>
                        <p className="text-small max-w-[62ch]">{option.description}</p>
                      </div>
                    </Row>
                  ))}
                </Rows>
              </Reveal>
            </section>

            {/* 03 — examples */}
            <section
              id="examples"
              aria-labelledby="examples-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="03" id="examples" title={t.sections[2]} body={t.examplesIntro} />
                <div className="mt-6 flex flex-col gap-6">
                  {command.examples.map((example) => (
                    <div key={example.command}>
                      <p className="text-small mb-2">{example.caption}</p>
                      <CommandBlock
                        prompt={example.prompt}
                        command={example.command}
                        label={example.command}
                        ui={ui}
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>

            {/* 04 — real captured run */}
            <section
              id="capture"
              aria-labelledby="capture-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="04" id="capture" title={t.sections[3]} />
                <figure className="mt-8">
                  <div className="overflow-hidden rounded-lg border border-line-1 bg-bg-1">
                    <div className="border-b border-line-0 bg-bg-2 px-4 py-2">
                      <span className="text-label">{command.capture.title}</span>
                    </div>
                    <pre className="text-terminal overflow-x-auto p-5 text-ink-1">
                      <code>{command.capture.text}</code>
                    </pre>
                  </div>
                  <figcaption className="text-small mt-3 max-w-[68ch] text-ink-3">
                    {command.capture.footnote}
                  </figcaption>
                </figure>
              </Reveal>
            </section>

            {/* 05 — related commands */}
            <section
              id="related"
              aria-labelledby="related-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="05" id="related" title={t.sections[4]} />
                <ul className="mt-6 flex flex-col border-t border-line-0">
                  {command.related.map((entry) => (
                    <li key={entry.label} className="border-b border-line-0">
                      <a
                        href={entry.href}
                        target={entry.internal ? undefined : "_blank"}
                        rel={entry.internal ? undefined : "noreferrer"}
                        className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                      >
                        <span className="text-terminal text-ink-0">{entry.label}</span>
                        <span className="text-small">{entry.blurb}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </section>

            {/* 06 — troubleshooting */}
            <section
              id="trouble"
              aria-labelledby="trouble-title"
              className="scroll-mt-14 border-b border-line-0 py-12"
            >
              <Reveal>
                <SectionHead n="06" id="trouble" title={t.sections[5]} body={t.troubleBody} />
                <ol className="mt-6 flex flex-col border-t border-line-0">
                  {command.trouble.map((entry) => (
                    <li key={entry.see} className="border-b border-line-0 py-6">
                      <pre className="text-terminal overflow-x-auto text-ink-0">
                        <code>{entry.see}</code>
                      </pre>
                      <dl className="mt-4 flex flex-col gap-3">
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleWhy}</dt>
                          <dd className="text-small max-w-[68ch]">{entry.why}</dd>
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleFix}</dt>
                          <dd className="text-small max-w-[68ch] text-ink-1">{entry.fix}</dd>
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,12ch)_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-label">{t.troubleSource}</dt>
                          <dd className="text-table text-ink-3">{entry.source}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ol>
                <p className="text-small mt-6 max-w-[68ch]">{t.stillStuck}</p>
              </Reveal>
            </section>

            {/* Where to go next */}
            <section aria-labelledby="elsewhere-title" className="py-8">
              <Reveal>
                <h2 id="elsewhere-title" className="text-label">
                  {t.elsewhere}
                </h2>
                <ul className="mt-6 flex flex-col border-t border-line-0">
                  {others.map((other) => (
                    <li key={other.slug} className="border-b border-line-0">
                      <Link
                        href={localeHref(other.href, locale)}
                        className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                      >
                        <span className="text-ink-0">{other.name}</span>
                        <span className="text-small">{other.summary}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="border-b border-line-0">
                    <a
                      href={`${REPO}#usage`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-1 gap-1 py-4 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,20ch)_minmax(0,1fr)] sm:gap-6"
                    >
                      <span className="text-ink-0">README — Usage</span>
                      <span className="text-small">Every omm command, one line each.</span>
                    </a>
                  </li>
                </ul>
              </Reveal>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Write `src/app/[locale]/commands/layout.tsx`**

```tsx
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { isLocale } from "@/i18n/config";

export default async function CommandsLayout({
  children,
  params,
}: LayoutProps<"/[locale]/commands">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <Nav locale={locale} />
      {children}
      <Footer locale={locale} />
    </>
  );
}
```

- [ ] **Step 3: Write `src/app/[locale]/commands/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCommandLinks } from "@/components/commands/commands";
import {
  OG_LOCALE,
  alternatesFor,
  isLocale,
  localeHref,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/commands">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { commandsChooser } = getDictionary(locale);

  return {
    title: commandsChooser.metaTitle,
    description: commandsChooser.metaDescription,
    alternates: alternatesFor("/commands"),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref("/commands", locale),
      locale: OG_LOCALE[locale],
      title: commandsChooser.metaTitle,
      description: commandsChooser.metaDescription,
    },
  };
}

export default async function CommandsChooser({
  params,
}: PageProps<"/[locale]/commands">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { commandsChooser, commands } = getDictionary(locale);
  const links = getCommandLinks(locale);
  const built = new Set(links.map((link) => link.slug));

  /** The other five commands from issue #6's scope, not built yet. Labels
   *  are the product's own vocabulary and stay untranslated, same rule as
   *  Footer.tsx's COMMANDS list. */
  const planned = [
    { name: "omm install" },
    { name: "omm run" },
    { name: "omm recommend" },
    { name: "omm contribute" },
    { name: "omm setup" },
  ].filter((entry) => !built.has(entry.name.replace("omm ", "") as never));

  return (
    <main className="relative border-b border-line-0 bg-bg-0">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-page px-5 pt-16 pb-32 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-4">
            <p className="text-label">{commandsChooser.label}</p>
            <h1 className="text-h2 mt-4">{commandsChooser.heading}</h1>
            <p className="text-lede mt-5 max-w-[62ch]">{commandsChooser.lede}</p>

            <ul className="mt-12 flex flex-col border-t border-line-0">
              {links.map((link) => (
                <li key={link.slug} className="border-b border-line-0">
                  <Link
                    href={localeHref(link.href, locale)}
                    className="grid grid-cols-1 gap-2 px-2 py-6 transition-colors duration-[120ms] ease-[var(--ease-micro)] hover:bg-bg-1 sm:grid-cols-[minmax(0,16ch)_minmax(0,1fr)] sm:gap-6"
                  >
                    <span className="text-h3 font-mono">{link.name}</span>
                    <span className="text-small max-w-[62ch]">{link.summary}</span>
                  </Link>
                </li>
              ))}
              {planned.map((entry) => (
                <li
                  key={entry.name}
                  className="grid grid-cols-1 gap-2 px-2 py-6 sm:grid-cols-[minmax(0,16ch)_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="text-h3 font-mono text-ink-3">{entry.name}</span>
                  <span className="text-small text-ink-3">{commands.comingSoon}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Write `src/app/[locale]/commands/search/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CommandDocPage from "@/components/commands/CommandDocPage";
import { getCommand } from "@/components/commands/commands";
import { OG_LOCALE, alternatesFor, isLocale, localeHref } from "@/i18n/config";

const SLUG = "search" as const;
const PATH = "/commands/search";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/commands/search">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const command = getCommand(SLUG, locale);

  return {
    title: command.metaTitle,
    description: command.metaDescription,
    alternates: alternatesFor(PATH),
    openGraph: {
      type: "article",
      siteName: "omm",
      url: localeHref(PATH, locale),
      locale: OG_LOCALE[locale],
      title: command.metaTitle,
      description: command.metaDescription,
    },
  };
}

export default async function SearchCommandDoc({
  params,
}: PageProps<"/[locale]/commands/search">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CommandDocPage command={getCommand(SLUG, locale)} locale={locale} />;
}
```

- [ ] **Step 5: Verify**

Run: `npm run dev` (in background), then in a browser: `http://localhost:3000/commands`, `http://localhost:3000/commands/search`, `http://localhost:3000/ko/commands`, `http://localhost:3000/ko/commands/search`.
Expected: chooser lists `omm search` as a live link and the other five as greyed-out "coming soon" rows; the search page renders all six sections, the copy button on each example works, on-this-page rail highlights correctly on `lg:` widths, and nothing visually clashes with `/install/linux` opened side by side (same header treatment, same spacing, same type scale).

Run: `npx tsc --noEmit`
Expected: no errors (Next.js's typed-routes plugin generates `PageProps<"/[locale]/commands">` etc. from the file structure automatically once these files exist — if it complains the route type doesn't exist yet, run `npm run dev` once first to regenerate).

- [ ] **Step 6: Commit**

```bash
git add src/components/commands/CommandDocPage.tsx src/app/\[locale\]/commands/
git commit -m "feat: add /commands and /commands/search pages"
```

---

### Task 5: Wire into the footer, document sources, final verification

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `design/FACTS.md`

**Interfaces:**
- Consumes: nothing new (Footer already imports `localeHref`, `Link`).

- [ ] **Step 1: Modify `src/components/Footer.tsx`'s `COMMANDS` list and its render block**

Replace the `COMMANDS` constant:

```ts
/** Command names are the product's own vocabulary — never translated.
 *  `href` is `internal: true` once `/commands/<slug>` exists; external
 *  entries point at the README section covering that command until then. */
const COMMANDS = [
  { label: "omm search", href: "/commands/search", internal: true },
  { label: "omm scan", href: `${REPO}#usage`, internal: false },
  { label: "omm install", href: `${REPO}#usage`, internal: false },
  { label: "omm list", href: `${REPO}#usage`, internal: false },
  { label: "omm benchmark", href: `${REPO}#self-hosted-benchmark-data`, internal: false },
  { label: "omm setting", href: `${REPO}#signed-recommendation-data`, internal: false },
] as const;
```

Replace the `Column title={t.commands.title}` block's body:

```tsx
            <Column title={t.commands.title}>
              {COMMANDS.map((command) => (
                <li key={command.label}>
                  {command.internal ? (
                    <Link
                      href={localeHref(command.href, locale)}
                      className={`${LINK_CLASS} font-mono`}
                    >
                      {command.label}
                    </Link>
                  ) : (
                    <a href={command.href} className={`${LINK_CLASS} font-mono`}>
                      {command.label}
                    </a>
                  )}
                </li>
              ))}
            </Column>
```

- [ ] **Step 2: Append to `design/FACTS.md`**

Add this section at the end of the file:

```markdown
## Command doc pages (`/commands`, `/commands/search`)

Source of truth for these pages is the omm product repo at
`~/Project/Localfit` (remote `origin` = `github.com/omm-hippo/omm`). Content
lives in `src/i18n/commands/` — `base.ts` for everything language-independent
(options, example commands, captured output, verbatim errors and their
file:line), `en.ts`/`ko.ts` for prose — assembled by
`src/components/commands/commands.ts`.

### `search`
- Command definition, options, and validation errors:
  `src/omm/cli.py:6293-6467`.
- README one-liner: `README.md:331`; shared scripting notes (global `--json`
  flag, safe-to-pipe guarantee): `README.md:401-403`; numeric-index reuse
  between `search`/`list`/`install`: `README.md:354`.
- Real captures, 2026-08-24, this dev machine, via `~/Project/Localfit`'s own
  `.venv` (`omm search ... --no-color`):
  - `omm search qwen --limit 5` — the page's "a real run" block, verbatim.
  - `omm search qwen --provider bogus` →
    `--provider must be one of: curated, huggingface, modelscope (got 'bogus').`
    (exit 2, `cli.py:6320-6323`)
  - `omm search qwen --skip-ms --provider modelscope` →
    `--skip-ms conflicts with --provider modelscope.`
    (exit 2, `cli.py:6326`)
  - `omm search zzzznonexistentmodelxyz` →
    `No models found matching 'zzzznonexistentmodelxyz'.`
    (exit 1, `cli.py:6362`)
- The other five commands from issue #6's scope (`install`, `run`,
  `recommend`, `contribute`, `setup`) are listed on `/commands` as
  "coming soon" placeholders with no page yet — same rule applies when they
  are written: real source or a real capture, cited here, before it ships.
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: both pass.

Run: `npm run build`
Expected: build succeeds (this also validates the typed-route `PageProps`/`LayoutProps` generics used in Task 4 against the real generated route manifest).

Re-run the four captured `omm search ...` commands against `~/Project/Localfit` one more time, diff against what's in `base.ts`:

```bash
cd ~/Project/Localfit && source .venv/bin/activate && omm search qwen --limit 5 --no-color
```

Expected: output matches `COMMAND_BASE.search.capture.text` in `src/i18n/commands/base.ts`. Package/model rankings can drift (HuggingFace/ModelScope download counts change) — if the numbers differ, update `base.ts` to the fresh capture rather than leaving a stale one, since the whole point of "real capture" is that it's real.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx design/FACTS.md
git commit -m "$(cat <<'EOF'
feat: link omm search from the footer, document its sources in FACTS.md

Closes the search slice of #6: footer now points at the internal page
instead of the README anchor, and FACTS.md records the product-repo source
and real captures behind every claim on the new page.
EOF
)"
```

---

## Self-review notes (from plan authoring)

- Spec coverage: all six spec sections (routes, content model, page sections,
  dictionary additions, footer change, testing) map onto Tasks 1–5. The
  spec's "Non-goals" (other five commands, real search UI, global Docs nav
  entry, video) are correctly absent from every task.
- The `/commands` chooser's "coming soon" filter in Task 4 Step 3 uses
  `entry.name.replace("omm ", "")` against `built` (a `Set<Slug>`) — this is
  a small type-unsafe cast (`as never`) purely to keep the placeholder list
  from double-listing a command once it's built; when the second real
  command page ships, replace this filter with an explicit `Slug[]` literal
  instead of extending the cast.
