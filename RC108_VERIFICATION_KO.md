# RC108 검증 기록

기준 main: 83371862e9e39148aa5a1ba09b672fbefd573ee1. 기존 누적 RC107을 보존한 최소 구조 수정입니다.

## 수행한 검사

- 비브라우저 회귀 58/58 통과, index가 참조하는 JS 67개 문법 검사 통과.
- Chromium 실제 렌더: PC 1180×757, 가로 터치 844×390, 세로 터치 390×844. 정보/전장 겹침, 조작 잘림, 설정 반복 닫기, 자동/수동 전환, 수동 A 누르기/해제 및 추가 조작 대화상자 통과.
- 레이저: 80종 경고·발사·종료·취소, 71 owner/5680 등록 조합, 84 네이티브 형상, endpoint 연결과 접촉, 안전 통로 및 실제 래스터 표시 검사 통과. 궁극기 8개 수명/owner 사망 검사 통과. 신규 Y/분기 그림은 native renderer에 상태를 넣은 검사 fixture의 실제 캔버스 캡처입니다.
- 세로 듀얼뷰 8개 연속 프레임의 두 패널 비공백 및 입력 좌표, 단일 시뮬레이션/합성 검사 통과.
- 실제 native 피해: 출력 100→50, 사몽→350, 모바일 적 입력 27→2.7/52→5.2/120→12. EGO 진입 쿨다운 50→46.5 및 사몽 부활 77→71.61, 발사 후 사몽 만료 배율 유지, 벽 7회 제거 통과.
- 8명 자동 차지/스킬, 최종 서사 전환·저장 회귀 통과.

## 실행

비브라우저는 각 tests/*smoke.cjs를 node로 실행합니다. 브라우저는 Playwright와 Chromium이 필요합니다.

```sh
HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc108-layout-browser.cjs
HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc108-laser-topology-browser.cjs
HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc108-combat-browser.cjs
```

## 한계

모바일 검사는 Chromium 터치 에뮬레이션입니다. 물리 iPhone/Android, Safari, 전체 캠페인 완주 및 실기 FPS는 검증하지 않았습니다. 기존 cosmic/spectacle 계열은 형상과 공용 렌더 연결을 확인했지만 개별 자연 발생 수명을 전수 플레이하지 않았습니다.
