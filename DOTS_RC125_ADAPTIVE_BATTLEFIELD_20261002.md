# RC125 — 반응형 전투영역 / HUD 정리

2026-10-02, kjb7876-lang/hapil1. 잡있으(Dots)를 위한 실제 구현 기록이다. 다른 Dots 대화를 자동 실행하거나 작업을 전송했다는 의미는 아니다.

## 기준과 확인 경로

- 기준 main: `257b920a470e0ee6a04e5a52d71157f66232682c` (RC124, cache42401).
- 작업 브랜치: `fix/rc125-adaptive-battlefield`.
- 실제 통합 커밋: `e989e80c9fab421d1dbf7840f48bfd12fc531b17`.
- 최종 검사 대상 코드/테스트 SHA: `4942ca213c906a7f519d9a13ac3f1fd3a13a2770`.
- 위 두 SHA 사이에는 portrait 검사 코드만 바뀌었고 게임 코드는 같다.
- 검사 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36995238324
- 이 문서는 검사 대상 이후 추가된 설명 파일이다. 최종 main/Pages SHA와 완료 상태는 이슈 #3의 RC125 배포 기록 및 실제 Actions에서 확인한다. 문서 작성이나 테스트 파일 존재만으로 배포 성공을 의미하지 않는다.

## 실제 변경

### 1. PC / 모바일 가로의 고정 화면 비율 해제

`assets/rc125/adaptive-battlefield.css`가 전투 canvas를 사용 가능한 stage 전체로 채운다. PC의 고정16:9 박스와 좌우/상하 남는 여백을 제거한다. 단순 CSS 늘이기로 캐릭터·탄막을 왜곡하는 방식이 아니다.

`assets/rc125/adaptive-battlefield.js`가 실제 stage 크기를 ResizeObserver로 읽는다. 논리 창은 `k=min(width/1280,height/720)`에 따라 확장하고, native world draw의 saved context 안에서 CSS 비율에 대한 역변환을 적용한다. 화면에서의 최종 x/y 배율은 같아지며, 마우스 좌표는 동일한 창/배율을 역변환한 뒤 기존 native world inverse를 사용한다.

기존 backing canvas 크기와 해상도·성능 예산, 시뮬레이션 업데이트 횟수는 보존한다. 화면마다 canvas를 대형 해상도로 증설하거나 전투를 추가 tick 하지 않는다. native bundle은 world draw의 save/translate 한 앵커와 끝의 install 호출만 변경했다(4줄 추가/1줄 삭제).

PC 카메라는 실제 기록된 맵 사각형 전체를 가용 영역에 맞춘다. 모바일 가로는 기존1.05 배율 정책을 유지하면서 확장된 논리 창과 보호 여백으로 팬 위치를 구한다. 적이 증감할 때 줌을 계속 바꾸지 않는다.

### 2. HUD

PC는 상단32px 정보바, 나머지 전투영역, 하단44px 조작부로 분리한다. 적 정보는 왼쪽, 아군 정보는 오른쪽이다. 하단 공명·사몽 상태, S/D, 추가 스킬 창, 설정 버튼을 정리한다. 기존 추가 스킬 dialog와 설정 화면을 proxy로 열며 실제 원래 조작/설정 내용을 없애지 않는다.

모바일 가로는36px 상단 정보바를 사용하고 기존 큰 터치 조작 버튼을 유지한다. 중복 작은 S/D 버튼은 표시하지 않는다. 전체 자동 모드의 기존 터치 takeover 및 release 코드는 변경하지 않았다.

### 3. 모바일 세로 보존

이미390x844 전체를 쓰고 있던 세로 화면은 기존 RC115 보스/영웅 2분할, .525 카메라 배율과 입력 정책을 그대로 유지한다. RC125 world 변환은 세로에서 비활성이다. 세로 분할을 전면 재설계하거나 더 넓혔다고 주장하지 않는다.

### 4. 보존 파일과 런타임 범위

실제 런타임 변경은 `assets/index-v31526.js`, `index.html`, 신규 `assets/rc125/adaptive-battlefield.js` 및 `.css` 네 파일이다. cache는42501이다.

- `assets/rc77/connected-laser.js` 승인 blob: `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`, 변경하지 않았다.
- 승인 미술 기준: `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`.
- RC124 맵 외곽32 native pixel 레이저 연장과 native 보스 미니HP 블록을 변경하지 않았다.
- `assets/rc108/portrait-split.js`는 배포RC124 파일 전체와 바이트 단위로 같아야 한다.
- 공격력/HP/쿨타임/세이브/자동 진행/사몽 사망 로직을 변경하지 않았다.

## 측정한 전후 차이

같은 dist06-boss/branch-y 레이저/보스50%HP의 staged native 전투 장면으로 baseline RC124와 candidate를 비교했다. 전투 상태 고정은 로컬 검사 harness에만 있고 배포 코드에는 없다. 자연 진행 증거와 혼동하지 않는다.

| 뷰포트 | 이전 canvas 표시 크기 | 이후 canvas 표시 크기 | canvas 면적 증가 |
|---|---|---|---|
| PC1180x757 |1180x663.75|1180x681|2.5989%|
| PC1920x1080 |1728x972|1920x1004|14.7691%|
| 모바일 세로390x844 |390x844|390x844|0%, 기존 전체화면 보존|
| 모바일 가로844x390 |844x351|844x354|0.8547%|

이는 canvas 표시 면적이다. 맵 전체의 실제 월드 가시 면적 증가율, FPS 향상률, 모든 기기에서의 동일한 개선율이 아니다. 특히 가로 모바일의 핵심 개선은 가로/세로 표시 배율 불일치 교정과 대응 입력 좌표다.

전후 비교 PNG8장 및 JSON:
https://github.com/kjb7876-lang/hapil1/actions/runs/36995238324/artifacts/11221426915

## 검사 항목

- `tests/rc125-adaptive-battlefield-browser.cjs`: 위4개 해상도 전후 실제 native render, 빈 여백, stage/canvas 일치, 실제 native HP draw의 화면상 x/y 배율, 16개 world 좌표의 pointer 역변환, 적/아군 배치, 하단 조작 겹침, 설정/추가 스킬 dialog, 모바일 양방향 회전.
- `tests/rc124-overrun-health-browser.cjs`: 기존80 레이저 x4시점 x3화면, 종단8,019/접촉84,360, 기존70개 native 보스·중간보스 HP fixture, 실제 game canvas HP 캡처. 미해결 static actor blue-executor는 기존과 같이 미검사로 남는다.
- `tests/rc121-connected-topology-browser.cjs`: 기존 레이저 연결/동작 수명/접촉 및 세로 양쪽 화면의 프레임 유지.
- `tests/rc115-portrait-camera-browser.cjs`: 이동하는 origin/main 대신 실제 배포RC124 SHA를 기준으로 파일 전체 동일, .525 배율, 상단 입력 차단/하단 허용 및 분할 프레임을 확인한다.
- `tests/laser-release-gate.cjs`: 기존 release9개 및 자연 STORY dist00->dist01 관측. 이것은 전체 스토리 완주 검사가 아니다.
- 기존 자동조작 소유권, 맵 전환, 사몽/사망 대화, 모바일 자동조작 smoke 검사.

## 초기 실패와 제한

초기 native context 진단 workflow에서 진단 스크립트 괄호 오타가 있었고 수정 후 다시 읽었다. 게임 코드의 오류가 아니지만 실패 실행을 통과로 합산하지 않는다.

첫 통합 검사에서 연결 기하 자체는 세 화면 모두 통과했으나, 추가 실행한 과거 RC115 migration 검사가 존재하지 않는 origin/main 및 이미 지난1.05배율을 가정하여 실패했다. 실제 배포기준257b920으로 고정하고 RC125에서 유지되어야 하는 .525 배율과 파일 전체 불변을 검사하도록 바꿨다. 게임 배율을 바꾸거나 수치 허용범위를 넓혀 통과시킨 것이 아니다.

로컬 container/Python 실행은 ClientError로 사용하지 못하여 실제 Chromium 실행/캡처는 GitHub Actions에서 수행했다. 캡처 파일을 이 대화에서 직접 열어 육안 검토했다는 주장은 하지 않는다. native draw 행렬·좌표·픽셀 검사와 사람이 이미지를 직접 보는 것은 구분한다.

실물 iPhone/Android 기기 및 Safari 엔진 검사는 수행하지 않았다. 전체 모드·영웅·맵 완주, 반복 사망, 비레이저 모든 공격 판정, 탄환 산개/맵별 장부, 큰 자산 겹침, 서사 교정이 이번 UI 변경으로 전부 해결됐다고 간주하지 않는다.

## 인수

최신 main과 이슈 #3을 읽고 작은 diff로 이어간다. `tools/apply-rc125.cjs` 및 과거RC124 apply는 이미 적용된 일회성 도구이므로 재실행하지 않는다. force push, hard reset, 전체 롤백 금지. 설명 문서/테스트 존재/테스트 통과/main 반영/Pages 성공/공개 URL 검사는 각각 별도 증거로 판단한다.
