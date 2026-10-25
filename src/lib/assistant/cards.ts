import type { Locale } from '../../i18n/config';
import type { AssistantCommandCard } from '../../components/assistant/types';
import { COMMAND_ORDER, getCommand, getCommandLinks } from '../../components/commands/commands';
import { REFERENCE_ONLY_IDS } from './catalog';
import { flagLabel, getEntry, ownOptions } from '../commands/reference';

const GROUP_SUMMARIES: Record<string, Record<Locale, string>> = {
  rag: { ko: '등록한 문서를 검색하고 컬렉션·MCP 연결·공유 권한을 관리합니다.', en: 'Search registered documents and manage collections, MCP connections and sharing.' },
  cluster: { ko: '여러 Mac을 묶어 모델을 제공하고 노드·모델·게이트웨이 토큰을 관리합니다.', en: 'Serve models across multiple Macs and manage nodes, model placement and gateway tokens.' },
  engine: { ko: 'Ollama·LM Studio 같은 실행 앱의 설치·상태·업데이트·제거를 관리합니다.', en: 'Manage installation, status, updates and removal of local runner applications.' },
  setting: { ko: '공유 정책·메모리 보호·에이전트 연결·자동 실행 등 OMM 설정을 관리합니다.', en: 'Manage sharing policies, memory protection, agent connections and startup settings.' },
};

/** One authoritative compact projection for both the dock and API consumers. */
export function getAssistantCards(locale: Locale): readonly AssistantCommandCard[] {
  const links = new Map(getCommandLinks(locale).map((link) => [link.slug, link]));

  // Only this compact, server-built projection crosses the RSC boundary. The
  // client never uses command strings, URLs, or options returned by the model.
  const cards: readonly AssistantCommandCard[] = COMMAND_ORDER.map((id) => {
    const command = getCommand(id, locale);
    const link = links.get(id);
    const visibleOptions = command.options.slice(0, 3).map((option) =>
      option.argument ? `${option.name} ${option.argument}` : option.name,
    );

    const group = getEntry(id)?.kind === "group";
    return {
      id,
      name: group ? `omm ${id}` : command.name,
      summary: GROUP_SUMMARIES[id]?.[locale] ?? link?.summary ?? command.lede,
      href: link?.href ?? `/commands/${id}`,
      example: group ? `omm ${id} --help` : command.examples[0]?.command ?? command.name,
      options: visibleOptions,
      remainingOptionCount: Math.max(0, command.options.length - visibleOptions.length),
      risk: command.risk,
    };
  });

  // Commands the CLI exports with no written page yet: the CLI's own summary
  // and generated reference page. Known group risks are conservative; new
  // unclassified groups remain explicitly unclassified.
  const referenceCards: readonly AssistantCommandCard[] = REFERENCE_ONLY_IDS.flatMap(
    (id) => {
      const entry = getEntry(id);
      if (!entry) return [];
      const own = ownOptions(entry);
      const visibleOptions = own.slice(0, 3).map(flagLabel);
      return [
        {
          id,
          name: `omm ${id}`,
          summary: GROUP_SUMMARIES[id]?.[locale] ?? entry.summary,
          href: `/commands/${id}`,
          example: entry.kind === "group" ? `omm ${id} --help` : entry.usage,
          options: visibleOptions,
          remainingOptionCount: Math.max(0, own.length - visibleOptions.length),
          risk: id === "rag" || id === "cluster" ? "high-impact" as const : null,
        },
      ];
    },
  );

  return [...cards, ...referenceCards];
}
