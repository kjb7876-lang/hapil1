"""Build the active story data from the uploaded voice-monologue source."""
from pathlib import Path
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'data/rc57/voice-monologue.txt'
OUTPUT = ROOT / 'data/story-rc51.js'
TEXT_OUTPUT = ROOT / 'data/rc57/voice-monologue-map-cards.txt'
AUDIT_OUTPUT = ROOT / 'docs/RC60-story-map-mob-combat-audit.md'

FIXES = [
    ('보라검천사', '보라검 천사'),
    ('스쳐지나갔다', '스쳐 지나갔다'),
    ('악마였던건지', '악마였던 건지'),
    ('경고와함께', '경고와 함께'),
    ('머리속', '머릿속'),
    ('문을 잠군', '문을 잠근'),
    ('기리고', '그리고'),
    ('수호자로써', '수호자로서'),
    ('남겨져있었다', '남겨져 있었다'),
    ('남은채', '남은 채'),
    ('거였던거', '거였던 것'),
    ('대리고', '데리고'),
    ('되기위한', '되기 위한'),
    ('문들 부터', '문들부터'),
    ('정당화 해', '정당화해'),
    ('정렬되 있었다', '정렬되어 있었다'),
    ('어려워 졌', '어려워졌다'),
    ('누를 수 밖에', '누를 수밖에'),
    ('기억 조차', '기억조차'),
    ('존재 하고 있었다', '존재하고 있었다'),
    ('책망 하였고', '책망하였고'),
    ('밀어 벼렸다', '밀어 버렸다'),
    ('보내었다', '보냈다'),
    ('바랬기에', '바랐기에'),
    ('한이경 이였다', '한이경이었다'),
    ('둘이상', '둘 이상'),
    ('뿐이였', '뿐이었다'),
    ('소멸 되어 버렸다', '소멸되어 버렸다'),
    ('강제로 묶였던 자아들... 그들의 각자의 이름과 기억이 되찾아 갔다.',
     '강제로 묶였던 자아들은 각자의 이름과 기억을 되찾아 갔다.'),
]

PRE_COUNT = {
    'dist00': 2, 'dist01': 2, 'dist02': 2, 'dist03': 2, 'dist05': 1,
    'ep1a08': 2, 'ep1a09': 3, 'ep1a10': 3, 'ep1a11': 5,
    'ep1b01': 3, 'ep1b02': 3, 'ep1b03': 3, 'ep1b04': 3, 'ep1b05': 3,
    'ep1b06': 2, 'ep1b06b': 2, 'ep1b07': 3, 'ep1b08': 3, 'ep1b09': 4,
    'u201': 2, 'u202': 4, 'u204': 4, 'u205': 2, 'u206': 4, 'u203': 1,
    'last304': 1, 'last305': 2, 'last301': 2, 'last302': 2, 'last303': 2,
    'kair01': 2, 'kair04': 2, 'kair05': 2, 'kair06': 1, 'kair07': 2,
    'kair08': 1, 'kair09': 1, 'kair10': 2, 'kair02': 2, 'kair03': 5,
    'hando01': 1, 'hando02': 2, 'hando03': 2,
    'murder01': 1, 'murder02': 5, 'murder04': 7, 'murder03': 3,
    'cult01': 3, 'cult02': 2, 'cult05': 2, 'cult06': 2, 'cult03': 4,
}
REST_BEFORE = {
    'ep1b01': 'dreamRest', 'u201': 'restEp1b', 'last304': 'restU2',
    'kair01': 'restLast3', 'hando01': 'restKairo', 'murder01': 'restHando',
}
CHAPTER_AUDIT = {
    '제1부 — 마지막 수호자 EGO': 'dist00–dist06은 중세 다크 판타지 회상이다. 뿌리 문지기→거미천사→뿔악마/동료 잔영→핏빛 추격자→기둥 문지기→발록 순서이며, 발록은 dist06의 3막 보스다. 추락 독백은 dist06 전투 후에 합치고 현대 도시 맵을 섞지 않는다.',
    '제2부 — 일곱 개의 귀와 하이테크 축귀': 'ep1b01–ep1b09는 솔로몬 봉인 뒤 나태·질투·탐식·정욕·탐욕·분노·교만·바이오테크로 진행한다. 각 죄악의 형상/기계가 보스고, 실제 피해자·환자·일반 주민은 적대 대상으로 만들지 않는다.',
    '제3부 — 통제자의 열일곱 단계': 'u201→u202→u204→u205→u206→u203은 1–17단계의 의도된 비수치 순서다. 구역마다 기억·방어 기계와 단계 중간보스가 있고, 마지막 u203에서 컨트롤러 프레임을 상대한다. 피해자 아이 자체는 적이 아니다.',
    '제4부 — 환도 자아와 융합몽세': 'last304→last305→last301→last302→last303 순서다. 중립 초원의 슬라임/늑대와 고블린 추장은 비인간 전투 몹이며 주민은 적으로 삼지 않는다. 이후 타락천사 기사, 검은 안개 잔영/심장, 불면귀로 상승한다. 마지막 보스의 소환 억제·1:1 전투를 유지한다.',
    '제5부 — 카이로노미콘': 'kair01의 6파동 이후 kair04→05→06→07→08→09→10→02→03 순서다. 외부 8맵은 일반 48·상위 12·대수문장 6의 66 수문장 편성을 유지한다. 유예 수문장 뒤 세이렌 모르가 3막 최종 보스이며 시간·명령·뉴런·망각 기믹을 구역별로 분리한다.',
    '제6부 — 두 사람의 성': 'hando01–03은 성 방어→코어 탈취→EGO 회수 흐름이다. 일반 봉인병/연결자 뒤 각 맵의 고유 중간보스를 두고, 한리안·백이온은 서사상 동료로만 유지한다. h103-boss는 악몽왕이지 동료 둘이 아니다.',
    '제7부 — 파란불 아래의 사람들': 'murder01→murder02→murder04→murder03의 비수치 순서다. 윤하람·장민재·고서진·한이경은 기억의 주인이지 사냥 대상이 아니다. 첫 두 맵은 순환 이벤트 중간보스, murder04는 진술 봉쇄 인과핵, murder03은 옥상·순환 도로 루프와 blue-executor 최종전이다.',
    '제8부 — 사이비 합일몽세': 'cult01→cult02→cult05→cult06→cult03→cult04 순서다. 제단/합창/생체조/기계재판 중간보스를 거쳐 cult03에서 한리안=c103-mid, 백이온=c103-boss로 연결한다. cult04의 교주 4페이즈만 의목사 사몽 각성과 엔딩을 작동시킨다.',
}


def load_world_profiles():
    path = ROOT / 'data/world-v31217.js'
    if path.exists():
        source = path.read_text(encoding='utf-8')
    else:
        result = subprocess.run(
            ['git', 'show', 'HEAD:data/world-v31217.js'], cwd=ROOT,
            check=True, capture_output=True, text=True, encoding='utf-8',
        )
        source = result.stdout
    pattern = re.compile(
        r'^\s*zone\("(?P<id>[^"]+)",\s*[^,]+,\s*\[[^\]]*\],\s*'
        r'"(?P<environment>[^"]+)",\s*"(?P<topology>[^"]+)",\s*'
        r'"(?P<weather>[^"]+)",\s*"(?P<lighting>[^"]+)",\s*'
        r'"(?P<hazard>[^"]+)",\s*"(?P<prop>[^"]+)",\s*'
        r'"(?P<tempo>[^"]+)",\s*(?P<tier>\d+)(?:,\s*[^)]*)?\),?\s*$',
        re.MULTILINE,
    )
    profiles = {m['id']: m.groupdict() for m in pattern.finditer(source)}
    profiles = {zone: row for zone, row in profiles.items() if int(row['tier']) > 0}
    if len(profiles) != 56:
        raise ValueError(f'world profile audit expected 56 combat maps, got {len(profiles)}')
    return profiles


def load_metadata():
    generated = OUTPUT.read_text(encoding='utf-8')
    payload = generated.split('=', 1)[1].strip().removesuffix(';').strip()
    return json.loads(payload)


def parse_sections(text):
    sections = {}
    current = None
    for line in text.split('\n'):
        header = re.match(r'^\[(\d+)\s*·\s*([^\]]+)\]\s*(.*)$', line)
        if header:
            current = {
                'index': int(header.group(1)),
                'zone': header.group(2).strip(),
                'title': header.group(3).strip(),
                'lines': [],
            }
            sections[current['zone']] = current
            continue
        if line.startswith('[08-삭제된기록]'):
            current = None
            continue
        if re.match(r'^(제\d+부|〈)', line.strip()):
            continue
        if current is not None:
            current['lines'].append(line)
    return sections


def section_paragraphs(sections, zone):
    body = '\n'.join(sections[zone]['lines']).strip()
    return [part.strip() for part in re.split(r'\n\s*\n', body) if part.strip()]


def join(*parts):
    return '\n\n'.join(part for part in parts if part).strip()


def card_stat(text):
    paragraphs = [part for part in re.split(r'\n\s*\n', text) if part.strip()]
    return f'{len(paragraphs)}문단 / {len(text)}자'


def write_audit(data):
    fights = [r for r in data['records'] if not r['rest']]
    profiles = load_world_profiles()
    lines = [
        '# RC60 독백·맵·전투 연결 점검', '',
        f"원문 `{data['sourceFile']}`의 SHA-256: `{data['sourceSha256']}`.",
        '원문 파일은 보존했다. 표시용 원문은 빈 8번을 삭제하고 번호를 01–61로 재정렬했다. 맵 ID는 세이브와 자산 호환을 위해 유지한다.',
        '61개 기록 = 전투 55개 + 쉼터 6개. 쉼터 독백은 다음 전투 전 카드에 포함한다. 최종전은 기존 다단계 독백을 유지한다.', '',
        '## 수정', '',
        '- 삭제된 ep1a07 전투는 활성 경로에서 제외했다. dist06 발록전 후 추락 독백 전체를 보여주고 ep1a08 병원으로 이동한다.',
        '- 동료의 악마화 소개는 dist04 전투 전, 동료를 쓰러뜨린 문장은 전투 후로 이동했다. 늪에서 되살아난 전우는 기존 수호자 자산으로 연결했다.',
        '- HELP ME 병원과 RC53/54/56 맵은 지연 설치와 렌더 선택 양쪽에서 우선한다. 다른 맵을 로딩 대체 이미지로 사용하는 경로를 제거했다.',
        '- dist00–dist06은 중세 회상이다. ep1a08 이후 병원·주사실·환자 도시는 원문상 현대 배경이므로 유지한다. ep1a09 전투 후 결전 회상 카드에는 중세 발록 전장 배경을 사용한다.',
        '- 삭제 구간 세이브는 HP·보유 자원을 유지하고 병원 입구에서 새 전투를 시작한다. 기존 전투 적과 파동 완료 상태는 넘기지 않는다.', '',
        '## 전후 카드와 환경 프로필', '',
        '| 순서 | 맵 ID | 업로드 제목 | 전투 전 | 전투 후/페이즈 |',
        '|---:|---|---|---|---|',
    ]
    for i, r in enumerate(fights, 1):
        after = ' · '.join(card_stat(r[k]) for k in ('firstPost', 'awakenPre', 'post') if r.get(k))
        lines.append(f"| {i:02d} | `{r['zone']}` | {r['title']} | {card_stat(r['pre'])} | {after} |")
    lines += ['', '| 맵 | 환경 키 | 지형·위험 | 소품·템포 |', '|---|---|---|---|']
    for r in fights:
        p = profiles[r['zone']]
        lines.append(f"| `{r['zone']}` · {r['title']} | `{p['environment']}` | `{p['topology']}` · `{p['hazard']}` | `{p['prop']}` · `{p['tempo']}` |")
    lines += ['', '## 검증 범위', '',
              '- 전체 활성 서사 순서와 실제 포털 next 연결 일치, 몹 이미지 파일 존재, 빈 번호 제거, 원문 보존과 전후 카드 분할을 검사한다.',
              '- 병원·중세 맵 자산은 대표 이미지를 직접 확인했고, 맵 설치 실행 순서 두 경우와 렌더러 우선순위를 VM으로 검사한다.',
              '- 기존 사망/쉼터/중간보스 2인 편성 및 구형 대사 격리 회귀 검사를 유지한다.',
              '- Chromium 다운로드가 실패하여 이번 수정의 실제 브라우저 렌더링·전체 게임 플레이는 검증하지 못했다. 전 맵의 시각적 무결성을 보증하는 보고서는 아니다.', '']
    AUDIT_OUTPUT.write_text('\n'.join(lines), encoding='utf-8')


def build():
    source_bytes = SOURCE.read_bytes()
    source_text = source_bytes.decode('utf-8-sig').replace('\r\n', '\n')
    text = source_text
    for before, after in FIXES:
        text = text.replace(before, after)
    text = re.sub(r'^\[08-삭제된기록\]\s*\n', '', text, flags=re.MULTILINE)
    counter = iter(range(1, 1000))
    text = re.sub(r'^\[\d+(\s*·\s*[^\]]+)\]', lambda m: f'[{next(counter):02d}{m[1]}]', text, flags=re.MULTILINE)
    sections = parse_sections(text)
    data = load_metadata()

    voice1_start = text.index('음성 1 — 기억의 독백')
    voice2_start = text.index('음성 2 — 전투 후 기억', voice1_start)
    part1_start = text.index('제1부 — 마지막 수호자 EGO', voice2_start)
    voice1 = text[voice1_start:voice2_start].strip()
    voice2 = text[voice2_start:part1_start].strip()
    records = []

    for original in data['records']:
        record = dict(original)
        zone = record['zone']
        if zone == 'ep1a07':
            continue  # The uploaded deleted record is not a battle.
        record['index'] = sections[zone]['index']
        record.pop('sourceZone', None)
        if record['rest']:
            record['paragraphs'] = section_paragraphs(sections, zone)
            record['pre'] = ''
            record['post'] = ''
            record.pop('firstPost', None)
            record.pop('awakenPre', None)
            records.append(record)
            continue

        if zone == 'dist04':
            body = '\n'.join(sections[zone]['lines']).strip()
            lines = [line.strip() for line in body.split('\n') if line.strip()]
            record['paragraphs'] = [body]
            record['pre'] = body
            record['post'] = '동료들마저 쓰러뜨리고'
            records.append(record)
            continue

        if zone == 'dist06':
            own = section_paragraphs(sections, zone)
            record.update(paragraphs=own, pre=own[0], post=join(*own[1:]))
            records.append(record)
            continue

        own = section_paragraphs(sections, zone)
        if not own or sections[zone]['title'] != record['title']:
            raise ValueError(f'source section is missing or title changed: {zone}')
        record['paragraphs'] = own
        cuts = [1, 7, 10] if zone == 'cult04' else [PRE_COUNT[zone]]
        parts = []
        start = 0
        for end in cuts:
            if not 0 < end < len(own):
                raise ValueError(f'invalid card split for {zone}: {end}/{len(own)}')
            parts.append('\n\n'.join(own[start:end]))
            start = end
        parts.append('\n\n'.join(own[start:]))

        if zone in REST_BEFORE:
            parts[0] = join('\n\n'.join(section_paragraphs(sections, REST_BEFORE[zone])), parts[0])
        if zone == 'dist00':
            parts[0] = join(voice1, parts[0])
            parts[1] = join(voice2, parts[1])

        if zone == 'dist05':
            parts[0] = parts[0].removeprefix('동료들마저 쓰러뜨리고\n')
        if zone == 'ep1a09':
            record['postBackdrop'] = './assets/v31345/maps/dist06.webp'
        record['pre'] = parts[0]
        if zone == 'cult04':
            record['firstPost'] = parts[1]
            record['awakenPre'] = parts[2]
            record['post'] = parts[3]
        else:
            record.pop('firstPost', None)
            record.pop('awakenPre', None)
            record['post'] = parts[1]
        records.append(record)

    data.update(
        version='RC60',
        sourceFile='data/rc57/voice-monologue.txt',
        sourceSha256=hashlib.sha256(source_bytes).hexdigest(),
        sourceBytes=len(source_bytes),
        raw=text,
        records=records,
        editorialRevision='RC60',
        editorialNote=(
            'Uploaded first-person voice monologue with only the previously requested '
            'spelling and spacing corrections and contiguous display numbering. Voice 1/2 frame the first map; each combat '
            'zone has before/after narration. Legacy reciprocal combat dialogue and '
            'interludes are disabled. Rest passages lead into the next combat map; '
            'the empty deleted-record marker is not a game zone.'
        ),
    )
    output = '/* RC60: uploaded voice monologue, proofread only and split into map pre/post cards. */\n'
    output += 'window.__HAPIL_STORY_DATA_RC51__ = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    OUTPUT.write_text(output, encoding='utf-8')
    (ROOT / 'data/rc57/voice-monologue-renumbered.txt').write_text(text, encoding='utf-8')

    card_lines = [
        '합일 · 업로드 1인칭 독백 — 맵 전후 문단본',
        f"원문: {data['sourceFile']}",
        f"SHA-256: {data['sourceSha256']}",
        '기존 전투 상호대화·인터루드 대신 아래 독백 카드만 표시합니다.',
        '문단 사이의 빈 줄은 화면 카드의 문단 구분입니다.',
        '',
    ]
    for record in records:
        if record['rest']:
            continue
        card_lines.extend([
            f"## {record['zone']} · {record['title']}",
            '',
            '### 전투 전',
            '',
            record['pre'],
            '',
        ])
        if record.get('firstPost'):
            card_lines.extend([
                '### 1차 전투 후', '', record['firstPost'], '',
                '### 사몽 각성 전', '', record['awakenPre'], '',
                '### 최종 전투 후', '', record['post'], '',
            ])
        else:
            card_lines.extend(['### 전투 후', '', record['post'], ''])
    TEXT_OUTPUT.write_text('\n'.join(card_lines).rstrip() + '\n', encoding='utf-8')
    write_audit(data)
    cards = [r for r in records if not r['rest']]
    too_long = [(r['zone'], key, len(r[key])) for r in cards
                for key in ('pre', 'post', 'firstPost', 'awakenPre')
                if len(r.get(key, '')) > 900]
    if too_long:
        raise ValueError(f'cards exceed the display budget: {too_long}')
    print(f'RC60 story built: {len(records)} records, {len(cards)} combat maps, max card {max(len(r[k]) for r in cards for k in ("pre", "post", "firstPost", "awakenPre") if r.get(k))} chars')


if __name__ == '__main__':
    build()
