import type { ModelTask, ModelView, WikiModel } from "./types";

const TASK_TERMS: Record<ModelTask, string> = {
  agents: "agent agents tool tools 에이전트 도구 자동화",
  coding: "coding code programming 코딩 코드 프로그래밍 개발",
  reasoning: "reasoning math logic 추론 수학 논리",
  vision: "vision image video multimodal 비전 이미지 영상 사진 멀티모달",
  multilingual: "multilingual translation language 다국어 번역 언어",
  compact: "compact small lightweight 경량 소형 작은",
};

function normalize(value: string): string {
  // Preserve decimal version separators: Qwen3.8 is not Qwen3-8B.
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}.]+/gu, "");
}

/** Literal bounded lookup, shared by the UI and API; no model or network calls. */
export function filterModels<T extends WikiModel | ModelView>(
  models: readonly T[],
  options: { readonly query?: string; readonly task?: ModelTask; readonly publisher?: string; readonly visionOnly?: boolean } = {},
): T[] {
  const terms = (options.query ?? "").slice(0, 160).split(/\s+/).map(normalize).filter(Boolean);
  return models.filter((model) => {
    if (options.task && !model.tasks.includes(options.task)) return false;
    if (options.publisher && model.publisher !== options.publisher) return false;
    if (options.visionOnly && !model.inputs.includes("image")) return false;
    const summary = typeof model.summary === "string" ? model.summary : Object.values(model.summary).join(" ");
    const text = normalize([model.name, model.repository, model.publisher, ...model.aliases, summary, ...model.tasks.map((task) => TASK_TERMS[task])].join(" "));
    return terms.every((term) => text.includes(term));
  });
}
