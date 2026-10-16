import type { Locale } from "@/i18n/config";
import { leaderboardDictionary } from "@/i18n/leaderboard";
import { groupLabel } from "@/lib/leaderboard/groups";
import { rankedModels, scopeOf } from "@/lib/leaderboard/view";
import type { BoardState } from "@/lib/leaderboard/types";

import Analysis from "./Analysis";
import BoardMessage from "./BoardMessage";
import CopyCommand from "./CopyCommand";
import Hero, { Label } from "./Hero";
import ModelDrawer from "./ModelDrawer";
import ScopeNav from "./ScopeNav";
import TierTable from "./TierTable";

/** The whole /leaderboard body for one verified (or failed) board state.
 *  Server-rendered; scope and selection come from the URL. */
export default function LeaderboardView({
  state,
  locale,
  scope: requested = "overall",
  model: requestedModel,
}: {
  state: BoardState;
  locale: Locale;
  scope?: string;
  model?: string;
}) {
  const t = leaderboardDictionary(locale);
  const wrap = "mx-auto w-full max-w-page px-5 md:px-8";

  if (state.kind === "unpublished" || state.kind === "error") {
    const [title, body] =
      state.kind === "unpublished"
        ? [t.unpublishedTitle, t.unpublishedBody]
        : state.reason === "too_new"
          ? [t.errorTooNewTitle, t.errorTooNewBody]
          : state.reason === "verification"
            ? [t.errorVerificationTitle, t.errorVerificationBody]
            : [t.errorUnavailableTitle, t.errorUnavailableBody];
    return (
      <div className={wrap}>
        <Hero t={t} />
        <BoardMessage title={title} body={body} />
      </div>
    );
  }

  const { artifact } = state;
  const view = scopeOf(artifact, requested);
  const navCurrent = view.fellBack ? view.requested : view.key;

  if (state.kind === "collecting" || !view.scope.ranked) {
    // Nothing ranked is shown, so the date is when these counts were taken.
    const someGroupRanked = artifact.groups.some((group) => group.ranked);
    return (
      <>
        <div className={wrap}>
          <Hero t={t} artifact={artifact} updatedAt={artifact.generated_at} example={state.example} />
        </div>
        <div className="border-t border-line-0" />
        <div className={wrap}>
          <div className="mt-6 mb-24 grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-lg border border-line-1 bg-bg-1 lg:grid-cols-[208px_minmax(0,1fr)]">
            <ScopeNav t={t} locale={locale} artifact={artifact} current={navCurrent} />
            <section className="min-w-0 p-6">
              <h2 className="text-[22px] font-semibold text-ink-0">
                {someGroupRanked ? t.scopeThinTitle : t.collectingTitle}
              </h2>
              <p className="mt-3 max-w-[60ch] text-ink-2">{someGroupRanked ? t.scopeThinBody : t.collectingBody}</p>
              <div className="mt-6 max-w-[320px]">
                <CopyCommand command="omm arena" copyLabel={t.copy} copiedLabel={t.copied} variant="button" />
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  const ranked = rankedModels(view.scope);
  const selected = ranked.find((model) => model.key === requestedModel) ?? ranked[0] ?? null;
  const corpus = view.scope.corpus;
  return (
    <>
      <div className={wrap}>
        <Hero t={t} artifact={artifact} updatedAt={view.scope.updated_at} example={state.example} />
      </div>
      <div className="border-t border-line-0" />
      <div className={wrap}>
        <div className="mt-6 mb-24 grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-lg border border-line-1 bg-bg-1 lg:grid-cols-[208px_minmax(0,1fr)_272px]">
          <ScopeNav t={t} locale={locale} artifact={artifact} current={navCurrent} />
          <section className="min-w-0 p-4 md:p-6">
            {view.fellBack ? (
              <p role="status" className="mb-4 rounded-md border border-line-1 bg-bg-2 px-3 py-2 text-[13px] text-ink-1">
                {t.fallbackNotice}
              </p>
            ) : null}
            <Label>{t.viewing}</Label>
            <div className="mt-2 text-[22px] leading-[1.4] font-semibold text-ink-0">{groupLabel(view.key, locale)}</div>
            <div className="text-[14px] leading-normal text-ink-2">
              {view.key === "overall"
                ? t.scopeLineOverall(corpus.client_count, corpus.rows_used)
                : t.scopeLineGroup(corpus.client_count, corpus.rows_used)}
            </div>
            <TierTable t={t} scope={view.scope} scopeKey={view.key} selected={selected?.key ?? null} />
          </section>
          {selected ? <ModelDrawer t={t} scope={view.scope} model={selected} /> : null}
        </div>
      </div>
      <Analysis artifact={artifact} scope={view.scope} scopeKey={view.key} locale={locale} />
    </>
  );
}
