import type { Locale } from "../../i18n/config";
import type { Localized, ModelSource, ModelView, WikiModel } from "./types";

export const MODEL_WIKI_VERSION = "2026-10-02.2";
export const MODEL_WIKI_REVIEWED_AT = "2026-10-01";
const l = (en: string, ko: string): Localized => ({ en, ko });
const card = (repository: string): ModelSource => ({
  id: "card", title: `${repository} · Model card`,
  url: `https://huggingface.co/${repository}`, accessedAt: MODEL_WIKI_REVIEWED_AT,
});
const config = (repository: string): ModelSource => ({
  id: "config", title: `${repository} · config.json`,
  url: `https://huggingface.co/${repository}/blob/main/config.json`, accessedAt: MODEL_WIKI_REVIEWED_AT,
});

/** Curated seed set. Order is editorial, never a performance ranking.
 * Keep each version separate; publisher claims are not OMM measurements. */
export const WIKI_MODELS: readonly WikiModel[] = [
  {
    id: "qwen3-8-27b", name: "Qwen3.8-27B", publisher: "Qwen", repository: "Qwen/Qwen3.8-27B",
    aliases: ["Qwen 3.8", "Qwen3.8", "큐웬 3.8", "퀀 3.8"],
    tasks: ["agents", "coding", "reasoning", "vision"], architecture: "dense", sizeLabel: "27B", activeParametersB: null,
    context: { tokens: 262144, basis: "native", extendedTokens: 1000000, sourceId: "card" },
    inputs: ["text", "image", "video"], toolCalling: true,
    license: { label: "Apache 2.0", url: "https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE" },
    summary: l("Multi-step agents with native image and video understanding.", "여러 단계의 에이전트 작업과 이미지·영상 이해를 함께 다루는 모델."),
    chooseWhen: l("Consider for agents that inspect visual inputs and act on feedback.", "화면이나 문서를 보고, 도구 실행 결과를 반영해 다음 작업을 이어가는 에이전트에 검토하세요."),
    strengths: [
      { text: l("Publisher reports improved planning and recovery in long-horizon tasks.", "개발사는 장기 작업의 계획 수립과 실행 피드백 처리 개선을 보고합니다."), basis: "publisher", sourceId: "card" },
      { text: l("Native vision; thinking depth is configurable.", "이미지·영상을 입력받고 추론 깊이를 조절할 수 있습니다."), basis: "publisher", sourceId: "card" },
    ],
    cautions: [{ text: l("Hosted built-in tools are not automatically included in local weights.", "호스팅 서비스의 내장 도구가 로컬 가중치에 그대로 포함되는 것은 아닙니다."), basis: "editorial" }],
    runtimeNote: l("Verify the runner, quantization, vision adapter and tool parser separately. Extended context needs configuration.", "러너·양자화·비전 어댑터·도구 파서를 각각 확인하세요. 확장 컨텍스트에는 별도 설정이 필요합니다."),
    sources: [card("Qwen/Qwen3.8-27B")], reviewedAt: MODEL_WIKI_REVIEWED_AT, ommEvaluation: null,
  },
  {
    id: "qwen3-coder-next", name: "Qwen3-Coder-Next", publisher: "Qwen", repository: "Qwen/Qwen3-Coder-Next",
    aliases: ["Qwen Coder", "큐웬 코더", "코딩 에이전트"],
    tasks: ["coding", "agents"], architecture: "moe", sizeLabel: "80B", activeParametersB: 3,
    context: { tokens: 262144, basis: "native", sourceId: "card" }, inputs: ["text"], toolCalling: true,
    license: { label: "Apache 2.0", url: "https://huggingface.co/Qwen/Qwen3-Coder-Next" },
    summary: l("A specialist for coding agents, tools and repository work.", "코딩 에이전트의 도구 사용과 저장소 작업에 초점을 맞춘 모델."),
    chooseWhen: l("Consider for code edits and debugging loops across a repository.", "저장소를 읽고 코드를 수정하며 실행 오류를 해결하는 개발 에이전트에 검토하세요."),
    strengths: [
      { text: l("Trained for complex tool use and recovery from execution failures.", "복잡한 도구 사용과 실행 실패 후 복구를 목표로 학습했습니다."), basis: "publisher", sourceId: "card" },
      { text: l("80B total, 3B active parameters; non-thinking output only.", "전체 80B 중 3B가 활성화되는 MoE이며, 출력은 non-thinking 방식입니다."), basis: "publisher", sourceId: "card" },
    ],
    cautions: [{ text: l("3B active does not mean 3B of weights to store or load.", "활성 파라미터 3B를 저장·로딩해야 할 전체 가중치 크기로 해석하면 안 됩니다."), basis: "editorial" }],
    runtimeNote: l("Check full weight size and the qwen3_coder tool parser. Reduce context if memory is tight.", "전체 가중치 크기와 qwen3_coder 도구 파서를 확인하세요. 메모리가 부족하면 컨텍스트를 줄이세요."),
    sources: [card("Qwen/Qwen3-Coder-Next")], reviewedAt: MODEL_WIKI_REVIEWED_AT, ommEvaluation: null,
  },
  {
    id: "glm-4-7-flash", name: "GLM-4.7-Flash", publisher: "Z.ai", repository: "zai-org/GLM-4.7-Flash",
    aliases: ["GLM Flash", "지엘엠", "GLM 4.7"],
    tasks: ["agents", "coding", "reasoning"], architecture: "moe", sizeLabel: "30B", activeParametersB: 3,
    context: { tokens: 202752, basis: "config", sourceId: "config" }, inputs: ["text"], toolCalling: true,
    license: { label: "MIT", url: "https://huggingface.co/zai-org/GLM-4.7-Flash" },
    summary: l("A 30B MoE option for coding and tool-driven tasks.", "코딩과 도구를 사용하는 작업에 검토할 수 있는 30B MoE 모델."),
    chooseWhen: l("Compare with coding-agent candidates when a 30B weight footprint is practical.", "30B 가중치를 운용할 수 있는 환경에서 코딩 에이전트 후보를 비교할 때 검토하세요."),
    strengths: [
      { text: l("Publisher evaluates coding, reasoning and agent benchmarks.", "개발사는 코딩·추론·에이전트 벤치마크 결과를 공개합니다."), basis: "publisher", sourceId: "card" },
      { text: l("Multi-turn agent evaluations use preserved thinking.", "여러 턴의 에이전트 평가에는 추론 내용 보존 설정을 사용합니다."), basis: "publisher", sourceId: "card" },
    ],
    cautions: [{ text: l("Published benchmarks use different prompts and settings; they are not a universal ranking.", "공개 점수는 프롬프트와 설정이 서로 달라 단일 순위로 비교하기 어렵습니다."), basis: "editorial" }],
    runtimeNote: l("Check architecture support and tool/thinking parsers in the exact runner version.", "사용할 러너의 정확한 버전에서 아키텍처 지원과 도구·추론 파서를 확인하세요."),
    sources: [card("zai-org/GLM-4.7-Flash"), config("zai-org/GLM-4.7-Flash")], reviewedAt: MODEL_WIKI_REVIEWED_AT, ommEvaluation: null,
  },
  {
    id: "qwen3-8b", name: "Qwen3-8B", publisher: "Qwen", repository: "Qwen/Qwen3-8B",
    aliases: ["Qwen 3 8B", "큐웬 8B", "번역", "translation"],
    tasks: ["multilingual", "reasoning", "compact"], architecture: "dense", sizeLabel: "8.2B", activeParametersB: null,
    context: { tokens: 32768, basis: "native", extendedTokens: 131072, sourceId: "card" }, inputs: ["text"], toolCalling: true,
    license: { label: "Apache 2.0", url: "https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE" },
    summary: l("A smaller multilingual model with switchable thinking.", "추론 모드를 켜고 끌 수 있는 소형 다국어 모델."),
    chooseWhen: l("Consider for multilingual chat and translation with optional reasoning.", "다국어 대화·번역에 쓰면서 필요할 때만 추론 모드를 켜려는 경우 검토하세요."),
    strengths: [
      { text: l("Supports thinking and non-thinking modes in one checkpoint.", "하나의 체크포인트에서 thinking·non-thinking 모드를 지원합니다."), basis: "publisher", sourceId: "card" },
      { text: l("Publisher reports support for over 100 languages and dialects.", "개발사는 100개 이상의 언어·방언 지원을 명시합니다."), basis: "publisher", sourceId: "card" },
    ],
    cautions: [{ text: l("Multilingual coverage alone does not establish Korean quality for your task.", "다국어 지원만으로 특정 작업의 한국어 품질이 입증되지는 않습니다."), basis: "editorial" }],
    runtimeNote: l("Native context is 32,768 tokens; 131,072 requires YaRN. Match the chat template to thinking mode.", "기본 컨텍스트는 32,768토큰이며 131,072토큰은 YaRN 설정이 필요합니다. 추론 모드에 맞는 채팅 템플릿을 쓰세요."),
    sources: [card("Qwen/Qwen3-8B")], reviewedAt: MODEL_WIKI_REVIEWED_AT, ommEvaluation: null,
  },
  {
    id: "gemma-3-4b-it", name: "Gemma 3 4B IT", publisher: "Google", repository: "google/gemma-3-4b-it",
    aliases: ["Gemma3", "젬마", "이미지", "사진", "image"],
    tasks: ["vision", "multilingual", "compact"], architecture: "dense", sizeLabel: "4B", activeParametersB: null,
    context: { tokens: 131072, basis: "native", sourceId: "card" }, inputs: ["text", "image"], toolCalling: null,
    license: { label: "Gemma terms", url: "https://ai.google.dev/gemma/terms" },
    summary: l("Compact image understanding and multilingual text generation.", "작은 크기로 이미지 이해와 다국어 텍스트 생성을 다루는 모델."),
    chooseWhen: l("Consider for image questions and summaries in a smaller model class.", "작은 모델로 사진에 질문하거나 문서를 요약하려는 경우 검토하세요."),
    strengths: [
      { text: l("The 4B checkpoint accepts text and images, and generates text.", "4B 체크포인트는 텍스트·이미지를 입력받아 텍스트를 생성합니다."), basis: "publisher", sourceId: "card" },
      { text: l("Publisher reports coverage of over 140 languages.", "개발사는 140개 이상의 언어 지원을 명시합니다."), basis: "publisher", sourceId: "card" },
    ],
    cautions: [{ text: l("Open weights under Gemma terms, not Apache/MIT. The 1B variant has different vision/context support.", "Apache·MIT 대신 Gemma 이용약관이 적용됩니다. 1B 모델은 비전·컨텍스트 조건이 다릅니다."), basis: "publisher", sourceId: "card" }],
    runtimeNote: l("Vision needs the matching adapter. Original HF files require accepting Gemma terms.", "비전 입력에는 맞는 어댑터가 필요합니다. HF 원본 파일은 Gemma 이용약관 동의가 필요합니다."),
    sources: [card("google/gemma-3-4b-it")], reviewedAt: MODEL_WIKI_REVIEWED_AT, ommEvaluation: null,
  },
  {
    id: "phi-4-mini-instruct", name: "Phi-4-mini-instruct", publisher: "Microsoft", repository: "microsoft/Phi-4-mini-instruct",
    aliases: ["Phi4", "파이", "경량", "lightweight", "수학", "math"],
    tasks: ["compact", "reasoning"], architecture: "dense", sizeLabel: "3.8B", activeParametersB: null,
    context: { tokens: 131072, basis: "native", sourceId: "card" }, inputs: ["text"], toolCalling: true,
    license: { label: "MIT", url: "https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/LICENSE" },
    summary: l("A small model focused on instructions, math and logic.", "지시 수행과 수학·논리에 초점을 맞춘 소형 모델."),
    chooseWhen: l("Consider for resource-constrained text tasks and short reasoning problems.", "자원이 제한된 환경의 텍스트 작업과 짧은 수학·논리 문제에 검토하세요."),
    strengths: [
      { text: l("3.8B parameters; intended for constrained and latency-sensitive workloads.", "3.8B 크기로 메모리·연산량과 지연시간이 제한된 환경을 목표로 합니다."), basis: "publisher", sourceId: "card" },
      { text: l("Provides a dedicated function-calling prompt format.", "함수 호출을 위한 전용 프롬프트 형식을 제공합니다."), basis: "publisher", sourceId: "card" },
    ],
    cautions: [{ text: l("Publisher notes limited factual knowledge; retrieval can help. Language quality varies.", "개발사는 사실 지식의 한계를 명시합니다. 검색을 결합할 수 있고 언어별 품질은 다를 수 있습니다."), basis: "publisher", sourceId: "card" }],
    runtimeNote: l("Use its documented chat/tool template. This checkpoint is text-only, distinct from Phi multimodal models.", "문서에 명시된 채팅·도구 템플릿을 사용하세요. Phi 멀티모달 모델과 구별되는 텍스트 전용 체크포인트입니다."),
    sources: [card("microsoft/Phi-4-mini-instruct")], reviewedAt: MODEL_WIKI_REVIEWED_AT, ommEvaluation: null,
  },
  {
    id: "deepseek-r1-distill-qwen-7b", name: "DeepSeek-R1-Distill-Qwen-7B", publisher: "DeepSeek", repository: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    aliases: ["DeepSeek R1 7B", "딥시크", "증류", "수학", "math"],
    tasks: ["reasoning", "compact"], architecture: "dense", sizeLabel: "7B class", activeParametersB: null,
    context: { tokens: 131072, basis: "config", sourceId: "config" }, inputs: ["text"], toolCalling: null,
    license: { label: "MIT · Qwen-derived", url: "https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B#7-license" },
    summary: l("R1-style reasoning distilled into a smaller Qwen checkpoint.", "R1의 추론 데이터를 작은 Qwen 체크포인트에 증류한 모델."),
    chooseWhen: l("Consider for step-by-step math and reasoning experiments on smaller hardware.", "작은 모델로 단계별 수학·추론 풀이를 실험하려는 경우 검토하세요."),
    strengths: [
      { text: l("Fine-tuned from Qwen2.5-Math-7B using R1-generated data.", "Qwen2.5-Math-7B를 R1이 생성한 데이터로 미세조정했습니다."), basis: "publisher", sourceId: "card" },
      { text: l("Publisher provides separate benchmark results for each distilled size.", "개발사는 각 증류 모델 크기의 평가 결과를 따로 공개합니다."), basis: "publisher", sourceId: "card" },
    ],
    cautions: [{ text: l("The 7B distill is not the full 671B R1; do not inherit its scores or capabilities.", "7B 증류 모델은 전체 671B R1과 다릅니다. 원본의 점수·기능을 그대로 적용하면 안 됩니다."), basis: "editorial" }],
    runtimeNote: l("Publisher recommends temperature 0.5–0.7 and user-prompt instructions instead of a system prompt.", "개발사는 temperature 0.5–0.7과 system prompt 대신 user prompt에 지시를 담는 방식을 권장합니다."),
    sources: [card("deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"), config("deepseek-ai/DeepSeek-R1-Distill-Qwen-7B")], reviewedAt: MODEL_WIKI_REVIEWED_AT, ommEvaluation: null,
  },
];

export function getWikiModel(id: string): WikiModel | undefined {
  return WIKI_MODELS.find((model) => model.id === id);
}

/** Only one locale crosses the client/API boundary. */
export function localizeModel(model: WikiModel, locale: Locale): ModelView {
  return {
    ...model, summary: model.summary[locale], chooseWhen: model.chooseWhen[locale],
    strengths: model.strengths.map((claim) => ({ ...claim, text: claim.text[locale] })),
    cautions: model.cautions.map((claim) => ({ ...claim, text: claim.text[locale] })),
    runtimeNote: model.runtimeNote[locale],
  };
}
