/**
 * Features — DIRECTION.md §4.4.
 * Four alternating full-width rows (5/7, then 7/5), separated by full-bleed
 * hairlines. No icon cards, no 3-column grid: every row carries one
 * purpose-built visual built from real omm behaviour.
 */

import type { ReactNode } from "react";
import FeatureLinkDiagram from "@/components/FeatureLinkDiagram";
import FeatureBudgetBar from "@/components/FeatureBudgetBar";
import FeatureBenchTable from "@/components/FeatureBenchTable";
import FeatureCatalogDiff from "@/components/FeatureCatalogDiff";
import Reveal from "@/components/Reveal";
import RichTextBlocks from "@/components/RichTextBlocks";
import type { Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

type Row = {
  id: keyof Dictionary["features"];
  visual: ReactNode;
  /** true → text on the left in a 5/7 split, false → visual left in 7/5 */
  textFirst: boolean;
};

export default function Features({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.features;

  const rows: Row[] = [
    { id: "hub", visual: <FeatureLinkDiagram locale={locale} />, textFirst: true },
    { id: "localfit", visual: <FeatureBudgetBar locale={locale} />, textFirst: false },
    { id: "benchmarks", visual: <FeatureBenchTable locale={locale} />, textFirst: true },
    { id: "catalogs", visual: <FeatureCatalogDiff locale={locale} />, textFirst: false },
  ];

  return (
    <section id="technical-features" className="explanatory-section">
      {rows.map((row, index) => (
        <div
          key={row.id}
          /* Problem's own bottom rule opens the section, so the first row does
             not draw a second one. Row padding 96px + 32px at the two outer
             edges makes the section read 128px top and bottom (§3 rhythm). */
          className={index === 0 ? undefined : "border-t border-line-0"}
        >
          <div
            className={`mx-auto w-full max-w-page px-5 py-16 md:px-8 ${
              index === 0 ? "pt-32" : index === rows.length - 1 ? "pb-32" : ""
            }`}
          >
            <Reveal className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-6">
              <div
                className={
                  row.textFirst
                    ? "md:col-span-5 md:col-start-1"
                    : "md:col-span-5 md:col-start-8 md:row-start-1"
                }
              >
                <p className="text-label">{t[row.id].eyebrow}</p>
                <h2 className="mt-4 text-h2">{t[row.id].title}</h2>
                <RichTextBlocks segments={t[row.id].body} locale={locale} className="mt-6 max-w-[52ch]" />
              </div>

              <div
                className={
                  row.textFirst
                    ? "md:col-span-7 md:col-start-6"
                    : "md:col-span-7 md:col-start-1 md:row-start-1"
                }
              >
                {row.visual}
              </div>
            </Reveal>
          </div>
        </div>
      ))}
    </section>
  );
}
