# 잡있으(Dots) 인수 — RC126 전투 안전 / 유한 직선 공격

날짜: 2026-10-02. 후속 작업은 원격 최신 main을 먼저 읽고 작은 diff로 진행한다. 이 문서 작성 후의 main 반영 및 공개 Pages 검증 결과는 이슈 #3의 최신 RC126 댓글을 확인한다. 다른 Dots 대화에 자동 실행 지시를 전송한 것은 아니다.

## 기준과 실제 검사 SHA

- 작업 시작 main: `dd56fb42aeb8faa45f66a391ea657daf772c410b` (RC125).
- 기존 미배포 전투 후보: `2b1b48dbda698bedecd6ff4ee10cea0fb4e62a6a`, `fix/rc126-combat-safety`. 기존 RC126 작업을 이어받았으며 전부 새로 작성한 것으로 간주하지 않는다.
- 이번 유한 공격 수정 후 실제 검사한 게임 SHA: **`6f2ca4d3ef9206cd5db86ab35fb2912d97ac8fbe`**.
- 릴리스 브랜치: `fix/rc126-finite-native-release`.
- 후속 `b05f6171...`와 `166c8e1...`는 공개 배포 검증 스크립트/워크플로만 추가했다. 이 인수 문서도 게임 코드에 영향을 주지 않는다.
- 캐시 버전: `42602`. 실행 주소: https://kjb7876-lang.github.io/hapil1/?v=42602
- 기존 Pages 주소, RC124 레이저 외곽 연장/보스 미니 HP, RC125 adaptive battlefield를 보존한다. force push, 전체 reset/rollback은 금지한다.

## 원래 레이저 신고와 보존 기준

정상 기준 `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a`와 신고 기준 `51d551f`를 비교했다. 51d의 `assets/rc77/connected-laser.js`에는 원래 텍스처 위에 `bodyWidth=half*1.38`, 알파 0.72, `source-over`, butt 선단의 몸체를 덧칠하는 블록이 추가되어 있었다. 이는 불투명하게 덮이는 모양과 관련된 코드 차이이며, 그 특정 옛 화면을 이번 세션에서 직접 육안 재현한 것은 아니다.

이번 기준 main과 최종 후보의 공통 renderer는 이미 정상 기준과 바이트가 동일했다. 승인 blob **`6bb4a891eb541734ef4c86f4d46dfb6ea94a44df`**를 유지했고 각 검사 작업에서 이를 확인했다. 그 renderer를 또 수정하거나 새 단색 사각형을 덧칠하지 않았다. RC123/124 공통 레이저 연결 및 맵 외곽 연장 정책도 보존했다.

## 이번에 바로잡은 유한 native(h) 공격

기존 RC126 후보의 `prepareNative`는 유한 공격의 양끝을 맵 밖 32픽셀까지 늘리고 radius도 늘렸다. 이는 공통 맵 관통 레이저와 다른 유한 공격에 맞지 않으므로 배포 전에 제거했다.

새 `assets/rc126/finite-native.js`의 `__HAPIL_FINITE_NATIVE_RC126__` (`RC126-finite-2`)가 다음을 담당한다.

- 대상은 `spectacleV31317 === true`, `spectacleModeV31317 === 'beam'`, `shape === 'line'`인 native 공격뿐이다.
- 방출 원점과 authored radius/width를 유지한다. x/y는 방향 표적이므로 원점 + 단위방향 * radius로 유한 끝점만 정규화한다. 공격력과 판정 시각은 바꾸지 않는다.
- 둥근 끝/모서리는 원래 공격 직사각형 내부에만 존재한다. 길이가 짧아도 앞뒤 범위를 넘기지 않는다.
- 실제 native 그림의 affine rounded clip과 `Di`/공통 `areaDistance`가 같은 rounded geometry를 사용한다. paint에서 공격 상태를 수정하지 않는다.
- 영거리/극소 방향, NaN/Infinity, 음수 폭 등 비정상 입력은 공격으로 인정하지 않는다.

통합 위치: `combat-safety.js` prepareNative, `laser-topology.js` renderNative의 native 전용 분기, bundle Di, contact-geometry areaDistance, index.html 로딩 순서. 공통 renderer 파일은 그대로다.

## 함께 반영되는 기존 RC126 전투 개선의 정확한 범위

1. RC95 salvo의 생성 시각을 분산한다. 기본 간격 0.115초, 큰 탄환 0.17초이고 마지막 발사보다 다음 salvo가 앞서지 않게 한다. 발사 전에는 그림/접촉이 모두 비활성화되고 수명도 지연분만큼 보정한다. envy/rage/obsession에 제한된 지그재그를 적용하며 속력은 유지한다. 모든 적 패턴을 수작업 재설계한 것은 아니다.
2. 맵/런 단위 특수 bitmap 사용 장부를 저장에 포함한다. 같은 자산의 첫 salvo는 원형을 유지하고 이후 일반 salvo는 기존 공통 bitmap을 소유자 색으로 사용한다. friendly/reflected 및 기존 고유 delivery 예외를 보존한다. 특수 연출의 서사 적합성 전수 검토는 별도다.
3. 공격 시작 전 새 적의 겹침을 제한된 탐색으로 완화한다. 경로/벽 검사와 보스/아군/목표물 등 보호 대상을 유지한다. 큰 자산 전 종류의 완전한 공간 스케줄러는 아니다.
4. 같은 출처/이미지/위치/근접 시각의 대형 cosmetic 중복만 제거한다. 경고장판/impact/hero 효과는 제외한다.
5. 비레이저 유한 line/cone/fan/sector 등 비정상 기하를 차단하고, 실제 투사체 이동·접촉 및 표시/발사 일치 회귀검사를 수행했다. 모든 자산의 정밀 alpha-contact 판정까지 전수 완성한 것은 아니다.
6. `blue-executor` 실제 템플릿을 bridge에서 찾을 수 있게 했다. 실제 템플릿/보스 표식/87개 패턴 존재 확인은 했지만 자연 등장부터 죽음/다음 맵까지 검증한 것으로 간주하지 않는다.

## 실제 성공한 검증

실행: https://github.com/kjb7876-lang/hapil1/actions/runs/37003976903

워크플로의 push SHA는 `50cddb7...`이고, integrate 단계가 생성한 **`6f2ca4d...`**를 모든 테스트가 직접 checkout했다. 9개 회귀 작업 모두 success: combat, layout, overscan-hp, topology, release, safeguards, hero-actions, dream-natural, webkit. 증거 저장 작업도 성공했다.

- 유한 공격 순수 검사 91개: 길이 5종 x 폭 4종 x 방향 4종 = 80개 기하 조합 및 비정상 입력. 원점/길이/피해/시각 보존, 끝점 밖 안전, 둥근 모서리 안전, 중복 준비 불변을 확인했다.
- 전투 안전 순수 검사 49개. RC43 8개 자산의 시간/비행/피해 경로 회귀도 성공했다.
- 실제 native browser: PC1180x757, 세로390x844, 가로844x390. u203-boss/b09-boss 유한 공격과 실제 salvo 생성/렌더를 확인했다. 각 화면 JS예외0, 실패HTTP응답0, 검사 problems0.
- 대표 envy salvo는 7발의 발사시간 범위 1.02초. 두 번째 salvo 7발 모두 공통 자산 선택, 7발 지그재그 확인. 원본 대비 공통 자산 tint 알파 차이0, 투명 픽셀212879 확인. 이것은 대표 fixture 수치이지 전체맵 통계가 아니다.
- 기존 레이저 release gate 하위 9/9 성공: approved-art, phase, continuity, telegraph, combat, map advance, natural story 등.
- STORY 자연 첫맵 진행: 진행치 강제변경 없이 dist00 -> dist01, 종료HP203, 관측115283ms. 전체 STORY 완주가 아니다.
- RC124 외곽/HP, RC125 배치/첫 프레임, 영웅 액션, 자동이동/사망보호, Linux WebKit smoke 검사도 성공했다. Linux WebKit은 실물 iPhone/Safari 검증이 아니다.

## 중요: PC DREAM은 해결 완료로 표시하지 말 것

DREAM 무진행조작 관측을 PC/모바일 각각 150초 수행했다. 두 실행은 JS/HTTP예외 및 장시간 시뮬레이션 정지 검사에는 통과했다. 그러나 승리/첫보스 통과를 승인 조건으로 삼은 테스트는 아니다.

- PC 최종: dist00, simulation time 85.72288, HP240. 관측 중 사망 대화상자와 적HP 재시작이 포함되어 있다. 첫보스 진행/반복사망 문제는 여전히 미해결 조사 대상으로 남긴다.
- 모바일 최종: dist01, simulation time 126.3632, HP224.8. 이 실행에서는 다음 맵에 진입했다. 모든 영웅/맵에서 재현 안 된다는 뜻이 아니다.

다음 작업에서는 단순 errors=[]나 time>10을 진행 성공으로 해석하지 말고, 자연 전투에서 죽음 횟수, 보스HP 변화, 부활/독백/출구 조건, 실제 zone 변경을 함께 추적한다. 테스트를 통과시키려고 HP/피해량을 임의 낮추거나 승리/진행을 강제 주입하지 않는다.

## 증거 위치와 시각 검수 제한

증거 branch: `qa/rc126-finite-evidence-37003976903`, commit `e50c9fe54752566d855285ff0d88ecccf4184580`.
폴더: `qa/rc126-finite-evidence/37003976903/`.
`combat`, `layout`, `overscan-hp`, `release`, `hero-actions`, `dream-natural`, `webkit`에 실제 PNG/JSON을 보존했다. 특히 combat/combat-results.json, release/release-summary.json, dream-natural/dream-results.json을 읽는다.

예: https://github.com/kjb7876-lang/hapil1/tree/qa/rc126-finite-evidence-37003976903/qa/rc126-finite-evidence/37003976903

PNG는 실제 브라우저가 생성했지만 이번 대화의 로컬 실행/이미지 열기 경로는 오류여서 생성된 최종 PNG를 직접 열어 육안판독하지 못했다. 자동 렌더/기하/픽셀 검사와 육안평가를 구분한다. 잡있으는 해당 PNG를 직접 열고 끝처리·사각덮임·겹침·UI가림을 추가 확인한다.

## 배포 후 검사 및 후속 우선순위

main 반영 시 `.github/workflows/rc126-published.yml`가 기존 Pages의 index/게임모듈 13개를 검사 SHA의 SHA256과 비교한 뒤 PC/세로/가로 공개 URL 시작을 관측한다. 실제 성공 여부/배포 SHA/Actions URL은 이슈 #3 최신 RC126 기록이 우선이다. 공개검사는 bundle interception/HP·적·진행 주입 없이 시작 UI와 기존 전자동 설정을 사용한다. 24초 내외의 관측이며 완주검사가 아니다.

남은 우선순위: PC DREAM 첫보스·반복사망 자연 재현 및 원인수정; blue-executor/소환몹 전체 생명주기; 모바일 모든 맵 전환; STORY/HELL/DREAM x 모든 영웅 자연 완주; 최종 PNG 육안 검수; 실물 iPhone/Safari 조작·성능. 서사 맞춤법 및 음성 품질은 이번 전투 패치에서 변경하지 않았다.

`tools/apply-rc126.cjs`와 `tools/apply-rc126-finite.cjs`는 이미 수행된 일회성 통합 도구다. 최신 main에 무작정 재실행하지 않는다. 다음 수정은 현재 파일과 실제 실패 사례에 대해 최소 diff로 진행한다.
