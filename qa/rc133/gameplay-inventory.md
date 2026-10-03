# RC133 전투 피드백·보스 돌진·중간보스 인벤토리

기준 브랜치 codex/rc133-samong-inner-self, 시작 커밋 70891e3df369442a50fcc3febf9c0401a382739a. 소스 위치는 assets/index-v31526.js의 현재 행이다. 중간보스 목록은 Chromium에서 게임 번들을 읽기 전용으로 실행한 뒤 window.__HAPIL_EPISODE1_RC59__.audit()와 최종 런타임 roster를 대조했다. 행위나 저장 데이터는 수정하지 않았다.

## 보스 차지·돌진 계열

| 계열 | 코드 위치 | 현재 동작 | RC133과의 관계 |
| --- | --- | --- | --- |
| 기본 간격 돌진 gapChargeV31226 | 43640–43789; 보스 브레인 연결 44556–44560; 마지막 RC133 바인딩 126590 | 보스와 중간보스가 각각 플레이어와 7.8/8.25칸 안에 있을 때 예약한다. 보스는 0.72초, 중간보스는 0.66초 뒤 목표선을 따라 이동하고 선형 히트를 낸다. 재사용 대기는 보스 7.2초, 중간보스 8.4초다. 사망·경직·페이즈 전환 때 취소된다. | RC133 바인딩은 보스/중간보스의 이 함수를 우회하고 예약된 gapChargeV31226 상태를 지운 뒤 안전 조건을 확인해 강제 워프를 시도한다. 이 처리만으로 다른 차지 계열도 꺼지지는 않는다. |
| 테마 보스 차지 dynamicBossAttackV31315 | 116157–116371; 실제 차지 큐 116250–116275; alternating-cycle 래퍼 116354–116356; RC133 tick 126595 | V31315가 등록한 71개 전투 소유자 가운데 런타임 profile()이 유효한 보스·중간보스 29개는 보스 공격 주기의 홀수 회차에 차지를 예약한다. 전조 뒤 pendingHits에 실제 피해를 넣고, 보스 피해 상한은 36, 중간보스는 26이다. 보스 대기시간은 18초, 중간보스는 21초이며 테마별 전조는 1.65–1.9초다. | RC133은 이 래퍼나 enqueue()를 가로채지 않는다. 따라서 gapChargeV31226 억제와 별개로 이 공격은 계속 가능하다. |
| V31315 프로필의 dash 경로 | 116198–116201, 116250–116263, 116281–116288 | 런타임 프로필은 mb-dist03, b07-boss, l301-boss에 mode: dash를 지정한다. 하지만 enqueue()가 요청된 dash를 즉시 cross로 바꾼다. 그 결과 생성된 타격은 십자형이고, 실제 이동을 시작하는 onImpact()의 mode === 'dash' 조건은 정상 enqueue() 경로에서 충족되지 않는다. | 별도 결함 가능성이 확인됐지만 이번 작업은 이를 변경하지 않았다. |
| 보스별 시그니처 덱의 돌진 명칭 | actor 시그니처 47588–47595; 서사 프로필 5448–5500; 룰 프로필 70320 | b07-boss 덱에 dash-trail-converge / dash-trail-convergence가 있고, l301-boss 덱에 six-image-charge가 있다. 이들은 위의 gapChargeV31226 함수가 아닌 보스별 패턴 계열이다. | 이번 정적 인벤토리만으로 개별 패턴의 물리 이동 여부까지 확인하지 않았다. 기본 gap-charge 차단과 V31315 차지 차단만으로 이 덱의 패턴을 없다고 간주하면 안 된다. |
| 테마 방어 구조물 차지 | 116600–116781 | 45개 검증된 적대 목표 구조물이 정지 사격을 1.05초 충전한다. owns()는 목표 구조물만 허용하고 boss/midboss는 제외한다. | 보스 차지와 별도 시스템이며 RC133 보스 억제 대상이 아니다. |
| 플레이어 차지 입력 | 123408–123411 | KeyA 또는 모바일 포인터로 발동하는 플레이어 입력이다. | 적 보스 공격이 아니므로 위 인벤토리의 보스 차지 수에 포함하지 않는다. |

V31315에서 실시간으로 프로필이 반환된 29개는 다음과 같다. dash는 선언된 프로필 모드이며 실제 enqueue() 결과는 위 제한을 따른다.

| 선언 모드 | 활성 프로필 보스·중간보스 ID |
| --- | --- |
| dash (3) | mb-dist03, b07-boss, l301-boss |
| safe (7) | mb-dist05, dist06-boss, mb-ep1b07, mb-last302-v31231, l303-boss, h103-boss, c102-boss |
| cross (19) | mb-dist06, b09-boss, u201-mid, u202-mid, u203-mid, u203-boss, kair-great-03, k103-boss, c104-mid, c104-boss, u204-mid, u205-mid, u206-mid, kair-great-01, kair-great-02, kair-great-04, kair-great-05, kair-great-06, c106-mid |

## 스토리·드림 중간보스

기본 actor ID ↔ zone 표는 70210–70235, 계열별 미니 덱/토폴로지는 70246–70285다. RC59가 초기 roster를 짝으로 만드는 규칙은 125392–125896, 특히 pairPlan()은 125726–125770, 복원은 125500–125529다. 전투 3차 웨이브의 중간보스 생성 지점은 61529–61536이다.

런타임 RC59 audit에서 확인한 42개 zone과 주 actor는 아래와 같다. 이 목록은 authored actor의 분포이고, RC59가 짝을 추가하며 RC133이 Dream에서 세 번째 actor를 추가할 수 있다.

| 구간 | 중간보스 actor ID |
| --- | --- |
| Dist dist01–dist06 | mb-dist01–mb-dist06 |
| Episode 1-A ep1a07–ep1a11 | mb-ep1a07–mb-ep1a11 |
| Episode 1-B ep1b01–ep1b06, ep1b06b, ep1b07–ep1b09 | mb-ep1b01–mb-ep1b06, mb-ep1b06b, mb-ep1b07–mb-ep1b09 |
| U2 u201–u206 | u201-mid–u206-mid |
| Last/Kair | last302: mb-last302-v31231; kair01: mb-kair01-v31231; kair04: mb-kair04-v31231; kair08: kair-great-05 |
| Hando hando01–hando03 | mb-hando01–mb-hando03 |
| Murder murder01–murder04 | mb-murder01–mb-murder03; murder04-mid |
| Cult cult01, cult04–cult06 | c101-mid; c104-mid; c105-mid; c106-mid |

Cult03은 중간보스 목록의 일반 행이 아니라 특별 전투다. RC59 release policy는 authored apostate boss를 유지하고 중간보스 파트너를 보존한다고 명시하며, smoke test는 c103-mid/c103-boss 조합을 짝짓기한다 (tests/rc59-death-checkpoint-midboss-duo-smoke.cjs:33–36).

RC59 초기 정책은 pairPlan()에 중간보스 1명이면 -duo-rc59 actor를 만든다. 2–3명은 그대로 보존하고 3명을 넘으면 첫 3명까지만 남긴다. 생성된 짝은 원본 체력의 78%로 시작하고, 원본과의 간격 및 지형을 고려해 자리를 잡는다. 복원 과정은 예전 저장에 짝이 빠졌을 때 복구한다.

RC133의 추가 규칙은 126550–126575다. U().enabled(state)가 참인 사몽/Dream은 짝 그룹을 3명까지 채우고, Story는 2명까지만 둔다. 추가 actor는 같은 arc의 다른 sprite를 우선 사용하고 leader max HP의 70%를 갖는다. 저장/검증/복원 경로는 126585–126588에 있으며, 추가 actor 저장 데이터는 좌표/체력 유효성 검사 후 최대 4개까지 정규화한다.

tests/rc133-browser.cjs:30–31은 첫 authored 중간보스 zone에서 Story 2명, Dream 3명과 서로 다른 sprite를 staged fixture로 확인한다. tests/rc59-death-checkpoint-midboss-duo-smoke.cjs는 짝짓기·저장/복원 정책을 확인한다. 42개 zone 각각에 대한 자연 캠페인 전투 검증이나 실물 모바일 검증을 뜻하지는 않는다.

## 새 단위 검사에서 재현한 수정

assets/rc128/combat-feedback.js:88–94에서 방어 출처별 throttle 시각을 전역 출력 간격 검사보다 먼저 기록하면, 같은 프레임의 출력 상한에 막혀 표시되지 않은 출처까지 180ms/450ms throttle을 소비한다. 기록 시점을 출력 admission 이후로 옮겼다. 회귀 사례는 tests/rc133-feedback-unit.cjs:116–201에 있으며 서로 다른 source ID, 25ms 출력 간격, 32개 효과 큐 한도, 연속 레이저의 450ms coalescing, 80회 반복 접촉, 실제 HIT/PARRY/EVADE/CANCELLED 분류, 접촉 MISS 및 0 피해 억제를 다룬다.

검사 결과: node tests/rc133-feedback-unit.cjs — **68 checks passed**. 인접 회귀 확인: node tests/rc59-death-checkpoint-midboss-duo-smoke.cjs — **passed**; node tests/rc87-episode-cosmic-smoke.cjs — **passed**.
