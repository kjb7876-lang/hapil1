const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const bundle = fs.readFileSync(path.join(__dirname, '../assets/index-v31526.js'), 'utf8');
const start = bundle.indexOf('/* HAPIL_V31316_DANMAKU_PATCH:');
const end = bundle.indexOf('/* HAPIL_V31316_CLARITY_PATCH', start);
assert(start >= 0 && end > start, 'the shipped Danmaku runtime is present');
assert(Number(fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8')
  .match(/index-v31526\.js\?v=(\d+)/)?.[1]) >= 37200, 'RC72 cache key is active');

const zones = {};
for (let i = 0; i < 24; i++) {
  const mob = {id: `arena-${String(i).padStart(2, '0')}-mob`, hp: 80, maxHp: 80,
    x: 7, y: 8, boss: false, midboss: false, name: '탄막 보병'};
  const boss = {id: `arena-${String(i).padStart(2, '0')}-boss`, hp: 150, maxHp: 150,
    x: 7, y: 8, boss: true, midboss: false, name: '맵 수호자'};
  zones[`arena-${String(i).padStart(2, '0')}`] = {
    order: i + 1, name: `전투 구역 ${i + 1}`, enemies: i % 4 === 0 ? [mob] : [boss, mob],
  };
}
zones.rest = {order: 90, enemies: []};

let mobile = false;
let nextId = 1;
const rankedRows = Array.from({length: 71}, (_, i) => ({
  actor: {id: `legacy-boss-${i}`, boss: true, hp: 100, x: 7, y: 8},
  zone: 'legacy-zone',
}));
function HAPIL_tickBossPatternsV31310() {}
function canvas() {
  return {globalAlpha: 1, draws: 0, save() {}, restore() {}, translate() {}, rotate() {},
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, arc() {}, ellipse() {},
    stroke() {}, fill() {}, setLineDash() {}, drawImage() {this.draws++;}};
}
const context = {
  N: zones,
  MONGSE_ASSET_VERSION: '31526',
  window: {
    __HAPIL_COMBAT_RC47__: {mobile: () => mobile},
    __HAPIL_V31315_RELEASE__: {allPass: true},
    __HAPIL_SKILL_VISUAL_V31311__: {rankedRows: () => rankedRows},
    __HAPIL_GAMEPLAY_V31309__: {saveRevision: 14},
  },
  MONGSE_tickBossCombatPatternsV31230: HAPIL_tickBossPatternsV31310,
  MONGSE_tickBossThemeOrdnance() {},
  MONGSE_bossBarrageTheme: () => 'causality',
  MONGSE_bossBarragePalette: () => ({theme: 'causality', color: '#aa66ff', accent: '#ffeedd'}),
  MONGSE_enemyActivePhase: () => 1,
  MONGSE_bossPatternBusyV31230: () => false,
  MONGSE_isEncounterLocked31226: () => false,
  MONGSE_lockAtomicBossCast31210: () => 'rc71-cast-' + nextId++,
  MONGSE_bossDirectorProfile31210: () => ({speedScale: 1, sizeScale: 1}),
  MONGSE_pushThemeProjectile3129(state, actor, options) {
    state.hostileProjectiles.push({id: nextId++, sourceId: actor.id, born: state.time, ...options});
  },
  MONGSE_compensateGlobalTimeStop31216() {},
  MONGSE_extendProjectileTimeline31214() {},
  MONGSE_enemyAttackSfx: () => 'boss-fire.wav',
  We() {},
  MONGSE_zoneAssetManifest: () => new Set(),
  MONGSE_zoneAssetPlan31220: () => ({all: new Set(), A: new Set(), B: new Set(), C: new Set(), pins: new Set(), deferred: new Set()}),
  MONGSE_queueImage: () => ({complete: true, naturalWidth: 64, naturalHeight: 64}),
  MONGSE_skillFxOpacity: () => 1,
  MONGSE_spawnBossCombatPatternV31230: () => null,
  Jn() {this.baseProjectileDraws = (this.baseProjectileDraws ?? 0) + 1;},
  Gn() {this.baseEffectDraws = (this.baseEffectDraws ?? 0) + 1;},
  G: (x, y) => ({x: x * 10, y: y * 10}),
  J: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  MONGSE_enemyTorsoOffset: () => ({y: -20}),
  setTimeout: () => 0,
};
vm.createContext(context);
vm.runInContext(bundle.slice(start, end), context);

const dm = context.window.__HAPIL_DANMAKU_V31316__;
assert(dm?.installed, 'danmaku runtime installs');
const audit = dm.audit();
assert(audit.allPass, JSON.stringify(audit));
const coverage = dm.mapCoverage();
assert.equal(coverage.combatMaps, 25, 'all 24 hostile maps plus the ranked legacy map are audited');
assert.equal(coverage.missingOwner.length, 0);
assert.equal(coverage.missingHost.length, 0, 'every signature has a live authored host or carrier');
assert.equal(coverage.signatureCount, coverage.combatMaps);
assert.equal(coverage.uniqueSignatures, true);
assert(coverage.uniquePatternPrefix, 'every map within the 64-spell catalog gets a different first card');
assert.equal(dm.deck.length, 64);
assert.equal(new Set(dm.mapSignatures().map(row => row.id)).size, 25);
assert(dm.mapSignatures().every(row => row.hostIds.length > 0), 'each map publishes its host IDs for runtime diagnostics');
assert(!dm.mapSignatures().some(row => row.zone === 'rest'), 'non-combat rest zones are excluded');
assert(dm.mapSignature('arena-00').mapCarrierV31371, 'a mob-only map receives an authored caster');
assert.equal(dm.barrageCap(), Infinity, 'PC admits bullets without a hard cap');

const carrier = zones['arena-00'].enemies[0];
const state = {zone: 'arena-00', time: 1, hp: 180, x: 16, y: 16,
  enemies: [{...carrier, id: carrier.id + '-trio-clone', templateId: carrier.id,
    combatOwnerIdRC69: carrier.id}], hostileProjectiles: [], pendingHits: [], impactQueue: [],
  bossLaserCastsV31330: [], effects: [], floatTexts: [], fxSerial: 1};
const first = dm.scheduleMapSignature(state);
assert(first?.projectiles > 0, 'the map-only spellcaster emits its signature through the normal hostile queue');
assert.equal(state.hostileProjectiles[0].danmakuModeV31316, dm.mapSignature(state.zone).mode);
assert(state.hostileProjectiles.every(q => q.danmakuMapSignatureV31371 === dm.mapSignature(state.zone).id));
assert.equal(dm.needsMapSignature(state), false, 'one successful cast fulfills the per-map guarantee');
const speedBands = state.hostileProjectiles.map(q => Number(q.danmakuSpeedV31316.toFixed(2)));
assert.equal(new Set(speedBands).size, 3,
  'each map volley interleaves slow, medium, and fast travel speeds');
assert(Math.abs(Math.min(...speedBands) - 1.15) < .01);
assert(Math.abs(Math.max(...speedBands) - 6.8) < .01);

state.time = 20;
dm.tick(state);
const shot = state.hostileProjectiles.find(q => q.bodySpawned31219);
assert(shot, 'released signature bullets enter the ordinary collision lifecycle');
const ctx = canvas();
assert.equal(dm.drawShot(ctx, {}, shot, state.time, {lowFx: true}), true);
assert.equal(ctx.draws, 1, 'authored jellybean bitmap draws for a clone/map carrier owner alias');

dm.clearMap(state);
assert.equal(dm.needsMapSignature(state), true, 'map image/pattern locks reset only on exit');
mobile = true;
assert.equal(dm.barrageCap(), 48, 'mobile keeps its safety admission budget');
const bossState = {zone: 'arena-01', time: 1, hp: 180, x: 16, y: 16, enemies: [{...zones['arena-01'].enemies[0]}]};
for (let i = 0; i < dm.deck.length; i++)
  assert(dm.plan(bossState, bossState.enemies[0], 'normal', i * 4).count <= 48,
    `mobile ${dm.deck[i]} cast remains under the per-cast budget`);
mobile = false;
const dense = dm.plan(bossState, bossState.enemies[0], 'normal', 20);
assert(dense.count >= 144, 'desktop broad patterns exceed the former density');

// The final wrappers are installed after later renderer replacements.
const rc71Start = bundle.indexOf('/* RC71: restore authored Danmaku');
assert(rc71Start > end, 'RC71 hooks are appended after the final legacy renderer');
const rc79Start = bundle.indexOf('/* RC79: final authoritative presentation and balance hooks. */', rc71Start);
assert(rc79Start > rc71Start, 'later presentation hooks follow the final RC71 bitmap dispatch');
vm.runInContext(bundle.slice(rc71Start, rc79Start), context);
assert.equal(context.window.__HAPIL_RC71__?.audit?.().allPass, true);
const nextState = {zone: 'arena-04', time: 1, hp: 180, x: 16, y: 16,
  enemies: [{...zones['arena-04'].enemies[0]}], hostileProjectiles: [], pendingHits: [],
  impactQueue: [], bossLaserCastsV31330: [], effects: [], floatTexts: [], fxSerial: 1};
context.MONGSE_tickBossThemeOrdnance(nextState);
assert(nextState.hostileProjectiles.length > 0, 'the final room tick schedules mob-only map signatures');
nextState.time = 20;
dm.tick(nextState);
const finalShot = nextState.hostileProjectiles.find(q => q.bodySpawned31219);
const finalCtx = canvas();
context.Jn(finalCtx, {}, finalShot, nextState.time, {lowFx: true});
assert.equal(finalCtx.draws, 1, 'RC71 final projectile dispatch preserves the danmaku bitmap renderer');
const cue = nextState.effects.find(effect => effect.danmakuCueV31316);
const cueCtx = canvas();
context.Gn(cueCtx, {}, cue, cue.born + .5, {lowFx: true});
assert(cueCtx.draws > 0, 'RC71 final effect dispatch preserves the authored warning and cue');
assert.equal(context.baseProjectileDraws ?? 0, 0, 'danmaku does not fall through to giant generic boss scaling');
assert.equal(context.baseEffectDraws ?? 0, 0, 'danmaku cue does not get overwritten by generic effect dispatch');

console.log('RC71 PASS: all hostile maps receive distinct signatures, mob-only maps schedule one, safe PC/mobile budgets, three speeds, and final bitmap/cue dispatch.');
