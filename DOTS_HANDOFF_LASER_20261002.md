# 잡있으(Dots) 인계: 레이저 회귀 검사와 복원 상태

2026-10-02. 잡있으는 사용자가 직접 만든 GPT Dots 에이전트다.
저장소: `kjb7876-lang/hapil1`, 브랜치: `main`.
기존 서비스: https://kjb7876-lang.github.io/hapil1/

## 요청 및 기준

레이저 위 불투명 사각 이미지와 단절 패턴을 최소 수정하고, 정상 질감 및 이후 다른 개선은 보존한다. 실제 브라우저 렌더·진행 검사 후 기존 main/Pages에서 이어서 작업한다.

- 요청에 인용된 당시 main: `51d551f5a0d9e50d49e0c19aa006bc3e4343ac7c`.
- 사용자가 정상 화면으로 지정한 기준: `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`.
- 조사 시작 시 이미 main에 있던 복원: `f159c8f8e5f53c8f570baf97d9491a60f8507745` (RC120).
- 이번 세션의 검사·CI 개선 최종 검사대상: `2130de0f647e2cc05a44cb3e94468332597dfbc9`.
- 이 문서 커밋과 이후 변경이 있을 수 있으므로 시작할 때 반드시 최신 원격 main을 다시 읽는다.

## 이미 복원되어 있던 게임 코드

RC120 복원은 이 세션이 새로 작성한 것이 아니라 선행 작업이다. 이번 세션은 런타임 파일을 변경하지 않고 복원 상태를 조사하고 검사 결함을 수정했다.

`assets/rc77/connected-laser.js`의 RC120 Git blob SHA는 `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`이며 정상 기준 19a4c1f의 동일 파일과 정확히 같다. 실제 `options.image`의 원래 보스별 이미지를 사용하며, 공통 `beamArt()` 그라디언트 대체 경로는 제거되어 있다.

RC116 커밋 `6e981986dd6117652caf4c051fa6aaceba3cdc51`은 연결 레이저 위에 강제 단색 몸통을 추가하고, 메인 번들에 line geometry 색상 fill 7줄을 추가했었다. RC120에서는 연결 렌더러를 정상 기준으로 복원하고 메인 번들의 그 7줄 덧칠을 제거했다. 테스트를 맞추려고 이 fill을 다시 넣지 않는다.

RC120의 `index.html`에서 메인 번들과 연결 렌더러의 캐시 키는 `v=41605`다. 연결 렌더러 내부 version이 RC107이어도 해당 파일이 오래된 배포라는 뜻은 아니다.

19a4c1f 이후의 모바일·세로 화면·영웅 방향·무기 소켓·맵 진행 개선은 보존한다. 전체 저장소를 과거 SHA로 되돌리지 않는다. `assets/rc108/laser-topology.js`의 회피 통로 및 렌더/접촉 공통 기하도형도 유지한다.

## 이번 세션에서 실제 반영한 변경

- `tests/laser-release-gate.cjs`: 9개 검사 실행, 개별 종료 상태·대상 SHA·로그·JSON 기록. 기존 자연 진행 테스트가 맵 이동 없이도 종료 코드 0을 낼 수 있는 결함을 보완하여 실제 맵 변경, 생존, 진행 치트 미사용, JS/HTTP 오류 없음을 별도 검사한다.
- `tests/rc116-laser-continuity-browser.cjs`: 불투명 배경을 칠한 뒤 알파를 측정하던 잘못된 검사 수정. 이제 투명 전경에서 실제 보스 이미지를 측정하고 정상 기준 렌더러와 같은 기하도형으로 픽셀을 비교한다. 투명 이미지에 덧칠이 생기는지도 음성 대조군으로 검사한다. 배경은 측정 후 갤러리에만 합성한다.
- `tests/rc116-laser-telegraph-browser.cjs`: 실제 main 번들의 예고 렌더러를 정상 기준과 현재 버전에서 각각 실행하여 비교한다. 기존 98% 불투명 몸통 요구는 진단값으로 기록하되, 원래 텍스처를 사각형으로 덮어야만 통과하는 기준으로 사용하지 않는다. 실제 기준 대비 픽셀 변화, 횡단면 누락 증가, 이미지 중복 출력을 검사한다.
- `.github/workflows/laser-release-audit.yml`: 원격 Chromium 실행, 로그와 전후 PNG 보존. 저장소 읽기 권한만 사용하며 main 자동 변경이나 배포는 하지 않는다.
- 이 인계문.

시각 비교 허용치는 색상 채널 차이 3/255를 넘는 픽셀에 대해 연결 렌더 타일 0.1%, 예고선 전경 0.5%다. 원본과 완전히 같은 이미지인지 여부도 예고선 결과의 `pixelExact`에 별도 기록한다. 기존 투명 부분이 있다는 이유만으로 불투명 단색 몸통을 추가하지 않는다.

## 완료된 1차 실제 실행

실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36966963378
대상: `24d1c7613cc2abf655b9026a76796c773843b8d8`.
환경: Ubuntu 24.04, Node v22.23.3, Playwright 1.55.1, Chromium 140.0.7339.186.
원본 결과: https://github.com/kjb7876-lang/hapil1/actions/runs/36966963378/artifacts/11210650440

최초 실행 결과는 8/9, 전체 FAILURE다. 연결 렌더러/메인 번들 구문, 합성 이미지 정상 기준 비교와 추가 덧칠 검사, 발사 단계, 전투, 맵 진행 로직, 자연 Story 진행은 통과했다. 기존 예고선 테스트는 `desktop, reduced-flash and low-FX warnings remain a continuous band` assertion으로 실패했다.

첫 실행의 기존 연속성 테스트는 PASS로 기록되지만, 불투명 배경 알파를 읽는 결함이 발견되었으므로 연속성 정상의 증거로 사용하지 않는다. 위의 수정된 투명 전경 검사로 다시 검증해야 한다.

자연 Story 실행은 다음과 같이 실제 첫 맵 이동을 입증했다. 이것은 전체 게임 완주 검사가 아니다.

```json
{
  "usedProgressCheats": false,
  "changedZone": true,
  "firstZone": "dist00",
  "finalZone": "dist01",
  "finalHp": 124,
  "elapsedMs": 145404
}
```

## 수정된 검사 2차 실행

실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36967919214
대상: `2130de0f647e2cc05a44cb3e94468332597dfbc9`.
job ID: `110715586421`.

이 문서 갱신 시 2차 실행은 아직 진행 중이었다. 결과를 확인하지 않고 PASS로 간주하지 않는다. 후속 결과 문서가 추가되었거나 이 실행이 완료되었는지 먼저 확인한다.

`Publish exact results in the job log and summary` 단계에는 전체 결과와 실제 시각 비교 수치가 나온다. artifact `laser-release-2130de0f647e2cc05a44cb3e94468332597dfbc9`에는 다음 경로가 생성되도록 설정했다.

- `release-summary.json`: 각 검사 통과/실패 및 자연 진행 증거.
- `laser-continuity/laser-patterns-after.json`: 실제 보스 질감과 정상 기준 픽셀·횡단면 비교.
- `laser-continuity/laser-patterns-foreground.png`: 배경 없는 전경.
- `laser-continuity/laser-patterns-after.png`, `laser-patterns-approved.png`: 비교 갤러리.
- `laser-telegraph/laser-warning-after.json`: 현재/정상 기준 각각의 예고선 수치와 픽셀 차이.
- `laser-telegraph/laser-warning-<mode>-after.png`, `laser-warning-<mode>-approved.png`: desktop, reduced-flash, mobile-lowFx 전후 PNG.
- `natural-story/`: 첫 맵 실제 자동 진행 JSON 및 화면.

artifact 보존 기간은 14일이다. setup 실패, 취소, timeout, 누락 JSON은 통과가 아니다.

## 배포 확인 수준

게임 복원 RC120의 Pages 실행 `36964235704`는 success였다. 이번 검사 수정 대상 `2130de0`의 기존 Pages 실행 `36967919174`도 2026-10-02 05:13:43 UTC까지 success로 확인했다.

Pages와 이 audit는 독립이다. 감사가 실패해도 기존 Pages 배포는 성공할 수 있으며, audit를 branch protection 또는 배포 필수 선행 조건으로 설정한 것은 아니다.

이 세션의 로컬 container/Python 도구가 오류로 열리지 않아 실제 브라우저 실행은 GitHub Actions에서 수행했다. PNG의 생성 및 자동 픽셀 검사는 직접적인 육안 미술 검토와 다르다. 이 세션에서 모든 PNG를 사람이 보듯 확인했다고 보고하지 않는다. 별도 웹 열기로 실제 Pages를 재확인하는 시도도 도구 접근 오류였으므로, 배포 로그 확인과 서비스 화면의 직접 검토를 구분한다.

## 잡있으의 재개 절차

1. 작업 트리의 미커밋 변경을 보존하고 `git fetch origin main`으로 최신 상태 확인. 깨끗한 트리에서 fast-forward하거나 별도 worktree 사용. hard reset/force push/전체 롤백 금지.
2. 2차 Actions 결과와 이 문서 이후의 결과 기록을 먼저 읽는다. 실패가 있으면 해당 JSON과 PNG로 실제 회귀, 정상 기준 자체의 질감, 테스트 실행 환경 문제를 구분한다.
3. `approved-art`는 합성 분홍색 이미지 검사이므로 이것만으로 모든 보스 고유 이미지가 검증되었다고 말하지 않는다. 새 연속성 검사는 dist00-boss 실제 이미지와 각 blood topology를, 예고선 검사는 지정된 실제 seven-sin 이미지를 사용한다. 모든 보스·기기 전수 검사는 아니다.
4. 남은 문제가 재현되면 같은 보스, 단계, 해상도, 이미지 src, clip/합성 모드로 원인을 좁힌다. 원래 고유 텍스처를 유지하고 관련 레이저 코드만 최소 수정한다. 회피 통로를 연결선으로 막거나 덧칠로 증상을 숨기지 않는다.
5. UI·모바일·영웅 포즈·스토리·진행 로직은 관련 없는 한 보존한다. 런타임 파일 변경 시에만 해당 index.html 캐시 키 갱신.
6. 실제 검사, PNG 육안 확인, main 업로드, Pages 배포를 각각 구분해서 보고한다. 첫 맵 이동 성공을 모든 에피소드 진행 보장으로 확대하지 않는다.

```bash
# 저장소 루트. Playwright/Chromium이 준비된 환경에서 실행.
node tests/laser-release-gate.cjs
```

`CODEX_PRIMARY_RUNTIME_NODE_MODULES`로 Playwright 위치, `HAPIL_RELEASE_OUTPUT`으로 출력 루트 지정 가능. 일부 기존 테스트는 Linux `/usr/bin/chromium` 및 `/workspace/hapil-deliverables/RC119-body`를 사용하므로 Actions 설정을 참고한다. 새 시각 비교의 기준 변경은 `HAPIL_VISUAL_BASELINE`으로 가능하지만 사용자의 승인 없이 정상 기준을 바꿔 테스트를 통과시키지 않는다.

이 문서를 저장소에 남긴 것이 인계 수단이다. 다른 Dots 대화로 세션을 직접 전송하거나 그 에이전트를 자동 실행했다는 뜻은 아니다.
