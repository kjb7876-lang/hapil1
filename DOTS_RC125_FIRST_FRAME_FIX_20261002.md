# RC125 후속 수정 — 최초 프레임 동기화

2026-10-02. 이 문서는 `DOTS_RC125_ADAPTIVE_BATTLEFIELD_20261002.md` 이후 발견한 문제와 실제 수정 기록이다. 최종 배포 결과는 이슈 #3의 마지막 RC125 기록 및 아래 Actions 실행의 실제 결과로 확인한다. 이 문서 존재 자체가 검사 통과나 공개 Pages 확인을 뜻하지 않는다.

## 버전과 정확한 대상

- 첫 RC125 main/Pages: `91a82460c7f1b748b9cecb04e4d79723969eacdb`, cache42501.
- 동기화 수정: `830618e9b36f16bfb45dc7da62254d85eeb38d49`.
- 동기화 helper blob: `8aa8902a0d894ed8864380e4414b1aaeac3d400f`.
- 후속 검사 대상 SHA: `73230d8c45f493af8d5c5c45341a583f9f6204fc`, cache42502.
- 회귀 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36996826383
- 이 설명 파일은 검사 SHA 뒤에 추가되며 게임 코드는 바꾸지 않는다.

## 실제 발견한 문제

첫 RC125의 고정 전투 장면 비교, 레이저/HP, 기존 보호 및 자연 진행 검사는 통과했다. 하지만 공개 Pages의 실제 STORY 시작부터 native 보스 HP draw 행렬을 기록하자 최초 프레임에서 배율 오류가 나왔다. 이를 성공으로 처리하지 않았다.

공개 진단 실행36996213403(job110803403345)에서 28개 native 보스 HP draw 중 첫1개만 x/y 배율 오차가 약3.8196%였고 나머지는 backing 정수 반올림 수준 약0.106% 이하였다. 첫 draw 당시 부모 stage와 helper는1180x639를 사용했지만 실제 canvas는1136x639였다. 다음 프레임은 stage/canvas가1180x681로 일치했다. 즉 부모 레이아웃 전환이 canvas의 기존16:9 해제보다 먼저 반영된 초기 동기화 문제였다. 단순히 시작 프레임을 버리거나 검사 기준을 느슨하게 하지 않았다.

진단 원본 JSON/PNG:
https://github.com/kjb7876-lang/hapil1/actions/runs/36996213403/artifacts/11222110673

## 실제 코드 수정

`assets/rc125/adaptive-battlefield.js`의 측정 대상을 부모 stage가 아닌 **실제로 그리는 canvas.getBoundingClientRect()**로 변경했다. ResizeObserver는 stage와 canvas 모두 관측한다. 카메라 계산과 native world transform 적용 직전 실제 canvas 크기를 동기화하고, pointer에서도 동일한 크기 정책을 사용한다. 최초 canvas 연결 시 bind를 먼저 수행한다.

시뮬레이션, 레이저 기하/질감, RC124 HP 블록, 기존 portrait-split.js는 수정하지 않았다. 회전 및 진입 시 임의 줌 변경이나 상태 주입을 하지 않는다. native bundle의 기존 RC125 한곳 연결은 그대로이며 이번 런타임 변경은 helper와 index의42501->42502 캐시 갱신이다.

## 추가한 검사

`tests/rc125-first-frame-browser.cjs`는 실제 게임 파일을 그대로 제공하는 local HTTP 또는 `HAPIL_TEST_BASE` 공개 URL로 실행한다. 외부 URL이면 주요6개파일의 HTTP200/SHA256 일치를 먼저 확인한다.

PC1180x757, 세로390x844, 가로844x390의 일반 STORY 시작을 UI로 수행하고, native fillRect를 첫 draw부터 추적한다. HP/적/진행/게임시간을 바꾸지 않으며, bundle append나 route interception도 하지 않는다. 첫600개 draw를 보존하고 초기 draw를 지우지 않는다. 넓은 화면에서 **모든 관측 draw**의 배율 오차<0.005와 실제canvas/측정크기 오차<=1px, 화면 내 보스 체력바 및 stage/canvas 일치를 요구한다. Portrait는 기존 split을 보존한다. JS 및 HTTP 오류도 실패 조건이다.

기존 layout 비교 뒤 이 검사를 실행하도록 회귀 workflow를 강화했다. 기존4개 추가 회귀 작업도 그대로 실행한다. 원래 일회성 apply를 재실행하지 않고 이미 검사한 index blob에서 캐시3군데만 변경하여 검사용 커밋을 생성했다.

## 인수와 한계

최종 main과 Pages SHA, 공개URL 테스트 통과 여부는 이슈 #3의 최종 기록을 읽는다. 초기42501 공개 검사 실패를42502 성공과 혼합하지 않는다. 첫 상태 고정 장면 검사와 이번 자연 시작 관측은 서로 다른 증거다. 전체 스토리/HELL/DREAM 완주, 실물 휴대폰/Safari, 모든 비레이저 공격을 검증한 것은 아니다.

PNG는 원격 Chromium이 실제 생성한다. 로컬 실행 도구 장애로 이 대화에서 이미지를 직접 열어 육안 판독하지 못했다는 제한은 유지한다. native 행렬/좌표/픽셀 및 자동 비교 검사와 사람이 직접 이미지를 보는 것은 구분한다.

잡있으(Dots)는 최신 main에서 작은 diff로 이어가며 RC124/RC125 일회성 apply 재실행, force push, hard reset, 전체 롤백을 하지 않는다.
