const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const runtime = read('assets/rc86/samong-cosmic.js');
const bundle = read('assets/index-v31526.js');
const html = read('index.html');
const ids = Array.from({length: 6}, (_, i) => 'kair-great-0' + (i + 1));
const art = {
  hanIdle: './assets/vfx/rc86/cult03-heretic-han-idle-v2.png',
  hanAction: './assets/vfx/rc86/cult03-heretic-han-cast-v2.png',
  baekIdle: './assets/vfx/rc86/cult03-heretic-baek-idle-v2.png',
  baekAction: './assets/vfx/rc86/cult03-heretic-baek-attack-v2.png',
};

assert.match(html, /assets\/index-v31526\.js\?v=39701/);
assert.match(html, /assets\/rc86\/samong-cosmic\.js\?v=39301/);
assert.match(html, /assets\/rc87\/episode-cosmic\.js\?v=39301/);
assert.match(bundle, /__HAPIL_RC86_BRIDGE__/);
assert.match(bundle, /text:`사몽 시련 \$\{p\.index\} · \$\{p\.role\}`/,
  'regional Dream encounters must not be mislabeled as the six Kair Great bosses');
assert.match(bundle, /dreamRegionalTrials:6/);
assert(!bundle.includes('./assets/vfx/rc55/cult03-heretic-han.png'));
assert(!bundle.includes('./assets/vfx/rc55/cult03-heretic-baek.png'));

const actors = [
  {id: 'c103-mid', name: 'old Han', midboss: true, hp: 800, maxHp: 800, actionSprites: {idle: 'old-han', attackA: 'old-han-attack'}},
  {id: 'c103-boss', name: 'old Baek', boss: true, hp: 1600, maxHp: 1600, phaseCount: 3, actionSprites: {idle: 'old-baek', attackA: 'old-baek-attack'}},
];
const templates = Object.fromEntries(ids.map((id, i) => [id, {
  id, boss: true, name: 'Great ' + (i + 1), eliteName: 'Great signature ' + (i + 1),
  patternSet: 'kair-signature-' + (i + 1), phaseCount: 3, phaseMax: 3,
  hp: 1000 + i * 100, maxHp: 1000 + i * 100,
  sprite: './assets/actors/v31345/guardians/great-0' + (i + 1) + '-atlas.webp',
  phaseSprites: ['./assets/actors/v31345/guardians/great-0' + (i + 1) + '-atlas.webp'],
  phaseSpriteFallbacks: ['./assets/actors/v31345/guardians/great-0' + (i + 1) + '-atlas.webp'],
  actionSprites: {idle: './assets/actors/v31345/guardians/great-0' + (i + 1) + '-atlas.webp'},
}]));
const regionalZones = ['u203', 'last303', 'kair03', 'hando03', 'ep1a11', 'cult04'];
const regional = regionalZones.map((zone, i) => ({
  zone,
  id: ['u203-boss', 'l303-boss', 'k103-boss', 'h103-boss', 'a11-boss', 'c104-boss'][i],
  boss: true,
}));
const emptyPlan = () => Object.fromEntries(
  ['all', 'A', 'B', 'C', 'deferred', 'pins'].map(key => [key, new Set()]),
);
const spriteMetadata = new Map();
const legacyPath = './assets/heroes/normalized/directions/rian-right.webp';
const bridge = {
  templates,
  apostates: actors,
  actor: (zone, id) => zone === 'cult03' ? actors.find(actor => actor.id === id) : null,
  zoneBoss: zone => {
    const index = regionalZones.indexOf(zone);
    return index >= 0 ? regional[index] : null;
  },
  modeApi: {mode: state => state.gameModeV31346 ?? 'STORY', dreamFinal: {zones: regionalZones}},
  patterns: (actor, phase) => actor ? [
    {name: actor.id + ' signature ' + phase, shape: 'circle', windup: 1.2},
    {name: actor.id + ' native pattern ' + phase, shape: 'line', windup: 1.5},
  ] : [],
  signatureProfile: actor => actor ? {deck: [actor.id + '-first', actor.id + '-second', actor.id + '-third']} : null,
  signatureAttack(state, actor) {
    const count = (state.signatureAttacks ??= []).filter(row => row.id === actor.id).length;
    const name = this.signatureProfile(actor).deck[count % 3];
    (state.signatureAttacks ??= []).push({id: actor.id, name});
    return {name, count: 12, phase: actor.fixedPhase};
  },
  runtimeSprite: (cache, pose, fallback) => ({pose, fallback}),
  setSpriteMetadata(path, metadata) { spriteMetadata.set(path, [...metadata]); },
  spriteMetadata(path) { return spriteMetadata.get(path) ?? null; },
  phaseSprite: (cache, actor, time) => ({old: actor?.id, time}),
  persistentTick(state) { this.lastTickState = state; return 37; },
  zoneAssetManifest(zone) { return new Set(zone === 'cult03' ? [legacyPath] : []); },
  zoneAssetPlan(zone) {
    const plan = emptyPlan();
    if (zone === 'cult03') for (const key of ['all', 'A', 'B', 'C', 'deferred', 'pins']) plan[key].add(legacyPath);
    return plan;
  },
};
const window = {
  __HAPIL_RC86_BRIDGE__: bridge,
  __HAPIL_V31300_PATCH__: {allPass: true},
  __HAPIL_AUTOPROGRESS_V31301__: {installed: true},
  __HAPIL_COSMIC_V31348__: {installed: true},
};
vm.runInNewContext(runtime, {window, setTimeout: fn => fn()});
const api = window.__HAPIL_SAMONG_COSMIC_V386__;
const visuals = window.__HAPIL_APOSTATE_VISUALS_RC86__;
assert(api?.installed && visuals?.installed, 'RC86 runtime and art hooks must install');
assert(api.audit().allPass, 'six native, three-phase cosmic bosses must be available');
assert(api.audit().signatureDecksDistinct, 'all six Kair Great signature decks must remain distinct');
assert(api.audit().bosses.every(row => row.signatureDeckUnique), 'each Kair Great boss needs a complete signature deck');
assert(visuals.audit().allPass, 'both apostates must keep their face and gear through their action poses');
assert.deepEqual(Array.from(api.audit().storyFinalSummonIds), ids);
assert(api.audit().regionalTrialsAreDifferentBosses,
  'Dream regional boss trials must remain separate from the Kair Great summons');

for (const file of Object.values(art)) {
  const png = fs.readFileSync(path.join(root, file.replace(/^\.\//, '')));
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a', file + ' must be PNG');
  assert.equal(png.readUInt32BE(16), 1254, file + ' width should match the paired sprite');
  assert.equal(png.readUInt32BE(20), 1254, file + ' height should match the paired sprite');
  assert.equal(png[25], 6, file + ' must preserve alpha for map compositing');
}
assert.deepEqual(bridge.phaseSprite(null, {...actors[0], castVisualUntil31210: 5}, 1), {
  pose: art.hanAction, fallback: art.hanIdle,
});
assert.deepEqual(bridge.phaseSprite(null, actors[0], 9), {
  pose: art.hanIdle, fallback: art.hanIdle,
});
const cult03Manifest = bridge.zoneAssetManifest('cult03');
for (const file of [art.hanIdle, art.hanAction, art.baekIdle, art.baekAction]) assert(cult03Manifest.has(file));
assert(!cult03Manifest.has(legacyPath), 'old unrelated hero actions must leave the apostate map manifest');
const cult03Plan = bridge.zoneAssetPlan('cult03');
assert(cult03Plan.A.has(art.hanIdle) && cult03Plan.pins.has(art.baekAction));
for (const key of ['B', 'C', 'deferred']) assert(!cult03Plan[key].has(legacyPath));
const cult04Manifest = bridge.zoneAssetManifest('cult04');
for (const id of ids) assert(cult04Manifest.has(templates[id].sprite), id + ' atlas must preload before the summon');
const cult04Plan = bridge.zoneAssetPlan('cult04');
for (const id of ids) assert(cult04Plan.A.has(templates[id].sprite), id + ' atlas must be promoted into the final arena');

const boss = {id: 'c104-boss', hp: 1000, maxHp: 1000, boss: true, hapilSecondPhaseV31300: true};
const state = {
  zone: 'cult04', gameModeV31346: 'STORY', time: 10, fxSerial: 1,
  enemies: [boss], bossDefeated: false, floatTexts: [], effects: [],
  hostileProjectiles: [], pendingHits: [], impactQueue: [], pendingStrikes: [],
  narrativeCasts: [], telekineticCasts: [], spatialRiftBarrages: [],
  bossOrdnanceCues: [], spatialRiftCasts: [], bossLaserCastsV31330: [],
  bossUltimateCastsV31334: [], dreamMirrorLasersV31347: [],
  hapilFinalBattleV31300: {
    stage: 7, secondPhaseActive: true, monochromeActiveV31377: true, completed: false,
  },
};
assert.equal(bridge.persistentTick(state), 37);
assert.equal(bridge.lastTickState, state);
assert.equal(api.snapshot(state).status, 'charging');
const sequence = [];
for (let index = 0; index < ids.length; index++) {
  state.time = api.snapshot(state).nextAt;
  api.tick(state);
  const clone = state.enemies.find(actor => actor.samongCosmicSummonV386);
  assert(clone, 'Samong summon ' + (index + 1) + ' did not appear');
  assert.equal(clone.id, ids[index]);
  assert.equal(clone.boss, true);
  assert.equal(clone.midboss, true, 'a summon must not end the map when its own HP is depleted');
  assert.equal(clone.noBossSummons, true, 'cosmic echoes must not recursively multiply');
  assert.equal(clone.themedOrdnanceAt, Number.POSITIVE_INFINITY,
    'the direct Kair signature cast must not get duplicated by the automatic route');
  assert.equal(clone.samongCosmicIndexV386, index + 1);
  assert(clone.hp > 0 && clone.maxHp < templates[clone.id].maxHp);
  assert(api.nativePatterns(clone.id, clone.fixedPhase).length > 0,
    clone.id + ' must use a real Kair Great attack deck');
  sequence.push(clone.id);
  state.time = clone.samongCosmicDispatchAtV386;
  api.tick(state);
  assert.equal(clone.samongCosmicPatternDispatchedV386, true,
    clone.id + ' must dispatch a native boss pattern during its summon');
  assert(bridge.signatureProfile(clone).deck.includes(clone.samongCosmicPatternNameV386),
    clone.id + ' must use its own native identity deck, not a shared generic pattern');
  assert.deepEqual(state.signatureAttacks.at(-1), {id: clone.id, name: clone.samongCosmicPatternNameV386});
  if (index === 0) {
    state.hostileProjectiles.push({id: 'cosmic-owned', sourceId: clone.id}, {id: 'final-boss-owned', sourceId: boss.id});
    clone.hp = 0;
    state.time += 0.01;
    api.tick(state);
    assert(!state.enemies.some(actor => actor.samongCosmicSummonV386));
    assert.deepEqual(state.hostileProjectiles.map(row => row.sourceId), [boss.id],
      'retiring an echo must clear only its own hostile projectiles');
    assert.equal(state.bossDefeated, false);
    continue;
  }
  state.time = api.snapshot(state).activeUntil;
  api.tick(state);
  assert(!state.enemies.some(actor => actor.samongCosmicSummonV386),
    clone.id + ' should retire before the next echo appears');
}
assert.deepEqual(sequence, ids);
assert.equal(api.snapshot(state).status, 'complete');
assert.equal(state.enemies[0], boss, 'the final boss must remain the sole map-clear authority');
assert.equal(state.bossDefeated, false);
assert.equal(state.effects.filter(effect => effect.samongCosmicSummonV386).length, 6);

const dreamState = {
  ...state, time: 50, gameModeV31346: 'DREAM',
  enemies: [{...boss}],
  hapilFinalBattleV31300: {stage: 7, secondPhaseActive: true, monochromeActiveV31377: true, completed: false},
};
api.tick(dreamState);
assert.equal(dreamState.hapilSamongCosmicWaveV386, undefined,
  'the separate Dream regional-boss sequence must stay isolated');
const hellState = {
  ...state, time: 70, gameModeV31346: 'HELL',
  hapilSamongCosmicWaveV386: undefined,
  enemies: [{...boss, hp: boss.maxHp}],
  hapilFinalBattleV31300: {stage: 7, secondPhaseActive: true, monochromeActiveV31377: true, completed: false},
};
api.tick(hellState);
assert.equal(api.snapshot(hellState),null,'removed Hell mode never admits a story Samong finale');
const earlyState = {
  ...state, time: 90, gameModeV31346: 'STORY',
  hapilSamongCosmicWaveV386: undefined,
  enemies: [{...boss, hp: boss.maxHp}],
  hapilFinalBattleV31300: {stage: 6, secondPhaseActive: false, monochromeActiveV31377: false, completed: false},
};
api.tick(earlyState);
assert.equal(earlyState.hapilSamongCosmicWaveV386, undefined, 'summons must not leak into the first phase');
console.log('RC86 PASS: apostate idle/action art stays identity-consistent; six unique Kair Great decks summon only in Story with bounded cleanup and Dream isolation.');
