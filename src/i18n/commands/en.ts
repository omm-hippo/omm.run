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
