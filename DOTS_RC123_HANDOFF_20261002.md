# 잡있으(Dots) — RC123 레이저 경계 수정 인계

2026-10-02. 실제 저장소 작업 기록이다. 다른 Dots 세션으로 자동 전송했다는 뜻은 아니다.

## 기준과 검사 상태

- 기준 main: `7ff0ed4bf5dc3b7eb9c95ae1308e1ca94caf2736` (RC122).
- 작업 브랜치: `fix/rc123-combat-readability`.
- 최초 게임 코드 수정: `08d4247220cc259331bda5bee4f06555ddceb166`.
- 실제 검사한 런타임/캐시 완료 SHA: `d68e8e8bb900bcd6978f52be25c861679d4028ed`.
- 검사 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36984416936 — 2026-10-02 08:35:48 UTC에 success로 완료. 6개 matrix 작업 모두 성공.
- 상세 실제 결과: `DOTS_RC123_AUDIT_RESULTS_20261002.json`.
- **main 최종 반영 SHA 및 기존 Pages 배포 성공 여부는 이슈 #3의 배포 후 기록과 해당 Actions 실행에서 확인한다. 이 문서는 배포 이전에 기록된 검사·인계 문서이므로 문서 존재만으로 배포 성공을 추정하지 않는다.** https://github.com/kjb7876-lang/hapil1/issues/3
- d68e8e8 이후 이 인계와 감사 JSON 추가는 문서 변경뿐이다. 게임 코드는 재수정하지 않았다.
- 앞선 `07aef6001b39fec998ba79436b24c3dabbafd0e8` 검사 실행 `36984321006`은 캐시 키 반영으로 취소되었다. 통과에 합산하지 않는다.

## 실제 수정

`assets/rc108/laser-topology.js`: RC97 choice-patterns와 같은 world 좌표 경계 1.1~30.9로 선분을 clip하고, 공통 기하의 열린 종단을 마지막 접선 방향으로 경계까지 연장한다. 새 교차점은 다시 분할하여 공통 정점으로 만든다. 입력 선분/시전 객체는 변경하지 않는다. 시전자 cx/cy와 일치하는 방출점, 이미 연결된 분기점, 닫힌 고리의 원형은 보존한다. 기존 연결 복구와 회피 통로 제거를 유지한다. 잘못된 좌표/0길이 입력은 제외하고 cache key에 시전자 중심/폭을 포함한다.

`index.html`: topology 캐시 키 42101 → 42301 및 마지막 개행 정리만 적용. 다른 모듈 순서·버전·서사 텍스트는 변경하지 않았다.

`tests/rc123-boundary-smoke.cjs`: 방향·대각선·곡선 접선·교차점·폐곡선·경계 clip·입력 불변·비정상 입력·캐시·기준 렌더러 hash 검사.

`tests/rc123-boundary-browser.cjs`: 실제 native 초기화와 보스 시전 경로의 blood 레이저를 PC/세로/가로에서 검사. 열린 종단·경계 근처 contact·선분 contact를 검사하고 branch-y 및 fork-link 전체 전투화면 PNG를 생성한다. 높은 HP로 고정한 장면 검사는 자연 플레이 증거와 구분한다.

`.github/workflows/rc123-boundary-regression.yml`: contents:read, persist-credentials:false로 검사만 수행. boundary/autoplay/dream/death-dialog/topology/release 6개 작업 분리. 게임 자동 수정·커밋·배포 단계 없음. 정확한 SHA 이름의 artifact에 PNG/JSON을 보존한다.

## 실제 검사 결과

- 신규 순수 기하 검사 23/23 통과.
- 레이저 80종 × 4개 시점 × 3개 화면비 = 960개 유형/시점/화면 조합. 열린 종단 검사 총 8,019개, contact 검사 총 92,379개, 오류 0. 이는 표본 좌표 검사 횟수이며 자연 플레이 피격 횟수가 아니다.
- PC/세로/가로 branch-y 및 fork-link PNG 총 6장 생성. artifact `11216748454`: https://github.com/kjb7876-lang/hapil1/actions/runs/36984416936/artifacts/11216748454
- 기존 레이저 release gate 9/9 통과: renderer-syntax, bundle-syntax, approved-art, phases, continuity, telegraph, combat, map-advance, natural-story.
- STORY 자연 진행: 진행 강제 조작 없이 `dist00 → dist01`, 최종 HP 176, 관측 120,911ms. 모든 맵/전체 엔딩 검증은 아니다.
- 자동 이동 정책 29검사 및 8브라우저 fixture 통과. 하지만 별도 180,038ms 자연 자동전투 관측은 dist00에 남았고 첫 보스 클리어는 미확인. 사망 안내창 반복 관측.
- DREAM 원격 회귀검사 명령은 성공했지만, PC 약100초 관측에서 첫 보스가 생존했고 반복 사망이 있었다. 모바일 약101초 관측은 마지막에 적 0/HP240이나 다음 맵 이동은 관측되지 않았다. 해당 성공 상태를 사몽 클리어·난이도 해결로 해석하지 않는다.

## 보존 사항

정상 미술 기준 `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`와 같은 `assets/rc77/connected-laser.js` blob `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`는 변경하지 않았다. 사각형 덧칠이나 공통 단색 beam body를 추가하지 않았다. 기존 approved-art 회귀검사도 통과했다.

main bundle `assets/index-v31526.js`, RC122 자동 이동·출구 근접 보조, RC121 사망창·사몽 방어, 피해량/체력/쿨타임 숫자, 탄환/서사/영웅 미술은 변경하지 않았다. 레이저의 공격 범위가 연장되므로 피해 숫자가 같다는 이유로 난이도도 같다고 말하지 않는다.

## 미완료 범위와 후속 순서

1. 실제 PNG를 열어 육안 검토하고 native(h) 직선 hazard의 피해 경로를 먼저 확인한다. 이 대화에서는 로컬 실행 ClientError로 PNG 직접 육안 판독은 수행하지 못했다. 원격 브라우저 렌더/픽셀 회귀검사는 실행했다. native 끝점은 이번 수정에서 그대로이며, 시각만 늘리거나 render 중 h를 변조하면 안 된다.
2. 사몽 PC 첫 보스 반복 사망 및 모바일 다음 맵 진행을 별도로 재현한다. 타임스케일/HP 치트로 통과시키지 말고 실제 입력·출구 상호작용·쿨타임·AI를 조사한다. 폐곡선에 임의의 바깥 방사선을 추가하지 않았다.
3. 이슈 #3의 탄환 산개/지그재그 재설계, 젤리빈 외 맵당 1회 자산 장부, 현장 몹/보스 간이 체력바, 큰 이미지 간격, 서사 맞춤법·띄어쓰기만 교정, 비레이저 판정 전체 검토는 이번 수정에 포함하지 않았다. 각각 별도 소규모 변경과 검사로 진행하고 완료 처리하지 않는다.

최신 main과 작업 브랜치를 읽고 시작한다. 다른 변경을 보존하며 force push/hard reset/전체 롤백을 하지 않는다. 배포 기록은 이슈 #3, 재현 가능한 상세 검사 수치는 감사 JSON을 우선 확인한다.
