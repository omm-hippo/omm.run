# 학교 PC를 어시스턴트 모델 서버로 쓰기

omm.run 어시스턴트가 질문을 학교 PC의 Ollama로 먼저 보내고, 학교 PC가 꺼져 있거나
느리면 Cloudflare Workers AI로 넘기는 구성입니다. 코드 쪽 계약은
[assistant-backend.md](assistant-backend.md)의 "Self-hosted gateway" 절에 있습니다.

```
브라우저 → omm.run Worker → Cloudflare Tunnel (+ Access 서비스 토큰) → 학교 PC의 cloudflared → localhost:11434 Ollama
```

Cloudflare Tunnel은 학교 PC에서 **바깥으로 나가는** 연결만 쓰기 때문에 포트를 열거나
공인 IP를 받을 필요가 없습니다. 대부분의 학교 방화벽도 통과하지만, 학교 네트워크
정책상 상시 터널이 허용되는지는 먼저 정보 담당 선생님께 확인하세요.

## 0. 준비물

- 계속 켜 둘 수 있는 PC 한 대 (절전·자동 종료 해제). GPU가 있거나 Apple Silicon이면 좋습니다.
- 메모리 8 GB 이상 (모델 약 2.5 GB).
- `omm.run` 도메인이 있는 Cloudflare 계정의 권한 (Zero Trust 포함).

## 1. 학교 PC: Ollama와 모델

```bash
# https://ollama.com/download 에서 설치한 뒤
ollama pull qwen3:4b-instruct
```

Ollama는 기본값(`127.0.0.1:11434`, 로컬 전용) 그대로 둡니다. `OLLAMA_HOST=0.0.0.0` 같은
설정으로 네트워크에 열지 마세요. 외부 접근은 터널만 담당합니다.

모델을 계속 메모리에 올려 두면 첫 질문이 빨라집니다. 시스템 환경 변수로
`OLLAMA_KEEP_ALIVE=-1`을 설정하고 Ollama를 다시 시작하세요.

설정을 바꾸기 전에 이 PC에서 정확도와 속도를 먼저 재 봅니다 (omm.run 저장소 체크아웃에서
`npm ci` 후 실행).

```bash
npx tsx scripts/assistant-eval.ts --mode hybrid --ollama http://127.0.0.1:11434 --model qwen3:4b-instruct --fixture tests/fixtures/assistant-paraphrase.json
```

2026-10-29에 Apple M5 Mac에서 잰 결과는 52문항 중 50개 정답, 중앙값 약 0.9초였습니다.
학교 PC에서 정답이 크게 떨어지거나 대부분 2.5초를 넘으면 게이트웨이를 켜도 거의 항상
Workers AI로 넘어갑니다.

## 2. 학교 PC: Cloudflare Tunnel

```bash
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ 에서 cloudflared 설치
cloudflared tunnel login
cloudflared tunnel create omm-assistant
cloudflared tunnel route dns omm-assistant assistant-ollama.omm.run
```

`~/.cloudflared/config.yml` (Windows는 `%USERPROFILE%\.cloudflared\config.yml`):

```yaml
tunnel: omm-assistant
credentials-file: <tunnel create가 출력한 .json 경로>
ingress:
  - hostname: assistant-ollama.omm.run
    service: http://localhost:11434
    originRequest:
      # Ollama는 낯선 Host 헤더를 거부하므로 로컬 주소로 바꿔서 보냅니다.
      httpHostHeader: "localhost:11434"
  - service: http_status:404
```

PC가 재부팅돼도 다시 뜨도록 서비스로 등록합니다.

```bash
cloudflared service install
```

## 3. Cloudflare Zero Trust: 아무나 못 쓰게 막기

이 단계가 없으면 터널 주소를 아는 누구나 학교 PC의 Ollama를 쓸 수 있습니다. 반드시 하세요.

1. Zero Trust → Access → Service Auth → **Service Tokens**에서 토큰을 만들고, Client ID와
   Client Secret을 저장합니다. Secret은 한 번만 보입니다.
2. Access → Applications → **Self-hosted** 앱을 만들고 도메인을 `assistant-ollama.omm.run`으로 지정합니다.
3. 정책의 Action을 **Service Auth**로 두고, Include에 방금 만든 서비스 토큰을 넣습니다.

확인: 토큰 없이 요청하면 거부되거나 로그인 페이지로 리다이렉트되고, 토큰을 넣으면 응답이 와야 합니다.

```bash
curl -i https://assistant-ollama.omm.run/api/tags
```

```bash
curl -s https://assistant-ollama.omm.run/api/tags -H "CF-Access-Client-Id: <ID>" -H "CF-Access-Client-Secret: <SECRET>"
```

## 4. omm.run Worker 설정

omm.run 저장소에서 실행합니다. 프로덕션 Worker가 바뀌는 작업이니 배포 승인을 받은 뒤 진행하세요.

```bash
npx wrangler secret put ASSISTANT_GATEWAY_URL
```

```bash
npx wrangler secret put ASSISTANT_GATEWAY_MODEL
```

```bash
npx wrangler secret put ASSISTANT_GATEWAY_ACCESS_ID
```

```bash
npx wrangler secret put ASSISTANT_GATEWAY_ACCESS_SECRET
```

각각 `https://assistant-ollama.omm.run`, `qwen3:4b-instruct`, 서비스 토큰 ID, Secret을 입력합니다.
네 값이 모두 있어야 게이트웨이가 켜지고, 하나라도 빠지면 지금처럼 Workers AI만 씁니다.
게이트웨이를 끄려면 `npx wrangler secret delete ASSISTANT_GATEWAY_URL`을 실행합니다.

## 5. 동작 확인

어시스턴트 답변 오른쪽 위 표시가 **"선택 방식: OMM 자체 로컬 모델"**이면 학교 PC가 답한 것이고,
**"Workers AI 분류기"**이면 학교 PC가 실패해서 넘어간 것입니다. "문서 기반 검색"은 키워드
규칙만으로 확실하게 답해서 모델을 부르지 않은 경우입니다.

## 운영 시 주의

- 질문 내용이 학교 PC를 거칩니다. 어시스턴트 개인정보 안내문에도 이 사실이 적혀 있습니다.
  학교 PC에 Ollama 요청 로그를 따로 저장하지 마세요.
- 학교 PC가 꺼져 있으면 질문마다 최대 2.5초를 기다린 뒤 Workers AI로 넘어가므로 응답이 그만큼
  느려집니다. 오래 끌 예정이면 4단계 방법으로 게이트웨이를 끄세요.
- 서비스 토큰은 유출되면 Zero Trust에서 즉시 폐기하고 새로 발급합니다.
