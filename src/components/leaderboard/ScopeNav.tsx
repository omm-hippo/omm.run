import type { Locale } from "@/i18n/config";
import type { LeaderboardDictionary } from "@/i18n/leaderboard";
import { navItems, scopeHref, type NavItem } from "@/lib/leaderboard/view";
import type { ArenaArtifact } from "@/lib/leaderboard/types";

import { Label } from "./Hero";

function familyHeading(t: LeaderboardDictionary, family: NavItem["family"]): string | null {
  switch (family) {
    case "unified":
      return t.familyUnified;
    case "vram":
      return t.familyVram;
    case "cpu":
      return t.familyCpu;
    case "unknown":
      return t.familyUnknown;
    default:
      return null;
  }
}

/** Scope list: 전체 first, then each memory family. A thin group is dimmed and
 *  tagged; picking it shows a notice above the overall board. */
export default function ScopeNav({
  t,
  locale,
  artifact,
  current,
}: {
  t: LeaderboardDictionary;
  locale: Locale;
  artifact: ArenaArtifact;
  current: string;
}) {
  const items = navItems(artifact, locale);
  return (
    <nav
      aria-label={t.scopeHeading}
      className="flex gap-1 overflow-x-auto border-b border-line-0 bg-bg-0 p-2 text-[14px] lg:block lg:overflow-visible lg:border-r lg:border-b-0 lg:px-0 lg:py-4"
    >
      <Label className="hidden px-4 pb-2 lg:block">{t.scopeHeading}</Label>
      {items.map((item, index) => {
        const heading = item.family !== items[index - 1]?.family ? familyHeading(t, item.family) : null;
        const on = item.key === current;
        return (
          <div key={item.key} className="contents lg:block">
            {heading ? <Label className="hidden px-4 pt-4 pb-2 lg:block">{heading}</Label> : null}
            <a
              href={scopeHref(item.key)}
              aria-current={on ? "page" : undefined}
              title={item.fullLabel}
              className={`flex shrink-0 items-center justify-between gap-3 border-l-2 px-4 py-1.5 whitespace-nowrap ${
                on ? "border-accent bg-bg-2 font-semibold text-ink-0" : "border-transparent hover:bg-bg-1"
              } ${item.ranked ? "text-ink-1" : "text-ink-3"}`}
            >
              <span>
                <span className="lg:hidden">{item.family === "overall" ? item.label : item.fullLabel}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </span>
              {item.ranked ? (
                <span className={`font-mono text-[12px] ${on ? "text-accent" : "text-ink-3"}`}>{item.votes}</span>
              ) : (
                <span className="rounded-sm border border-line-1 px-1 font-mono text-[10px] text-ink-3">
                  {t.thin} · {item.votes}
                </span>
              )}
            </a>
          </div>
        );
      })}
    </nav>
  );
}
