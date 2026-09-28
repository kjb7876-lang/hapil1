"""Build the active story data from the uploaded voice-monologue source."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'data/rc57/voice-monologue.txt'
OUTPUT = ROOT / 'data/story-rc51.js'

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
        version='RC57',
        sourceFile='data/rc57/voice-monologue.txt',
        sourceSha256=hashlib.sha256(source_bytes).hexdigest(),
        raw=text,
        records=records,
        editorialRevision='RC57',
        editorialNote=(
            'Uploaded first-person voice monologue with only the previously requested '
            'spelling and spacing corrections. Voice 1/2 frame the first map; each combat '
            'zone has before/after narration. Rest passages lead into the next combat map; '
            'the empty deleted-record marker is not a game zone.'
        ),
    )
    output = '/* RC57: uploaded voice monologue, proofread only and split into map pre/post cards. */\n'
    output += 'window.__HAPIL_STORY_DATA_RC51__ = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    OUTPUT.write_text(output, encoding='utf-8')
    cards = [r for r in records if not r['rest']]
    too_long = [(r['zone'], key, len(r[key])) for r in cards
                for key in ('pre', 'post', 'firstPost', 'awakenPre')
                if len(r.get(key, '')) > 900]
    if too_long:
        raise ValueError(f'cards exceed the display budget: {too_long}')
    print(f'RC57 story built: {len(records)} records, {len(cards)} combat maps, max card {max(len(r[k]) for r in cards for k in ("pre", "post", "firstPost", "awakenPre") if r.get(k))} chars')


if __name__ == '__main__':
    build()
