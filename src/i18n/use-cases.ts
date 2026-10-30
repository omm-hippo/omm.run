/**
 * The use-case guides: what to run, on which machine, in what order, and what
 * the CLI prints when each step worked.
 *
 * Source: Localfit `origin/main` at 6cb432fb (omm 0.4.86). Quoted CLI output
 * (`check`, `troubles[].message`) is copied verbatim, so it is identical in
 * both languages; `…` marks where a message continues. Every `omm` command in
 * `commands` is checked against src/data/commands.json by
 * tests/use-case-guides.test.ts.
 *
 * In prose fields, `backticks` mark commands, paths and CLI output; the page
 * renders them as <code>.
 */

import type { Locale } from './config';

export const USE_CASE_SLUGS = ['model-management', 'local-chat', 'document-search', 'coding-agents', 'mac-cluster'] as const;
export type UseCaseSlug = typeof USE_CASE_SLUGS[number];

export type GuideStep = {
  title: string;
  /** Which machine runs it, when the guide involves more than one. */
  where?: string;
  body: string;
  commands?: string[];
  notes?: string[];
  /** What the reader should see before moving on. */
  check?: string;
  ref?: { href: string; label: string };
};

export type Guide = {
  slug: UseCaseSlug;
  title: string;
  summary: string;
  /** What the reader has when the guide is done. */
  outcome: string;
  requirements: string[];
  steps: GuideStep[];
  verify: string[];
  troubles: { message: string; fix: string; href?: string }[];
  undo?: { body: string; commands: string[] };
  references: { href: string; label: string }[];
};

const copy = {
  ko: { outcome: '끝나면', check: '넘어가기 전에 확인:', verify: '제대로 됐는지 확인', trouble: '막혔을 때', undo: '되돌리기', more: '자세히', onThisPage: '이 페이지' },
  en: { outcome: 'When you finish:', check: 'Before moving on:', verify: 'Check that it worked', trouble: 'If you get stuck', undo: 'Undo', more: 'Details', onThisPage: 'On this page' },
};

const ko: Guide[] = [
  {
    slug: 'model-management',
    title: '모델을 한곳에서 관리하기',
    summary: '내 컴퓨터에 맞는 모델을 골라 한 번만 받고, 설치된 실행 앱 모두에서 쓰도록 연결합니다.',
    outcome: '모델 파일 하나가 omm 허브(`~/.omm/models`)에 있고, Ollama·LM Studio 같은 실행 앱에서 따로 받지 않아도 그 모델이 보입니다.',
    requirements: [
      'OMM과 실행 앱 하나 이상. omm이 연결하는 앱: Ollama, LM Studio, Jan, AnythingLLM, Msty, text-generation-webui, KoboldCpp.',
      '모델 파일 크기만큼의 디스크 공간. 모델은 `~/.omm/models`에 GGUF 파일 하나로 보관하며, 위치는 `OMM_HOME`(절대 경로)으로 바꿀 수 있습니다.',
      'macOS·Linux는 심볼릭 링크로 연결해 공간을 더 쓰지 않습니다. 링크를 못 만들면 그 앱은 건너뛰고, 복사하지 않습니다.',
      'Windows는 하드 링크, 심볼릭 링크 순서로 시도하고 둘 다 안 되면 남은 공간을 확인한 뒤 복사합니다. 이때는 공간을 그만큼 더 씁니다.',
      'Ollama가 omm의 연결 형식을 받지 않는 버전이면 `ollama create`로 넘어가며, 이 경우 운영체제와 관계없이 전체 복사가 생깁니다.',
    ],
    steps: [
      {
        title: '내 컴퓨터 상태 확인',
        body: 'RAM과 VRAM, 모델에 쓸 수 있는 안전 예산(Safe model budget), 설치된 실행 앱, 이미 있는 모델과 그 모델을 omm이 관리하는지 보여 줍니다.',
        commands: ['omm scan'],
        notes: [
          '허브 모델 중 아직 앱에 연결되지 않은 것이 있으면 `omm link`를 안내합니다.',
          '허브 밖에서 받은 모델 파일이 있으면 `omm import`를 안내합니다. 가져오면 같은 방식으로 관리됩니다.',
        ],
        check: "`Local AI runners` 목록에 쓸 앱이 보이는지 확인하세요.",
        ref: { href: '/commands/scan', label: 'omm scan' },
      },
      {
        title: '모델 고르기',
        body: '`omm recommend`는 먼저 이 컴퓨터를 모델과 얼마나 나눠 쓸지(Dedicated, Balanced, Minimal) 묻고, 그 기준에 맞는 모델을 보여 줍니다. 목록에서 고르면 바로 설치로 넘어갑니다. 이름을 알고 있다면 `omm search`로 찾으세요. 번호가 붙은 목록이 나오고, 이 컴퓨터에 맞지 않는 모델에는 `(won\'t fit)`이 붙습니다.',
        commands: ['omm recommend', 'omm search <검색어>'],
        check: "search 결과 끝에 `Install with: omm install <number>` 안내가 나옵니다. 번호를 기억해 두세요.",
        ref: { href: '/models', label: '모델 위키에서 용도 비교하기' },
      },
      {
        title: '메모리에 맞는지 확인',
        body: '필요한 메모리는 파일 크기의 1.2배로 추정합니다. 다른 앱이 쓰는 메모리, 운영체제 몫, 설치 상한을 함께 보여 주고 결론을 하나 냅니다.',
        commands: ['omm fit <model>'],
        notes: [
          '`✓ Fits now`: 지금 바로 실행할 수 있습니다.',
          '`! Fits this PC, but not right now`: 다른 앱을 닫으면 들어갑니다.',
          '`✗ Too big for this PC`: 다른 앱을 모두 닫아도 부족합니다. 더 작은 모델이나 양자화를 고르세요.',
        ],
        check: '추정치입니다. 설치한 뒤 실제로 응답하는지도 확인하세요(아래 확인 단계).',
        ref: { href: '/commands/fit', label: 'omm fit' },
      },
      {
        title: '설치하기',
        body: '양자화를 고르는 화면이 나오면 하나를 고르세요. `--quant Q4_K_M`처럼 지정하면 건너뜁니다. 예상 속도를 보여 주고, 이 하드웨어로 실행이 어렵다고 예측되면 `Install anyway?`로 한 번 더 묻습니다. 받은 파일은 SHA-256을 확인한 뒤 허브에 저장하고, 설치된 실행 앱 모두에 연결합니다. 마지막에 Ollama로 짧은 호환성 테스트를 할지 묻습니다.',
        commands: ['omm install <model>'],
        check: '`Ω Installed <file>`과 `Linked into N local runners: …` 가 나오면 끝입니다. 이어서 `Run it now: omm run <file>`을 안내합니다.',
        ref: { href: '/commands/install', label: 'omm install' },
      },
      {
        title: '설치 결과와 연결 확인',
        body: '`omm list`는 허브의 모델과 연결 개수를 보여 줍니다. `omm info`는 실행 앱마다 연결 상태를 한 줄씩 보여 줍니다. Ollama는 `ollama run <tag>`, 다른 앱은 `linked (visible in …)` 또는 `not linked`로 표시됩니다.',
        commands: ['omm list', 'omm info <model>'],
        check: '쓰려는 앱의 줄이 `not linked`가 아니면 됩니다.',
      },
      {
        title: '연결이 빠졌으면 복구',
        body: '인자 없이 실행하면 모든 모델을 모든 실행 앱에 다시 연결합니다. 한 앱만 고치려면 `--engine`을, omm이 만들지 않은 파일이 그 자리에 있어 막혔다면 확인한 뒤 `--force`를 쓰세요. 지원하지 않는 앱에는 `--to <폴더>`로 연결할 수 있습니다.',
        commands: ['omm link', 'omm link --engine <runner>'],
        check: '`N model(s) relinked/verified.` 다음에 나오는 skipped 개수가 0인지 확인하세요.',
        ref: { href: '/commands/link', label: 'omm link' },
      },
    ],
    verify: [
      '`omm list`에 모델이 보입니다.',
      '쓰려는 앱의 모델 목록에도 보입니다(Ollama는 `ollama list`, LM Studio는 내 모델 목록).',
      '`omm verify <model>`을 실행해 `Compatible: local text generation succeeded`가 나옵니다. 다운로드가 끝났다고 해서 실행까지 확인된 것은 아닙니다.',
    ],
    troubles: [
      { message: "Unknown model '<x>'.", fix: '큐레이션 ID, org/repo:file.gguf, HTTPS 주소만 받습니다. `omm search`로 찾은 뒤 `omm install <번호>`로 설치하세요.', href: '/commands/search' },
      { message: 'Not enough disk space: … needs up to X GiB (…) but only Y GiB is free', fix: '그 디스크의 공간을 비우거나, 안내대로 `--skip-unfit`을 붙여 다시 시도하세요.' },
      { message: 'Refusing to replace unowned existing file at …', fix: 'omm이 만들지 않은 파일이 연결할 자리에 있습니다. 그 파일이 필요 없는지 확인한 뒤 `omm link <model> --force`를 실행하세요.', href: '/commands/link' },
      { message: '<x> is not installed via omm.', fix: '이름이 다릅니다. `omm list`에 나오는 이름이나 번호를 쓰세요.' },
      { message: 'This GGUF has no embedded chat template - Ollama will fall back to raw completion', fix: '오류가 아니라 경고입니다. 대화가 어색하면 다른 양자화나 다른 저장소의 파일을 받아 보세요.' },
    ],
    undo: {
      body: '모델 하나를 지우면 실행 앱의 연결과 허브 파일을 함께 지웁니다. 하나만 지울 때는 확인을 묻지 않으므로 `--dry-run`으로 먼저 보세요. 중단된 다운로드나 끊긴 링크는 `omm cleanup`이 정리합니다.',
      commands: ['omm uninstall <model> --dry-run', 'omm uninstall <model>', 'omm cleanup'],
    },
    references: [
      { href: '/commands/install', label: 'omm install 전체 옵션' },
      { href: '/commands/link', label: 'omm link 전체 옵션' },
      { href: '/commands/uninstall', label: 'omm uninstall' },
    ],
  },
  {
    slug: 'local-chat',
    title: '내 컴퓨터에서 AI와 대화하기',
    summary: '설치한 모델이 실제로 답하는지 확인하고, 터미널이나 브라우저 작업 화면에서 대화합니다.',
    outcome: '모델이 이 컴퓨터에서 실제로 답하는 것을 확인했고, 터미널(`omm run`)이나 브라우저(`omm web`)에서 대화할 수 있습니다.',
    requirements: [
      '설치하고 실행 앱에 연결한 모델 하나 이상. 아직 없다면 모델 관리 가이드부터 진행하세요.',
      'Ollama 또는 LM Studio. Ollama API는 http://127.0.0.1:11434, LM Studio 로컬 서버는 http://127.0.0.1:1234입니다.',
      '브라우저 작업 화면의 대화는 Ollama와 LM Studio만 지원합니다.',
    ],
    steps: [
      {
        title: '대화할 모델 확인',
        body: '모델 이름이나 번호를 확인하세요. `omm run`에서 이름을 생략하면 설치된 모델이 하나일 때는 그 모델을 쓰고, 여러 개면 `Which model do you want to run?`으로 묻습니다.',
        commands: ['omm list'],
      },
      {
        title: '터미널에서 대화하기',
        body: '실행 앱은 `--engine`으로 지정한 앱, 설정의 기본 앱, 연결된 앱(Ollama가 먼저) 순서로 정합니다. Ollama라면 이 터미널에서 바로 대화합니다. Ollama가 꺼져 있으면 켤지 묻고 백그라운드로 켭니다.',
        commands: ['omm run <model>', 'omm run <model> --engine <runner>'],
        notes: [
          '대화를 끝내려면 `/bye`를 입력하세요.',
          'LM Studio, Jan, AnythingLLM, Msty는 앱만 열어 줍니다. 앱의 모델 목록에서 직접 고르세요.',
          'KoboldCpp(http://localhost:5001)와 text-generation-webui(http://localhost:7860)는 모델을 올린 채 시작합니다.',
        ],
        check: '첫 줄 `<file> via <Runner> (…)`에서 어떤 앱으로 실행됐는지 확인하세요.',
        ref: { href: '/commands/run', label: 'omm run' },
      },
      {
        title: '실제 응답 확인',
        body: '다운로드가 끝났다고 해서 모델이 실행되는 것은 아닙니다. `omm verify`는 짧은 문장 생성을 실제로 시켜 봅니다.',
        commands: ['omm verify <model>', 'omm verify <model> --engine lmstudio'],
        check: '`Compatible: local text generation succeeded (…)`가 나오면 됩니다.',
        ref: { href: '/commands/verify', label: 'omm verify' },
      },
      {
        title: '브라우저 작업 화면 열기',
        body: '이 컴퓨터(127.0.0.1)에서만 열리는 관리 화면입니다. 포트는 실행할 때마다 비어 있는 번호로 정하므로 주소가 바뀔 수 있습니다. 이미 켜져 있으면 `OMM local manager already running: …`으로 그 주소를 다시 알려 줍니다.',
        commands: ['omm web --open'],
        check: '터미널에 `OMM local manager: http://127.0.0.1:<port>/` 가 나오고 브라우저가 열립니다. 끌 때는 터미널에서 `Ctrl+C`를 누르세요.',
        ref: { href: '/commands/web', label: 'omm web' },
      },
      {
        title: '작업 화면에서 대화 시작',
        body: '연결 상태에서 Ollama 서버 켜기를 누르세요. LM Studio는 앱에서 로컬 서버를 직접 켜야 합니다. 추천 모델의 이 모델로 대화 시작이나, 가진 모델의 대화 준비하고 시작을 누르고 실행 앱을 고르면 실행 앱 안전 점검, 다운로드와 연결, 짧은 실제 응답 확인, 대화 순서로 진행합니다.',
        check: '실행 확인에 실제 응답 문장과 실행 확인 통과가 보여야 대화 창이 열립니다.',
      },
    ],
    verify: [
      '질문에 답이 표시됩니다.',
      '실행된 앱과 모델 이름이 의도한 것과 같습니다(터미널의 `via <Runner>` 줄, 또는 작업 화면의 모델 이름).',
      '`omm verify <model>`에서 Compatible이 나옵니다.',
    ],
    troubles: [
      { message: 'Ollama is not installed or its executable cannot be found.', fix: 'https://ollama.com/download 에서 Ollama를 설치하고 한 번 실행한 뒤 다시 시도하세요.' },
      { message: 'omm run requires the Ollama API at http://localhost:11434.', fix: 'Ollama를 켜라는 질문을 거절했거나 대화형 터미널이 아닙니다. Ollama를 직접 켜거나 -y를 붙여 실행하세요.' },
      { message: 'This model is not linked into any installed runner. Run `omm link` to repair links, or `omm setup` to install a runner.', fix: '`omm link`로 연결을 복구하거나, 실행 앱이 없다면 `omm setup`으로 설치하세요.', href: '/commands/link' },
      { message: '실행 앱의 로컬 서버를 먼저 켜 주세요.', fix: '작업 화면에서 Ollama 서버 켜기를 누르거나, LM Studio 앱에서 로컬 서버를 켜세요.' },
      { message: '다른 모델이 사용 중이에요…', fix: 'omm은 이미 올라간 모델을 내리지 않습니다. 실행 앱에서 그 모델을 내린 뒤 다시 시도하세요.' },
    ],
    references: [
      { href: '/commands/run', label: 'omm run' },
      { href: '/commands/verify', label: 'omm verify' },
      { href: '/commands/web', label: 'omm web' },
    ],
  },
  {
    slug: 'document-search',
    title: '내 문서에서 필요한 내용 찾기',
    summary: '문서를 컬렉션에 넣고 질문으로 관련 구간을 찾습니다. 같은 검색을 코딩 에이전트에도 연결합니다.',
    outcome: '질문하면 파일명, 쪽, 글자 위치와 함께 관련 구간이 나오고, Claude Code 같은 에이전트도 같은 문서를 검색합니다.',
    requirements: [
      '로컬 Ollama(http://127.0.0.1:11434)와 임베딩 모델 `bge-m3`(`ollama pull bge-m3`). 없어도 단어 검색은 되지만 의미 검색은 되지 않습니다.',
      '지원 형식: 텍스트 PDF, TXT, Markdown, HTML, HWPX. 스캔 PDF(OCR), HWP, 암호가 걸린 PDF는 지원하지 않습니다.',
      '한도: 파일당 6 MiB, PDF 100쪽, 문서당 50만 자, 전체 문서 100개·200만 자.',
      '문서와 색인은 `~/.omm/documents/library.sqlite3`에 저장합니다. 임베딩은 로컬 Ollama로만 만들고, 문서와 질문은 이 컴퓨터를 떠나지 않습니다.',
    ],
    steps: [
      {
        title: '준비 상태 확인',
        body: '임베딩 모델과 의미 검색이 준비됐는지 보여 줍니다.',
        commands: ['omm rag status'],
        check: '`Embedding model: bge-m3 (...) - available`과 `Semantic search: ready (...)`가 보이면 됩니다.',
      },
      {
        title: '컬렉션 만들기',
        body: '기본 컬렉션 기본이 항상 있으므로 건너뛰어도 됩니다. 인사규정, 계약서처럼 주제별로 나누면 검색 범위를 좁힐 수 있습니다.',
        commands: ['omm rag collection create <collection>'],
        check: "`'<collection>' 컬렉션을 만들었어요.` 가 나옵니다.",
      },
      {
        title: '문서 추가',
        body: '파일과 폴더를 함께 넣을 수 있고, 폴더는 하위 폴더까지 읽습니다. 같은 이름의 문서를 새 버전으로 바꾸려면 `--replace`를 붙이세요. 지원하지 않는 형식은 건너뛰고 그 개수를 알려 줍니다.',
        commands: ['omm rag add <collection> <folder-or-file>'],
        check: '파일마다 `등록: <file> (구간 N개, 의미+단어 색인)`이 나옵니다. `단어 색인만`이라고 나오면 의미 색인이 만들어지지 않은 것이니 아래 막혔을 때를 보세요.',
      },
      {
        title: '처리 결과 확인',
        body: '문서마다 색인 상태를 보여 줍니다. 다시 색인해야 할 문서가 있으면 `omm rag reindex`를 안내합니다. 임베딩 모델을 바꾼 뒤에도 reindex가 필요합니다.',
        commands: ['omm rag status', 'omm rag reindex'],
        check: '문서 줄이 모두 `semantic index ready`로 끝나면 됩니다.',
      },
      {
        title: '검색하기',
        body: '기본으로 결과 3개를 보여 주며 `--limit`으로 1~10개까지 바꿀 수 있습니다. 결과마다 `[1] <file> (<collection>) · N쪽 · a-b자` 아래에 해당 구간이 나옵니다. 근거를 찾지 못하면 `NO_EVIDENCE`를 출력합니다.',
        commands: ['omm rag search "<question>"', 'omm rag search "<question>" --collection <collection> --limit 5'],
        notes: ['omm은 원본 파일을 열어 주지 않습니다. 결과의 파일명, 쪽, 글자 범위로 원본을 직접 열어 대조하세요.'],
        check: '`검색 방식: 의미+단어`가 보이면 의미 검색까지 쓴 결과입니다.',
      },
      {
        title: '코딩 에이전트에 연결(선택)',
        body: '에이전트 설정에 MCP 서버 `omm-documents`를 추가합니다. 에이전트는 `search_documents`와 `list_collections` 도구로 같은 문서를 검색합니다. 대상은 claude-code, codex, pi, cursor이며, 원래 설정은 `~/.omm/rag-connections/<harness>.json`에 백업합니다.',
        commands: ['omm rag connect claude-code'],
        notes: [
          '바꾸는 파일: Claude Code `~/.claude.json`, Codex `~/.codex/config.toml`, pi `~/.pi/agent/mcp.json`, Cursor `~/.cursor/mcp.json`.',
          '회사 클러스터의 공유 컬렉션을 쓰려면 `omm rag remote set`으로 헤드 Mac을 지정하세요. 그 뒤로는 같은 명령이 헤드의 컬렉션을 씁니다.',
        ],
        check: "`Registered MCP server 'omm-documents' for claude-code in <path>.` 가 나오면 에이전트의 새 세션을 시작하세요.",
        ref: { href: '/use-cases/mac-cluster', label: '여러 Mac 클러스터와 공유 검색' },
      },
    ],
    verify: [
      '찾으려던 문서가 검색 결과에 나옵니다.',
      '결과의 쪽과 글자 범위를 원본에서 열었을 때 같은 내용입니다.',
      '에이전트의 새 세션에서 문서 질문을 했을 때 출처가 함께 나옵니다.',
    ],
    troubles: [
      { message: 'Ollama(http://127.0.0.1:11434)에 연결하지 못했어요. Ollama를 켠 뒤 다시 시도해 주세요.', fix: '추가는 `단어 색인만`으로 끝납니다. Ollama를 켠 뒤 `omm rag reindex`를 실행하세요.' },
      { message: 'Ollama에 임베딩 모델 bge-m3이(가) 없어요.', fix: '`ollama pull bge-m3`으로 받은 뒤 `omm rag reindex`를 실행하세요.' },
      { message: '읽을 수 있는 텍스트가 없어요. 스캔 PDF의 OCR은 아직 지원하지 않아요.', fix: '텍스트를 선택할 수 있는 PDF나 다른 지원 형식으로 바꿔서 넣으세요.' },
      { message: '같은 이름의 문서가 있어요. 교체를 선택해 주세요.', fix: '새 버전으로 바꾸려면 `--replace`를 붙여 다시 추가하세요.' },
      { message: 'Choose claude-code, codex, pi, cursor.', fix: 'rag connect에서는 claude가 아니라 claude-code라고 써야 합니다.' },
    ],
    undo: {
      body: '에이전트 연결은 백업해 둔 원래 설정으로 되돌립니다.',
      commands: ['omm rag disconnect claude-code'],
    },
    references: [
      { href: '/commands/rag', label: 'omm rag 전체 명령' },
      { href: '/commands/rag#connect', label: 'omm rag connect' },
    ],
  },
  {
    slug: 'coding-agents',
    title: '코딩 에이전트에 로컬 모델 연결하기',
    summary: 'Claude Code·Codex·pi가 내 컴퓨터의 Ollama 모델을 쓰도록 바꾸고, 언제든 원래 설정으로 돌아갑니다.',
    outcome: '에이전트가 로컬 Ollama 모델로 동작하고, 원래 설정은 백업되어 명령 한 줄로 되돌릴 수 있습니다.',
    requirements: [
      'Claude Code(claude), Codex(codex), pi 중 하나가 설치되어 PATH에 있어야 합니다.',
      'Ollama 0.14.0 이상.',
      '이 컴퓨터에 받은 모델이어야 합니다. :cloud나 -cloud로 끝나는 태그와 원격 호스트를 가리키는 모델은 거부합니다.',
      '도구 호출(tools)을 지원하고 컨텍스트가 32,768 토큰 이상인 모델(65,536 이상 권장). omm이 연결 전에 Ollama 메타데이터로 확인합니다.',
      '연결은 라우팅 설정만 바꿉니다. 실제 에이전트 작업이 잘 되는지는 omm이 확인하지 않습니다.',
    ],
    steps: [
      {
        title: '도구 호출을 지원하는 모델 준비',
        body: 'Ollama에 모델을 받으세요(`ollama pull <tag>`). 이미 쓰던 모델이면 `ollama list`로 정확한 태그를 확인하세요. 어떤 모델이 맞는지 모르겠다면 모델 위키에서 코딩 용도를 비교하세요.',
        ref: { href: '/models', label: '모델 위키' },
      },
      {
        title: '에이전트 연결',
        body: '하네스는 claude, codex, pi 중 하나입니다. 터미널에서 인자 없이 `omm agent local`을 실행하면 하네스와 모델을 고르는 화면이 나옵니다. Ollama가 기본 주소(http://127.0.0.1:11434)가 아니면 `--base-url`을 붙이세요. omm은 버전, 도구 호출, 컨텍스트를 확인한 뒤 원래 설정을 `~/.omm/agent-connections/<harness>.json`에 백업하고 수정합니다.',
        commands: ['omm agent local claude --model <ollama-model>'],
        notes: [
          'Claude Code: `~/.claude/settings.json`의 model과 `ANTHROPIC_BASE_URL` 등 환경 변수.',
          'Codex: `~/.codex/config.toml`의 model과 `model_provider = "omm-local"`.',
          'pi: `~/.pi/agent/models.json`과 settings.json의 기본 공급자·모델.',
        ],
        check: '`Saved local routing settings for claude. Start a new harness session.` 이 나옵니다.',
        ref: { href: '/commands/agent', label: 'omm agent' },
      },
      {
        title: '연결 상태 확인',
        body: '상태는 unmanaged, local, applying, `changed_or_interrupted` 중 하나입니다.',
        commands: ['omm agent status claude'],
        check: '`claude: local; installed: True` 가 나오면 됩니다.',
      },
      {
        title: '새 세션에서 작은 작업 해 보기',
        body: '에이전트를 새로 열고 파일 하나를 읽고 요약하게 하는 정도의 작은 작업부터 시켜 보세요. omm은 모델 메타데이터만 확인했기 때문에 실제 작업 흐름은 직접 확인해야 합니다. 프로젝트·관리형·셸 설정이 이 사용자 설정을 덮어쓸 수 있으며, 실행 중 컨텍스트는 64K 이상을 권장합니다.',
      },
    ],
    verify: [
      '`omm agent status <harness>`가 local입니다.',
      '새 세션에서 에이전트가 파일을 읽는 등 도구를 써서 답합니다.',
      'Ollama 쪽에서 해당 모델이 실행 중인지 확인합니다(`ollama ps`).',
    ],
    troubles: [
      { message: 'Ollama 0.14.0 or newer is required for agent connections.', fix: 'Ollama를 업데이트하세요.' },
      { message: 'Ollama model inspection failed. Start Ollama and check the installed model tag.', fix: 'Ollama를 켜고 `ollama list`로 태그를 확인한 뒤 `--model`에 그대로 쓰세요.' },
      { message: 'This model does not advertise tool calling. Choose a tool-capable model with omm recommend.', fix: '도구 호출을 지원하는 모델로 바꾸세요.' },
      { message: 'Agent connections require a model context of at least 32768 tokens; 65536+ is recommended.', fix: '컨텍스트가 더 긴 모델을 고르세요.' },
      { message: 'An OMM connection backup already exists. Restore with agent cloud before switching again.', fix: '먼저 `omm agent cloud <harness>`로 되돌린 뒤 다시 연결하세요.' },
      { message: 'claude is not installed or is not on PATH. Install the harness first.', fix: '에이전트를 설치하고 새 터미널에서 다시 실행하세요.' },
    ],
    undo: {
      body: '연결한 뒤 설정 파일을 손대지 않았다면 원래 파일을 그대로 되돌리고, 손댔다면 omm이 바꾼 항목만 되돌립니다. `Original routing restored. Start a new harness session.` 이 나오면 새 세션을 여세요.',
      commands: ['omm agent cloud claude'],
    },
    references: [
      { href: '/commands/agent', label: 'omm agent 전체 옵션' },
      { href: '/commands/rag#connect', label: '에이전트에 문서 검색도 연결하기' },
    ],
  },
  {
    slug: 'mac-cluster',
    title: '여러 Mac을 모델 서버로 연결하기',
    summary: 'Thunderbolt로 묶은 Mac들을 exo 클러스터 하나로 만들고, 직원이 토큰으로 접속하게 합니다.',
    outcome: '여러 Mac의 메모리를 합쳐 큰 모델 하나를 서비스하고, 직원 PC는 게이트웨이(https://<헤드 IP>:52440)로 모델과 공유 문서 검색을 씁니다.',
    requirements: [
      '클러스터에 들어갈 모든 Mac이 macOS 26.2 이상. 직원 PC는 운영체제와 관계없습니다.',
      'Thunderbolt 5 케이블로 모든 Mac을 서로 직접 연결(풀 메시). Mac마다 다른 Mac 수만큼 포트가 필요합니다.',
      'RDMA를 쓰려면 모든 Mac의 macOS 빌드가 정확히 같아야 합니다. 켜는 방법: 복구 모드 터미널에서 `rdma_ctl enable` 후 재시동.',
      'exo는 Homebrew로 설치합니다(`brew install --cask exo`). Homebrew가 없으면 exo를 직접 설치하세요.',
      '각 Mac의 관리자 암호. omm이 이 Mac에서 바꾸는 것: Thunderbolt Bridge를 포트별 DHCP 서비스로 교체, 방화벽(pf) 규칙 추가로 exo 포트 52415/52416을 사무실 네트워크에서 막고 게이트웨이 포트 52440을 엶, 이 Mac의 모든 앱에 대해 TCP 49153–65535 차단, 유휴 잠자기 끔, 백그라운드 서비스 등록.',
    ],
    steps: [
      {
        title: '헤드 Mac 만들기',
        where: '헤드 Mac',
        body: '이 Mac이 클러스터의 중심이 되고 직원용 게이트웨이를 엽니다. macOS가 exo 실행 허가를 화면에서 기다릴 수 있으니 헤드 Mac 화면을 지켜보세요. 이미 다른 클러스터의 멤버라면 먼저 `omm cluster leave`가 필요합니다.',
        commands: ['omm cluster init'],
        notes: ['출력의 `Run this on every other Mac:` 아래에 `omm cluster join omm-…` 줄이 나옵니다. 다음 단계에서 그대로 씁니다.', '직원 연결용 `omm rag remote set https://<ip>:52440` 줄과 인증서 지문도 함께 나옵니다.'],
        check: '`exo is running on this Mac (cluster …)`와 `RDMA over Thunderbolt: enabled.` 를 확인하세요.',
      },
      {
        title: '나머지 Mac 참여',
        where: '나머지 Mac 각각',
        body: '헤드가 출력한 클러스터 이름으로 참여합니다. 어떤 Mac에서든 `omm cluster`만 입력하면 그 Mac의 다음 단계를 안내하고, `Run it now?`에 동의하면 대신 실행합니다.',
        commands: ['omm cluster join <cluster-name>', 'omm cluster'],
        check: '`This Mac joined the cluster. Check it from the head Mac with: omm cluster status`',
      },
      {
        title: '연결 상태 확인',
        where: '헤드 Mac',
        body: '노드, 메모리, RDMA, 방화벽, 게이트웨이, 문서 검색 상태와 문제를 보여 줍니다. 켜져 있는데 목록에 없는 Mac이 있으면 그 Mac과 헤드에서 restart를 실행하세요. 약 15초 뒤 다시 찾습니다.',
        commands: ['omm cluster status', 'omm cluster restart'],
        check: '모든 노드에 `RDMA enabled`와 같은 macOS가 보이고, 마지막 줄이 `No problems found.` 이면 됩니다.',
        ref: { href: '/commands/cluster#status', label: 'omm cluster status' },
      },
      {
        title: '모델 올리기',
        where: '헤드 Mac',
        body: 'recommend는 클러스터 여유 메모리의 85% 안에 드는 큰 모델을 보여 줍니다. install은 모든 Mac에 파일을 받기만 하고, load가 메모리에 올립니다. `--sharding tensor|pipeline`과 `--macs N`은 생략하면 omm이 고릅니다. 한 Mac에만 올리려면 `--on <Mac>`을 쓰며, 앞의 두 옵션과 함께 쓸 수 없습니다. 가능한 배치는 `omm cluster info <model>`로 볼 수 있습니다.',
        commands: ['omm cluster recommend', 'omm cluster install <model>', 'omm cluster load <model>'],
        check: '`Serving <model> at https://<ip>:52440` 이 나오면 직원이 쓸 수 있습니다.',
      },
      {
        title: '실제 응답과 속도 확인',
        where: '헤드 Mac',
        body: 'run으로 터미널에서 대화해 보고 `/bye`로 나옵니다. benchmark는 첫 토큰 시간과 초당 토큰 수를 잽니다(결과는 업로드하지 않습니다).',
        commands: ['omm cluster run <model>', 'omm cluster benchmark <model>'],
        check: '`<model>: first token X s, Y tok/s (…)` 형태로 숫자가 나옵니다.',
      },
      {
        title: '직원마다 토큰 발급',
        where: '헤드 Mac',
        body: '이름은 영문, 숫자, ., -, _로 1~40자입니다. 토큰은 한 번만 보여 주므로 안전한 방법으로 바로 전달하세요. 목록은 `omm cluster token list`로 봅니다.',
        commands: ['omm cluster token add <name>'],
        check: '`Token for <name>: omm_…` 와 `Store it now - omm cannot show it again.` 이 나옵니다.',
      },
      {
        title: '직원 PC 연결',
        where: '직원 PC',
        body: '토큰은 숨김 입력으로 받아 셸 기록에 남지 않습니다. 화면에 나오는 헤드 인증서 지문 (SHA-256)을 헤드의 `omm cluster status`에 있는 `Gateway certificate (SHA-256)`과 비교한 뒤 연결하세요. 이후 `omm cluster status`, list, run, benchmark가 게이트웨이를 거쳐 동작합니다. 코딩 에이전트를 클러스터 모델에 연결하려면 이 단계가 먼저 필요하고, 모델 컨텍스트는 32K 이상이어야 합니다.',
        commands: ['omm rag remote set https://<head-ip>:52440', 'omm agent cluster claude --model <exo-model>'],
        check: '에이전트 연결 뒤 `Saved cluster routing settings for …` 가 나옵니다.',
        ref: { href: '/commands/rag#remote', label: 'omm rag remote' },
      },
    ],
    verify: [
      '헤드의 `omm cluster status` 마지막 줄이 `No problems found.` 입니다.',
      '`omm cluster benchmark <model>`이 숫자를 출력합니다.',
      '직원 PC에서 `omm cluster run <model>`로 답을 받습니다.',
    ],
    troubles: [
      { message: "exo has not answered for 60 seconds. macOS may be holding exo until someone approves it on this Mac's screen…", fix: '그 Mac 화면에서 허용 또는 열기를 누른 뒤 `omm cluster restart`를 실행하세요.' },
      { message: 'exo on this Mac sees no other Mac. … allow exo under System Settings > Privacy & Security > Local Network', fix: '각 Mac의 시스템 설정 > 개인정보 보호 및 보안 > 로컬 네트워크에서 exo를 허용하고 `omm cluster restart`를 실행하세요.' },
      { message: 'no Thunderbolt link between A and B', fix: '두 Mac 사이 케이블을 확인하고 각 Mac에서 `omm cluster restart`를 실행하세요.' },
      { message: 'macOS versions differ: … Update macOS to <build> on <Macs>, one Mac at a time', fix: '안내된 Mac을 한 대씩 같은 빌드로 업데이트하세요. `RDMA disabled on X`가 나오면 그 Mac에서 `rdma_ctl enable`을 실행하세요.' },
      { message: "The cluster head rejected your token. Ask the head Mac's admin for a new one (omm cluster token add <name>), then run: omm rag remote set <head address>", fix: '토큰이 취소됐거나 틀렸습니다. 헤드 관리자에게 새 토큰을 받아 다시 연결하세요.' },
      { message: "the head's address changed from … to …; on each employee PC run omm rag remote set https://<new>:52440", fix: '직원마다 새 주소로 다시 연결하세요. 네트워크 관리자에게 헤드의 DHCP 주소 예약을 요청하면 반복되지 않습니다.' },
    ],
    undo: {
      body: 'unload는 메모리만 비우고, `omm cluster uninstall <model>`은 모든 Mac에서 파일을 지웁니다. token revoke는 즉시 막습니다. 직원 PC는 `omm agent cloud`와 `omm rag remote clear`로 되돌립니다. leave는 방화벽, Thunderbolt Bridge, 잠자기, 앱 방화벽 설정과 서비스를 원래대로 돌리며, 직원 토큰은 남겨 둡니다. exo 앱 자체는 메뉴 막대 아이콘 → Advanced → Uninstall로 지웁니다. 헤드 역할을 다른 Mac으로 옮기려면 `omm cluster handover <Mac>`을 쓰고, 토큰은 새 헤드에서 다시 발급하세요.',
      commands: ['omm cluster unload <model>', 'omm cluster token revoke <name>', 'omm cluster leave'],
    },
    references: [
      { href: '/commands/cluster', label: 'omm cluster 전체 명령' },
      { href: '/commands/rag#remote', label: '직원 PC에서 공유 문서 검색' },
      { href: '/commands/agent', label: '에이전트를 클러스터에 연결' },
    ],
  },
];

const en: Guide[] = [
  {
    slug: 'model-management',
    title: 'Manage models in one place',
    summary: 'Pick a model that fits your computer, download it once and link it into every installed runner.',
    outcome: 'One model file lives in the omm hub (`~/.omm/models`), and runners such as Ollama and LM Studio see it without downloading it again.',
    requirements: [
      'OMM and at least one runner. `omm link`s into Ollama, LM Studio, Jan, AnythingLLM, Msty, text-generation-webui and KoboldCpp.',
      'Disk space for the model file. Each model is one GGUF file in `~/.omm/models`; set `OMM_HOME` (an absolute path) to move it.',
      'macOS and Linux link with symlinks, so no extra space is used. If a link cannot be made, that runner is skipped; omm never copies there.',
      'Windows tries a hard link, then a symlink, and only then copies the file after checking free space. A copy uses that much extra space.',
      'If your Ollama version rejects omm’s link format, omm falls back to `ollama create`, which makes a full copy on every OS.',
    ],
    steps: [
      {
        title: 'Check this computer',
        body: 'Shows RAM and VRAM, the safe model budget, installed runners, and the models already on disk along with whether omm manages them.',
        commands: ['omm scan'],
        notes: [
          'If a hub model is `not linked` into a runner yet, it suggests `omm link`.',
          'If it finds model files outside the hub, it suggests `omm import` so omm can manage them too.',
        ],
        check: 'Make sure the runner you want appears under `Local AI runners`.',
        ref: { href: '/commands/scan', label: 'omm scan' },
      },
      {
        title: 'Choose a model',
        body: '`omm recommend` first asks how this computer should be shared with the model (Dedicated, Balanced or Minimal), then lists models that fit. Picking one goes straight to installation. If you know the name, use `omm search`: it prints a numbered list and marks models that do not fit with `(won\'t fit)`.',
        commands: ['omm recommend', 'omm search <query>'],
        check: 'Search ends with `Install with: omm install <number>`. Note the number.',
        ref: { href: '/models', label: 'Compare uses in the model wiki' },
      },
      {
        title: 'Check that it fits in memory',
        body: 'Required memory is estimated as the file size × 1.2. It shows memory used by other apps, the OS reserve and the install cap, then one verdict.',
        commands: ['omm fit <model>'],
        notes: [
          '`✓ Fits now`: you can run it right away.',
          '`! Fits this PC, but not right now`: close other apps first.',
          '`✗ Too big for this PC`: not enough even with everything closed. Choose a smaller model or quantization.',
        ],
        check: 'This is an estimate. After installing, check that the model really answers (see the check below).',
        ref: { href: '/commands/fit', label: 'omm fit' },
      },
      {
        title: 'Install it',
        body: 'If a quantization picker appears, choose one, or pass `--quant Q4_K_M` to skip it. omm shows a predicted speed and asks `Install anyway?` if this hardware is predicted not to run the model. The download is checked against SHA-256, stored in the hub and linked into every installed runner. Finally it offers a short Ollama compatibility test.',
        commands: ['omm install <model>'],
        check: 'You are done when `Ω Installed <file>` and `Linked into N local runners: …` appear, followed by `Run it now: omm run <file>`.',
        ref: { href: '/commands/install', label: 'omm install' },
      },
      {
        title: 'Check the install and links',
        body: '`omm list` shows hub models and how many links each has. `omm info` shows one line per runner: `ollama run <tag>` for Ollama, and `linked (visible in …)` or `not linked` for the others.',
        commands: ['omm list', 'omm info <model>'],
        check: 'The line for the runner you want should not say `not linked`.',
      },
      {
        title: 'Repair missing links',
        body: 'With no argument it re-links every model into every runner. Use `--engine` for a single runner, and `--force` (after checking) when a file omm does not own is in the way. `--to <folder>` links into an app omm does not support.',
        commands: ['omm link', 'omm link --engine <runner>'],
        check: 'After `N model(s) relinked/verified.`, the skipped counts should be 0.',
        ref: { href: '/commands/link', label: 'omm link' },
      },
    ],
    verify: [
      'The model appears in `omm list`.',
      'It also appears in your runner (`ollama list` for Ollama, My Models in LM Studio).',
      '`omm verify <model>` prints `Compatible: local text generation succeeded`. A finished download does not prove the model runs.',
    ],
    troubles: [
      { message: "Unknown model '<x>'.", fix: 'omm accepts a curated id, org/repo:file.gguf or an HTTPS URL. Find it with `omm search`, then run `omm install <number>`.', href: '/commands/search' },
      { message: 'Not enough disk space: … needs up to X GiB (…) but only Y GiB is free', fix: 'Free space on that volume, or retry with `--skip-unfit` as the message suggests.' },
      { message: 'Refusing to replace unowned existing file at …', fix: 'A file omm did not create is where the link should go. Check you do not need it, then run `omm link <model> --force`.', href: '/commands/link' },
      { message: '<x> is not installed via omm.', fix: 'The name is different. Use the name or number from `omm list`.' },
      { message: 'This GGUF has no embedded chat template - Ollama will fall back to raw completion', fix: 'A warning, not an error. If chat looks wrong, try another quantization or repository.' },
    ],
    undo: {
      body: 'Uninstalling one model removes its runner links and the hub file together. A single model is removed without a confirmation, so preview with `--dry-run` first. `omm cleanup` clears interrupted downloads and broken links.',
      commands: ['omm uninstall <model> --dry-run', 'omm uninstall <model>', 'omm cleanup'],
    },
    references: [
      { href: '/commands/install', label: 'Every omm install option' },
      { href: '/commands/link', label: 'Every omm link option' },
      { href: '/commands/uninstall', label: 'omm uninstall' },
    ],
  },
  {
    slug: 'local-chat',
    title: 'Chat on your computer',
    summary: 'Check that an installed model really answers, then chat in the terminal or in the browser workspace.',
    outcome: 'You have seen the model answer on this computer and can chat in the terminal (`omm run`) or the browser (`omm web`).',
    requirements: [
      'At least one model installed and linked into a runner. If you have none, start with the model management guide.',
      'Ollama or LM Studio. The Ollama API is at http://127.0.0.1:11434 and LM Studio’s local server at http://127.0.0.1:1234.',
      'Chat in the browser workspace supports Ollama and LM Studio only.',
    ],
    steps: [
      {
        title: 'Pick the model',
        body: 'Note the model’s name or number. If you leave the name out of `omm run`, it uses the only installed model, or asks `Which model do you want to run?` when there are several.',
        commands: ['omm list'],
      },
      {
        title: 'Chat in the terminal',
        body: 'The runner is the one you pass with `--engine`, else the default in your config, else the first linked runner (Ollama first). With Ollama you chat right in this terminal. If Ollama is stopped, omm offers to start it in the background.',
        commands: ['omm run <model>', 'omm run <model> --engine <runner>'],
        notes: [
          'Type `/bye` to leave the chat.',
          'LM Studio, Jan, AnythingLLM and Msty only open the app; pick the model from its list.',
          'KoboldCpp (http://localhost:5001) and text-generation-webui (http://localhost:7860) start with the model loaded.',
        ],
        check: 'The first line, `<file> via <Runner> (…)`, tells you which runner it used.',
        ref: { href: '/commands/run', label: 'omm run' },
      },
      {
        title: 'Check a real response',
        body: 'A finished download does not mean the model runs. `omm verify` asks it to generate a short reply.',
        commands: ['omm verify <model>', 'omm verify <model> --engine lmstudio'],
        check: 'Look for `Compatible: local text generation succeeded (…)`.',
        ref: { href: '/commands/verify', label: 'omm verify' },
      },
      {
        title: 'Open the browser workspace',
        body: 'A manager page that only opens on this computer (127.0.0.1). It picks a free port each time, so the address can change. If it is already running it prints `OMM local manager already running: …` with the address.',
        commands: ['omm web --open'],
        check: 'The terminal prints `OMM local manager: http://127.0.0.1:<port>/` and your browser opens. Press `Ctrl+C` in the terminal to stop it.',
        ref: { href: '/commands/web', label: 'omm web' },
      },
      {
        title: 'Start a chat in the workspace',
        body: 'Under connection status, press the button that starts the Ollama server. For LM Studio, turn on its local server in the app. Then start a chat from a recommended model or prepare one you already have, and choose the runner. The workspace runs a runner safety check, download and linking, a short real-response check, and then opens the chat.',
        check: 'The chat opens only after the response check shows a real sample reply and a pass.',
      },
    ],
    verify: [
      'An answer appears for your question.',
      'The runner and model are the ones you meant (the `via <Runner>` line, or the model name in the workspace).',
      '`omm verify <model>` reports Compatible.',
    ],
    troubles: [
      { message: 'Ollama is not installed or its executable cannot be found.', fix: 'Install Ollama from https://ollama.com/download, start it once, then try again.' },
      { message: 'omm run requires the Ollama API at http://localhost:11434.', fix: 'You declined to start Ollama, or the terminal is not interactive. Start Ollama yourself, or add -y.' },
      { message: 'This model is not linked into any installed runner. Run `omm link` to repair links, or `omm setup` to install a runner.', fix: 'Repair links with `omm link`, or install a runner with `omm setup`.', href: '/commands/link' },
      { message: '실행 앱의 로컬 서버를 먼저 켜 주세요.', fix: 'The runner’s local server is off. Start the Ollama server from the workspace, or turn on LM Studio’s local server.' },
      { message: '다른 모델이 사용 중이에요…', fix: 'Another model is loaded. omm never unloads it for you; unload it in the runner and try again.' },
    ],
    references: [
      { href: '/commands/run', label: 'omm run' },
      { href: '/commands/verify', label: 'omm verify' },
      { href: '/commands/web', label: 'omm web' },
    ],
  },
  {
    slug: 'document-search',
    title: 'Search your documents',
    summary: 'Put documents into a collection and find the passages that answer a question. Connect the same search to a coding agent.',
    outcome: 'A question returns passages with the file name, page and character range, and agents such as Claude Code can search the same documents.',
    requirements: [
      'Local Ollama (http://127.0.0.1:11434) with the embedding model `bge-m3` (`ollama pull bge-m3`). Without it, word search still works but meaning-based search does not.',
      'Supported files: text PDF, TXT, Markdown, HTML and HWPX. Scanned PDFs (OCR), HWP and encrypted PDFs are not supported.',
      'Limits: 6 MiB per file, 100 PDF pages, 500,000 characters per document, 100 documents and 2,000,000 characters in total.',
      'Documents and the index are stored in `~/.omm/documents/library.sqlite3`. Embeddings come from local Ollama only; documents and questions stay on this computer.',
    ],
    steps: [
      {
        title: 'Check readiness',
        body: 'Shows whether the embedding model and semantic search are ready.',
        commands: ['omm rag status'],
        check: 'Look for `Embedding model: bge-m3 (...) - available` and `Semantic search: ready (...)`.',
      },
      {
        title: 'Create a collection',
        body: 'A built-in collection named 기본 always exists, so this is optional. Splitting by topic, such as HR rules or contracts, lets you narrow searches.',
        commands: ['omm rag collection create <collection>'],
        check: "It prints `'<collection>' 컬렉션을 만들었어요.`",
      },
      {
        title: 'Add documents',
        body: 'Pass files and folders together; folders are read recursively. Add `--replace` to swap in a new version of a document with the same name. Unsupported files are skipped and counted.',
        commands: ['omm rag add <collection> <folder-or-file>'],
        check: 'Each file prints `등록: <file> (구간 N개, 의미+단어 색인)`. If it says `단어 색인만` (word index only), no semantic index was built — see below.',
      },
      {
        title: 'Check processing',
        body: 'Shows the index state for each document and suggests `omm rag reindex` when something needs it. Reindex is also needed after changing the embedding model.',
        commands: ['omm rag status', 'omm rag reindex'],
        check: 'Every document line should end in `semantic index ready`.',
      },
      {
        title: 'Search',
        body: 'Three results by default; `--limit` takes 1–10. Each result shows `[1] <file> (<collection>) · N쪽 · a-b자` followed by the passage. When nothing supports an answer it prints `NO_EVIDENCE`.',
        commands: ['omm rag search "<question>"', 'omm rag search "<question>" --collection <collection> --limit 5'],
        notes: ['omm does not open the original file. Use the file name, page and character range to open it yourself and compare.'],
        check: '`검색 방식: 의미+단어` means meaning-based search was used too.',
      },
      {
        title: 'Connect a coding agent (optional)',
        body: 'Adds an MCP server named `omm-documents` to the agent’s settings; the agent searches with the `search_documents` and `list_collections` tools. Targets are claude-code, codex, pi and cursor. The original settings are backed up to `~/.omm/rag-connections/<harness>.json`.',
        commands: ['omm rag connect claude-code'],
        notes: [
          'Files changed: Claude Code `~/.claude.json`, Codex `~/.codex/config.toml`, pi `~/.pi/agent/mcp.json`, Cursor `~/.cursor/mcp.json`.',
          'To use shared collections on a company cluster, point omm at the head Mac with `omm rag remote set`. The same commands then use the head’s collections.',
        ],
        check: "`Registered MCP server 'omm-documents' for claude-code in <path>.` — then start a new agent session.",
        ref: { href: '/use-cases/mac-cluster', label: 'Mac clusters and shared search' },
      },
    ],
    verify: [
      'The document you expected appears in the results.',
      'Opening the original at that page and range shows the same text.',
      'In a new agent session, a question about your documents comes back with sources.',
    ],
    troubles: [
      { message: 'Ollama(http://127.0.0.1:11434)에 연결하지 못했어요. Ollama를 켠 뒤 다시 시도해 주세요.', fix: 'Ollama is not reachable, so adding ends with a word index only. Start Ollama, then run `omm rag reindex`.' },
      { message: 'Ollama에 임베딩 모델 bge-m3이(가) 없어요.', fix: 'The embedding model is missing. Run `ollama pull bge-m3`, then `omm rag reindex`.' },
      { message: '읽을 수 있는 텍스트가 없어요. 스캔 PDF의 OCR은 아직 지원하지 않아요.', fix: 'A scanned PDF has no text. Convert it to a text PDF or another supported format.' },
      { message: '같은 이름의 문서가 있어요. 교체를 선택해 주세요.', fix: 'A document with that name exists. Add it again with `--replace`.' },
      { message: 'Choose claude-code, codex, pi, cursor.', fix: 'rag connect expects claude-code, not claude.' },
    ],
    undo: {
      body: 'Restores the agent’s original settings from the backup.',
      commands: ['omm rag disconnect claude-code'],
    },
    references: [
      { href: '/commands/rag', label: 'Every omm rag command' },
      { href: '/commands/rag#connect', label: 'omm rag connect' },
    ],
  },
  {
    slug: 'coding-agents',
    title: 'Connect a coding agent to a local model',
    summary: 'Point Claude Code, Codex or pi at an Ollama model on your computer, and switch back whenever you like.',
    outcome: 'The agent runs on a local Ollama model, and the original settings are backed up and restored with one command.',
    requirements: [
      'Claude Code (claude), Codex (codex) or pi installed and on your PATH.',
      'Ollama 0.14.0 or newer.',
      'A model downloaded to this computer. Tags ending in :cloud or -cloud, and models pointing at a remote host, are refused.',
      'A model that advertises tool calling and has at least 32,768 tokens of context (65,536+ recommended). omm checks this from Ollama’s metadata before connecting.',
      'Connecting only changes routing settings. omm does not check how well the agent actually works.',
    ],
    steps: [
      {
        title: 'Prepare a tool-calling model',
        body: 'Download a model into Ollama (`ollama pull <tag>`). For a model you already use, check its exact tag with `ollama list`. If you are unsure which one suits coding, compare in the model wiki.',
        ref: { href: '/models', label: 'Model wiki' },
      },
      {
        title: 'Connect the agent',
        body: 'The harness is claude, codex or pi. Run `omm agent local` without arguments in a terminal to pick the harness and model interactively. Add `--base-url` if Ollama is not at http://127.0.0.1:11434. omm checks the version, tool calling and context, backs up the original settings to `~/.omm/agent-connections/<harness>.json`, then edits them.',
        commands: ['omm agent local claude --model <ollama-model>'],
        notes: [
          'Claude Code: model and environment variables such as `ANTHROPIC_BASE_URL` in `~/.claude/settings.json`.',
          'Codex: model and `model_provider = "omm-local"` in `~/.codex/config.toml`.',
          'pi: default provider and model in `~/.pi/agent/models.json` and settings.json.',
        ],
        check: 'It prints `Saved local routing settings for claude. Start a new harness session.`',
        ref: { href: '/commands/agent', label: 'omm agent' },
      },
      {
        title: 'Check the connection',
        body: 'The state is one of unmanaged, local, applying or `changed_or_interrupted`.',
        commands: ['omm agent status claude'],
        check: 'Look for `claude: local; installed: True`.',
      },
      {
        title: 'Try a small task in a new session',
        body: 'Open a new agent session and start small, for example asking it to read and summarize one file. omm only checked the model’s metadata, so check the real workflow yourself. Project, managed or shell settings can override this user configuration, and 64K+ runtime context is recommended.',
      },
    ],
    verify: [
      '`omm agent status <harness>` reports local.',
      'In a new session the agent answers using tools, such as reading a file.',
      'Ollama shows the model running (`ollama ps`).',
    ],
    troubles: [
      { message: 'Ollama 0.14.0 or newer is required for agent connections.', fix: 'Update Ollama.' },
      { message: 'Ollama model inspection failed. Start Ollama and check the installed model tag.', fix: 'Start Ollama, check the tag with `ollama list` and pass it to `--model` exactly.' },
      { message: 'This model does not advertise tool calling. Choose a tool-capable model with omm recommend.', fix: 'Switch to a model that supports tool calling.' },
      { message: 'Agent connections require a model context of at least 32768 tokens; 65536+ is recommended.', fix: 'Choose a model with a longer context.' },
      { message: 'An OMM connection backup already exists. Restore with agent cloud before switching again.', fix: 'Run `omm agent cloud <harness>` first, then connect again.' },
      { message: 'claude is not installed or is not on PATH. Install the harness first.', fix: 'Install the agent and run the command again in a new terminal.' },
    ],
    undo: {
      body: 'If the settings file was not edited after connecting, the original file comes back byte for byte; otherwise only the fields omm set are reverted. When you see `Original routing restored. Start a new harness session.`, open a new session.',
      commands: ['omm agent cloud claude'],
    },
    references: [
      { href: '/commands/agent', label: 'Every omm agent option' },
      { href: '/commands/rag#connect', label: 'Connect document search to the agent too' },
    ],
  },
  {
    slug: 'mac-cluster',
    title: 'Connect Macs as a model server',
    summary: 'Join Thunderbolt-linked Macs into one exo cluster and let employees connect with tokens.',
    outcome: 'Several Macs pool their memory to serve one large model, and employee PCs use the model and shared document search through the gateway (https://<head IP>:52440).',
    requirements: [
      'macOS 26.2 or later on every Mac in the cluster. Employee PCs can run any OS.',
      'Thunderbolt 5 cables connecting every Mac directly to every other Mac (full mesh). Each Mac needs one port per other Mac.',
      'For RDMA, every Mac must run exactly the same macOS build. To enable it: Recovery mode → Terminal → `rdma_ctl enable` → restart.',
      'exo is installed with Homebrew (`brew install --cask exo`). Without Homebrew, install exo yourself.',
      'Each Mac’s administrator password. omm changes this Mac: it replaces Thunderbolt Bridge with one DHCP service per port, adds pf firewall rules that block exo ports 52415/52416 from the office network and open gateway port 52440, blocks TCP 49153–65535 for every app on the Mac, turns off idle sleep and registers background services.',
    ],
    steps: [
      {
        title: 'Create the head Mac',
        where: 'Head Mac',
        body: 'This Mac becomes the centre of the cluster and opens the employee gateway. macOS may wait on screen for you to approve exo, so watch the head Mac’s display. If this Mac already belongs to a cluster as a member, run `omm cluster leave` first.',
        commands: ['omm cluster init'],
        notes: ['Under `Run this on every other Mac:` it prints an `omm cluster join omm-…` line. You use it in the next step.', 'It also prints the `omm rag remote set https://<ip>:52440` line for employees and the certificate fingerprint.'],
        check: 'Look for `exo is running on this Mac (cluster …)` and `RDMA over Thunderbolt: enabled.`',
      },
      {
        title: 'Join the other Macs',
        where: 'Each other Mac',
        body: 'Join with the cluster name the head printed. On any Mac, plain `omm cluster` shows that Mac’s next step and runs it after you answer `Run it now?`.',
        commands: ['omm cluster join <cluster-name>', 'omm cluster'],
        check: '`This Mac joined the cluster. Check it from the head Mac with: omm cluster status`',
      },
      {
        title: 'Check the connections',
        where: 'Head Mac',
        body: 'Shows nodes, memory, RDMA, firewall, gateway and document search, and lists any problems. If a Mac is on but missing, run restart on that Mac and on the head; it finds the others again in about 15 seconds.',
        commands: ['omm cluster status', 'omm cluster restart'],
        check: 'Every node shows `RDMA enabled` and the same macOS, and the last line is `No problems found.`',
        ref: { href: '/commands/cluster#status', label: 'omm cluster status' },
      },
      {
        title: 'Put a model on the cluster',
        where: 'Head Mac',
        body: 'recommend lists the biggest models that fit in 85% of the cluster’s free memory. install only downloads the files to every Mac; load puts the model in memory. Leave out `--sharding tensor|pipeline` and `--macs N` to let omm choose. `--on <Mac>` loads it on one Mac and cannot be combined with those two. `omm cluster info <model>` lists the possible placements.',
        commands: ['omm cluster recommend', 'omm cluster install <model>', 'omm cluster load <model>'],
        check: '`Serving <model> at https://<ip>:52440` means employees can use it.',
      },
      {
        title: 'Check a real answer and the speed',
        where: 'Head Mac',
        body: 'Chat with run and leave with `/bye`. benchmark measures time to first token and tokens per second (nothing is uploaded).',
        commands: ['omm cluster run <model>', 'omm cluster benchmark <model>'],
        check: 'It prints `<model>: first token X s, Y tok/s (…)`.',
      },
      {
        title: 'Issue a token per employee',
        where: 'Head Mac',
        body: 'Names are 1–40 letters, digits, ., - or _. The token is shown only once, so hand it over securely right away. `omm cluster token list` shows existing tokens.',
        commands: ['omm cluster token add <name>'],
        check: 'It prints `Token for <name>: omm_…` and `Store it now - omm cannot show it again.`',
      },
      {
        title: 'Connect an employee PC',
        where: 'Employee PC',
        body: 'The token is typed hidden, so it stays out of shell history. Compare the head certificate fingerprint (SHA-256) shown on screen with `Gateway certificate (SHA-256)` in the head’s `omm cluster status` before connecting. After that, `omm cluster status`, list, run and benchmark work through the gateway. Connecting a coding agent to a cluster model needs this step first and a model with at least 32K context.',
        commands: ['omm rag remote set https://<head-ip>:52440', 'omm agent cluster claude --model <exo-model>'],
        check: 'Connecting the agent prints `Saved cluster routing settings for …`',
        ref: { href: '/commands/rag#remote', label: 'omm rag remote' },
      },
    ],
    verify: [
      'The last line of `omm cluster status` on the head is `No problems found.`',
      '`omm cluster benchmark <model>` prints numbers.',
      'An employee PC gets an answer from `omm cluster run <model>`.',
    ],
    troubles: [
      { message: "exo has not answered for 60 seconds. macOS may be holding exo until someone approves it on this Mac's screen…", fix: 'Click Allow or Open on that Mac’s screen, then run `omm cluster restart`.' },
      { message: 'exo on this Mac sees no other Mac. … allow exo under System Settings > Privacy & Security > Local Network', fix: 'Allow exo under Local Network on each Mac, then run `omm cluster restart`.' },
      { message: 'no Thunderbolt link between A and B', fix: 'Check the cable between those Macs and run `omm cluster restart` on each.' },
      { message: 'macOS versions differ: … Update macOS to <build> on <Macs>, one Mac at a time', fix: 'Update the listed Macs to the same build, one at a time. If you see `RDMA disabled on X`, run `rdma_ctl enable` on that Mac.' },
      { message: "The cluster head rejected your token. Ask the head Mac's admin for a new one (omm cluster token add <name>), then run: omm rag remote set <head address>", fix: 'The token was revoked or is wrong. Get a new one from the head’s admin and connect again.' },
      { message: "the head's address changed from … to …; on each employee PC run omm rag remote set https://<new>:52440", fix: 'Reconnect each employee PC to the new address. Ask your network admin to reserve the head’s DHCP address so it does not happen again.' },
    ],
    undo: {
      body: 'unload frees memory only, and `omm cluster uninstall <model>` deletes the files from every Mac. token revoke takes effect at once. On employee PCs, `omm agent cloud` and `omm rag remote clear` undo the connection. leave restores the firewall, Thunderbolt Bridge, sleep and app-firewall settings and removes the services; employee tokens are kept. Remove the exo app itself from its menu bar icon → Advanced → Uninstall. To move the head role, use `omm cluster handover <Mac>` and issue tokens again on the new head.',
      commands: ['omm cluster unload <model>', 'omm cluster token revoke <name>', 'omm cluster leave'],
    },
    references: [
      { href: '/commands/cluster', label: 'Every omm cluster command' },
      { href: '/commands/rag#remote', label: 'Shared document search from employee PCs' },
      { href: '/commands/agent', label: 'Connect an agent to the cluster' },
    ],
  },
];

const guides: Record<Locale, Guide[]> = { ko, en };

export function getUseCases(locale: Locale): readonly Guide[] { return guides[locale]; }
export function getUseCase(slug: string, locale: Locale) { return guides[locale].find((guide) => guide.slug === slug); }
export function getGuideCopy(locale: Locale) { return copy[locale]; }
