/**
 * Runners — DIRECTION.md §4.5.
 * The coverage table from linker.has_automated_installer()
 * (design/FACTS.md §"The 7 runners"),
 * rendered as full-bleed hairline rows rather than a boxed table: runner names
 * in Archivo so the one sans column anchors the mono grid, platforms as small
 * mono chips, `—` in --ink-3. Not a logo grid — the repo ships no logo assets,
 * so the optional wordmark strip is omitted rather than faked.
 *
 * Rows use ARIA table roles because each row rule must reach both viewport
 * edges while the cells stay inside the 1280px container; a real <table>
 * cannot be full-bleed and contained at once.
 *
 * The chips stay English in every locale: they are platform names and the
 * package/CLI that drives each install, not prose. The "Manual elsewhere"
 * column is prose and comes from the dictionary, row by row.
 */

import Reveal from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type Chip = { os: string; note?: string };
type RunnerRow = { runner: string; automated: Chip[] };

const ROWS: RunnerRow[] = [
  {
    runner: "Ollama",
    automated: [{ os: "macOS" }, { os: "Linux" }, { os: "Windows" }],
  },
  {
    runner: "LM Studio",
    automated: [
      { os: "macOS" },
      { os: "Linux" },
      { os: "Windows", note: "headless lms CLI" },
    ],
  },
  {
    runner: "Jan",
    automated: [
      { os: "macOS", note: "Homebrew" },
      { os: "Windows", note: "winget" },
      { os: "Linux", note: "Flatpak" },
    ],
  },
  {
    runner: "AnythingLLM",
    automated: [
      { os: "macOS", note: "Homebrew" },
      { os: "Windows", note: "x86_64" },
    ],
  },
  {
    runner: "Msty",
    automated: [
      { os: "macOS", note: "Homebrew" },
      { os: "Windows", note: "x86_64" },
    ],
  },
  {
    runner: "KoboldCpp",
    automated: [
      { os: "macOS", note: "Apple Silicon" },
      { os: "Linux", note: "x86_64" },
      { os: "Windows", note: "x86_64" },
    ],
  },
  {
    runner: "text-generation-webui",
    automated: [
      { os: "macOS", note: "any arch" },
      { os: "Linux", note: "x86_64" },
      { os: "Windows", note: "x86_64" },
    ],
  },
];

const CONTAINER = "mx-auto w-full max-w-page px-5 md:px-8";
const GRID =
  "grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:items-baseline md:gap-6";

export default function Runners({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).runners;

  return (
    <section id="runners" className="border-t border-line-0 py-24">
      <Reveal className={CONTAINER}>
        <p className="text-label">{t.label}</p>
        <h2 className="mt-4 max-w-[22ch] text-h2">{t.heading}</h2>
        <p className="mt-6 max-w-[56ch]">{t.body}</p>
      </Reveal>

      <div role="table" className="mt-12">
        <div role="rowgroup" className="border-y border-line-0 bg-bg-1">
          <div className={CONTAINER}>
            <div role="row" className={GRID}>
              <div role="columnheader" className="text-label md:col-span-3">
                {t.columns.runner}
              </div>
              <div role="columnheader" className="text-label md:col-span-6">
                {t.columns.automated}
              </div>
              <div role="columnheader" className="text-label md:col-span-3">
                {t.columns.manual}
              </div>
            </div>
          </div>
        </div>

        <div role="rowgroup">
          {ROWS.map((row, index) => {
            const manual = t.manual[index];
            return (
              <div key={row.runner} className="border-b border-line-0">
                <div className={CONTAINER}>
                  <div role="row" className={GRID}>
                    <div
                      role="rowheader"
                      className="font-sans font-medium text-ink-0 md:col-span-3"
                    >
                      {row.runner}
                    </div>

                    <div role="cell" className="md:col-span-6">
                      <ul className="flex flex-wrap gap-2">
                        {row.automated.map((chip) => (
                          <li
                            key={chip.os}
                            className="rounded-sm border border-line-1 px-2 py-1 text-table text-ink-1"
                          >
                            {chip.os}
                            {chip.note ? (
                              <span className="text-ink-3"> {chip.note}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      role="cell"
                      className={
                        manual === "—"
                          ? "text-small text-ink-3 md:col-span-3"
                          : "text-small text-ink-2 md:col-span-3"
                      }
                    >
                      {manual}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
