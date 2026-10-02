# 잡있으(Dots) — HAPIL RC121 레이저 연결·사몽 멈춤 인계

갱신일: 2026-10-02. 잡있으는 사용자가 만든 GPT Dots 에이전트다.
저장소: `kjb7876-lang/hapil1`. 서비스 브랜치: `main`.
기존 서비스: https://kjb7876-lang.github.io/hapil1/

## 최신 요청이 이전 통로 보존 지시를 대체한다

사용자가 마지막으로 **레이저 회피 통로를 제거하고 한 줄기로 연결**, **사몽 첫 전투 멈춤 수정**을 요청했다. 따라서 이전 문서의 '회피 통로 보존'은 더 이상 현재 요구가 아니다. 단, 고유 레이저 질감, 경고와 피해 판정의 일치, 이후 모바일·방향·무기 소켓·자동 이동 개선 보존은 계속 유효하다.

각 레이저 패턴 내부는 하나의 연결 그래프로 만든다. 독립된 보스의 서로 다른 시전 시각·종료 시각을 가진 공격까지 무조건 잇는 방식은 사용하지 않았다. 직선은 기존 중심점에서 분할하고, X 교차는 공통 정점으로 나눈다. 새로운 단색 빔이나 불투명 사각형으로 덮지 않는다.

## 기준과 실제 검사

- 작업 시작 main: `2212b747994a5fabccfbcc287e5fb0637d4687ad`.
- 작업 브랜치: `fix/rc121-connected-dream`.
- 최종 런타임 검사 대상: `dff2960eab8e0bbddcfb611e167c6f7ad4ffa395`.
- 실제 성공 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36974216123
- 최신 관측 결과: `DOTS_RC121_AUDIT_RESULTS_20261002.json`.
- 이 결과의 이후 문서·CI 변경은 런타임 검사와 구분한다. 작업 재개 때 최신 main과 실제 diff를 확인한다.

미술 기준 `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`는 유지했다. `assets/rc77/connected-laser.js`는 변경하지 않았으며 blob은 `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`다. RC120 `f159c8f`와 과거 검사 `7957999`의 기록은 `DOTS_LASER_AUDIT_RESULTS_20261002.json`에 역사 자료로 남아 있다. 과거의 '이번 세션 런타임 변경 없음'을 RC121에 적용하지 않는다.

## 실제 수정

`assets/rc108/laser-topology.js`: 회피 구역에 따른 연결 제한 제거. 패턴 구성요소 연결, 교차 공통점, 단독 직선의 중심점 연결을 유지한다.

`assets/rc97/choice-patterns.js`: broad/narrow 통로를 잘라내는 처리를 제거했다. 기존 order 격자 모양은 보존한다. `rc97Choice` 메타데이터는 기존 저장·시전 검증과 호환되도록 남겼지만 통로를 만들지는 않는다. 전체 자산 JS 검색에서 자동 이동이 이 메타데이터를 안전 통로로 사용하는 별도 소비자는 발견되지 않았다.

`assets/rc108/samong-ricochet.js`: 대응 시각 효과가 없는 공격에서 `null.route` 접근을 막고 원래 타격 처리를 보존한다. 이미지 로더는 외부 스크립트에서 전역으로 찾지 않고 호출자로부터 받는다.

`assets/index-v31526.js`: 모듈 내부 이미지 로더를 사몽 렌더러에 전달한다. 최종전 레이저의 빈 중앙 통로와 잘못된 안전 구역 표시를 제거하고 실제 기하로 안전 여부를 판정한다. 사망 안내창의 완전자동 재시작을 수정한다.

사망 안내창은 완전자동이며 자동 서사 진행 설정이 허용된 경우, 화면이 보이고 다른 메뉴가 없을 때 3초 후 정상 종료한다. '자동 재시작 일시정지/계속' 버튼이 있다. 반자동은 원래 버튼/Enter 입력을 기다린다. 이전 창의 타이머·키 리스너를 정리하고 이 창이 소유한 읽기 잠금만 해제한다. 원래 사망 귀환 목적지, 난이도, HP·피해량, 7초 각성·77초 재사용 대기 정책은 바꾸지 않았다.

`index.html`: 변경한 스크립트만 캐시 키 갱신. 메인 번들 `42102`, choice/topology/ricochet `42101`. 고유 미술 렌더러는 기존 `41605`.

`tests/rc116-laser-telegraph-browser.cjs`: 예고선 비교 중 무관한 전투 이미지까지 decode하던 검사 결함을 수정했다. 실제 예고 렌더 중 선택된 이미지의 src 할당과 decode를 기다린다. 미술 기준 SHA나 픽셀 허용치를 느슨하게 바꾸지 않았다.

## 확인 결과와 한계

최종 실행의 dream / death-dialog / topology / release 4개 검사 job이 모두 성공했다.

- 기존 `laser-release-gate.cjs`: 9/9. 예고선 일반·섬광 감소·lowFx 모두 기준과 정확히 같은 픽셀. Story 자연 진행은 `dist00 → dist01`, 145218ms, 종료 HP120, JS/HTTP 오류 없음.
- 연결 기하: PC·모바일 세로·가로 각 80개 blood 패턴, 연결 성분 1개, 교차점·접촉 판정·통로 제거·발사/종료/취소 검사. 각 조건 problems0/errors0. 71 owners·5680 profiles는 등록 수이지 모든 텍스처 육안 검사 수가 아니다.
- 사몽 예외 재현용 강제 상태 fixture 2개: 모두 성공.
- 사망 안내창의 자동/수동/보류/교체/이전 읽기 잠금/원래 부활 경로/세로 화면 fixture 7개: 모두 성공. 기존 RC91 각성 smoke도 성공.
- 자연 Dream PC: 100525ms 동안 반복 사망 뒤 자동 재개, 12초 정지 없음, JS/HTTP 오류 없음. **최종 dist00이며 첫 보스 클리어는 입증하지 못했다.** 이것을 완주로 보고하지 않는다.
- 자연 Dream 모바일 세로 에뮬레이션: 101017ms 실행, `dist00 → dist01` 이동 및 다음 맵 전투 관측, JS/HTTP 오류 없음. 최초 다음 맵 관측 90859ms. 메뉴 해제 777 외에 진행·HP·시간 조작은 하지 않았다.

PC의 반복 사망은 멈춤과 별도의 완전자동 전투/난이도 후속 검토 대상이다. 화면 연결 증가로 난도가 올라갈 수 있으나 임의로 공격·피해를 삭제하지 않았다. 모든 모드·엔딩 완주는 아직 미검증이다.

Chromium 원격 실제 렌더와 자동 픽셀 검사를 실행했다. 이 대화에서 PNG를 직접 열어 육안 승인한 것은 아니다. 모바일 결과는 에뮬레이션이며 실기기 발열·성능·메모리 검사가 아니다. RAF 최대 간격은 PC116.6ms/세로133.3ms로 관측됐고, 세로 long-task 기록은 100개 상한에 도달했다. 성능 최적화를 완료했다고 보고하지 않는다.

## 원본 증거

성공 실행 `36974216123`의 아티팩트:

- Dream: https://github.com/kjb7876-lang/hapil1/actions/runs/36974216123/artifacts/11212404966
- 사망 안내창: https://github.com/kjb7876-lang/hapil1/actions/runs/36974216123/artifacts/11213051026
- 레이저 기하: https://github.com/kjb7876-lang/hapil1/actions/runs/36974216123/artifacts/11212542835
- 기존 release 9/9 및 렌더 비교: https://github.com/kjb7876-lang/hapil1/actions/runs/36974216123/artifacts/11212727591

JSON·스크린샷 보관 기간은 14일이다. 증거가 만료되면 검사를 재실행하며 결과를 추정하지 않는다. 초기 실패 실행 `36972428058`, 중간 후보 실패 `36973349977`도 진단 기록으로 남겨 두었다.

## Codex 없이 재검사

`.github/workflows/rc121-dream-connected.yml`은 현재 수동 실행형 **읽기 전용** 검사기다. 원하는 브랜치에서 Actions의 Run workflow로 실행한다. 일회성 prepare/자동 커밋 단계는 제거했다. 기존 `.github/workflows/laser-release-audit.yml`의 main 자동 검사는 별도 유지된다. 검사 성공을 Pages 성공으로, Pages 성공을 검사 성공으로 대체하지 않는다.

로컬 실행 환경이 있다면 Node22와 Playwright/Chromium 및 기존 Actions의 경로 설정을 사용한다.

```bash
node tests/rc121-dream-regression-browser.cjs
node tests/rc91-samong-and-laser-smoke.cjs
node tests/dream-death-dialog-browser.cjs
node tests/rc121-connected-topology-browser.cjs
node tests/laser-release-gate.cjs
```

`tools/rc121-apply.cjs`, `rc121-finalize-geometry.cjs`, `rc121-build-connectivity-test.cjs`, `patch-dream-death-dialog.cjs`, `repair-warning-fixture-loading.cjs`는 작업 과정의 정확한 패치/재현 기록이다. 최신 main에 일괄 재실행하지 않는다. 특히 초기 apply는 이전 캐시 키를 전제로 하므로 이후 수정 위에 사용하지 않는다.

## 다음 작업: 완료로 처리하지 말 것

포탈을 문·계단 중심의 자연스러운 출입으로 대체하고 실제 문/계단이 없는 맵만 워프 자산을 사용하는 작업은 아직 미구현이다. 모든 모드의 전 구간·엔딩, 이미지 로딩/메모리 최적화, 준비→타격→회복 동작, 모바일 선명도/병목 개선도 후속 범위다. 방향·무기 소켓·자동 이동은 보존했으나 8영웅×8방향 전체 재검증까지 이번 결과로 대신하지 않는다.

최신 원격과 미커밋 작업을 먼저 확인·보존한다. 검증된 좁은 수정만 작업 브랜치에서 준비하고 main과 충돌을 확인한 뒤 반영한다. hard reset, force push, 전체 롤백, 단색 레이저 덧칠 금지. 이 문서가 Dots 인계 수단이며 다른 대화로 직접 세션을 전송했다는 뜻은 아니다.
