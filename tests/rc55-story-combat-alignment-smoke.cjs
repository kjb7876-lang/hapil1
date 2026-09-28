const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const storyWindow = {};
vm.runInNewContext(read('data/story-rc51.js'), { window: storyWindow });
const story = storyWindow.__HAPIL_STORY_DATA_RC51__;
const records = story.records;

assert.equal(story.editorialRevision, 'RC57');
assert.equal(records.length, 62, 'all authored map and rest records must remain');
assert.equal(new Set(records.map(record => record.zone)).size, 62,
  'every story entry must target a distinct playable zone');
assert.equal(records.filter(record => !record.rest).length, 56,
  'the 56 battle entries must keep their before/after cards');
for (const record of records) {
  if (record.rest) continue;
  for (const field of ['pre', 'post', 'firstPost', 'awakenPre'])
    assert((record[field]?.length ?? 0) <= 900, `${record.zone} ${field} exceeds the card layout limit`);
}
const prose = story.raw;
assert(!/악마였던건지|경고와함께|머리속|문을 잠군|기리고|수호자로써|남겨져있었다|남은채|거였던거|대리고|되기위한|문들 부터|정당화 해|정렬되 있었다|어려워 졌|누를 수 밖에|기억 조차|존재 하고 있었다|책망 하였고|밀어 벼렸다|보내었다|바랬기에|한이경 이였다|둘이상|뿐이였|소멸 되어 버렸다|그들의 각자/.test(prose),
  'the reviewed story still contains known spelling or spacing errors');
const cultRecord = records.find(record => record.zone === 'cult03');
assert.match(cultRecord.pre, /한리안과 백이온/);
assert.match(cultRecord.post, /황금 역십자가의 탄막과 질서의 방벽/);
assert.match(prose, /이곳에 남은 사람들이 자기 이름으로 살아갈 수 있는 자유의지가 존재하는 세계/);

const bundle = read('assets/index-v31526.js');
const html = read('index.html');
assert.match(html, /assets\/index-v31526\.js\?v=35502/);
assert.match(bundle, /MONGSE_ZONE_DISPLAY_NAMES31222/);
assert.match(bundle, /black_rose_ego_core_prison\.jpg/);
assert.match(bundle, /"c103-boss": \{ deck: \[`id-chase`, `superego-judgment`, `ego-triad`, `harvest-composite`\]/);
assert.match(bundle, /actorId: `c103-mid`,[\s\S]{0,180}spriteArt: `\.\/assets\/vfx\/rc55\/cult03-heretic-han\.png`/,
  'Han must use the actual apostate midboss actor and generated art');
assert.match(bundle, /actorId: `c103-boss`,[\s\S]{0,180}spriteArt: `\.\/assets\/vfx\/rc55\/cult03-heretic-baek\.png`/,
  'Baek must use the actual apostate boss actor and generated art');
assert.match(bundle, /actorId: `c103-mid`,[\s\S]{0,260}patternSet: `rc55-c103-han`/);
assert.match(bundle, /actorId: `c103-boss`,[\s\S]{0,260}patternSet: `rc55-c103-baek`/);

const marker = '/* RC55: bind the cult03 heretics to their story and paired golden attacks. */';
const start = bundle.indexOf(marker);
assert(start >= 0, 'RC55 encounter bridge is missing');
const rc56Start = bundle.indexOf('/* RC56: restore the enclosed HELP ME ward', start);
assert(rc56Start > start, 'RC56 must follow the cult03 route bridge');
const bridge = bundle.slice(start, rc56Start);
const actors = [
  {id: 'c103-e2', kind: 'void', name: 'SUPER EGO 절개결정', hp: 266, x: 14, y: 6},
  {id: 'c103-e3', kind: 'ghoul', name: 'ID 잔류 점액체', hp: 246, x: 7, y: 14},
  {id: 'c103-mid', kind: 'siren', name: 'apostate template', hp: 840, x: 11.8, y: 16.4, midboss: true, patternSet: 'final-kairo', actionSprites: {idle: 'old-han-idle', attackA: 'old-han-attack'}},
  {id: 'c103-boss', kind: 'tank', name: 'apostate template', hp: 1620, x: 23.4, y: 16.8, boss: true, patternSet: 'final-hando', phaseCount: 3, actionSprites: {idle: 'old-baek-idle', attackA: 'old-baek-attack'}},
];
const ordinaryBefore = JSON.stringify(actors.slice(0, 2));
const N = {cult03: {id: 'cult03', map: './assets/maps/latest-v3123/black_rose_ego_core_prison.jpg', enemies: actors}};
const emptyPlan = () => Object.fromEntries(
  ['all', 'A', 'B', 'C', 'deferred', 'pins'].map(key => [key, new Set()]),
);
const context = {
  N,
  er: {},
  K(name, shape, options = {}) { return {name, shape, ...options}; },
  MONGSE_zoneAssetManifest() { return new Set(); },
  MONGSE_zoneAssetPlan31220() { return emptyPlan(); },
  window: {},
};
vm.runInNewContext(bridge, context);
const api = context.window.__HAPIL_STORY_COMBAT_ALIGNMENT_RC55__;
assert(api, 'RC55 story/combat audit API was not installed');
const audit = JSON.parse(JSON.stringify(api.audit()));
assert.deepEqual(audit.heretics, ['이단의목사 한리안', '이단의목사 백이온']);
assert.deepEqual(audit.sprites, [api.assets.han, api.assets.baek],
  'the generated character art must be assigned to the matching story enemies');
assert.deepEqual(audit.portraits, [api.assets.han, api.assets.baek],
  'the generated apostate art must also reach their portrait path');
assert.deepEqual(audit.actorIds, ['c103-mid', 'c103-boss'],
  'the story names must bind to the apostate duo, not regular add slots');
assert.deepEqual(audit.ranks, [true, true], 'midboss/boss combat rank must stay intact');
assert.equal(audit.duplicateHereticActors, 2,
  'each named apostate should exist exactly once in the enemy roster');
assert.deepEqual(audit.hereticPatterns.map(deck => deck.length), [3, 3]);
assert(audit.hereticPatterns[0].some(pattern => pattern.shape === 'cross'));
assert(audit.hereticPatterns[1].some(pattern => pattern.shape === 'cone'));
assert(audit.hereticPatterns[0].some(pattern => pattern.name.includes('황금 격자')),
  'Han’s pattern deck must include the circuit attack described by the encounter');
assert(audit.hereticPatterns[1].some(pattern => pattern.shape === 'donut'),
  'Baek’s pattern deck must include the paired circuit ring');
assert.equal(JSON.stringify(actors.slice(0, 2)), ordinaryBefore,
  'ordinary c103-e2/e3 enemies must not be replaced by the named apostates');
assert.equal(actors.length, 4, 'the encounter actor count must stay stable');
assert.deepEqual(JSON.parse(JSON.stringify(actors[2].actionSprites)), {
  idle: api.assets.han, attackA: 'old-han-attack', move: api.assets.han,
}, 'Han’s generated image must be used in idle/move while preserving attack animation');
assert.deepEqual(JSON.parse(JSON.stringify(actors[3].actionSprites)), {
  idle: api.assets.baek, attackA: 'old-baek-attack', move: api.assets.baek,
}, 'Baek’s generated image must be used in idle/move while preserving attack animation');
assert.equal(audit.manifest, true);
assert.equal(audit.plan, true);
assert.equal(actors.find(actor => actor.id === 'c103-e2').midboss, undefined,
  'the actor roster count stays stable');

for (const file of [api.assets.han, api.assets.baek]) {
  const png = fs.readFileSync(path.join(root, file.replace(/^\.\//, '')));
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a', `${file} is not a PNG`);
  assert.equal(png.readUInt32BE(16), 1254, `${file} width changed`);
  assert.equal(png.readUInt32BE(20), 1254, `${file} height changed`);
  assert.equal(png[25], 6, `${file} must preserve alpha for sprite compositing`);
}

console.log('RC55/56 PASS: story entries retained; cult03 apostates bind to their real boss slots.');
