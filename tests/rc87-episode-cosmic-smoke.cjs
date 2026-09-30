const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const runtime = read('assets/rc87/episode-cosmic.js');
const html = read('index.html');
const bundle = read('assets/index-v31526.js');
const ids = Array.from({length: 6}, (_, i) => 'kair-great-0' + (i + 1));
const episodes = [
  {part: 2, zone: 'ep1b09', triggerId: 'b09-boss'},
  {part: 3, zone: 'u203', triggerId: 'u203-boss'},
  {part: 4, zone: 'last303', triggerId: 'l303-boss'},
  {part: 5, zone: 'kair03', triggerId: 'k103-boss'},
  {part: 6, zone: 'hando03', triggerId: 'h103-boss'},
  {part: 7, zone: 'murder03', triggerId: 'mb-murder03'},
];

assert.match(html, /assets\/rc87\/episode-cosmic\.js\?v=38703/);
assert.match(bundle, /__HAPIL_EPISODE_COSMIC_V387__\?\.beforeDeath\(t, e\)/,
  'campaign Cosmic final death must enter the regular reward and map-clear route');
assert.match(bundle, /get zoneCombatCleared\(\)/);
assert.match(bundle, /set restoreEnemies\(value\)/);

const triggerActors = new Map(episodes.map((episode, i) => [episode.zone, {
  id: episode.triggerId, name: 'Episode boss ' + (i + 2), boss: i !== 5,
  midboss: i === 5, hp: 1200 + i * 100, maxHp: 1200 + i * 100,
  x: 8 + i, y: 9 + i,
}]));
const templates = Object.fromEntries(ids.map((id, i) => [id, {
  id, name: 'Kair Great ' + (i + 1), boss: true, phaseCount: 3, phaseMax: 3,
  patternSet: 'great-' + (i + 1), hp: 1600 + i * 100, maxHp: 1600 + i * 100,
  sprite: './assets/actors/great-' + (i + 1) + '.webp',
  phaseSprites: ['./assets/actors/great-' + (i + 1) + '.webp'],
  actionSprites: {idle: './assets/actors/great-' + (i + 1) + '.webp'},
}]));
const profiles = ids.map((id, i) => ({id, title: 'Cosmic ' + (i + 1), color: '#8ceaff', accent: '#e7fcff'}));
const metadata = new Map();
const plans = new Map();
const emptyPlan = () => Object.fromEntries(['all', 'A', 'B', 'C', 'deferred', 'pins'].map(key => [key, new Set()]));
const bridge = {
  templates,
  modeApi: {mode: state => state.gameModeV31346 ?? 'STORY'},
  actor: (zone, id) => {
    const actor = triggerActors.get(zone);
    return actor?.id === id ? actor : null;
  },
  zoneCombatCleared(state) {
    return Boolean(state && state.enemies.length === 0 && state.bossDefeated === true);
  },
  persistentTick(state) { state.baseTicks = (state.baseTicks ?? 0) + 1; return 9; },
  signatureAttack(state, actor) {
    (state.signatureAttacks ??= []).push(actor.id);
    return {name: actor.id + '-native-signature', count: 4, cycle: state.signatureAttacks.length};
  },
  zoneAssetManifest(zone) { return new Set(['./assets/maps/' + zone + '.webp']); },
  zoneAssetPlan(zone) { const plan = emptyPlan(); plan.all.add('./assets/maps/' + zone + '.webp'); return plan; },
  setSpriteMetadata(path, value) { metadata.set(path, [...value]); },
  spriteMetadata(path) { return metadata.get(path) ?? null; },
  serializeSave(state) { return {zone: state.zone, enemies: []}; },
  normalizeSave(raw) { return {...raw, sourceVersion: 13}; },
  restoreEnemies() { return []; },
  restoreEntry(state) { return state; },
};
const window = {
  __HAPIL_RC86_BRIDGE__: bridge,
  __HAPIL_SAMONG_COSMIC_V386__: {installed: true, bosses: profiles},
};
vm.runInNewContext(runtime, {window, setTimeout: fn => fn()});
const api = window.__HAPIL_EPISODE_COSMIC_V387__;
assert(api?.installed, 'RC87 campaign Cosmic finale runtime should install');
const audit = JSON.parse(JSON.stringify(api.audit()));
assert.equal(audit.allPass, true, JSON.stringify(audit, null, 2));
assert.deepEqual(audit.rows.map(row => [row.part, row.zone, row.triggerId, row.cosmicId]),
  episodes.map((row, i) => [row.part, row.zone, row.triggerId, ids[i]]));
assert.equal(audit.partOneUsesLucifer, true, 'part 1 must retain its existing post-mask Lucifer finale');
assert.equal(audit.partEightKeepsSamong, true, 'part 8 must retain Samong and his separate summon skill');
assert.equal(audit.dreamIsolated, true, 'Dream mode must retain its separate six-stage boss sequence');

const campaign = {clues: new Set()};
for (let i = 0; i < episodes.length; i++) {
  const episode = episodes[i];
  const trigger = {...triggerActors.get(episode.zone), hp: 0};
  const state = Object.assign(campaign, {
    zone: episode.zone, gameModeV31346: 'STORY', time: 12, fxSerial: 1,
    enemies: [trigger], bossDefeated: false, floatTexts: [], effects: [], signatureAttacks: [],
    spawnedWaves: new Set([3]), loopCycles: {[episode.zone]: 3},
  });

  assert.equal(api.beforeDeath(state, trigger), false);
  assert.equal(state.hapilEpisodeCosmicV387.status, 'pending');
  if (trigger.midboss) assert.equal(state.bossDefeated, true, 'the authored episode-final midboss must release the finale gate');
  state.enemies = [];
  if (trigger.boss) state.bossDefeated = true;
  assert.equal(bridge.zoneCombatCleared(state, episode.zone), false,
    'the regular portal must remain locked while the Cosmic boss is active');
  const boss = state.enemies.find(actor => actor.episodeCosmicFinalV387);
  assert(boss, episode.zone + ' must spawn the mapped Cosmic boss');
  assert.equal(boss.id, ids[i]);
  assert.equal(boss.boss, true);
  assert.equal(boss.midboss, false, 'episode Cosmic must be a true final boss, not a transient midboss echo');
  assert.equal(boss.episodeCosmicPartV387, episode.part);
  const path = templates[ids[i]].sprite;
  assert(bridge.zoneAssetManifest(episode.zone).has(path), path + ' must preload in its episode map');
  const plan = bridge.zoneAssetPlan(episode.zone);
  assert(plan.A.has(path) && plan.pins.has(path), path + ' must be promoted before the Cosmic arrival');

  state.time = boss.episodeCosmicSignatureAtV387;
  api.tick(state);
  api.tick(state);
  assert.deepEqual(state.signatureAttacks, [boss.id], 'the arrival signature must dispatch once, not repeat per frame');
  state.time = boss.episodeCosmicNextSignatureV387;
  api.tick(state);
  assert.equal(state.signatureAttacks.length, 2, 'the native boss deck must repeat after its authored cycle interval');

  boss.hp = 0;
  api.beforeDeath(state, boss);
  state.enemies = [];
  assert.equal(bridge.zoneCombatCleared(state, episode.zone), true,
    'the episode exit should unlock only after its true-final Cosmic boss falls');
  assert.equal(state.hapilEpisodeCosmicV387.status, 'complete');
}

const saveState = {
  zone: 'u203', gameModeV31346: 'STORY', time: 4, fxSerial: 1,
  enemies: [], bossDefeated: false, clues: new Set(), floatTexts: [], effects: [],
  spawnedWaves: new Set([3]), loopCycles: {u203: 3},
};
saveState.hapilEpisodeCosmicV387 = {
  version: 1, status: 'pending', part: 3, zone: 'u203', triggerId: 'u203-boss',
  cosmicId: ids[1], triggerX: 11, triggerY: 12, triggerMaxHp: 1500, queuedAt: 3,
};
saveState.bossDefeated = true;
bridge.zoneCombatCleared(saveState, 'u203');
const activeBoss = saveState.enemies[0];
activeBoss.hp -= 17;
saveState.time = 3600;
activeBoss.episodeCosmicFirstSignatureDispatchedV387 = true;
activeBoss.episodeCosmicNextSignatureV387 = 3604.25;
const serialized = bridge.serializeSave(saveState);
assert.equal(serialized.episodeCosmicFinalV387.status, 'active');
assert.equal(serialized.episodeCosmicFinalV387.hp, activeBoss.hp);
assert.equal(serialized.episodeCosmicFinalV387.signatureDelayRemaining, 4.25);
const normalized = bridge.normalizeSave(serialized);
assert.equal(normalized.episodeCosmicFinalV387.cosmicId, ids[1]);
const restoredActors = bridge.restoreEnemies(normalized);
assert.equal(restoredActors.length, 1);
assert.equal(restoredActors[0].episodeCosmicFinalV387, true);
assert.equal(restoredActors[0].hp, activeBoss.hp);
const restoredState = {zone: 'u203', time: 100, enemies: restoredActors, clues: new Set(), bossDefeated: true};
bridge.restoreEntry(restoredState, normalized);
assert.equal(restoredState.hapilEpisodeCosmicV387.status, 'active');
assert.equal(restoredState.bossDefeated, false);
assert.equal(restoredActors[0].episodeCosmicNextSignatureV387, 104.25,
  'a late-session save must rebase its remaining signature delay onto the restored clock');
restoredState.time = 104;
api.tick(restoredState);
assert.equal(restoredState.signatureAttacks, undefined);
restoredState.time = 104.25;
api.tick(restoredState);
assert.deepEqual(restoredState.signatureAttacks, [ids[1]]);
saveState.zone = 'unrelated-map';
assert.equal(bridge.serializeSave(saveState).episodeCosmicFinalV387, null,
  'a previous episode stage must not leak into saves for a different map');
assert.equal(api.sanitize({...serialized.episodeCosmicFinalV387, cosmicId: 'c104-boss'}, 'u203'), null,
  'save payloads must not inject a different Cosmic or Samong actor');
console.log('RC87 PASS: parts 2–7 gate their exits behind mapped native Cosmic true-final bosses; part 1 Lucifer, part 8 Samong, Dream trials, native signatures, asset promotion, and save/resume stay isolated.');
