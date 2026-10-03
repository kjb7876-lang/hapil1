# 잡있으(Dots) 인수 — RC127 전투 색감 / 이동 / 쿨타임 / 시전 유지

날짜: 2026-10-02. 최신 main을 먼저 읽고 작은 diff로 이어서 작업한다. 이 문서는 실행 지시를 다른 Dots 대화에 자동 전송했다는 뜻이 아니다. 이 문서 이후의 최종 main SHA와 공개 Pages 검사 결과는 이슈 #3의 RC127 최종 댓글을 확인한다.

## 기준과 검사

- 시작 main: `0aa5c8dffeb57714179076152196ad10a8ece93d` (RC126, 42602).
- 최종 검증한 런타임/검사 SHA: `a4e210fc2df36ba853c4b2e1f73ebf86e77524f6`.
- 작업 브랜치: `fix/rc127-dark-combat`.
- 캐시 버전: `42701`. 기존 주소 유지: https://kjb7876-lang.github.io/hapil1/?v=42701
- 최종 배포 전 검사 run: https://github.com/kjb7876-lang/hapil1/actions/runs/37014024872
- 위 run의 integrate, tests(rc127), tests(regression)는 모두 success. 단위검사와 실제 Chromium PC/세로/가로에서 새 기능 검사, 기존 회귀검사 10개를 수행했다. 픽스처로 실제 런타임 함수를 호출한 검사와 자연 플레이를 구분한다.
- 최종 증거 브랜치: `qa/rc127-evidence-37014024872`, 루트 `qa/rc127-evidence/`. artifact별 하위 경로 `rc127-rc127-37014024872/home/runner/work/_temp/rc127-evidence/rc127/results.json` 및 PNG와, `rc127-regression-37014024872/`의 로그/PNG를 읽는다.
- 증거 업로드에는 최초 실패도 보존했다. 최종 성공만으로 이전 실패가 없었다고 서술하지 않는다.

## 1. 젤리빈: 공통 자산만 색감과 재질 변경

새 `assets/rc127/dark-jelly.js` (`__HAPIL_DARK_JELLY_RC127__`)가 기존 `danmaku-jellybean.webp`의 알파를 그대로 사용한다. 몸체는 어두운 흑요석 계열, 가장자리와 가는 균열/광물 반사는 보스 고유색, 그림자는 맵의 색/이름/주제에 따른 보조색이다. 루시퍼/가면/심연은 어두운 적자색, 독/숲은 탁한 녹색, 화염은 적갈색, 탐욕/황금은 오래된 금색을 보조로 쓴다. 고유 공격 이미지를 모두 젤리빈으로 바꾼 것은 아니다.

범위: 기존 RC126 공통 자산 교체 경로, native DANMAKU 공통 렌더, decoded/reflected common 경로. 판정 반경, 스프라이트 크기, 발사 속력, 특수 이미지, RC126 사용 장부는 보존한다. 픽셀 알파를 그대로 복사하므로 새 사각 배경이 생기지 않으며 RNG를 소비하지 않는다. 색상/맵별 결과를 캐시하고 원본 이미지당 16변형을 상한으로 두었다.

검사: 실제 이미지 decode → 세 보스/맵 대표 색상 변환 → 원본/결과의 모든 알파 픽셀 비교에서 차이0. 실제 projectile pipeline의 common bitmap 렌더와 캐시 재사용도 검사했다. 이것은 각 맵의 미적 완성도를 육안 전수 검토했다는 뜻은 아니다.

## 2. 777 기준 일반 이동속도 고정과 방어 전환

새 `assets/rc127/combat-policy.js` (`__HAPIL_POLICY_RC127__`)의 고정값은 `4.75 * 1.21 * 1.126 = 6.471685` 월드 단위/초이다. 개발자 777이 부여하는 기본 속도 공명3과 영웅 숙련7의, 일시 각성/시간가속이 없는 실제 native 기준값을 브라우저에서 대조했다.

일반 이동계수는 영웅, STORY/HELL/DREAM, 성장, 각성, 시간가속에 따라 바뀌지 않는다. 블링크/돌진의 스킬 이동, 충돌, 맵 경계, 입력/사망 잠금은 별도로 보존했다. 이동은 기존의 실제 프레임 delta를 쓰므로 사몽의 적 시간축을 곱하지 않는다.

기존 저장키 `speed`와 `infiniteSpeed`를 유지하되 다음과 같이 피격 피해감소로 읽는다.

- 기본 이동 공명: 단계당 7%, 3단계 21%.
- 무한 이동 성장: 기존 로그 성장률에 대응하는 감소율, 해당 항목 상한40%.
- 영웅 숙련의 종전 이동 보너스: 단계당1.8%, 숙련7에서12.6%.
- 각성/시간가속 중 종전 이동 보너스도 해당 활성 시간의 피해감소로 전환.
- 항목끼리 합산하지 않고 잔여 피해를 곱한다. 이 전환 모듈의 총 피해감소 상한75%, 잔여배율 최소0.25. 기존 다른 피해/난이도 정책과 기본 최소피해 규칙은 보존했다. 전환율을 게임 전체 모든 방어 효과의 최종 상한으로 혼동하지 않는다.
- 본인 비용/환경/아군/반사 표식은 이 새 방어 계수에서 제외한다.
- 기본 공명과 무한 성장 설명을 피해감소/이동고정 문구로 바꿨다. 기존 획득 단계와 파편을 초기화하지 않는다.

디버그 상태: `state.rc127MovementSpeed`, `state.rc127Defense`, policy.snapshot(). 캐릭터가 움직일 때만 성장한다는 뜻이 아니라 프레임 이동계수 산출 때 갱신되는 캐시다.

## 3. STORY 보스 쿨타임 2배

변경 대상은 새 스킬 시작을 허용하는 시각이다. native Ei, spatial rift, boss combat pattern, theme ordnance, DANMAKU, cosmic arsenal의 시작 경계에서 기존 준비 시각을 현재 시각 기준 2배로 조정한다. 중첩 호출은 WeakMap 트랜잭션으로 한 번만 계산한다. 거절된 시전은 쿨타임을 소비하지 않는다. 공통 RC95 탄막/레이저의 다음 허용시각도 STORY 보스에 적용했다.

선딜, 이미 생성한 pending hit의 at, 연속탄 발사 시각, 공격의 실제 유효 수명은 쿨타임 계산으로 늘리거나 잘라내지 않는다. `recoverUntil` 같은 다음 행동 허용 시각은 길어질 수 있으나 실제 공격 resolve 시각은 유지된다. 이 때문에 여유가 생기되 이미 시작한 스킬 자체는 느려지지 않는다.

보스(`boss === true`)에만 적용하며 일반 적/중간보스 표식만 있는 적, HELL, DREAM은 이 배율을 적용하지 않는다. 현대 `gameModeV31346:'HELL'`과 기존 `hellModeV31322:true` 양쪽을 검사해 구형 저장/실행 상태가 STORY로 잘못 분류되지 않게 했다. DREAM이 명시된 경우 DREAM이 우선한다.

## 4. 중간 중단 디버깅: 특히 코스믹 가면 루시퍼

- 기존 skill-completion은 cast.id를 actor.id와 비교했다. cast의 고유 일련번호가 아닌 sourceId/ownerId로 소유자를 식별하도록 수정했다.
- pendingHits/impactQueue/hostileProjectiles/bossLaserCasts까지 현재 실제 예약된 공격을 추적한다. 소유자의 마지막 타격/발사 및 보호 만료시각까지 시전을 보호한다. 제거되거나 피해가 억제된 공격을 계속 붙들지 않는다.
- DANMAKU는 체력 단계가 바뀌었다는 이유만으로 진행 중인 volley를 삭제하지 않는다. 일시 스킬 억제는 기존 일시정지/지연 경로로 이어진다.
- 루시퍼는 명시한 세 공격 선택을 전역 페이즈로 덮어쓰지 않는다. delayed cloned pending hit가 생겨도 실제 큐 항목의 resolve/interrupt 보호 시각과 마지막 시전 보호를 동기화한다. 시간정지/억제 시 발사되지 않은 탄이 사라지지 않는다.
- 일반 회피용 보스 공격 리셋이 이미 보호된 특수 시전을 끊지 못하도록 guard를 추가했다.
- 실제 사망, 소유자의 실제 제거, 맵 이탈 시 취소/정리는 유지한다. 죽은 보스의 공격을 영구 유지하는 방식이 아니다.

실제 native 검증: `a11-boss`의 beforeDeath를 호출해 실제 `a11-cosmic-v31318`을 생성하고, STORY/HELL/DREAM에서 각각 reliquary(5회, 낙하 간격0.6초), blood-beam(1회, 선딜3.8초), abyss-fan(24발, 두 발사 박자)을 실행했다. 각 시전의 마지막 타격 VFX 또는 모든 발사까지, 지연/일시정지, 피격 경직 보호, 사망 후 정리를 확인했다. PC/세로/가로 모두 취소0인 정상 전달 케이스가 통과했다. 이는 플레이어가 전 캠페인을 자연 완주한 검사가 아니라 native staged regression이다.

## 5. 보존 및 회귀검사

공통 레이저 `assets/rc77/connected-laser.js`는 승인 blob `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df` 그대로다. RC124 외곽 연장/HP와 RC125 adaptive battlefield, RC126 유한 공격 기하/장부/분산, 음성/서사/맵 파일을 롤백하지 않았다. bundle diff는 줄바꿈 기준33줄 추가/23줄 삭제이며 전체 재작성하지 않았다.

최종 run에서 성공한 기존10개: rc126-finite-native, rc126-combat-safety-smoke, rc43-bloodied-projectile-flight, rc126-combat-browser, rc125-adaptive-battlefield-browser, rc125-first-frame-browser, rc123-boundary-smoke, rc122-autoplay-policy-smoke, rc115-map-advance-smoke, rc91-samong-and-laser-smoke.

개발 중 실패 기록: run37012813965는 이전 쿨타임이 끝나지 않은 단위 fixture 때문에 중단되어 배포되지 않았다. run37013091115는 native HELL fixture의 모드 표식 불일치와 모드 판별 취약성을 드러냈다. 실제 HELL 상태를 구성하고 현대/구형 표식 양쪽을 방어하는 코드를 추가한 뒤 run37014024872의 전체 검사를 다시 통과했다. 실패 로그는 그대로 보존한다.

## 6. 배포 및 잡있으 후속 확인

main 반영 시 `.github/workflows/rc127-published.yml`가 공개 index/모듈16개를 현재 검사 SHA256과 대조하고 PC/세로/가로 실제 시작을 관측한다. 네트워크 응답을 바꿔 끼우거나 HP/진행 상태를 강제로 주입하지 않으며, 실제 공개 시뮬레이션의 고정 속도와 방어값도 확인한다. 성공/실패와 최종 배포SHA는 이슈 #3 댓글 및 `qa/rc127-public-RUNID` 브랜치 기록을 확인한다. 문서를 작성한 것만으로 공개 검사를 완료했다고 간주하지 않는다.

로컬 실행/이미지 열기 도구는 이 세션에서 오류여서 GitHub Actions로 실행했다. 실제 브라우저 PNG와 픽셀 검사는 남겼지만 PNG 직접 육안 판독은 완료하지 못했다. 잡있으는 세 화면의 `*-dark-jelly.png`, `*-cosmic-final-delivery.png`를 열어 색상·가독성·어두운 맵 대비를 확인한다.

기존 RC126의 PC DREAM 반복 사망/첫보스 자연 진행, blue-executor/소환몹 전체 생명주기, 모든 맵 전환, 모든 영웅/모드 자연 완주, 실물 iPhone/Safari 성능 검사는 이번 변경만으로 해결/완료 표시하지 않는다. 기존 인수 문서를 함께 읽는다. 음성 고품질 작업과 문장 끝 '-다' 개선은 이번 전투 패치에서 건드리지 않았다.

`tools/apply-rc127.cjs`와 `tools/refine-rc127-tests.cjs`는 이미 적용한 통합용 도구다. 이후 변경은 현재 런타임을 읽고 작은 diff로 처리하며 전체 롤백/force push는 하지 않는다.
