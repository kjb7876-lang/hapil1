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

require('../tools/rc154-cosmic-loader.cjs').verify({html,bundle,extension15:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-15.json')),extension16:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-16.json')),extension17:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-17.json')),extension18:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-18.json')),extension19:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-19.json')),extension20:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-20.json')),extension21:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-21.json')),extension22:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-22.json')),extension23:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-23.json')),extension24:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-24.json')),extension25:fs.readFileSync(path.join(root,'qa/rc133/authorized-runtime-extension-25.json'))});
assert.match(html, /assets\/rc86\/samong-cosmic\.js\?v=45001/);
assert.match(html, /assets\/rc87\/episode-cosmic\.js\?v=39303/);
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
  phaseGateHealth(_state, actor, damage) { return Math.max(0, actor.hp - damage); },
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
window.__HAPIL_DANMAKU_RPG_RC88__ = {
  summonClock: state => state.time,
  prepareSummon(_state, actor) { actor.hp = actor.maxHp = 30; actor.rc88InteractiveCosmic = true; },
  beforeDeath(state, actor) { state.enemies = state.enemies.filter(row => row !== actor); (state.rc88Encounter ??= {cosmicKills: []}).cosmicKills.push(actor.samongCosmicIndexV386); return true; },
};
window.__HAPIL_FINAL_AWAKENING_RC108__ = {
  complete(state) { const battle = state.hapilFinalBattleV31300; if (!battle.awakeningPendingRC108) return false; battle.awakeningPendingRC108 = false; battle.awakeningCommittedRC108 = true; state.hp = state.maxHp; return true; },
};
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
  zone: 'cult04', gameModeV31346: 'STORY', time: 10, hp: 240, maxHp: 240, x: 12, y: 22, fxSerial: 1,
  enemies: [boss], bossDefeated: false, floatTexts: [], effects: [],
  hostileProjectiles: [], pendingHits: [], impactQueue: [], pendingStrikes: [],
  narrativeCasts: [], telekineticCasts: [], spatialRiftBarrages: [],
  bossOrdnanceCues: [], spatialRiftCasts: [], bossLaserCastsV31330: [],
  bossUltimateCastsV31334: [], dreamMirrorLasersV31347: [],
  hapilFinalBattleV31300: {
    stage: 7, secondPhaseActive: true, monochromeActiveV31377: true, completed: false,
    awakeningPendingRC108: true, awakeningCommittedRC108: false,
  },
};
assert.equal(bridge.persistentTick(state), 37);
assert.equal(bridge.lastTickState, state);
assert.equal(api.snapshot(state).status, 'charging');
state.time = api.snapshot(state).nextAt;
api.tick(state);
const clones = state.enemies.filter(actor => actor.samongCosmicSummonV386);
assert.equal(clones.length, 6, 'all six bodies must appear in the same tick');
assert.deepEqual(clones.map(actor => actor.id), ids);
assert.equal(new Set(clones.map(actor => actor.x + ':' + actor.y)).size, 6, 'six readable arena positions');
assert(clones.every(actor => actor.boss && !actor.midboss && actor.noBossSummons && actor.hp > 0 && actor.invulnerableUntil === Infinity && !actor.episodeBossSummon), 'native midpoint and Pride cleanup must not retire live Cosmic bodies');
assert.equal(bridge.phaseGateHealth(state, clones[0], clones[0].hp * 10), clones[0].hp, 'native damage must not retire a Cosmic before the awakening');
assert.equal(api.snapshot(state).status, 'six-awakened');
assert.equal(state.hapilFinalBattleV31300.awakeningCommittedRC108, false);
for (const clone of clones) {
  state.time = clone.samongCosmicDispatchAtV386;
  api.tick(state);
  assert.equal(clone.samongCosmicPatternDispatchedV386, true, clone.id + ' signature must release');
  assert(bridge.signatureProfile(clone).deck.includes(clone.samongCosmicPatternNameV386));
}
assert.equal(api.snapshot(state).status, 'crisis');
assert.equal(state.hp, 1);
assert.equal(state.hapilFinalBattleV31300.awakeningCommittedRC108, false);
state.hostileProjectiles.push({id:'cosmic-owned',sourceId:ids[0]},{id:'leader-owned',sourceId:boss.id});
state.time += 1.21;
api.tick(state);
assert.equal(state.hapilFinalBattleV31300.awakeningCommittedRC108, true);
assert.equal(state.hp, 240);
for (let i = 0; i < 5; i++) { state.time += .29; api.tick(state); }
assert.equal(api.snapshot(state).status, 'complete');
assert.equal(state.enemies.length, 0, 'player awakening dissolves the leader after six Cosmic strikes');
assert.equal(state.hapilFinalBattleV31300.finalHitModeV31377, 'samong-awakening');
assert.equal(state.hapilFinalBattleV31300.completed, true);
assert.deepEqual(state.rc88Encounter.cosmicKills, [1,2,3,4,5,6]);
assert.deepEqual(state.hostileProjectiles.map(row => row.sourceId), [], 'real deaths clear Cosmic and leader hazards');
assert.equal(state.effects.filter(effect => effect.samongCosmicSummonV386).length, 13);
const once = state.rc88Encounter.cosmicKills.length;
state.time += 20; api.tick(state);
assert.equal(state.rc88Encounter.cosmicKills.length, once, 'completed wave is idempotent');
assert.equal(state.bossDefeated, true);

const deadState={...state,time:35,hp:240,bossDefeated:false,enemies:[{...boss,hp:1000}],hapilSamongCosmicWaveV386:undefined,
  hapilFinalBattleV31300:{stage:7,secondPhaseActive:true,monochromeActiveV31377:true,completed:false,awakeningPendingRC108:true}};
api.tick(deadState);deadState.time=api.snapshot(deadState).nextAt;api.tick(deadState);
assert.equal(deadState.enemies.filter(actor=>actor.samongCosmicSummonV386).length,6);
deadState.hp=0;api.tick(deadState);
assert.equal(deadState.hapilSamongCosmicWaveV386,undefined,'player death clears the once-only encounter');
assert.equal(deadState.enemies.filter(actor=>actor.samongCosmicSummonV386).length,0,'player death removes all six bodies');

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
// The same final Story route becomes a true one-body sequence on a touch
// device; resizing a desktop browser alone leaves the six-body route above.
window.navigator = {maxTouchPoints: 5};
window.screen = {width: 390, height: 844};
window.matchMedia = query => ({matches: query === '(pointer: coarse)'});
assert.equal(api.mobileDevice(), true);
const mobileState = {
  ...state, time: 100, hp: 240, bossDefeated: false, enemies: [{...boss, hp: 1000}],
  hostileProjectiles: [{sourceId:'c104-boss'}], pendingHits: [{sourceId:'c104-boss'}],
  impactQueue: [], effects: [], floatTexts: [], rc88Encounter: {cosmicKills: []},
  hapilSamongCosmicWaveV386: undefined,
  hapilFinalBattleV31300: {stage:7,secondPhaseActive:true,monochromeActiveV31377:true,
    completed:false,awakeningPendingRC108:true,awakeningCommittedRC108:false},
};
const mobileLive = () => mobileState.enemies.filter(actor => actor.samongCosmicSummonV386 && actor.hp > 0);
api.tick(mobileState);
assert.equal(api.snapshot(mobileState).sequentialMobile, true);
assert.equal(mobileState.hostileProjectiles.length, 0, 'leader ordnance pauses during mobile Cosmic sequence');
mobileState.time = api.snapshot(mobileState).nextAt;
api.tick(mobileState);
assert.deepEqual(mobileLive().map(actor => actor.id), ids.slice(0,1));
const mobileOrder=[];
for (let index=0; index<6; index++) {
  const actor=mobileLive()[0];
  assert.equal(actor?.id, ids[index], 'each mobile boss appears once in canonical order');
  mobileOrder.push(actor.id);
  mobileState.time=Math.max(mobileState.time,actor.samongCosmicDispatchAtV386)+.01;
  api.tick(mobileState);
  assert.equal(actor.samongCosmicPatternDispatchedV386,true,'mobile boss must emit its native signature');
  if(index===0){
    assert.equal(api.snapshot(mobileState).status,'crisis');
    assert.equal(mobileState.hp,1);
    mobileState.time+=1.21;api.tick(mobileState);
    assert.equal(api.snapshot(mobileState).status,'awakening');
    assert.equal(mobileState.hapilFinalBattleV31300.awakeningCommittedRC108,true);
  }
  mobileState.hostileProjectiles.push({sourceId:actor.id,id:'shot-'+index});
  mobileState.pendingHits.push({sourceId:actor.id,id:'hit-'+index});
  mobileState.bossLaserCastsV31330.push({sourceId:actor.id,id:'cast-'+index});
  mobileState.time=Math.max(mobileState.time,actor.activePatternUntil,actor.samongCosmicPatternClockV386+1.8)+.01;
  api.tick(mobileState);
  assert.equal(mobileLive().length,0,'old body must die before the next appears');
  for(const key of ['hostileProjectiles','pendingHits','bossLaserCastsV31330'])
    assert(!mobileState[key].some(row=>row.sourceId===actor.id),'old boss '+key+' must be cleaned');
  if(index<5){
    if(index===1)window.screen={width:844,height:390};
    mobileState.time=api.snapshot(mobileState).nextAt;
    api.tick(mobileState);
    assert.equal(mobileLive().length,1,'rotation/next arrival keeps one body');
  }
}
assert.deepEqual(mobileOrder,ids);
assert.deepEqual(mobileState.rc88Encounter.cosmicKills,[1,2,3,4,5,6]);
assert.equal(api.snapshot(mobileState).status,'complete');
assert.equal(mobileState.hapilFinalBattleV31300.completed,true);
assert.equal(mobileState.bossDefeated,true);
mobileState.time+=20;api.tick(mobileState);
assert.equal(mobileState.rc88Encounter.cosmicKills.length,6,'mobile finale must be idempotent');
const earlyKillState={...mobileState,time:200,hp:240,bossDefeated:false,enemies:[{...boss,hp:1000}],hostileProjectiles:[],pendingHits:[],impactQueue:[],pendingStrikes:[],narrativeCasts:[],telekineticCasts:[],spatialRiftBarrages:[],bossOrdnanceCues:[],spatialRiftCasts:[],bossLaserCastsV31330:[],bossUltimateCastsV31334:[],dreamMirrorLasersV31347:[],rc88Encounter:{cosmicKills:[]},hapilSamongCosmicWaveV386:undefined,hapilFinalBattleV31300:{stage:7,secondPhaseActive:true,monochromeActiveV31377:true,completed:false,awakeningPendingRC108:true}};
api.tick(earlyKillState);earlyKillState.time=api.snapshot(earlyKillState).nextAt;api.tick(earlyKillState);
const first=earlyKillState.enemies.find(actor=>actor.id===ids[0]);earlyKillState.time=first.samongCosmicDispatchAtV386+.01;api.tick(earlyKillState);
assert.equal(first.samongCosmicPatternDispatchedV386,true);
earlyKillState.hostileProjectiles.push({sourceId:first.id,id:'early-kill-shot'});first.hp=0;
window.__HAPIL_DANMAKU_RPG_RC88__.beforeDeath(earlyKillState,first);api.tick(earlyKillState);
assert.equal(api.snapshot(earlyKillState).strikeIndex,1,'a native early kill advances the mobile sequence');
assert(!earlyKillState.hostileProjectiles.some(row=>row.sourceId===first.id),'native early kill clears the prior owner packets');
earlyKillState.time=api.snapshot(earlyKillState).nextAt;api.tick(earlyKillState);
assert.deepEqual(earlyKillState.enemies.filter(actor=>actor.samongCosmicSummonV386&&actor.hp>0).map(actor=>actor.id),ids.slice(1,2),'second body arrives after an unscripted native kill');
console.log('RC86 PASS: six simultaneous unique Kair bodies, delayed player crisis/awakening, native signatures, death cleanup, idempotence, Dream isolation.');
