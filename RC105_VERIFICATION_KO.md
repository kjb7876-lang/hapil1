# RC105 모바일 실사용 피드백 반영

기준 main: 6a3593574b2cc9a8855d20f70526db7f5b6578b3 (RC104). 작업 시작과 재개 시 origin/main 일치 확인. 일반 push만 사용.

## 수정됨
- 세로: 하단 중앙 넓은 이동 영역. 375×812에서 195×165px. 좌하단 공명, 우하단 블링크. 버튼 터치 영역은 각각64px, 보이는 원은44px. 가로 컨트롤 배치는 유지.
- 세로 렌더 카메라: 플레이어 중심 고정. 적/근거리 위협/출구의 보호 범위를 담기 위해 확대율을 줄일 수 있다. 따라서 모든 전투 상황에서 검은 여백0을 보장하지 않는다. 같은 time 안에서 x/y/zone이 바뀌면 카메라 캐시를 무효화한다. 전투용 native 카메라/피해/타깃/이동 계산은 유지.
- 균형 해상도 예산 상향과 모바일 이미지 보간 적용. 가로844×390 DPR3 실제 backing549×309→702×395. CSS 확대 배율은 약1.54→1.20. 저효과 설정과 절전 설정은 유지.
- castUntil에서 매 호출 Object.entries/map/filter와 정규식 반복을 줄였다. 시간/값은 매번 읽으며 같은 틱의 캐스팅 변경도 반영한다.
- 곡선 레이저 소프트웨어 조인: 조인마다16개의 삼각형 클립을 원본 텍스처를 사용하는 원형 클립1개로 변경. 접촉 경로·반폭·GPU 렌더 경로 유지. 테스트24구간/25조인에서 클립448→73개. 이 최적화를 사용자 보고의 절반 잘림 원인 해결이라고 단정하지 않는다.

## 수행 검사
- 비브라우저56/56, assets/data JS 문법153/153 통과. 최종 카메라 캐시 변경 후 해당 단위검사 추가 통과.
- castUntil 기존/신규 비교1,600건: 필드 추가/삭제, 같은 틱 값 변경, cast 목록/시간 변경 일치.
- 레이저 mock: 조인25개 각각반경16 원형 클립·원본 텍스처·save/restore 복원을 검증. arc 누락을 보완했으며 검사를 제거하지 않았다.
- 실제 Chromium UI6종: PC1180×757/1920×1080/1280×600, 모바일390×844/844×390/320×568. 설정 반복닫기, 수동/반자동/자동 전환 및 수동버튼 실행 통과.
- CDP 동시터치: 중앙 이동+우측블링크/좌측공명, 해제 후 이동 유지, 이동 중 메뉴열기/입력해제 통과.
- 실제 Chromium 전투5종: 320×568/375×812/430×932/844×390/1180×757. 주인공/적 중심 가시성과 실제 native 포인터 좌표 전달 통과. 세로 중앙 카메라와 먼 적/위협/출구는 단위검사도 통과.
- 보스 직선·곡선 레이저 전체경로 실제 렌더780건, 오류/404/경로 중간 샘플 소실0. PC/모바일 각390건에서 세그먼트의20/50/80% 위치 주변 픽셀 모두 검출. 피격 범위 밖 끝이나 화면 밖 부분은 이 측정에 포함하지 않는다.
- dist06 원본 blood renderer를 실제 게임 canvas 카메라에 적용한 전투 화면 fixture 확인. 이는 결정적 그리기 fixture이며 자연 플레이 전체 캠페인 검증이 아니다.
- 가로 자연전투 Chromium rAF 중앙값16.7ms, p95 33.4ms 전후 동일. 해상도를 늘렸어도 이 환경에서는 큰 프레임 지연 개선을 입증하지 못했다. 실폰 FPS 개선을 주장하지 않는다. CPU 표본에서 castUntil 반복 비용은 감소했으나 장면이 완전히 동일하지 않아 속도 배수를 제시하지 않는다.

## 미재현 / 실폰 확인 필요
사용자의 '레이저 절반이 잘린 느낌'은 전체경로 샘플/fixture에서 재현되지 않았으며 정확한 원인은 미확정. 카메라 캐시 보완과 clip 최적화를 근본 원인 해결로 보고하지 않는다. 플레이어를 따라가는 카메라의 화면 밖 레이저 부분은 정상 viewport 크롭이므로 전체맵 화면과 구분해야 한다.

실폰 재현에 필요한 조건: 보스/맵 이름, 세로/가로, 사용 캐릭터, 전투 모드, 모바일 성능 설정, 자유의지 활성 여부. 가능하면 해당 순간 영상/스크린샷. 자유의지를 원인으로 단정하지 않는다. 실제 기기/Safari의 성능·노치/브라우저바·레이저 자연 발사 전수 확인은 미수행.

공개 Pages 직접 접속은 이 환경 프록시 CONNECT403으로 차단됨. 정확한 커밋의 GitHub Actions Pages 성공을 별도 확인한다. Library 업로드 성공 시에만 confirmed library_file_ids를 반환한다.

재현: node tests/rc105-cast-timing-smoke.cjs; node tests/rc104-viewport-smoke.cjs; HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc99-battle-layout-browser.cjs; node tests/rc103-mobile-interaction-browser.cjs; node tests/rc104-viewport-browser.cjs; HAPIL_CHROMIUM=/usr/bin/chromium node tests/rc105-laser-visibility-browser.cjs; HAPIL_QA_CASE=landscape HAPIL_QA_QUALITY=balanced node tests/rc105-mobile-render-browser.cjs . 레이저 화면 fixture만 재현하려면 HAPIL_QA_STAGE_ONLY=1.
