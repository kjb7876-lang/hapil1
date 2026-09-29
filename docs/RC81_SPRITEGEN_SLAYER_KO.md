# RC81 · sprite-gen 악몽검사 공격 스프라이트

악몽검사 좌우 공격 모션에 4프레임 투명 아틀라스를 연결했다. 공격이 시작되면 입력 방향을 고정하고, 공격 구간의 진행도에 따라 준비·올려잡기·내려베기·회복 프레임을 재생한다. 아틀라스를 읽지 못하거나 크기가 맞지 않으면 기존 캐릭터 렌더러가 계속 그린다.

## 자산과 생성 과정

- 원화 참조: 기존 `assets/hero-authored-v314rc64/slayer-side-left.webp`, `slayer-side-right.webp`
- 생성 행: 내장 ImageGen으로 좌우 각각 4개의 공격 자세 생성
- 후처리: `aldegad/sprite-gen` 2.11.0, upstream commit `bc64939c6e46a9679bb6569f40524d8a84c88160`
- 실행 단계: `prepare` → 프레임 추출(`extract`) → RGBA 아틀라스(`compose-atlas`) → 미리보기(`compose-gif`) → 검사(`inspect`)
- 셀: 방향별 640×640, 가로 4칸, 8 fps에 해당하는 네 구간, 비반복
- 프로젝트 자산: `assets/hero-authored-v314rc81/slayer-side-{left,right}/`

이 환경에는 sprite-gen이 요구하는 `codex` CLI가 없어 저장소의 생성 provider를 직접 호출할 수 없었다. 따라서 포즈 행은 내장 ImageGen으로 만들고, 실제 프레임 분리·크로마 처리·정렬·아틀라스·검사는 설치한 sprite-gen CLI로 수행했다. 실행에 사용한 `raw/attack.png`, 요청·프롬프트, 결과 manifest와 검사 보고서, GIF 미리보기를 각 방향 폴더에 보관했다. 기존 단일 방향 WebP는 덮어쓰지 않았다.

## 검사

두 방향 모두 sprite-gen 검사에서 4개 자연 포즈가 확인됐고, 오류·경고가 없다. 프레임 경계 픽셀과 크로마 인접 픽셀도 각각 0이다. `node tests/rc81-spritegen-slayer-smoke.cjs`는 PNG 크기·투명 채널·프레임 수·잘림·크로마 흔적을 검사하고, `node tests/rc64-pattern-assets-smoke.cjs`는 게임 런타임에서 방향 고정과 네 프레임 재생, 좌우 자산 선로딩을 확인한다.
