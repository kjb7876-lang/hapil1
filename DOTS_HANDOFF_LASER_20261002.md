# 잡있으(Dots) — HAPIL RC122 자동 이동·출구 접근 인계

갱신일: 2026-10-02. 저장소 `kjb7876-lang/hapil1`, 서비스 브랜치 `main`.
기존 서비스: https://kjb7876-lang.github.io/hapil1/

## 현재 단계와 기준

사용자의 '다음작업해줘' 요청에 따라 자동 기술 중 이동 억제와 클리어 후 출구 접근 보조 처리를 수정했다. **PC 사몽 반복 사망 자체는 아직 해결되지 않았다.** 이동 검사 통과를 자동 클리어 성공으로 보고하지 않는다.

- 시작 main / 기존 RC121 배포: `12312df6acc6f39be03214a4852dc6851a783518`.
- 작업 브랜치: `fix/rc122-autoplay-transitions`.
- 실제 런타임 검사 커밋: `39df6b11aac7107cd6a18b69522aecf89f34645b`.
- 검사 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36978178836
- RC122 관측 기록: `DOTS_RC122_AUDIT_RESULTS_20261002.json`.
- 이후 `2d8fed9817936fc096c7bc8f4a0d0986b74e9ad3`은 일회성 검사 파일·CI 정리만 수행했다. 문서 및 정리 변경은 런타임 검증과 구분한다.
- 최종 main 병합 SHA와 Pages 배포는 실시간 GitHub 기록에서 확인한다. 과거 SHA를 최신으로 간주하거나 전체 롤백하지 않는다.

## 계속 보존할 사용자 요구

레이저 회피 통로는 제거된 상태를 유지한다. 각 개별 시전 패턴은 하나의 연결 구조이며 그림과 피해 판정이 일치해야 한다. 서로 다른 소유자·수명의 공격을 무조건 연결하지 않는다. 보스별 질감을 단색 빔이나 불투명 사각형으로 덮지 않는다.

미술 기준은 `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`, `assets/rc77/connected-laser.js`의 동일 blob은 `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`다. RC122는 이 파일과 RC121 연결 기하를 변경하지 않았다. 이후 모바일·영웅 방향·무기 소켓·사망 재개 개선도 보존한다.

RC121의 `null.route` 방어, 모듈 이미지 로더 주입, 완전자동 사망 안내창 3초 재개와 수동/보류/기존 읽기 잠금 보존은 유지했다. 이전 상세 결과는 `DOTS_RC121_AUDIT_RESULTS_20261002.json`, 실행 `36974216123`에 남아 있다. 그 이전 RC120 자료는 `DOTS_LASER_AUDIT_RESULTS_20261002.json`에 있다.

## RC122 실제 수정

`assets/rc122/autoplay-policy.js`: 자동 skill/ultimate 시각 동작과 수동 이동 우선권을 구분하는 순수 판정 함수를 추가했다. 실제 방향키·포인터·수동 기술 입력 유예, hurt/guard/dash, 버퍼 입력, 원래 상태 잠금은 보존한다. `autoAwakeningV31336` 목표는 수동 클릭으로 취급하지 않는다.

`assets/index-v31526.js`: native frame의 manualMotion/manualTarget 두 판정 지점에 위 함수를 연결했다. 실제 movementLocked 처리, 피해량, 체력, 공격 재사용 대기, 난이도는 변경하지 않았다. 기존 렌더링 동작을 임의로 지우거나 기술을 취소하지 않는다.

`assets/rc115/map-advance.js`: 7초 경과 후 원거리 `interact(true)` / off-portal 우회 호출을 제거했다. 이제 native 출구 반경과 `interact` 계획을 만족해야 넘어간다. 자동 출구 경로가 막힌 경우에만 자동 소유 target/path를 해제해 원래 경로탐색기가 다시 계산하도록 한다. 위치 이동, 클리어 플래그 변경, 저장/전환 게이트 우회는 하지 않는다. 실제 수동 입력과 일시정지 등 18개 차단 조건을 검사했다.

`index.html`: main·map-advance·새 policy 캐시 키는 `42201`. policy는 main module보다 먼저 로드한다. connected-laser 미술 키는 `41605`, RC121 choice/topology/ricochet 키는 `42101` 그대로다.

**포탈 그림을 문·계단으로 바꾼 것은 아니다.** 이번 단계는 자연스러운 출구 접근과 막힌 자동 경로의 복구다. 초기 조사에서 검토한 시간별 레이저 회피 경로 예측도 새로 구현하지 않았다.

## 실제 검사와 결과 해석

동일한 39df6b1 런타임에서 autoplay / dream / death-dialog / topology / release 5개 job이 success였다.

- 입력 정책 29개 assertion, 출구 복구 18개 차단 조건과 근접/원거리/자동 경로 재탐색/수동 보존/실패 전환 검사 통과.
- native 수동 입력·기술 동작·피격 잠금 fixture 8개 통과. fixture 상태 조작은 자연 플레이 결과와 구분한다.
- 기존 release 9/9. 레이저 질감 기준, 예고선, 연속성, 발사 단계, 전투 검사 통과. Story 자연 진행 `dist00 → dist01`, 관측 110173ms, 종료 HP156.
- PC·세로·가로 각각 blood 레이저 80종 연결·피해·종료/취소 검사, problems0/errors0. 71 owners/5680 profiles는 등록 수이지 전체 그림 육안 검사 수가 아니다.
- 기존 사몽 예외 fixture 2개, 사망 안내창 lifecycle fixture 7개, RC91 각성 smoke 통과.
- 확장 PC 사몽 자연 플레이 180453ms: 자동 기술 중 이동 141개 표본, native 역할 이동 호출 4383회 중 자동 기술 중 3460회, JS/HTTP 오류0. **반복 사망이 남았고 최종 dist00, 첫 보스 클리어는 실패했다.** deathDialogSamples101은 표본 수이지 사망 횟수가 아니다.
- 별도 기존 PC 사몽 검사 100955ms 역시 정지/JS/HTTP 오류는 없었으나 최종 dist00이었다.
- 모바일 세로 에뮬레이션 101123ms: 최종 HP209.8, 살아 있는 적0, 보스는 더 이상 표시되지 않았다. **최종 zone은 dist00으로, 이번 관측에서 다음 맵 진입은 확인하지 못했다.** RC121의 모바일 다음 맵 진입 결과를 이번 결과로 재사용하지 않는다.

시각 동작 때문에 이동 판정이 차단되는 문제와 반복 사망·전투 생존 문제는 별개다. baseline은 약45초, 확장 후속 검사는180초이므로 피해·사망 감소율이나 성능 개선율을 계산하지 않는다. 상태 문자열 'locked'가 남더라도 실제 위치 변화/함수 호출을 같이 확인한다.

## 증거 및 재검사

원본 실행 https://github.com/kjb7876-lang/hapil1/actions/runs/36978178836 에서 JSON·PNG 아티팩트를 확인한다. 보관기간14일이며 만료 후 결과를 추정하지 않는다.

- 자동 이동: https://github.com/kjb7876-lang/hapil1/actions/runs/36978178836/artifacts/11214597342
- 사몽 PC/세로: https://github.com/kjb7876-lang/hapil1/actions/runs/36978178836/artifacts/11213869982
- 사망 안내창: https://github.com/kjb7876-lang/hapil1/actions/runs/36978178836/artifacts/11214311478
- 레이저 연결: https://github.com/kjb7876-lang/hapil1/actions/runs/36978178836/artifacts/11214366276
- release 및 Story: https://github.com/kjb7876-lang/hapil1/actions/runs/36978178836/artifacts/11214296738

원래 문제의 진단은 실행 `36976864330`, 요약 `qa-results/rc122-baseline-summary.json`에 있다. 일회성 원격 소스 추출·커밋 워크플로와 큰 소스 복사본은 최종 트리에서 제거했다. 원본은 검사 당시 커밋/실행 기록에 남는다.

`.github/workflows/rc122-regression.yml`은 workflow_dispatch 전용 읽기 검사기이며 게임 코드를 자동 패치하거나 커밋하지 않는다. 기존 main의 laser-release-audit와 Pages는 별도다. `tools/rc122-apply-candidate.cjs` 및 과거 rc121 패치 도구는 역사적 적용 기록이므로 최신 main에 일괄 실행하지 않는다.

## 다음 우선순위와 미완료 범위

PC 사몽의 실제 피격 원인, 자동 회피·위치 선정·근접/원거리 간 역할 충돌과 부활 직후 위험 구간을 우선 검토한다. 이동이 가능해졌다는 이유로 자동 생존을 완료 처리하지 않는다. 피해량을 임의로 줄이거나 적/패턴을 삭제해 통과시키지 않는다.

그 다음은 실제 맵 구조에 맞는 문·계단 출입구와 없는 맵의 워프, 전 구간·엔딩 및 모든 맵의 전환, 이미지 로딩/메모리, 준비→타격→회복 동작, 모바일 선명도와 병목이다. 현재 PNG는 원격 Chromium에서 생성되고 자동 시각 검사를 수행했지만 이 대화에서 직접 열어 육안 승인하지 않았다. 모바일도 실기기 발열·메모리·성능 측정이 아니다.

최신 원격과 미커밋 작업을 먼저 확인·보존하고 좁은 수정만 검증 후 반영한다. force push, hard reset, 전체 롤백, 단색 레이저 덧칠 금지. 이 문서는 Dots 인계용 기록이며 다른 대화로 세션을 직접 전송했다는 뜻은 아니다.
