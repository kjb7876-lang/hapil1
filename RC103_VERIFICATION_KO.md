# RC103 모바일 입력·불필요 UI 작업 수정

기준: 6608152bb10a23c359aed4cf10a60aa2352f5eed. RC102의 해상도 예산·기본 균형·저사양 효과와 원본 이미지, 기존 전투·레이저 로직은 유지합니다.

실제 Chromium CDP touchStart/touchEnd로 375x812, DPR 3에서 다음을 재현했습니다. 단순 DOM PointerEvent 합성 외에 브라우저의 멀티터치 경로를 검사합니다.

- 이동 + 블링크 후 이동 유지: 이전부터 정상.
- 이동 + 공명 후 공명 손가락만 해제: 이동 포인터는 계속 ArrowRight를 소유하지만 실제 입력 Set이 비어 이동이 복구되지 않음. 마지막 공명 터치 해제 시 현재 컨텍스트의 남은 이동 포인터 방향만 복구합니다. 공명 유지 중 이동 제한은 바꾸지 않습니다.
- 이동을 유지하면서 두 번째 손가락으로 조작 더보기: 일반 click 의존으로 창이 열리지 않음. touch/pen pointerdown에서 열고 합성 click 중복을 억제합니다. 열기 시 기존 입력 해제 함수를 호출하여 잔류 이동·공명을 정리합니다. 키보드 활성화·닫기·Escape는 유지합니다.
- 추가 조작 창이 열려 있을 때 전역 게임 keydown이 실행되지 않게 합니다.
- 조작 더보기 터치 영역은 68.6x36에서 68.6x44로 확장하고 safe-area 상단/좌측을 반영합니다. 이동104x104, 블링크70x70, 공명70x70, 설정46x46의 기존 영역은 유지합니다.

성능 조사 및 수정:
- 2초간 추가 조작 목록 DOM mutation 관찰: 이전 40회, 수정 후 0회. 텍스트/disabled 값이 바뀔 때만 DOM을 갱신합니다. 실제 쿨타임 등이 바뀌는 경우는 계속 갱신됩니다.
- 매 프레임 backingScale에서 visualViewport 크기를 읽던 경로를 제거하고, 이미 존재하는 resize/visualViewport resize/화면 업데이트 경로에서 계산한 coverScale을 재사용합니다. RC102 수식·상한은 그대로입니다.
- 전후 실제 canvas 내부 크기는 모두 821x462, 표시 크기375x812, DPR3입니다. 선명도를 낮추지 않았습니다.
- 5초 JS CPU 샘플에 native Canvas restore/drawImage와 기존 castUntil 계산 등이 나타났습니다. 이 샘플만으로 실폰 GPU/전체 프레임 지연 원인 또는 FPS 개선율을 확정할 수 없어 게임 렌더/전투 계산에는 변경하지 않았습니다.

검사 명령:
```
HAPIL_QA_OUTPUT=/tmp/rc103 node tests/rc103-mobile-interaction-browser.cjs
HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc99-battle-layout-browser.cjs
HAPIL_CHROMIUM=/usr/bin/chromium node tests/mobile-smoke.cjs
node tests/rc102-quality-budget-smoke.cjs
```

비브라우저 회귀 54/54, assets/data JavaScript 문법152/152 통과. 실제 iPhone/Android 하드웨어, Safari, 안전영역이 있는 물리 기기의 장시간 성능은 미검증입니다. 멀티터치 before/after 스크린샷은 실제 브라우저 원본입니다.
