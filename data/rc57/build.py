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
AUDIT_OUTPUT = ROOT / 'docs/RC58-story-map-mob-combat-audit.md'

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
    '제1부 — 마지막 수호자 EGO': 'dist00–ep1a07은 중세 다크 판타지 회상이다. 뿌리 문지기→거미천사→뿔악마/동료 잔영→핏빛 추격자→기둥 문지기→발록→기억포식자 순서이며, 발록은 dist06의 3막 보스다. ep1a07은 보스 뒤 추락 처리이고 현대 도시 맵을 섞지 않는다.',
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
    fights = [record for record in data['records'] if not record['rest']]
    profiles = load_world_profiles()
    lines = [
        '# RC58 1인칭 독백 · 맵/몹/전투 점검',
        '',
        '## 결론과 범위',
        '',
        f"활성 서사 원문은 업로드본 `{data['sourceFile']}`이며 SHA-256은 `{data['sourceSha256']}`이다. 기존 전투 상호대화, 쉼터 대화, 인터루드, 구형 시작 서문은 게임 경로에서 비활성화했다. 맵 전·후 화면은 업로드 독백 카드만 사용한다.",
        '',
        f"전체 62개 서사 기록 중 전투 맵 {len(fights)}개와 휴식 기록 6개를 확인했다. 각 전투 맵에는 전투 전·후 카드가 있고, cult04는 1차 전투 후·사몽 각성 전·최종 전투 후를 추가해 총 4단계로 표시한다. 휴식 기록은 중복 별도 화면을 만들지 않고 다음 전투 전 카드에 이어 붙인다.",
        '',
        '## 56개 전투 맵별 카드 대조',
        '',
        '| 순서 | 맵 ID | 업로드 제목 | 전투 전 카드 | 전투 후/페이즈 카드 |',
        '|---:|---|---|---|---|',
    ]
    for order, record in enumerate(fights, 1):
        before = card_stat(record['pre'])
        if record.get('firstPost'):
            after = ' · '.join([
                f"1차 후 {card_stat(record['firstPost'])}",
                f"각성 전 {card_stat(record['awakenPre'])}",
                f"최종 후 {card_stat(record['post'])}",
            ])
        else:
            after = card_stat(record['post'])
        lines.append(f"| {order:02d} | `{record['zone']}` | {record['title']} | {before} | {after} |")
    lines.extend(['', '## 에피소드별 맵·몹·전투 정합성', '',
                  '| 장/진행 구역 | 점검 결과 |', '|---|---|'])
    for chapter, note in CHAPTER_AUDIT.items():
        zones = [r['zone'] for r in fights if r['chapter'] == chapter]
        lines.append(f"| {chapter} · `{', '.join(zones)}` | {note} |")
    lines.extend([
        '', '## 56개 개별 맵의 구조·위험·전투 리듬', '',
        '아래 환경 키와 지형/위험/소품/템포는 로드된 월드 프로필의 56개 combat zone과 대조했다. 인물 서술은 업로드 독백, 적대 슬롯·보스/페이즈는 게임 월드 편성을 기준으로 해석했다.', '',
        '| 맵 | 환경 키 | 지형 · 위험 요소 | 핵심 소품 · 전투 리듬 |', '|---|---|---|---|',
    ])
    for record in fights:
        profile = profiles.get(record['zone'])
        if not profile:
            raise ValueError(f"missing active world profile for {record['zone']}")
        lines.append(
            f"| `{record['zone']}` · {record['title']} | `{profile['environment']}` | "
            f"`{profile['topology']}` · `{profile['hazard']}` | "
            f"`{profile['prop']}` · `{profile['tempo']}` |"
        )
    lines.extend([
        '',
        '## 이미 반영된 구체 수정과 전투 불변조건',
        '',
        '- `ep1a07`은 중세 추락 기억 맵을 사용하며 병원/도시 이미지를 앞 에피소드에 역류시키지 않는다. `ep1a08`은 벽이 보이는 폐쇄형 병동, 내부 벽의 “HELP ME” 자산을 우선 사용하고 기존 맵은 로드 실패 대체재로 둔다.',
        '- `murder03`은 옥상과 순환 도로를 함께 보여주는 루프 맵으로 교체했고 실패 시 기존 옥상 맵으로 복구한다. 인물 이름을 몹 이름으로 전환하지 않는다.',
        '- `cult03`은 한리안=`c103-mid`, 백이온=`c103-boss`에 연결한다. 생성 이미지와 십자가/격자/회로 패턴이 해당 보스 슬롯에 붙으며 일반 몹 슬롯은 보존한다.',
        '- `dist00–ep1a07`은 어두운 궁전/회랑/추락 이미지로 확인했다. 특히 `dist03`의 도로는 돌바닥·고딕 성문만 있는 폐허 접근로라 현대 도로 장면이 아니다. 현대 횡단보도/도시 자산은 murder01/murder03에만 배치한다.',
        '- `ep1a08`은 폐쇄 병동 내부 벽과 HELP ME가 보인다. 간호사/의사 같은 실제 의료진은 적이 아니며, 전투 슬롯은 환각·구속·안정화 집행체로만 읽히도록 한다. `murder03`의 옥상·순환 도로는 파란불 회귀 장면과 맞는다.',
        '- 전체 보스 ID 72개는 고유하다. 보스·중간보스·일반 몹 역할, 맵 위험요소, 공격 템포, 스토리 순서를 대조했고, murder 루프/카이로 66 수문장/ cult03 실제 영웅 보스 슬롯/cult04 4페이즈가 별도 회귀 대상이다.',
        '- 구형 전투 초기화는 적 배치/전투 상태만 유지하고, 상호대사 레코드는 빈 줄 목록으로 교체한다. 구형 대사 잠금·무적·적 공격 지연은 진입 때 제거하며 이후 공격 주기는 변경하지 않는다.',
        '',
        '## 검증과 한계',
        '',
        '- 생성기와 테스트가 업로드 해시, 62개 원문 기록, 56개 전후 카드, 여섯 휴식 구간의 다음 전투 전달, cult04 페이즈, 900자 화면 한도를 대조한다.',
        '- RC55/56 전투 연결, 72 보스 ID, 맵 대체 경로와 서사/몹 연결 테스트를 유지한다. 시각 점검은 dist00, dist03, ep1a07, ep1a08, murder03, cult04 등 대표 경로의 자산을 표본 확인했고, 나머지는 월드 프로필·전투 슬롯 데이터와 정적 테스트로 대조했다.',
        '- 현재 실행 환경에는 Chromium이 없어 이번 패치의 데스크톱/모바일 실게임 전수 플레이는 수행하지 않았다. 따라서 카드 레이아웃의 실제 브라우저 렌더와 전체 56맵 플레이 완료를 통과했다고 주장하지 않는다.',
        '',
    ])
    AUDIT_OUTPUT.write_text('\n'.join(lines), encoding='utf-8')


def build():
    source_bytes = SOURCE.read_bytes()
    source_text = source_bytes.decode('utf-8-sig').replace('\r\n', '\n')
    text = source_text
    for before, after in FIXES:
        text = text.replace(before, after)
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
            record['pre'] = '\n'.join(lines[:3])
            record['post'] = '\n'.join(lines[3:])
            records.append(record)
            continue

        if zone == 'dist06':
            own = section_paragraphs(sections, zone)[:2]
            record.update(paragraphs=own, pre=own[0], post=own[1])
            records.append(record)
            continue

        if zone == 'ep1a07':
            own = section_paragraphs(sections, 'dist06')[2:]
            if len(own) != 2:
                raise ValueError('dist06 must split into two fall-memory paragraphs')
            record.update(paragraphs=own, pre=own[0], post=own[1], sourceZone='dist06')
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
        version='RC58',
        sourceFile='data/rc57/voice-monologue.txt',
        sourceSha256=hashlib.sha256(source_bytes).hexdigest(),
        sourceBytes=len(source_bytes),
        raw=text,
        records=records,
        editorialRevision='RC58',
        editorialNote=(
            'Uploaded first-person voice monologue with only the previously requested '
            'spelling and spacing corrections. Voice 1/2 frame the first map; each combat '
            'zone has before/after narration. Legacy reciprocal combat dialogue and '
            'interludes are disabled. Rest passages lead into the next combat map; '
            'the empty deleted-record marker is not a game zone.'
        ),
    )
    output = '/* RC58: uploaded voice monologue, proofread only and split into map pre/post cards. */\n'
    output += 'window.__HAPIL_STORY_DATA_RC51__ = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    OUTPUT.write_text(output, encoding='utf-8')

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
    print(f'RC58 story built: {len(records)} records, {len(cards)} combat maps, max card {max(len(r[k]) for r in cards for k in ("pre", "post", "firstPost", "awakenPre") if r.get(k))} chars')


if __name__ == '__main__':
    build()
