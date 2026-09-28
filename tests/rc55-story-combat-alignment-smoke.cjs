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

assert.equal(story.editorialRevision, 'RC55');
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
assert(!/악마였던건지|경고와함께|머리속|문을 잠군|기리고|수호자로써|남겨져있었다|남은채|완치되었|거였던거|대리고|되기위한|문들 부터|정당화 해|정렬되 있었다|어려워 졌|누를 수 밖에|기억 조차|존재 하고 있었다|책망 하였고|밀어 벼렸다|보내었다|바랬기에|한이경 이였다|둘이상|뿐이였|소멸 되어 버렸다|그들의 각자/.test(prose),
  'the reviewed story still contains known spelling or spacing errors');
const cultRecord = records.find(record => record.zone === 'cult03');
assert.match(cultRecord.pre, /한리안과 백이온/);
assert.match(cultRecord.post, /황금 역십자가의 탄막과 질서의 방벽/);
assert.match(prose, /각자의 이름으로 살아가며 스스로 선택할 수 있는 세계/);

const bundle = read('assets/index-v31526.js');
const html = read('index.html');
assert.match(html, /assets\/index-v31526\.js\?v=35501/);
assert.match(bundle, /MONGSE_ZONE_DISPLAY_NAMES31222/);
assert.match(bundle, /black_rose_ego_core_prison\.jpg/);
assert.match(bundle, /"c103-boss": \{ deck: \[`id-chase`, `superego-judgment`, `ego-triad`, `harvest-composite`\]/);

const marker = '/* RC55: bind the cult03 heretics to their story and paired golden attacks. */';
const start = bundle.indexOf(marker);
assert(start >= 0, 'RC55 encounter bridge is missing');
const bridge = bundle.slice(start);
const actors = [
  {id: 'c103-e2', kind: 'void', name: 'SUPER EGO 절개결정', hp: 266, x: 14, y: 6},
  {id: 'c103-e3', kind: 'ghoul', name: 'ID 잔류 점액체', hp: 246, x: 7, y: 14},
  {id: 'c103-mid', kind: 'tank', name: '삼중자아 수확기', hp: 840, x: 10, y: 9, midboss: true, patternSet: 'final-hando'},
  {id: 'c103-boss', kind: 'commandBoss', name: '삼중수확체', hp: 1620, x: 15, y: 14, boss: true, patternSet: 'final-hando', phaseCount: 3},
];
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
assert.deepEqual(audit.heretics, ['이단 의목사 한리안', '이단 의목사 백이온']);
assert.deepEqual(audit.sprites, [api.assets.han, api.assets.baek],
  'the generated character art must be assigned to the matching story enemies');
assert.deepEqual(audit.hereticPatterns.map(deck => deck.length), [2, 2]);
assert(audit.hereticPatterns[0].some(pattern => pattern.shape === 'cross'));
assert(audit.hereticPatterns[1].some(pattern => pattern.shape === 'cone'));
assert.equal(audit.circuitPatternSet, 'rc55-cult03-circuit');
assert.deepEqual(audit.circuitPatterns.map(pattern => pattern.shape), ['cross', 'donut']);
assert.equal(audit.coreBoss, true, 'the triadic core remains the zone boss');
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

console.log('RC55 PASS: 62 story entries proofread; cult03 heretics, gold patterns, and sprite asset routes align.');
