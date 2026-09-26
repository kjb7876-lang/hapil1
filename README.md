# 합일 RC26 — GitHub Pages로 모바일에서 혼자 플레이하기

## 이번 버전

- 시작 이야기: 요청한 여덟 문단만 전문 표시. 스토리·헬·사몽 공통.
- 악마화 나무 전투 전: 요청한 한 문장만 표시.
- 두 장면은 자동 넘김을 적용하지 않으며, 읽은 뒤 버튼으로 진행합니다.
- 가로·세로 화면에 맞춰 글자 크기와 문단 배치를 조정합니다. 스크롤 없이 전문을 읽도록 설계했습니다.
- 뿌리 수호자 전용 혈맥 이미지가 궁극기뿐 아니라 일반 혈광 패턴에도 연결됩니다.
- 궁극기 낙하 간격과 루시퍼 비석 간격은 각각 0.6초입니다. 같은 공격 이미지의 재피격 간격도 0.6초입니다. 서로 다른 이미지의 판정은 각각 독립적입니다.

## 1. GitHub용 분할 파일을 준비하기

1. `HAPIL_RC26_PAGES_PART_01.zip`부터 마지막 PART까지 전부 같은 폴더에 다운로드합니다.
2. `HAPIL_RC26_PAGES_ASSEMBLY_TOOLS.zip`도 다운로드하고 그 폴더에 압축을 풉니다.
3. Windows에서는 `ASSEMBLE_PAGES_WINDOWS.bat`을 실행합니다. 파일 손상 여부를 확인하고 `HAPIL_RC26_GITHUB_PAGES` 폴더를 생성합니다.
4. Mac/Linux에서는 Python 3로 `python3 assemble_pages.py`를 실행합니다.
5. 결과 폴더 안에 `index.html`, `assets`, `data`, `.nojekyll`이 있는지 확인합니다.

각 PART는 독립 ZIP입니다. 자동 조립 도구 대신 모든 PART를 **같은 위치에 병합해서 풀어도** 됩니다. 하나만 풀면 게임이 완성되지 않습니다.

## 2. PC에서 GitHub에 한 번 올리기

게임 파일이 많으므로 GitHub Desktop을 사용합니다.

1. GitHub 계정으로 GitHub Desktop에 로그인합니다.
2. `File → New repository`에서 저장소 이름을 `hapil-mobile`로 만듭니다.
3. 저장소 폴더를 열고, 위에서 생성한 `HAPIL_RC26_GITHUB_PAGES` **폴더 안의 내용물 전체**를 복사합니다.
4. 저장소 최상위에 바로 `index.html`이 있어야 합니다. `HAPIL_RC26_GITHUB_PAGES/index.html`처럼 한 단계 아래에 넣지 마세요.
5. `Commit to main` 후 `Publish repository` 또는 `Push origin`을 누릅니다.
6. GitHub Free에서는 Pages용으로 공개 저장소를 사용합니다. Publish 화면의 `Keep this code private`를 해제하면 공개됩니다. 공개 저장소의 게임 코드와 이미지·음향도 다른 사람이 볼 수 있습니다.

전체판 ZIP이나 PART ZIP은 저장소에 넣지 않습니다. **압축을 푼 실행 파일들만** 올립니다. 100MiB를 넘는 개별 파일은 일반 Git 푸시에서 거부됩니다.

## 3. GitHub Pages 켜기

1. 웹브라우저에서 저장소를 엽니다.
2. `Settings → Pages`로 이동합니다.
3. `Build and deployment → Source`를 `Deploy from a branch`로 선택합니다.
4. `Branch`는 `main`, 폴더는 `/(root)`로 선택하고 `Save`를 누릅니다.
5. 게시가 완료되면 표시되는 주소를 복사합니다. 보통 다음 형태입니다.

`https://본인아이디.github.io/hapil-mobile/`

게시가 완료될 때까지 수 분 걸릴 수 있습니다. 오류가 나면 저장소의 `Actions`에서 Pages 배포 결과를 확인합니다. 404라면 저장소 최상위의 `index.html`과 Pages의 브랜치/폴더 선택부터 확인하세요.

## 4. 모바일에서 실행하기

- 위 주소를 휴대폰 Chrome 또는 Safari에서 엽니다. 이후에는 PC가 꺼져 있어도 접속할 수 있습니다.
- 새 게임 → 영웅·모드 선택 → 접속. 시작 이야기는 모든 모드에서 동일합니다.
- 전투는 가로 화면을 권장합니다. 화면의 터치 조작을 사용합니다.
- 처음에는 Wi-Fi에서 확인하세요. 게임은 필요한 이미지·음향을 요청하므로 연결 상태에 따라 로딩 시간이 달라집니다.
- 게임 시작 버튼을 직접 터치해야 브라우저에서 소리가 허용될 수 있습니다.
- 저장은 접속한 브라우저에 남습니다. PC 저장과 자동 동기화되지 않습니다. 기존 저장은 게임의 JSON 내보내기/불러오기로 옮기세요.
- 이 배포본은 싱글 플레이용입니다. 서버가 필요한 온라인 방 생성/접속 UI는 제외했습니다.
- 인터넷 없이 실행하는 오프라인 앱으로 만든 것은 아닙니다. 현재 GitHub 계정에 실제 게시된 상태도 아니므로 위의 최초 업로드가 필요합니다.

## 검증 범위

동봉된 RC26 검증 보고서를 참고하세요. Chromium의 모바일 화면·터치 환경 에뮬레이션과 실제 코드 검사를 사용했습니다. 실제 iPhone/Android 기기 및 사용자의 GitHub 게시 주소에서의 검증은 별도입니다.

## 공식 안내

- GitHub Desktop: https://desktop.github.com/
- Pages 게시 소스 설정: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Pages 사이트 만들기: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- 파일 크기 제한: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
