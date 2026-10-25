import type { Locale } from './config';

export const USE_CASE_SLUGS = ['model-management', 'local-chat', 'document-search', 'coding-agents', 'mac-cluster'] as const;
export type UseCaseSlug = typeof USE_CASE_SLUGS[number];

type Guide = {
  slug: UseCaseSlug;
  title: string;
  summary: string;
  steps: string[];
  result: string;
  requirement: string;
  command: string;
  href: string;
  link: string;
};

const ko = {
  overview: '내 컴퓨터에서 쓸 AI 모델, 한곳에서 관리하세요.',
  benefitsTitle: '모델을 고를 때부터, 다시 쓸 때까지.',
  benefits: [
    { title: '받기 전에 확인하세요.', body: '모델의 용도와 크기를 비교하고, 내 컴퓨터의 메모리로 실행할 수 있을지 확인합니다.', href: '/models', link: '모델 비교하기' },
    { title: '같은 모델은 한곳에.', body: '모델을 중앙 폴더에 보관하고 지원 앱에 연결합니다. 연결 방식과 저장 공간은 운영체제와 앱에 따라 달라집니다.', href: '/use-cases/model-management', link: '모델 관리 살펴보기' },
    { title: '할 일에 맞게 연결하세요.', body: '로컬 대화부터 문서 검색, 코딩 에이전트 연결까지. 필요한 작업의 준비 과정과 사용법을 확인하세요.', href: '/use-cases', link: '활용법 보기' },
  ],
  startTitle: '내 컴퓨터에서 시작해 보세요.',
  startBody: '운영체제에 맞는 설치 방법을 고른 뒤, 사용할 앱과 모델을 준비하세요.',
  useCasesTitle: 'OMM으로 무엇을 할 수 있나요?',
  useCasesIntro: '하려는 일을 고르면 준비할 것과 실행 순서를 확인할 수 있습니다.',
  chooseUseCase: '활용법 목록',
  stepsTitle: '이 순서로 시작하세요',
  resultTitle: '실행한 뒤 확인할 것',
  requirementsTitle: '시작 전에 준비할 것',
  nextTitle: '명령어와 자세한 설명',
  versionNote: '활용법은 현재 main 개발 소스를 기준으로 작성했습니다. 설치한 버전에서 해당 명령과 옵션을 지원하는지 도움말과 릴리스 기록을 확인하세요.',
  docsTitle: '설치부터 문제 해결까지.',
  docsIntro: '처음이라면 설치 가이드부터 읽으세요. 이미 사용 중이라면 필요한 명령이나 문제 해결 방법으로 바로 이동할 수 있습니다.',
  docsSections: [
    { title: '처음 시작하기', body: '설치 방법을 고르고, 사용할 앱과 첫 모델을 준비합니다.', links: [{ href: '/install', label: '운영체제별 설치' }, { href: '/commands/setup', label: '처음 설정하기' }, { href: '/use-cases/local-chat', label: '첫 대화 시작하기' }] },
    { title: '사용 중에 찾아보기', body: '명령어의 입력 방법과 옵션, 파일 저장 위치를 확인합니다.', links: [{ href: '/commands', label: '전체 명령어' }, { href: '/docs/storage-location', label: '모델 저장 위치' }, { href: '/docs/supported-platforms', label: '지원 환경' }] },
    { title: '막힌 부분 해결하기', body: '현재 상태를 점검하고, 오류에 맞는 해결 방법을 찾습니다.', links: [{ href: '/commands/doctor', label: '상태 점검' }, { href: '/docs/troubleshooting', label: '문제 해결 가이드' }, { href: '/docs/faq', label: '자주 묻는 질문' }, { href: '/assistant', label: '하고 싶은 일로 명령어 찾기' }] },
  ],
  newsTitle: 'OMM의 변경 사항을 확인하세요.',
  newsIntro: '새 버전의 변경 사항과 알려진 문제를 확인하고, 개선 의견을 남길 수 있습니다.',
  newsLinks: [
    { title: '릴리스 기록', body: '설치할 버전에서 무엇이 달라졌는지 확인하세요.', href: 'https://github.com/omm-hippo/omm/releases' },
    { title: '알려진 문제와 기능 요청', body: '기존 제보를 확인하거나 재현 과정과 함께 의견을 남겨 주세요.', href: 'https://github.com/omm-hippo/omm/issues' },
    { title: '웹사이트 개선 의견', body: '설명이 어렵거나 문서가 잘못된 부분을 알려 주세요.', href: 'https://github.com/omm-hippo/omm.run/issues' },
  ],
  readingTitle: '더 읽어보기',
  readingIntro: '모델 선택과 사용 방법, OMM을 만드는 과정에 관한 글입니다.',
  notionHub: 'OMM 안내서 전체 보기',
  articles: {
    'why-omm': 'OMM은 어떤 문제를 해결하나요?',
    'choosing-models': '내 컴퓨터에 맞는 모델 고르기',
    'runners-and-omm': 'Ollama·LM Studio와 함께 쓰기',
    'document-search': '내 문서에서 답변의 근거 찾기',
    'mac-cluster': '여러 Mac을 연결하기 전에 알아둘 것',
    'dev-notes': 'OMM 개발 노트',
  },
};

const en: typeof ko = {
  overview: 'Manage local AI models in one place.',
  benefitsTitle: 'Choose a model. Keep it useful.',
  benefits: [
    { title: 'Check before downloading.', body: 'Compare model uses and sizes, then estimate whether your computer has enough memory.', href: '/models', link: 'Compare models' },
    { title: 'Keep models in one place.', body: 'Store models in a central folder and link them to supported apps. Linking and storage requirements depend on the OS and app.', href: '/use-cases/model-management', link: 'See model management' },
    { title: 'Connect the tools you need.', body: 'Prepare local chat, document search or a coding agent. Each guide explains what you need and how to start.', href: '/use-cases', link: 'Browse use cases' },
  ],
  startTitle: 'Start on your computer.',
  startBody: 'Choose an installation method for your OS, then prepare an app and a model.',
  useCasesTitle: 'What can you do with OMM?',
  useCasesIntro: 'Choose a task to see the requirements, steps and result to check.',
  chooseUseCase: 'Use case guides',
  stepsTitle: 'Start with these steps',
  resultTitle: 'What to check afterwards',
  requirementsTitle: 'What you need first',
  nextTitle: 'Commands and details',
  versionNote: 'These guides describe the current main development source. Check your installed version’s help and release notes for the available commands and options.',
  docsTitle: 'From installation to troubleshooting.',
  docsIntro: 'Start with the installation guide, or go straight to a command or a troubleshooting topic.',
  docsSections: [
    { title: 'Get started', body: 'Choose an installation method, then prepare an app and your first model.', links: [{ href: '/install', label: 'Install for your OS' }, { href: '/commands/setup', label: 'First-time setup' }, { href: '/use-cases/local-chat', label: 'Start a conversation' }] },
    { title: 'Look something up', body: 'Find command usage, options and model storage locations.', links: [{ href: '/commands', label: 'All commands' }, { href: '/docs/storage-location', label: 'Storage locations' }, { href: '/docs/supported-platforms', label: 'Supported platforms' }] },
    { title: 'Fix a problem', body: 'Check the current state and find the guide for your issue.', links: [{ href: '/commands/doctor', label: 'Run diagnostics' }, { href: '/docs/troubleshooting', label: 'Troubleshooting guide' }, { href: '/docs/faq', label: 'Frequently asked questions' }, { href: '/assistant', label: 'Find a command for your task' }] },
  ],
  newsTitle: 'Keep up with OMM.',
  newsIntro: 'Read release notes, check known issues and share suggestions.',
  newsLinks: [
    { title: 'Release notes', body: 'Check what changed in the version you want to install.', href: 'https://github.com/omm-hippo/omm/releases' },
    { title: 'Known issues and feature requests', body: 'Read existing reports or share an issue with steps to reproduce it.', href: 'https://github.com/omm-hippo/omm/issues' },
    { title: 'Website feedback', body: 'Report unclear explanations or errors in the documentation.', href: 'https://github.com/omm-hippo/omm.run/issues' },
  ],
  readingTitle: 'Further reading',
  readingIntro: 'Articles on choosing models, using OMM and building the project.',
  notionHub: 'Open the OMM handbook',
  articles: {
    'why-omm': 'What problems does OMM solve?',
    'choosing-models': 'Choose a model for your computer',
    'runners-and-omm': 'Use OMM with Ollama and LM Studio',
    'document-search': 'Find sources in your documents',
    'mac-cluster': 'Before you connect multiple Macs',
    'dev-notes': 'OMM development notes',
  },
};

const guides: Record<Locale, Guide[]> = {
  ko: [
    { slug: 'model-management', title: '모델을 한곳에서 관리하기', summary: '내 컴퓨터의 사양을 확인하고, 모델을 찾아 설치한 뒤 지원 앱에 연결합니다.', requirement: 'OMM과 사용할 실행 앱을 설치하세요. 연결 가능한 파일 형식과 방식은 앱·운영체제·파일 시스템에 따라 다릅니다. 링크를 만들 수 없는 환경에서는 파일을 복사해 추가 공간을 사용할 수 있습니다.', steps: ['omm scan으로 메모리와 설치된 앱을 확인합니다.', '모델 위키에서 용도를 비교하고 omm search로 받을 파일을 찾습니다.', 'omm fit으로 메모리 적합성을 확인하고 모델을 설치합니다.', 'omm list와 연결 명령으로 저장 위치와 앱 연결 상태를 확인합니다.'], result: '선택한 모델이 목록에 나타나는지, 사용할 앱에서 인식되는지 확인하세요. 메모리 적합성은 추정이므로 실제 실행도 확인해야 합니다.', command: 'omm scan', href: '/commands/install', link: '모델 설치와 연결 명령어' },
    { slug: 'local-chat', title: '내 컴퓨터에서 AI와 대화하기', summary: '로컬 작업 화면에서 모델을 준비하고, 실제 응답을 확인한 뒤 대화를 시작합니다.', requirement: 'OMM과 Ollama 또는 LM Studio가 필요합니다. 사용할 앱의 로컬 API를 켜고, 설치한 OMM 버전이 로컬 작업 화면을 지원하는지 확인하세요.', steps: ['Ollama 또는 LM Studio의 로컬 API를 켭니다.', 'omm web --open으로 내 컴퓨터의 작업 화면을 엽니다.', '사용할 모델과 설치 내용을 확인하고 준비 작업을 진행합니다.', '선택한 모델의 실제 응답을 확인한 뒤 대화를 시작합니다.'], result: '질문에 답변이 표시되는지 확인하세요. 다운로드 완료만으로 실행을 확인할 수는 없습니다. 모델 이름과 연결된 서버도 함께 확인하세요.', command: 'omm web --open', href: '/commands/web', link: '로컬 작업 화면 사용법' },
    { slug: 'document-search', title: '내 문서에서 필요한 내용 찾기', summary: '문서를 모아 검색하고, 결과와 함께 원문 위치를 확인합니다.', requirement: '문서 검색을 지원하는 OMM 버전과 해당 파일 형식의 처리 환경이 필요합니다. 검색 결과를 코딩 도구에서 쓰려면 MCP를 연결하세요. 공유 검색에는 클러스터와 접근 토큰 설정이 필요합니다.', steps: ['omm rag 도움말에서 지원하는 파일 형식과 컬렉션 생성 방법을 확인합니다.', '검색할 문서를 컬렉션에 추가하고 처리 결과를 확인합니다.', '질문이나 검색어로 관련 구간을 찾습니다.', '파일명·페이지·원문을 열어 검색 결과의 근거를 확인합니다.'], result: '원하는 문서가 검색되고 원문 위치가 맞는지 확인하세요. 검색 결과를 이용해 만든 답변도 원문과 대조해야 합니다.', command: 'omm rag --help', href: '/commands/rag', link: '문서 검색 명령어' },
    { slug: 'coding-agents', title: '코딩 에이전트에 로컬 모델 연결하기', summary: 'Claude Code·Codex·pi의 연결 설정을 백업하고 로컬 Ollama 모델을 사용하도록 설정합니다.', requirement: '지원하는 코딩 에이전트를 별도로 설치하세요. Ollama 0.14.0 이상과 도구 호출·32K 이상 컨텍스트를 지원하는 모델이 필요합니다. 연결 설정만으로 작업 품질을 보장하지는 않습니다.', steps: ['사용할 에이전트와 Ollama 모델을 준비합니다.', 'omm setting agent 도움말에서 에이전트별 연결 방법을 확인합니다.', '기존 설정을 백업하고 로컬 모델에 연결합니다.', '새 세션에서 서버와 모델을 확인하고 작은 작업을 실행합니다.'], result: '에이전트가 의도한 로컬 서버와 모델을 사용하는지 확인하세요. 원래 연결로 돌아갈 때는 cloud 하위 명령으로 백업한 설정을 복원합니다.', command: 'omm setting agent --help', href: '/commands/setting#agent', link: '에이전트 연결과 복원' },
    { slug: 'mac-cluster', title: '여러 Mac을 모델 서버로 연결하기', summary: '여러 Mac으로 클러스터를 구성하고 연결 상태와 사용 가능한 모델을 확인합니다.', requirement: 'macOS 26.2 이상과 Thunderbolt 네트워크가 필요합니다. RDMA를 사용하려면 OS 빌드도 같아야 합니다. 설정 중 네트워크·방화벽·자동 잠자기를 변경하며 관리자 승인이 필요합니다.', steps: ['각 Mac의 OS와 Thunderbolt 네트워크 구성을 확인합니다.', 'omm cluster 도움말에 따라 클러스터를 만들고 다른 Mac을 참여시킵니다.', '연결 상태와 여유 메모리를 확인하고 실행할 모델을 고릅니다.', '공유할 경우 사용자별 게이트웨이 토큰을 발급하고 접근을 확인합니다.'], result: 'Mac의 참여 상태와 실제 모델 응답을 확인하세요. 장치를 연결한 것만으로 속도나 실행 가능한 모델 크기가 보장되지는 않습니다.', command: 'omm cluster --help', href: '/commands/cluster', link: '클러스터 구성 명령어' },
  ],
  en: [
    { slug: 'model-management', title: 'Manage models in one place', summary: 'Check your hardware, find a model, install it and link it to supported apps.', requirement: 'Install OMM and a supported runner. File formats and linking depend on the app, OS and file system. When links are unavailable, a copy may use additional storage.', steps: ['Run omm scan to inspect memory and installed apps.', 'Compare uses in the wiki and find a file with omm search.', 'Estimate memory fit with omm fit, then install the model.', 'Use omm list and the linking commands to check storage and app connections.'], result: 'Check that the model appears in the list and in your chosen app. Memory fit is an estimate; verify a real model run too.', command: 'omm scan', href: '/commands/install', link: 'Model installation and linking' },
    { slug: 'local-chat', title: 'Chat on your computer', summary: 'Prepare a model in the local workspace, check a real response and start a conversation.', requirement: 'Install OMM and Ollama or LM Studio. Enable the runner’s local API and check that your OMM version supports the local workspace.', steps: ['Enable the local API in Ollama or LM Studio.', 'Open your local workspace with omm web --open.', 'Review the selected model and installation before continuing.', 'Check a real response from that model, then start chatting.'], result: 'Ask a question and check that an answer appears. A finished download does not prove generation works. Confirm the server and model name too.', command: 'omm web --open', href: '/commands/web', link: 'Local workspace guide' },
    { slug: 'document-search', title: 'Search your documents', summary: 'Organize documents into a collection and find passages with their source locations.', requirement: 'Use an OMM version with document search and the dependencies for your file formats. Connect MCP to use search from coding tools. Shared search requires cluster and access-token configuration.', steps: ['Check omm rag help for file formats and collection setup.', 'Add documents to a collection and check processing results.', 'Search for a question or phrase.', 'Open the file, page and source passage to check the result.'], result: 'Verify that the expected document is found and the source location is correct. Compare any answer based on the results with the original text.', command: 'omm rag --help', href: '/commands/rag', link: 'Document search commands' },
    { slug: 'coding-agents', title: 'Connect a coding agent to a local model', summary: 'Back up Claude Code, Codex or pi settings and connect the agent to a local Ollama model.', requirement: 'Install a supported agent separately. You need Ollama 0.14.0+ and a model with tool calling and a context of at least 32K. Connection settings alone do not establish task quality.', steps: ['Prepare the agent and your Ollama model.', 'Read omm setting agent help for the agent-specific connection.', 'Back up the existing settings and connect the local model.', 'Start a new session, check the server and model, and try a small task.'], result: 'Verify that the agent uses the intended local server and model. Use the cloud subcommand to restore the original backed-up settings.', command: 'omm setting agent --help', href: '/commands/setting#agent', link: 'Agent connection and restore' },
    { slug: 'mac-cluster', title: 'Connect Macs as a model server', summary: 'Build a cluster, check its connections and choose a model for the available memory.', requirement: 'You need macOS 26.2+ and Thunderbolt networking. RDMA also requires the same OS build. Setup changes network, firewall and automatic-sleep settings and requires administrator approval.', steps: ['Check each Mac’s OS and Thunderbolt network setup.', 'Follow omm cluster help to create the cluster and join other Macs.', 'Inspect connections and available memory before choosing a model.', 'For shared access, issue a gateway token per user and verify access.'], result: 'Check cluster membership and a real model response. Connecting devices alone does not guarantee speed or model capacity.', command: 'omm cluster --help', href: '/commands/cluster', link: 'Cluster setup commands' },
  ],
};

export function getSiteCopy(locale: Locale) { return locale === 'ko' ? ko : en; }
export function getUseCases(locale: Locale): readonly Guide[] { return guides[locale]; }
export function getUseCase(slug: string, locale: Locale) { return guides[locale].find((guide) => guide.slug === slug); }
