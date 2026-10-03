# RC124 — 레이저 외곽 여유 길이 / 보스 미니 체력바

2026-10-02. 저장소 kjb7876-lang/hapil1. 잡있으(Dots)가 이어 읽을 실제 작업 기록이다. 다른 에이전트 세션으로 자동 전송한 것은 아니다.

## 기준과 정확한 검사 커밋

- 기준 main: `17b8ab817b83238376c900bf7a10c1ab77d359e5` (RC123).
- 후보 브랜치: `fix/rc124-laser-overrun-boss-hp`.
- 최종 검사 SHA: `9530ed09bc551150d1a23155982deba56e18c173`.
- 검사 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36988975797
- overscan-hp / topology / release / safeguards 4개 작업 모두 실제 success를 확인했다.
- 이 문서는 검사 후 추가되는 설명 파일이며 게임 코드는 변경하지 않는다. 최종 main 및 Pages 반영 SHA와 성공 여부는 이슈 #3의 RC124 배포 기록과 실제 Actions에서 별도로 확인한다.

## 실제 수정

### 1. 레이저

`assets/rc124/laser-overrun.js`를 추가하고 native world projection G로 설치했다. RC123의 연결된 공통 보스 레이저 기하를 유지한 다음, 자유 종단을 마지막 접선 방향으로 맵 이미지 외곽보다 기본 32 native canvas 픽셀 더 나가도록 연장한다. 각 맵의 실제 geometry profile rect를 사용하며, 없는 경우 기존 공통 맵 이미지 사각형을 사용한다. 그리기와 접촉 판정은 동일한 확장 선분을 사용한다. 렌더 단계에서 공격 객체를 변경하지 않는다.

이미 기존 arena 경계가 맵 이미지보다 32픽셀 이상 바깥에 있는 끝점은 줄이지 않는다. dist06의 80개 패턴 검사에서 이런 끝점은 화면별 27개였고 최대 외곽 여유는 46.72681361694487픽셀이었다. 신규 연장은 정확한 32픽셀 프레임, 기존 종단 보존 예외는 원래 arena의 두 좌표 범위 및 경계에 속하는지 함께 검증한다. 무제한 연장이나 검사 허용 오차 확대가 아니다.

방출점, 기존 분기점, 닫힌 고리의 형태는 보존한다. native(h)라는 별도 유한 직선 hazard의 끝점을 추가로 변경한 것은 아니다. 모든 유한 공격을 억지로 맵 관통형으로 바꾸지 않는다.

### 2. 보스 미니 체력바

`assets/index-v31526.js`의 native 적 그리기 함수 Yn에서 HP 막대가 `showCombatInfo !== false` 조건 안에 있어 설명 숨김 설정과 함께 사라지는 원인을 확인했다. HP 막대를 이 조건 밖으로 옮겼다. 전투 설명, 긴 텍스트, 기타 정보는 계속 선택적으로 숨겨진다.

보스/중간보스 HP 막대는 기존 적 위치 기준 아래쪽 앵커를 사용하고, `hp / maxHp`를 0~1로 제한해 실제 체력을 표시한다. 얇은 밝은 테두리와 어두운 바탕으로 대비를 보완했다. HP 부분만 alpha 1 / filter none / shadowBlur 0으로 그린 후 캔버스 상태를 복구한다. HP 0 이하, 잘못된 maxHp, visualOnly 및 friendly 객체에는 막대를 표시하지 않는다. 같은 native 경로의 기존 일반 적 표시 조건도 보존했다.

체력, 피해량, 쿨타임, 진행 상태, 저장 데이터를 강제로 변경하지 않았다.

### 3. 로딩 및 보존

- index.html: helper 추가, bundle 캐시 `42201 -> 42401`.
- bundle 끝에서 `window.__HAPIL_LASER_OVERRUN_RC124__?.install(G)`를 호출한다.
- 승인 레이저 렌더러 `assets/rc77/connected-laser.js` blob `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`는 그대로다.
- 승인 미술 기준은 `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`. 레이저 위 불투명 사각형이나 공통 단색 빔을 추가하지 않았다.
- RC123 topology 파일, 자동 이동/출구 보조, 사몽/사망 처리, 영웅 이미지, 서사는 이번에 변경하지 않았다.

## 실제 검사 결과

### 신규 레이저 및 HP 검사

PC 1180x757, 모바일 세로 390x844, 모바일 가로 844x390. 각 화면에서 다음 결과를 확인했다.

- 레이저 80종 x 4시점. 열린 종단 2,673개, 전체 선분 중점 contact 28,120개. 기하/연결/접촉/입력 불변 검사 문제 0.
- 세 화면 합계: 960개 패턴-시점-화면 조합, 종단 8,019개, 접촉 표본 84,360개. 이는 모든 보스별 자연 플레이 횟수가 아니다.
- 실제 native bridge로 가져온 보스/중간보스 70개에 대해 HP 100%, 50%, 25%, 200% 제한, 저사양, HP 0, maxHp 0, visualOnly를 검사했다. 막대 개수, 비율, 실제 그린 픽셀 색/알파, HP 불변 검사 모두 통과했다.
- 카탈로그의 blue-executor (murder03)는 static actor bridge에서 반환되지 않아 검사 대상 70개에 포함하지 않았다. 미검사 대상을 통과로 합산하지 않는다.
- 실제 게임 canvas의 native HP 그리기 호출도 검사했다. branch-y / fork-link 각각 HP 100%와 25%에서 막대 존재와 길이 비율을 확인하고 세 화면에서 PNG 12장을 생성했다.
- 해당 세 화면의 pageerror 및 404 자산 응답은 0이었다.
- 기존 RC123 순수 기하 검사 23/23도 통과했다.

원본 PNG/JSON artifact: https://github.com/kjb7876-lang/hapil1/actions/runs/36988975797/artifacts/11218955771

artifact SHA256: `6e88327dc24e053eca5f6922959842939d9b26821319800332f8c6220c288b69`.

### 기존 회귀 검사

- 연결 기하 / 모바일 세로 분할 프레임 안정성 검사 success.
- 자동 이동 소유권, 출구 접근, 사몽 및 사망 대화 보호 검사 success.
- release gate 9/9: renderer-syntax, bundle-syntax, approved-art, laser-phases, laser-continuity, laser-telegraph, combat, map-advance, natural-story 모두 통과.
- STORY 자연 관측은 진행 강제 조작 없이 dist00 -> dist01, 최종 HP 193, 관측 경과 95,329ms. 전체 스토리 완주를 뜻하지 않는다.

release artifact: https://github.com/kjb7876-lang/hapil1/actions/runs/36988975797/artifacts/11218613038

## 검사 중 수정 내역과 한계

초기 후보는 screen -> world 역변환의 미세한 소수 오차로 기존 직선 유지 검사에 실패했다. 실제 world 접선에 같은 선형 매개변수 t를 적용하도록 구현을 수정해 해결했다. 초기 HP 검사는 static actor가 없는 카탈로그 항목을 복제하려 해 중단됐으며, 이를 명시적 미검사 목록으로 분리하고 필수 실제 보스 네 개의 포함을 강제했다. 이후 레이저 끝점 검사에서 이미 원래 경계가 맵 밖에 있는 선분까지 정확히 32픽셀이어야 한다는 과도한 조건을 수정했다. 원래 공격을 줄여 통과시키지 않고 기존 경계와 두 좌표 범위에 한정된 보존 예외를 검증했다. 이전 실패/취소 실행은 최종 통과로 합산하지 않는다.

캡처는 원격 Chromium에서 실제로 생성했지만 로컬 도구 ClientError로 이 대화에서 직접 열어 육안 판독하지 못했다. native painter 픽셀 검사 및 실제 전투 canvas 그리기 검사와 사람이 PNG를 직접 확인하는 것은 구분한다. 고정 장면의 HP 변경은 테스트 fixture 안에서만 수행하며 자연 진행 증거와 구분한다.

기존 PC 사몽 반복 사망, 전체 모드 완주, 탄환 산개/맵당 자산 장부, 큰 자산 간격, 서사 교정, 비레이저 판정 전수 검토는 이번 두 항목 수정으로 해결됐다고 간주하지 않는다.

## 인수 주의

tools/apply-rc124.cjs와 rc124-apply workflow는 큰 bundle의 정확한 두 앵커를 수정했던 일회성 도구다. 이미 적용됐으므로 다시 실행하지 않는다. 원래 blob hash가 다르면 중단하도록 되어 있다. 후속 작업은 최신 main을 읽고 작은 diff로 이어가며 force push, hard reset, 전체 롤백을 하지 않는다. 테스트 파일 존재, 실제 통과, main 반영, Pages 배포, 공개 URL 직접 플레이는 각각 별개로 확인한다.
