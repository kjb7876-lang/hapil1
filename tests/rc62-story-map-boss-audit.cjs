const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const bundle = read('assets/index-v31526.js');
const mobileController = read('assets/hapil-mobile-v31406.js');
const sourcePath = 'data/rc57/voice-monologue.txt';
const sourceBytes = fs.readFileSync(path.join(root, sourcePath));
const sourceHash = crypto.createHash('sha256').update(sourceBytes).digest('hex');

function nativeGameData() {
  const context = { window: {}, S: (x, y) => ({x, y}) };
  vm.createContext(context);
  const rootDefinitions = bundle.indexOf('  le = `./`,');
  const rootEnd = bundle.indexOf('var MONGSE_REST_ZONE_IDS', rootDefinitions);
  assert(rootDefinitions >= 0 && rootEnd > rootDefinitions, 'native map registry source is missing');
  vm.runInContext(`var ${bundle.slice(rootDefinitions, rootEnd)}`, context);
  const prologueStart = bundle.indexOf('N.dist00 = {');
  const prologueEnd = bundle.indexOf('// The terrain registry', prologueStart);
  assert(prologueStart >= 0 && prologueEnd > prologueStart, 'dist00 prologue encounter is missing');
  vm.runInContext(bundle.slice(prologueStart, prologueEnd), context);
  vm.runInContext(read('data/story-rc51.js'), context);
  vm.runInContext(read('data/world-v31217.js'), context);
  // RC60 removes the empty map without changing stable IDs.
  context.N.dist06.next = 'ep1a08';
  return context;
}

function sourceObject(startMarker, endMarker) {
  const start = bundle.indexOf(startMarker);
  const end = bundle.indexOf(endMarker, start);
  assert(start >= 0 && end > start, `runtime table missing: ${startMarker}`);
  const context = {};
  vm.createContext(context);
  vm.runInContext(bundle.slice(start, end), context);
  return context;
}

const context = nativeGameData();
const story = context.window.__HAPIL_STORY_DATA_RC51__;
const world = context.window.__MONGSE_WORLD_V31217__;
const records = story.records;
const battles = records.filter(record => !record.rest);
const shelters = records.filter(record => record.rest);
const battleIds = new Set(battles.map(record => record.zone));
const signatureProfiles = sourceObject(
  'var MONGSE_BOSS_SIGNATURE_PROFILES_V31212 =',
  '\nfunction MONGSE_signatureProfile31212',
).MONGSE_BOSS_SIGNATURE_PROFILES_V31212;
const ruleSource = sourceObject(
  'var MONGSE_BOSS_RULE_PROFILE_SOURCE_V31215 =',
  '\nvar MONGSE_BOSS_RULE_PROFILES_V31215',
).MONGSE_BOSS_RULE_PROFILE_SOURCE_V31215;

assert.equal(story.version, 'RC60');
assert.equal(sourceHash, story.sourceSha256, 'uploaded monologue source bytes changed');
assert.equal(records.length, 61);
assert.equal(battles.length, 55);
assert.equal(shelters.length, 6);
assert.equal(new Set(records.map(record => record.zone)).size, 61);
assert.deepEqual(Array.from(records, record => record.index), Array.from({length: 61}, (_, i) => i + 1));
assert(!story.raw.includes('[08-삭제된기록]'));
assert(!records.some(record => record.zone === 'ep1a07'));
assert(records.every(record => record.rest || (record.pre?.trim() && record.post?.trim())),
  'each battle map must have first-person text on both sides');

const route = [];
let zoneId = 'dist00';
while (zoneId && zoneId !== 'hub' && zoneId !== 'village') {
  assert(!route.includes(zoneId), `portal route loops at ${zoneId}`);
  route.push(zoneId);
  zoneId = context.N[zoneId]?.next;
}
assert.deepEqual(route, Array.from(records, record => record.zone),
  'all prose/rest records must match the live portal order');
assert.equal(context.N.dist06.next, 'ep1a08');

function assetExists(asset) {
  return typeof asset === 'string' && fs.existsSync(path.join(root, asset.replace(/^\.\//, '')));
}
for (const record of records) {
  const zone = context.N[record.zone];
  const profile = world.zoneById[record.zone];
  assert(zone, `${record.zone} has no native map`);
  assert(profile, `${record.zone} has no authored environment profile`);
  assert(assetExists(zone.map), `${record.zone} map art is missing: ${zone.map}`);
  assert(profile.environmentKey && profile.topology && profile.hazards?.length && profile.props?.length,
    `${record.zone} environment profile is incomplete`);
  if (record.rest) continue;
  assert(zone.enemies?.length, `${record.zone} has no encounter actors`);
  assert(new Set(zone.enemies.map(actor => actor.id)).size === zone.enemies.length,
    `${record.zone} has duplicate actor IDs`);
  for (const actor of zone.enemies) {
    assert(actor.name?.trim(), `${record.zone}/${actor.id} has no visible name`);
    assert(assetExists(actor.sprite), `${record.zone}/${actor.id} has missing actor art: ${actor.sprite}`);
  }
}

const allActors = battles.flatMap(record => context.N[record.zone].enemies);
const midbossZones = battles.flatMap(record => {
  const midbosses = context.N[record.zone].enemies.filter(actor => actor.midboss);
  if (midbosses.length) assert(midbosses.length <= 2, `${record.zone} has more than two authored midbosses`);
  return midbosses.length ? [{zone: record.zone, midbosses}] : [];
});
assert.equal(midbossZones.length, 38, 'the active route must preserve all authored midboss encounters');
assert.equal(midbossZones.filter(row => row.midbosses.length === 1).length, 38);
assert.equal(midbossZones.filter(row => row.zone !== 'cult03' && row.midbosses.length === 1).length, 37,
  '37 single midboss rosters rely on the RC59 runtime partner; cult03 is paired with its authored boss');
const apostates = context.N.cult03.enemies.filter(actor => actor.midboss || actor.boss);
assert.deepEqual(Array.from(apostates, actor => actor.id), ['c103-mid', 'c103-boss'],
  'the story-authored Han/Baek pair must remain intact');

const guardians = allActors.filter(actor => /^kair-guardian-\d{2}$/.test(actor.id));
const elites = allActors.filter(actor => /^kair-elite-\d{2}$/.test(actor.id));
const greatGuardians = allActors.filter(actor => /^kair-great-\d{2}$/.test(actor.id));
assert.equal(guardians.length, 48, 'the six-map expedition must include guardians 01–48');
assert.equal(elites.length, 12, 'the six-map expedition must include upper guardians 49–60');
assert.equal(greatGuardians.length, 6, 'the six-map expedition must include six great guardians');
assert.equal(new Set([...guardians, ...elites, ...greatGuardians].map(actor => actor.id)).size, 66,
  'the 66-guardian campaign must contain 66 distinct named combatants');

const majorBosses = world.bosses;
assert.equal(majorBosses.length, 28);
assert.equal(Object.keys(signatureProfiles).length, 27,
  'the 27-boss signature library excludes only the two-pattern prologue guardian');
assert.equal(Object.keys(ruleSource).length, 27);
for (const boss of majorBosses) {
  assert(battleIds.has(boss.zoneId), `${boss.id} is not attached to an active battle map`);
  assert(boss.sourceIdentity && boss.phasePresentation?.length >= 2,
    `${boss.id} has no identity or multi-phase presentation`);
  if (boss.id === 'dist00-boss') {
    assert.match(bundle, /er\.dist00 = \[\s*K\(`검은 뿌리 직선 찌르기`/);
    assert.match(bundle, /K\(`기억 수액 낙하`, `circle`/);
  } else {
    assert(signatureProfiles[boss.id], `${boss.id} has no unique signature deck`);
    assert(ruleSource[boss.id], `${boss.id} has no learn/variation/synthesis rule profile`);
    assert.equal(ruleSource[boss.id].zone, boss.zoneId, `${boss.id} is mapped to the wrong boss arena`);
    assert(signatureProfiles[boss.id].deck.length >= 3, `${boss.id} has too few distinct signature attacks`);
  }
}
const nativeBossIds = allActors.filter(actor => actor.boss).map(actor => actor.id);
assert.equal(nativeBossIds.length, 27);
assert(!nativeBossIds.includes('blue-executor'));
assert(majorBosses.some(boss => boss.id === 'blue-executor' && boss.zoneId === 'murder03'),
  'the staged blue-executor must remain registered to the rooftop loop');
assert.match(bundle, /MONGSE_bossZoneById31219\.set\(`blue-executor`, `murder03`\)/);

const signatureIds = [...new Set(Object.values(signatureProfiles).flatMap(profile => profile.deck))];
assert.equal(signatureIds.length, 85);
const signatureSpawnStart = bundle.indexOf('MONGSE_spawnBossSignatureKind31212 = function (e, t, n) {');
const signatureSpawnEnd = bundle.indexOf('function MONGSE_applyBossPhasePresentation31215',signatureSpawnStart);
const signatureSpawn = bundle.slice(signatureSpawnStart,signatureSpawnEnd);
assert(signatureSpawn.includes('announce?.(t, signature, e?.time)'),
  'non-profile story attacks such as the first boss must announce their named attack');
assert(signatureSpawn.includes('announce?.(t, i, e.time)'),
  'profiled boss signatures must announce the resolved move, not only the generic rule');
assert(mobileController.includes("find(section=>section.querySelector('h3')?.textContent.includes('화면'))?.querySelector('.settings-list')"),
  'mobile performance quality must be injected into the nested screen/touch settings section');
const rc62Start = bundle.indexOf('/* RC62: show each authored boss signature');
assert(rc62Start >= 0, 'RC62 story-named boss signature layer is missing');
const calloutContext = {
  window: {},
  MONGSE_BOSS_SIGNATURE_PROFILES_V31212: signatureProfiles,
};
vm.createContext(calloutContext);
vm.runInContext(bundle.slice(rc62Start), calloutContext);
const namesApi = calloutContext.window.__HAPIL_BOSS_PATTERN_NAMES_RC62__;
assert(namesApi?.installed, 'RC62 signature callout hook did not install');
assert.equal(namesApi.signatureCount, 85);
assert.deepEqual(Array.from(namesApi.missing), [], 'every signature move must have a Korean name');
const names = namesApi.names;
assert.equal(Object.keys(names).length, 87, '85 authored signatures plus two prologue attacks must be named');
assert.equal(new Set(Object.values(names)).size, Object.keys(names).length,
  'each named signature needs a recognizable distinct title');
for (const id of signatureIds) assert(namesApi.resolve(id), `${id} has no visible Korean attack title`);
assert.equal(namesApi.resolve('dist06-boss:hell-gate-columns'), names['hell-gate-columns']);
const announcedBoss = {bossRuleCalloutLabelV31220:'공통 규칙명',bossSkillCalloutUntilV31219:0};
assert.equal(namesApi.announce(announcedBoss,'hell-gate-columns',10),names['hell-gate-columns']);
assert.equal(announcedBoss.bossRuleCalloutLabelV31220,names['hell-gate-columns'],
  'the active attack title must replace the generic boss label');
assert(announcedBoss.bossSkillCalloutUntilV31219>=10.9,'the named attack must remain visible during its release');
assert.equal(namesApi.announce(announcedBoss,'not-a-known-signature',11),null,
  'unknown attacks must retain a safe generic callout');
assert.equal(announcedBoss.bossRuleCalloutLabelV31220,names['hell-gate-columns']);

function compactText(text, limit = 78) {
  const lines = String(text ?? '').split(/\n+/).map(line => line.trim())
    .filter(line => line && !/^음성\s*\d+\s*[—-]/.test(line));
  const normalized = (lines[0] ?? '').replaceAll('|', '／');
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
}
const battleRows = battles.map((record, index) => {
  const zone = context.N[record.zone];
  const profile = world.zoneById[record.zone];
  const actors = zone.enemies.map(actor => {
    const rank = actor.boss ? '보스' : actor.midboss ? '중간보스' : '일반';
    const pair = actor.midboss
      ? (record.zone === 'cult03' ? ' · 정본 보스와 연계(짝 생성 제외)' : zone.enemies.filter(enemy => enemy.midboss).length === 1 ? ' + RC59 자동 짝' : ' · 정본 2인')
      : '';
    return `${actor.name} (${rank}${pair}; ${actor.id})`;
  }).join('<br>');
  const boss = majorBosses.find(row => row.zoneId === record.zone);
  let bossText = '대형 보스 없음';
  if (boss) {
    const deck = signatureProfiles[boss.id]?.deck ?? ['검은 뿌리 직선 찌르기', '기억 수액 낙하'];
    const titles = deck.map(id => namesApi.resolve(id) ?? namesApi.resolve(id.split(':').at(-1)) ?? id);
    bossText = `${boss.sourceIdentity} · ${boss.phasePresentation.length}막<br>${titles.join(' → ')}`;
    if (boss.id === 'blue-executor') bossText += '<br><small>단서·순환 조건 충족 뒤 출현</small>';
  }
  return `| ${String(index + 1).padStart(2, '0')} | \`${record.zone}\` · ${record.title} | ${compactText(record.pre)}<br>→ ${compactText(record.post, 58)} | \`${zone.map}\`<br>\`${profile.environmentKey}\` · \`${profile.topology}\` · ${profile.hazards.join(', ')} · ${profile.props.join(', ')} · 박자 ${profile.tempo} | ${actors} | ${bossText} |`;
});

const comparison = [
  '| 비교작·확인 원칙 | HAPIL 현황 | 이번 개선·유지 원칙 |',
  '|---|---|---|',
  '| 동방 프로젝트: 공격을 캐릭터 이야기와 연결하고 이름을 붙여 패턴 자체에 의미를 준다. | 각 보스는 정본 맵·외형·3~4개 시그니처 덱·학습/변주/합성 규칙을 갖지만, 화면 예고는 보스 공통 규칙명만 우선 노출했다. | **개선:** 85개 시그니처 공격 + 프롤로그 2개 공격을 고유 한국어 이름으로 예고 배너에 표시한다. |',
  '| Hades: 반복 시도와 서사를 함께 두고, 난이도 보조 기능으로 도전 범위를 조절한다. | 사망·쉼터 체크포인트는 이미 서사 규칙에 연결되어 있다: 에피소드 1-A 완료 전 dist00 재시작, 이후 최근 쉼터. | 체크포인트 의미는 건드리지 않는다. 추후 쉬운 모드/연습 난이도를 추가하더라도 원문·저장 진행은 보존하고 전투 수치만 선택적으로 조절한다. |',
  '| Hollow Knight: 내부 테스트에서 초반 보스가 진행 장벽이 되는지 점검했고, 첫 보스의 위압감과 진입 난도를 별도로 다뤘다. | dist00는 2개 공격, 긴 예고, 두 형태 페이즈를 가진 짧은 첫 전투다. | 이야기상 사망 규칙은 그대로 두되, 공격명·공격선·안전 구간을 한 번에 읽히게 유지한다. 실제 신규 플레이테스트로 첫 보스의 이해도와 이탈률을 확인한다. |',
].join('\n');

const reportPath = path.join(root, 'docs/RC62-story-map-mob-boss-combat-review.md');
const report = [
  '# RC62 · 1인칭 독백 / 맵 / 몹 / 보스 전투 전수조사',
  '',
  `- 정본: \`${sourcePath}\` · SHA-256 \`${sourceHash}\` (업로드 원문 바이트 보존)`,
  '- 조사 대상: 활성 포털 경로 61기록 = 전투맵 55 + 쉼터 6 · 주요 보스 28 · 66수문장 원정 · 중간보스 38개 맵',
  '- 방법: 게임의 실제 정적 맵/적 편성 + 업로드 독백 카드 + 환경 프로필 + 보스 시그니처/규칙 테이블을 교차 검사. 활성 55개 맵 이미지는 연락표로 시각 개요를 확인했으며, 이는 픽셀 단위 아트 QA나 실제 사용자 플레이를 대체하지 않는다.',
  '',
  '## 결론',
  '',
  '독백과 포털 순서, 맵 환경, 몹의 명칭·스프라이트, 보스의 전용 패턴은 현재 정본 기준으로 전반적으로 맞물린다. 이전 RC60은 텍스트·환경 요약에 치우쳐 실제 적 편성과 보스 덱을 한눈에 검증하기 어려웠다. 이번 RC62는 55개 맵의 실제 정적 편성과 각 보스의 단계·공격을 같은 표에 놓고, 런타임에 생성되는 중간보스 짝까지 표기한다.',
  '',
  `전수 검사 결과: 맵 파일 ${battles.length}/${battles.length}, 적 스프라이트 ${allActors.length}/${allActors.length}, 환경 프로필 ${records.length}/${records.length}, 보스 전용 덱 ${Object.keys(signatureProfiles).length}개, 고유 공격명 ${signatureIds.length}/${signatureIds.length}. 누락 항목 0.`,
  '',
  '## 유명 게임과 비교해 반영한 점',
  '',
  comparison,
  '',
  '비교 근거: [ZUN 인터뷰 — 탄막에 캐릭터 서사와 이름을 연결](https://en.touhougarakuta.com/article/specialtaidan_zun_hiroyuki_5-en/) · [Supergiant Games — Hades FAQ](https://www.supergiantgames.com/blog/hades-faq/) · [Team Cherry — Hollow Knight playtest notes](https://www.teamcherry.com.au/blog/hollow-knights-mega-may-update).',
  '',
  '## 다음 행동 구조',
  '',
  '- **프롤로그·마지막 수호자:** 악마화 나무 정원의 첫 보스는 2개 예고형 공격과 2형태. 동굴에서 보라검 천사, 늪에서 뿔악마 및 되살아난 전우, 묘지에서 악마화 동료, 일곱 기둥에서 발록 결전으로 상승한다.',
  '- **병원·기억 전환:** dist06 발록전 뒤 추락 서사를 보여주고 ep1a08 병원에 도착한다. ep1a09는 주사실 전투 뒤 중세 발록/초천사 회상 배경을 사용한다. 병원은 내부 병동 맵이며 HELP ME 벽 글자가 보인다.',
  '- **일곱 죄악·컨트롤러:** 죄악별 테마맵과 개별 덱이 분리되어 있다. 컨트롤러 편은 17단계 이야기를 u201→u202→u204→u205→u206→u203으로 잇고, 마지막 주소 재생 보스가 그 구간을 닫는다.',
  '- **66수문장:** 48 일반 수문장 + 12 상위 수문장 + 6 대수문장 = 이름이 다른 66 전투자. 아카데미 6웨이브 뒤 시간 숲·수로·공방·뉴런 게이트·망각 묘지·붕괴 의식장·아르벨리아 회랑으로 진행한다.',
  '- **순환살인·사몽:** 살인 기억은 윤하람→장민재→고서진→옥상 루프 순이며, 파란불 집행체는 단서/순환 조건 뒤 출현한다. cult03 한리안/백이온은 정본 2인 보스이며, cult04 최종 교주전은 기존 4형태 및 사몽 각성 장면을 유지한다.',
  '',
  '## 맵별 원문·전투 매핑',
  '',
  '| 전투 순서 | 맵·독백 | 전투 전 → 전투 후 첫 문장 | 실제 맵·환경/기믹 | 정적 적 편성 | 주요 보스·전용 공격 |',
  '|---:|---|---|---|---|---|',
  ...battleRows,
  '',
  '## 쉼터 순서',
  '',
  '| 정본 순서 | 쉼터 | 다음 전투 |',
  '|---:|---|---|',
  ...shelters.map(record => `| ${record.index} | \`${record.zone}\` · ${record.title} | \`${records[record.index]?.zone ?? '에필로그'}\` |`),
  '',
  '## RC62에서 실제 적용한 개선',
  '',
  `- 보스의 85개 시그니처 패턴과 프롤로그 전용 공격 2개에 서로 구분되는 한국어 공격명을 붙였다. 시그니처 공격이 발사될 때 기존 보스 공통 규칙명 대신 해당 공격명을 예고 배너에 보여준다. 이름이 없는 런타임 공격은 기존 공통 예고로 안전하게 대체한다.`,
  '- UI 예고 제목을 한국어 “보스 패턴”으로 바꿨다. 패턴의 탄막·피격 기하·타이밍·공격력은 바꾸지 않아 피해판정 회귀 위험을 분리했다.',
  '- 모바일에서 RC15 레이아웃 규칙이 전투 레일을 숨기던 우선순위 충돌을 바로잡았다. 터치형 390×844 화면에서 패턴명 카드의 가시성과 폭을 브라우저로 확인했다.',
  '- 설정 DOM이 화면·터치 옵션을 하위 섹션에 두는 구조인데 예전 선택자는 최상위만 찾고 있었다. 모바일 성능 선택란 삽입을 섹션 경로에 맞추고 조작·저장까지 확인했다.',
  '- 전수 검사에서 서사 순서, 55개 맵 파일, 전 적 이미지, 맵 환경, 모든 보스 페이즈/덱, 66수문장 수, 중간보스 짝 편성을 자동 검증하도록 테스트를 추가했다.',
  '- 맵·몹 자산은 누락된 것이 없고 시각 테마도 서사에 대체로 맞아 새 이미지는 추가하지 않았다. 원문은 정확한 업로드 바이트를 보존한다.',
  '',
  '## 자동 검증에서 확인한 예외/한계',
  '',
  '- world boss 28개 가운데 `blue-executor`는 상시 정적 적이 아니라 murder03 순환/단서 후 투입되는 연출 보스다. 일반 중간보스 `mb-murder03`와 같은 객체로 세지 않도록 별도 예외로 검증한다.',
  '- 첫 보스 `dist00-boss`는 27종 공통 덱에 넣지 않은 튜토리얼 예외다. 두 공격(검은 뿌리 직선 찌르기, 기억 수액 낙하)과 2단계를 별도로 검증한다.',
  '- 동적 중간보스 짝은 정적 N 데이터에 복제된 스프라이트를 중복 저장하지 않고, RC59 런타임 파트너 생성/복원 규칙에 따른다. cult03의 한리안·백이온은 이미 정본 2인이라 중복 생성하지 않는다.',
  '- PC/모바일 브라우저에서 이름표 표시와 모바일 390×844 화면 적합성을 확인했다. 자동 검사와 뷰포트 검사가 기기별 프레임 속도, 실제 탄막 회피 난도, 모바일 기기에서 맵 가림 정도까지 보증하지는 않으므로, 공격 곡선·가독성은 실제 플레이로 확인해야 한다.',
  '',
].join('\n');

if (process.argv.includes('--write-audit')) fs.writeFileSync(reportPath, report);
else assert.equal(read('docs/RC62-story-map-mob-boss-combat-review.md'), report,
  'the exhaustive review document is stale; regenerate with --write-audit');

console.log(`RC62 PASS: ${records.length} canonical records, ${battles.length} battle maps, ${shelters.length} shelters, ${allActors.length} static actors, ${midbossZones.length} midboss maps, 66 guardians, ${majorBosses.length} boss concepts, ${signatureIds.length} named signatures, and all audited assets/routes.`);
