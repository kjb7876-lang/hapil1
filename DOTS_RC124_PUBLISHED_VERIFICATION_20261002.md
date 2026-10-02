# RC124 공개 서비스 검증 — 잡있으(Dots) 후속 인계

## 구분

- 실제 게임 배포 SHA: `257b920a470e0ee6a04e5a52d71157f66232682c`.
- 게임 버전/기존 주소: https://kjb7876-lang.github.io/hapil1/?v=42401
- 이번 이어서 작업은 이미 적용된 RC124 게임 코드를 다시 덮어쓰지 않고, 최종 main 감사 및 실제 공개 Pages의 검증 공백을 보완했다.
- 새 검사는 `qa/rc124-published-verification` 브랜치의 `tests/rc124-published-smoke.cjs`와 `.github/workflows/rc124-published-verification.yml`에 보존했다. 게임 런타임 수정·새 호스팅·새 인증정보·강제 push는 하지 않았다.
- 정확히 실행한 검사 코드 SHA: `e3b7174c61b3367def7c0013cd261eb2df3bb9d8`. 이 문서는 그 이후의 기록만 추가한다.

## 1. 공개 Pages 직접 검사: 통과

실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36990273812

job: `110784606237`, 모든 step success. 실제 검사 종료 2026-10-02 09:33:05 UTC (18:33:05 KST).

GitHub Actions의 Chromium이 localhost가 아닌 공개 Pages를 직접 열었다. route.fulfill, bundle 주입, 진행 해제 코드, HP/적/진행 상태 조작은 사용하지 않았다. 기존 전자동 설정 API와 실제 시작/편성/독백 넘기기 UI만 사용했다. 캔버스 fillRect의 반환 동작을 보존하는 추적기로 실제 native 보스 미니 HP 그리기 호출과 화면 좌표를 관측했다.

### 배포 파일 5개

모두 HTTP200, 해당 배포 SHA의 원본 bytes와 SHA256 일치.

| 파일 | bytes | SHA256 |
|---|---:|---|
| index.html | 7976 | aeb07c1eda3503110f905278f5344844f3239f01309cfea24f2cc3547786705b |
| assets/index-v31526.js | 6140681 | ef033a7d4cd2485cc9385dee92f94461d7b3d0707dd9936d2dde6f3b0faab1d6 |
| assets/rc124/laser-overrun.js | 3464 | 82145eeadee46f3b476781b246ca0174892784f740127921733bc9a36dad4eaf |
| assets/rc108/laser-topology.js | 10389 | e61f84325196820ec14316cdd74f189c765c38829a4be027d4726daf766e9b1f |
| assets/rc77/connected-laser.js | 17027 | d13975dce2e5a5f087c3eefa17b4a54fd7f9eecc64441873301b6c25215c31cf |

### 실제 공개 게임 초기 전투 관측

| 화면 | 실제 보스 HP 그리기 호출 | 보존된 표본 중 화면 내 alpha1 막대 | 연장 모듈 | JS/HTTP 오류 |
|---|---:|---:|---|---|
| PC1180x757 | 207 | 207 | RC124, 32 native canvas px, 설치 확인 | 0 / 0 |
| 모바일 세로390x844 | 192 | 192 | RC124, 32 native canvas px, 설치 확인 | 0 / 0 |
| 모바일 가로844x390 | 382 | 240 | RC124, 32 native canvas px, 설치 확인 | 0 / 0 |

추적기는 최근240개 표본만 보존한다. 가로의240/382는 나머지142개가 안 보였다는 뜻이 아니라 오래된 표본을 버렸다는 뜻이다. 이 수치는 검사한 보스 수가 아니라 프레임별 그리기 호출 수다.

각 viewport의 관측은 독백 종료 후 약12초이며 첫맵 dist00에서 이루어졌다. 전체 진행/완주 증거가 아니다. 원본 공개 전투 PNG3장과 상세JSON을 artifact에 보존했다.

artifact: https://github.com/kjb7876-lang/hapil1/actions/runs/36990273812/artifacts/11219392606

artifact SHA256: `234c6117cf33ee508f33696907997075b9a62939301f02360bfbfca8840037d0`.

## 2. 최종 main의 기존 release 감사: 통과 확정

실행: https://github.com/kjb7876-lang/hapil1/actions/runs/36989485480

정확한 검사 SHA는 배포 SHA와 동일한257b920. 기존 인계에는 진행중이라고 적혀 있었지만, 이번에 완료/success 및 실제 job로그를 확인했다. renderer-syntax, bundle-syntax, approved-art, laser-phases, laser-continuity, laser-telegraph, combat, map-advance, natural-story 총9개 모두 통과했다.

자연 STORY 관측: 진행 강제 조작 없이 dist00 -> dist01, 최종 HP48,115184ms. 이는 앞선 배포전 후보검사의 HP193/95329ms와 별개 실행이다. 서로 섞지 않는다.

정상 기준19a4c1f 대비 GPU/Canvas/모바일 저사양 approved-art baselinePixelMatch:true, addedPixels:0. 기존 레이저연속성 검사80종/160렌더행에서 negativePixels0, maxChangedPixelRatio0, minSectionCoverage1이었다. 이 비교는 같은 기하에서 기준렌더러 미술을 보존하는 검사이며 모든 실전장면의 육안승인을 뜻하지 않는다.

artifact: https://github.com/kjb7876-lang/hapil1/actions/runs/36989485480/artifacts/11218589188

## 3. 완료 범위 및 계속 남는 한계

RC124의 맵외곽 기본32픽셀 연장과 showCombatInfo와 분리된 보스/중간보스 미니체력바는 배포되어 있다. 기존 배포전 검사70개 실제 보스/중간보스의 HP비율/숨김/저사양 검사는 `DOTS_RC124_LASER_HP_HANDOFF_20261002.md`와 원본 실행36988975797에 기록돼 있다.

이번 공개검사는 이전의 공개HTTP/배포캐시확인 공백을 보완했다. 다만 로컬 container, Python 및 이미지표시 실행은 ClientError였고 ZIP에 들어있는 PNG는 파일읽기 도구로 직접 표시되지 않았다. 캡처를 직접 눈으로 검토했다고 표현하지 않는다. native 그리기/좌표/자동픽셀검사와 최종합성화면 육안확인은 별개다.

기존 미완료인 blue-executor 동적카탈로그 장면, native(h) 유한직선hazard의 추가연장, 모든모드완주/모든영웅조합, 사몽진행문제, 탄환재설계/자산장부, 큰자산간격, 서사교정, 비레이저판정 전수검토는 이번 공개검증으로 해결됐다고 간주하지 않는다.

인수 시 최신main을 읽고 기존 RC124 일회성 apply스크립트를 다시 실행하지 않는다. 새 검사에는 생산SHA가 명시적으로고정돼 있으므로 향후 게임커밋이 변경되면 새SHA를 검토한 후 기대값을 갱신한다. 원격불일치가 나면 검사만 실패하도록 두고 게임을 자동롤백하거나덮어쓰지 않는다.
