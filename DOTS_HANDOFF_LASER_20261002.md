# 잡있으(Dots) 인계: 레이저 회귀 점검

작성일: 2026-10-02. 잡있으는 사용자가 만든 GPT Dots 에이전트다.
저장소: `kjb7876-lang/hapil1`, 작업 브랜치: `main`.
기존 서비스: https://kjb7876-lang.github.io/hapil1/

## 요청과 작업 기준

사용자 요청은 레이저 위 불투명 사각 이미지와 단절 패턴을 최소 수정하고, 정상 레이저 질감 및 이후 다른 개선을 보존하며, 실제 렌더·진행 안전 검사를 거쳐 기존 GitHub Pages에서 계속 서비스하는 것이다.

- 사용자 요청 당시 main: `51d551f5a0d9e50d49e0c19aa006bc3e4343ac7c`.
- 사용자가 지정한 정상 화면 참고: `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`.
- 조사 시 이미 main에 존재한 복원 커밋: `f159c8f8e5f53c8f570baf97d9491a60f8507745`, `RC120 restore approved laser art and remove solid overlays`.
- 이후 이 인계 작업에서 검사기와 CI, 문서를 추가했다. 작업 재개 시 반드시 원격 main을 다시 읽는다. 위의 오래된 SHA로 main 전체를 되돌리지 않는다.

## 소스로 확인한 내용

1. RC120의 `assets/rc77/connected-laser.js`는 정상 참고 19a4c1f의 같은 파일과 Git blob SHA가 정확히 같다: `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`.
2. RC120은 RC119에서 추가한 `beamArt()` 및 공통 그라디언트 대체 경로를 제거하고 `options.image`의 원래 보스별 이미지를 다시 사용한다.
3. RC120은 `assets/index-v31526.js`의 line geometry 내부 색상 fill 덧칠 7줄을 제거했다.
4. RC120의 `index.html`에서 연결 렌더러와 메인 번들 캐시 키는 `v=41605`다. 렌더러의 내부 version 문자열 RC107만 보고 배포가 오래됐다고 판단하지 않는다.
5. 51d551f에서 RC120까지의 변경 파일은 메인 번들, 연결 렌더러, index.html, `tests/rc119-laser-body-browser.cjs`뿐이다. 19a4c1f 이후의 모바일·세로 화면·영웅 방향·무기 소켓·맵 진행 개선은 전체 롤백하지 않았다.
6. RC120의 기존 Pages 배포는 GitHub Actions run `36964235704`에서 success로 확인했다. 배포 성공은 브라우저 렌더 검사 통과를 의미하지 않는다.

RC120 복원 코드는 이 인계 세션이 새로 작성한 코드가 아니라, 조사 시 이미 존재한 선행 작업이다. 미확인 부분을 고쳤다고 보고하지 않는다.

## 이 인계 세션에서 추가한 개선

### 엄격한 검사기

`tests/laser-release-gate.cjs` (추가 커밋 `302f0b7d4eba32c7947be6a3fcc17d77ceaea84f`).

9개 항목을 독립 실행하고 종료 코드·오류·소요시간·로그·대상 커밋을 JSON으로 기록한다.

- 연결 렌더러 / 메인 번들 구문 검사 2개.
- 정상 참고 렌더러와 픽셀 일치 및 투명 이미지에 추가 덧칠이 없는지 검사.
- 경고 / 발사 경계 / 발사 중 / 동시 시전 / 종료 단계 검사.
- 레이저 연속성 및 예고 검사.
- 전투, 맵 진행 로직, 자연 Story 진행 검사.

중요: 기존 `tests/rc115-natural-story-portal-browser.cjs`는 JS·HTTP 오류만 assert하므로 `changedZone:false`여도 종료 코드 0일 수 있다. 새 검사기는 결과 JSON을 별도로 읽어 실제 시작 맵 이탈, 생존, 진행 상태 치트 미사용, 오류 없음까지 확인한다. 150초 안에 이 조건을 입증하지 못하면 성공으로 처리하지 않는다. 이 제한 시간 내 미통과는 추가 조사 사유이지 곧바로 게임 불능을 증명하는 것은 아니다.

### 원격 Chromium 검사

`.github/workflows/laser-release-audit.yml` (추가 커밋 `24d1c7613cc2abf655b9026a76796c773843b8d8`).

- GitHub-hosted Ubuntu 24.04, Node 22, 격리된 Playwright 1.55.1 환경.
- main 레이저 관련 변경 또는 수동 workflow_dispatch로 실행.
- 저장소 읽기 권한만 사용. main 자동 수정, 저장 데이터 변경, 강제 배포는 하지 않는다.
- 기존 Pages 배포 설정은 그대로다. 이 audit는 branch protection이나 Pages의 필수 선행 조건으로 설정된 것이 아니다.
- 결과와 PNG를 `laser-release-<검사대상SHA>` artifact에 14일 보관한다.

첫 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36966963378
검사대상 SHA: `24d1c7613cc2abf655b9026a76796c773843b8d8`.

### 현재 확인 수준

이 문서 최초 작성 시 위 CI 실행은 시작되었고, 결과는 아직 확정되지 않았다. 통과 개수나 실제 스크린샷의 육안 검토 완료를 추정하지 않는다. 다음 담당자는 해당 실행의 최종 conclusion뿐 아니라 `release-summary.json`과 실패 항목 로그를 확인한다.

이 대화의 로컬 container/Python은 실행 도구 오류로 사용할 수 없어서 GitHub Actions로 검사를 옮겼다. 이 로컬 실패를 게임 코드의 실패로 혼동하지 않는다.

## 검사 결과 읽는 방법

Actions의 `Laser release audit` 실행을 열어 `Publish exact results in the job log and summary` 단계 또는 artifact의 `release-summary.json`을 본다.

`status`, `testedCommit`, 각 `suites[].status`, `suites[].error`, `natural-story.progression`을 확인한다. setup 실패, 취소, timeout, 누락 JSON은 통과가 아니다. 자연 진행은 `changedZone:true`와 `usedProgressCheats:false`가 함께 있어야 한다.

`approved-art` 테스트의 분홍색 합성 이미지는 렌더러 구조·추가 덧칠 회귀를 검사하기 위한 것이다. 이 테스트만으로 모든 보스 고유 텍스처의 미술 품질을 승인해서는 안 된다. phase/continuity 테스트의 실제 게임 텍스처 PNG와 전투 화면을 추가로 확인한다.

## 재개 순서

1. 로컬 변경사항을 먼저 확인하고 보존한다. `git fetch origin main` 후 최신 원격 커밋을 읽는다. 깨끗한 작업 트리에서만 fast-forward하거나 별도 worktree를 사용한다. force push / hard reset / 전체 파일 롤백 금지.
2. 위 CI 실행과 artifact를 먼저 읽는다. 이미 해결된 RC119 공통 그라디언트·덧칠 문제를 다시 만들지 않는다.
3. 문제가 남았으면 같은 보스·동일 시전 단계·동일 해상도에서 재현하고 실제 이미지 src, Canvas 합성 모드, clip, draw 순서를 기록한다. 새로운 공통 빔 도형이나 색상 사각형으로 덮어서 숨기지 않는다.
4. 곡선·십자·분기·직선 및 모바일 lowFx를 검사한다. `assets/rc108/laser-topology.js`의 의도된 회피 통로는 연결선으로 막지 않는다. 렌더와 피해 판정의 공통 기하도형을 보존한다.
5. 실제 변경이 필요할 때만 좁은 패치를 만든다. UI, 스토리, 영웅 방향, 전투 규칙, 진행 조건은 관련 없는 한 수정하지 않는다.
6. `node tests/laser-release-gate.cjs` 또는 Actions를 다시 실행하고, PNG를 직접 검토한 부분과 자동검사만 한 부분을 구분해서 보고한다.
7. 원격이 바뀌지 않았는지 확인하고 main에 반영한다. 런타임 파일을 바꾼 경우에만 해당 index.html 캐시 키를 갱신한다. 기존 Pages 성공과 실제 서비스 로딩을 각각 확인한다.

## 로컬 실행 조건

기존 개별 테스트들은 Playwright 모듈 및 Linux `/usr/bin/chromium`을 요구하고 일부는 `/workspace/hapil-deliverables/RC119-body`에 PNG를 저장한다. 실행 환경이 다르면 앱 코드를 바꾸지 말고 테스트 런처·출력 경로를 환경에 맞춰 설정한다.

```bash
# 저장소 루트, 필요한 브라우저/의존성 설치 이후
node tests/laser-release-gate.cjs
```

`CODEX_PRIMARY_RUNTIME_NODE_MODULES`로 Playwright 설치 위치를 지정할 수 있다. 결과 루트는 `HAPIL_RELEASE_OUTPUT`로 지정한다. 기본 결과 디렉터리는 `qa-results/laser-release`다.

## 보고 시 구분할 것

- 소스 검토, 실제 브라우저 자동검사, PNG 육안 검사, main 업로드, Pages 배포를 각각 따로 표시한다.
- 테스트 완료 전 '모든 버그 없음', '전수 통과', '진행 안전 보장'이라고 보고하지 않는다.
- 이 문서를 저장소에 남긴 것이 인계 수단이다. 다른 Dots 대화로 직접 세션을 전송하거나 작업을 자동 실행시켰다는 뜻은 아니다.
