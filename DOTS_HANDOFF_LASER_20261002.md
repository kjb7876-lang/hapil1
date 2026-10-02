# 잡있으(Dots) — HAPIL 레이저 작업 인계

2026-10-02. 잡있으는 사용자가 직접 만든 GPT Dots 에이전트다.
저장소 `kjb7876-lang/hapil1`, 브랜치 `main`.
기존 서비스: https://kjb7876-lang.github.io/hapil1/

최종 실행 결과는 `DOTS_LASER_AUDIT_RESULTS_20261002.json`이 있으면 그 기록과 해당 Actions 실행을 우선 확인한다. 문서 작성 이후 원격 main이 달라질 수 있으므로 과거 SHA로 전체 되돌리기 금지.

## 요청과 복원 기준

사용자 요청은 레이저 위 불투명 사각 이미지와 단절 패턴의 최소 수정, 정상 질감과 이후 다른 개선 보존, 실제 렌더/진행 검사, 기존 main/Pages에서의 작업 재개다.

- 요청에 인용된 당시 main: `51d551f5a0d9e50d49e0c19aa006bc3e4343ac7c`.
- 사용자가 정상 화면으로 지정한 기준: `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`.
- 조사 시작 시 이미 존재한 복원: `f159c8f8e5f53c8f570baf97d9491a60f8507745` (RC120).
- 검사 로딩 조건 보완까지 반영한 대상: `795799931d8c2e7812597dd07eae316806e41e53`.

RC120 복원은 이 세션에서 새로 작성한 것이 아니라 선행 작업이다. 이번 세션은 런타임 파일을 변경하지 않고 소스 대조, 검사 결함 수정, 실제 Chromium 실행 및 인계 기록을 수행했다.

`assets/rc77/connected-laser.js`의 RC120 Git blob은 `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`이며 정상 기준 19a4c1f와 정확히 같다. `options.image`의 원래 보스별 이미지를 사용하며 공통 `beamArt()` 그라디언트 대체는 제거되어 있다.

RC116 `6e981986dd6117652caf4c051fa6aaceba3cdc51`이 추가했던 강제 단색 레이저 몸통과 메인 번들 line geometry fill 7줄은 RC120에서 제거되었다. 테스트를 맞추려고 이를 다시 추가하지 않는다. RC120의 index.html 메인/연결 렌더러 캐시 키는 `v=41605`다. 렌더러 내부 version 문자열 RC107은 배포가 오래됐다는 증거가 아니다.

19a4c1f 이후의 모바일, 세로 화면, 영웅 방향, 무기 소켓, 맵 진행 개선은 유지한다. `assets/rc108/laser-topology.js`의 의도된 회피 통로와 렌더/피해 판정의 공통 기하도형도 보존한다.

## 이번 세션의 변경 범위

1. `tests/laser-release-gate.cjs`: 9개 검사 실행 및 개별 로그/결과 기록. 기존 자연 Story 테스트가 맵 변경 없이도 성공 종료할 수 있던 문제를 보완하여 실제 맵 이동, 생존, 진행 치트 미사용, JS/HTTP 오류 없음까지 검사한다.
2. `tests/rc116-laser-continuity-browser.cjs`: 불투명 배경 알파를 레이저로 오인하던 검사 수정. 투명 전경에서 실제 이미지와 정상 기준 렌더러를 비교하고, 측정 이후에만 갤러리 배경을 합성한다. 투명 이미지 음성 대조군으로 추가 덧칠도 검사한다.
3. `tests/rc116-laser-telegraph-browser.cjs`: 정상 기준/현재 main의 실제 예고 렌더러를 각각 실행해 비교한다. 명시적으로 지정한 이미지뿐 아니라 렌더러가 간접 선택한 이미지도 먼저 decode하고 실제 경로와 로딩 상태를 기록한다.
4. `.github/workflows/laser-release-audit.yml`: 읽기 전용 원격 Chromium 검사, 로그 및 비교 PNG 보존. 테스트 또는 관련 레이저 코드 변경 시 실행된다. 기존 Pages 설정이나 branch protection은 변경하지 않았다.
5. 이 인계문 및 별도 실행 결과 기록.

기존 98% 불투명 몸통 요구는 진단값으로만 보존한다. 원래 텍스처의 투명 부분을 단색으로 칠해야 통과하는 기준으로 사용하지 않는다. 대신 정상 기준 대비 픽셀 변화, 횡단면 누락 증가, 중복 그리기를 검사한다. 채널 차이 3/255를 넘는 픽셀 기준 허용치는 연결 렌더 타일 0.1%, 예고선 전경 대비 0.5%다. `pixelExact`도 별도 기록한다. 승인 없이 기준 SHA나 허용치를 바꿔 통과시키지 않는다.

## 실제 실행 이력

### 1차 — 8/9, 전체 FAILURE

대상 `24d1c7613cc2abf655b9026a76796c773843b8d8`.
실행 https://github.com/kjb7876-lang/hapil1/actions/runs/36966963378
artifact https://github.com/kjb7876-lang/hapil1/actions/runs/36966963378/artifacts/11210650440

기존 예고선의 불투명 몸통 assertion이 실패했다. 이 실행의 기존 연속성 PASS는 배경 알파 결함이 있어 연속성 증거로 사용하지 않는다. 자연 Story는 진행 치트 없이 `dist00 → dist01`, 최종 HP 124, 145404 ms로 통과했다.

### 2차 — 8/9, 전체 FAILURE

대상 `2130de0f647e2cc05a44cb3e94468332597dfbc9`.
실행 https://github.com/kjb7876-lang/hapil1/actions/runs/36967919214
artifact https://github.com/kjb7876-lang/hapil1/actions/runs/36967919214/artifacts/11209903488

수정된 연속성 검사는 실제 dist00-boss 이미지로 80개 blood topology × 일반/lowFx 2모드 = 160개 결과를 검사했다. 기준 대비 changedPixels는 모든 행에서 0, 샘플 횡단면 가시성은 양쪽 모두 1, 투명 이미지에 생성된 추가 픽셀은 0이었다. 이는 해당 이미지/기하도형 조합의 검사이지 모든 보스 미술 전수 검사가 아니다.

자연 Story는 진행 치트 없이 `dist00 → dist01`, 최종 HP 120, 135366 ms로 다시 통과했다. 구문 2개, 합성 이미지 기준 비교/추가 덧칠, 발사 단계, 전투, 맵 진행 로직도 통과했다.

예고선 비교는 실패했다. 그러나 기준은 drawImage 0회, 현재는 1회여서 동일한 이미지 준비 상태를 비교했는지 확인이 필요했다. 이 차이만으로 실제 서비스 레이저가 망가졌다고 단정하지 않는다. 다음 커밋에서 렌더러가 간접 선택한 이미지까지 미리 로딩하는 보완을 추가했다.

### 3차 — 로딩 조건 보완 후 실행

대상 `795799931d8c2e7812597dd07eae316806e41e53`.
실행 https://github.com/kjb7876-lang/hapil1/actions/runs/36968383652
job ID `110716988028`.

최종 conclusion, 별도 `DOTS_LASER_AUDIT_RESULTS_20261002.json`, 원본 artifact 결과를 확인한다. 앞선 실행 결과를 이 실행의 결과로 바꿔 쓰지 않는다.

## 실행 환경·증거·제한

GitHub-hosted Ubuntu 24.04, Node v22.23.3, Playwright 1.55.1, Chromium 140.0.7339.186에서 실행했다. 로컬 container/Python 도구는 접근 오류여서 원격 Actions를 사용했다.

Actions의 `Publish exact results in the job log and summary` 단계에 전체 결과와 시각 비교 수치가 나온다. artifact `laser-release-<검사대상SHA>`는 14일 보관된다.

- `release-summary.json`: 검사별 종료 상태, 대상 SHA, 자연 진행 증거.
- `laser-continuity/laser-patterns-after.json` 및 `laser-patterns-foreground.png`: 배경 없는 실제 레이저 측정.
- `laser-continuity/laser-patterns-after.png`, `laser-patterns-approved.png`: 현재/기준 갤러리.
- `laser-telegraph/laser-warning-after.json`: 모드별 현재/기준 수치, 실제 요청 이미지, 로딩 상태.
- `laser-telegraph/laser-warning-<mode>-after.png`, `laser-warning-<mode>-approved.png`: desktop/reduced-flash/mobile-lowFx 비교.
- `natural-story/`: 자연 진행 JSON과 화면.

합성 분홍색 이미지 검사만으로 보스별 미술 품질을 보장하지 않는다. PNG 생성/자동 픽셀 검사는 직접 육안 검토와 구분하며, 이 세션에서 모든 PNG를 직접 보았다고 보고하지 않는다. 첫 맵 이동은 전체 게임 완주 검사가 아니다. setup 실패, 취소, timeout, 누락 결과는 통과가 아니다.

RC120 Pages 실행 `36964235704` 및 검사 수정 대상 2130de0의 Pages 실행 `36967919174`는 success를 확인했다. 최신 배포 상태는 다시 확인한다. Pages는 audit와 독립이므로 Pages success만으로 검사가 통과했다고 보고하지 않는다. 별도 웹 도구의 Pages 직접 열기는 접근 오류였으므로 실제 서비스 화면의 육안 확인까지 완료한 것으로 확대하지 않는다.

## 잡있으의 재개 절차

최신 원격 main과 로컬 미커밋 변경을 확인하고 보존한다. 깨끗한 트리에서 fast-forward하거나 별도 worktree를 사용한다. hard reset, force push, 전체 파일 롤백은 하지 않는다.

먼저 이 문서와 별도 실행 결과를 읽고, 마지막 Actions 결과/PNG를 확인한다. 예고선 비교가 남아 있다면 `queuedAssets`, `warmupPasses`, drawImage 경로, 경고/발사 단계를 대조해 실제 회귀와 로딩 차이를 구분한다. 원래 고유 텍스처를 유지하면서 관련 코드만 최소 수정한다. 회피 통로를 막거나 단색 덧칠로 증상을 숨기지 않는다.

UI·모바일·영웅 포즈·스토리·진행 로직은 관련 없는 한 보존한다. 런타임 파일을 변경했을 때만 해당 index.html 캐시 키를 갱신한다. 검사, PNG 육안 확인, main 업로드, Pages 배포를 각각 구분해 보고한다. 검사 산출물 PNG/로그를 소스에 무분별하게 커밋하지 않는다.

```bash
# 저장소 루트. 필요한 Playwright/Chromium 설치 후.
node tests/laser-release-gate.cjs
```

`CODEX_PRIMARY_RUNTIME_NODE_MODULES`로 Playwright 위치, `HAPIL_RELEASE_OUTPUT`으로 출력 루트 지정 가능. 일부 기존 테스트는 Linux `/usr/bin/chromium` 및 `/workspace/hapil-deliverables/RC119-body`를 사용하므로 Actions 설정을 참고한다.

이 문서가 인계 수단이다. 다른 Dots 대화로 세션을 직접 전송하거나 에이전트를 자동 실행했다는 뜻은 아니다.
