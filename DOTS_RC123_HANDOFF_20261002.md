# 잡있으(Dots) — RC123 레이저 경계 후보 인계

2026-10-02. 이 문서는 실제 저장소 작업 기록이며 다른 Dots 세션으로 작업을 전송했다는 뜻이 아니다.

## 기준과 현재 상태

- 기준 main: `7ff0ed4bf5dc3b7eb9c95ae1308e1ca94caf2736` (RC122).
- 작업 브랜치: `fix/rc123-combat-readability`.
- 최초 실제 게임 코드 커밋: `08d4247220cc259331bda5bee4f06555ddceb166`.
- 검사 대상 런타임/캐시 변경 완료 SHA: `d68e8e8bb900bcd6978f52be25c861679d4028ed`.
- 검사 실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36984416936
- 이 문서를 최초 작성할 때 검사는 아직 완료되지 않았다. main 반영 및 Pages 배포도 아직 수행하지 않았다. 최종 상태는 후속 감사 기록과 원격 main/Actions에서 확인한다.
- 앞선 `07aef6001b39fec998ba79436b24c3dabbafd0e8` 검사 실행 `36984321006`은 캐시 키 반영으로 대체되어 취소되었다. 이를 통과로 합산하지 않는다.

## 실제 수정

`assets/rc108/laser-topology.js`: RC97 choice-patterns와 같은 world 좌표 경계 1.1~30.9로 선분을 clip하고, 공통 기하의 열린 종단을 마지막 접선 방향으로 경계까지 연장한다. 새 교차점은 다시 분할하여 공통 정점으로 만든다. 입력 선분/시전 객체는 변경하지 않는다. 시전자 cx/cy와 일치하는 방출점, 이미 연결된 분기점, 닫힌 고리의 원형은 보존한다. 기존 연결 복구와 회피 통로 제거를 유지한다. 잘못된 좌표/0길이 입력은 제외하고 cache key에 시전자 중심/폭을 포함한다.

`index.html`: topology의 캐시 키만 42101 → 42301. 다른 모듈 순서와 버전, 서사 텍스트는 변경하지 않았다.

`tests/rc123-boundary-smoke.cjs`: 방향·대각선·곡선 접선·교차점·폐곡선·경계 clip·입력 불변·비정상 입력·캐시·기준 렌더러 hash를 검사한다.

`tests/rc123-boundary-browser.cjs`: PC/세로/가로의 실제 native 초기화와 보스 시전 경로로 blood 레이저를 생성한다. 열린 종단/경계 근처 contact/전체 선분 contact를 검사하고 branch-y 및 fork-link 전체 전투화면 PNG를 만든다. 높은 HP로 고정한 장면 검사는 자연 플레이 증거와 구분한다.

`.github/workflows/rc123-boundary-regression.yml`: contents:read, persist-credentials:false로 검사만 수행. boundary/autoplay/dream/death-dialog/topology/release 6개 작업을 분리한다. 게임 자동 수정·커밋·배포 단계는 없다. 각 검사와 PNG/JSON은 정확한 SHA 이름의 artifact에 저장한다.

## 보존 사항

정상 미술 기준 `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`와 동일한 `assets/rc77/connected-laser.js` blob `6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`는 변경하지 않았다. 사각형 덧칠이나 공통 단색 beam body를 추가하지 않았다.

main bundle `assets/index-v31526.js`, RC122 자동 이동·출구 근접 보조, RC121 사망창·사몽 방어, 피해량/체력/쿨타임 숫자, 탄환/서사/영웅 미술은 변경하지 않았다. 다만 레이저의 실제 공격 범위가 연장되므로 난이도 영향은 별도 자연 플레이 검사가 필요하다.

## 반드시 구분할 미완료 범위

- `native(h)` 직선 hazard는 main bundle의 native 피해 경로를 완전히 읽고 검증하지 못해 이번 후보에서 끝점을 변경하지 않았다. 그림만 길게 하거나 render 중 h를 변조하지 않는다.
- 닫힌 고리에 임의의 외부 방사선을 추가하지 않았다. 모든 폐곡선까지 경계와 연결하라는 요구는 별도 설계/검증이 필요하다.
- 원격 브라우저 PNG 생성과 이 대화에서 직접 PNG를 열어 본 육안 검사는 구분한다. 이 문서 작성 시 직접 육안 검사는 수행하지 않았다.
- 기존 RC122의 PC 사몽 반복 사망/첫 보스 미클리어/모바일 다음 맵 미관측을 해결했다고 간주하지 않는다.
- 이슈 #3의 탄환 재설계·젤리빈 외 맵당 1회 자산 장부·현장 몹/보스 체력바·큰 이미지 간격·서사 맞춤법·전체 판정 검토는 이번 레이저 후보에 포함하지 않았다. 완료 처리 금지.

## 인수 원칙

최신 main과 작업 브랜치 변경을 먼저 확인한다. 검사 실패 시 main으로 보내지 않는다. 원격 main이 변경되면 재비교하고 다른 작업을 보존한다. force push/hard reset/전체 롤백 금지. 실제 통과 결과 및 최종 배포 SHA는 별도 감사 JSON에 기록한다.
