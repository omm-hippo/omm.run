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
