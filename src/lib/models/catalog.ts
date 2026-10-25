import data from '../../data/model-wiki.json';
import type { Locale } from '../../i18n/config';
import type { ModelView, WikiModel } from './types';

export const MODEL_WIKI_VERSION = '2026-10-25.1';
export const MODEL_WIKI_REVIEWED_AT = '2026-10-25';

/** Reviewed checkpoint records. Order is editorial, never a capability rank. */
export const WIKI_MODELS: readonly WikiModel[] = data as readonly WikiModel[];

export function getWikiModel(id: string): WikiModel | undefined {
  return WIKI_MODELS.find((model) => model.id === id);
}

export function localizeModel(model: WikiModel, locale: Locale): ModelView {
  return {
    ...model,
    summary: model.summary[locale], chooseWhen: model.chooseWhen[locale],
    strengths: model.strengths.map((claim) => ({ ...claim, text: claim.text[locale] })),
    cautions: model.cautions.map((claim) => ({ ...claim, text: claim.text[locale] })),
    runtimeNote: model.runtimeNote[locale],
    example: { prompt: model.example.prompt[locale], check: model.example.check[locale] },
  };
}
