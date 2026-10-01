import type { Locale } from "@/i18n/config";
import { getModelDictionary } from "@/i18n/models";
import type { ModelView } from "@/lib/models/types";

export function ContextValue({ model, locale }: { model: ModelView; locale: Locale }) {
  const t = getModelDictionary(locale);
  const number = new Intl.NumberFormat(locale);
  return (
    <>
      <span className="font-mono text-ink-0">{number.format(model.context.tokens)}</span>
      <span className="ml-2 text-small text-ink-2">{model.context.basis === "native" ? t.native : t.configured}</span>
      {model.context.extendedTokens ? <p className="text-small mt-1 text-ink-2">{number.format(model.context.extendedTokens)} · {t.extended}</p> : null}
    </>
  );
}

export function ModelFacts({ model, locale }: { model: ModelView; locale: Locale }) {
  const t = getModelDictionary(locale);
  const facts = [
    [t.architecture, model.architecture === "moe" ? t.moe : t.dense],
    [t.specs, `${model.sizeLabel} ${t.total}${model.activeParametersB ? ` / ${model.activeParametersB}B ${t.active}` : ""}`],
    [t.context, <ContextValue key="context" model={model} locale={locale} />],
    [t.input, model.inputs.map((input) => t.inputs[input]).join(" / ")],
    [t.tools, model.toolCalling === true ? t.documented : t.unconfirmed],
    [t.license, <a key="license" href={model.license.url} target="_blank" rel="noreferrer" className="text-ink-0 underline decoration-line-1 underline-offset-4 hover:text-accent">{model.license.label} ↗</a>],
    [t.evaluation, t.notMeasured],
  ] as const;
  return (
    <dl className="divide-y divide-line-0 border-y border-line-0">
      {facts.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 py-4 text-small">
        <dt className="text-ink-2">{label}</dt><dd className="min-w-0 text-ink-1">{value}</dd>
      </div>)}
    </dl>
  );
}
