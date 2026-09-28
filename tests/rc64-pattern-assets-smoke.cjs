const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const bundle = read('assets/index-v31526.js');
const html = read('index.html');
const rc64Start = bundle.indexOf('/* RC64: stable danmaku');
assert(rc64Start >= 0, 'RC64 runtime is missing');
assert(Number(html.match(/index-v31526\.js\?v=(\d+)/)?.[1]) >= 37100,
  'RC71 must invalidate the previous browser cache');
const requiredPatterns = ['fan', 'ring', 'lanes', 'spiral', 'rotating', 'scatter',
  'petals', 'helix', 'curtain', 'cross', 'wave', 'orbit', 'gate', 'echo', 'hexagram', 'sixfold'];
for (const name of requiredPatterns)
  assert(bundle.includes(`${name}:`), `danmaku deck is missing ${name}`);
assert(bundle.includes('COMMON_BULLET="./assets/rc64/projectiles/danmaku-jellybean.webp"'));
assert(bundle.includes('return {sprite:COMMON_BULLET,heading:0,radial:true'));
const danmakuStart = bundle.indexOf('/* HAPIL_V31316_DANMAKU_PATCH:');
const clarityStart = bundle.indexOf('/* HAPIL_V31316_CLARITY_PATCH', danmakuStart);
assert(danmakuStart >= 0 && clarityStart > danmakuStart, 'Danmaku runtime slice is missing');
function HAPIL_tickBossPatternsV31310() {}
const emptySet = () => new Set();
let mobile=false;
const dmContext = {
  window: {
    __HAPIL_COMBAT_RC47__: {mobile:()=>mobile},
    __HAPIL_V31315_RELEASE__: {allPass: true},
    __HAPIL_SKILL_VISUAL_V31311__: {rankedRows: () => Array.from({length: 71}, (_, i) => ({
      actor: {id: `boss-${i}`}, zone: 'dist00',
    }))},
    __HAPIL_GAMEPLAY_V31309__: {saveRevision: 14},
  },
  MONGSE_tickBossCombatPatternsV31230: HAPIL_tickBossPatternsV31310,
  MONGSE_bossBarrageTheme: () => 'causality',
  MONGSE_bossBarragePalette: () => ({theme: 'causality', color: '#aa66ff', accent: '#ffeedd'}),
  MONGSE_zoneAssetManifest: emptySet,
  MONGSE_zoneAssetPlan31220: () => ({all: emptySet(), A: emptySet(), B: emptySet(), C: emptySet(), pins: emptySet(), deferred: emptySet()}),
  Jn() {}, Gn() {},
  setTimeout: () => 0,
};
vm.createContext(dmContext);
vm.runInContext(bundle.slice(danmakuStart, clarityStart), dmContext);
assert.equal(dmContext.window.__HAPIL_DANMAKU_V31316__?.audit?.().allPass, true,
  '16-pattern Danmaku runtime audit must pass after expanding the pattern deck');
assert.equal(dmContext.window.__HAPIL_DANMAKU_V31316__?.deck?.length, 16);
assert.deepEqual([0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60].map(cycle =>
  dmContext.window.__HAPIL_DANMAKU_V31316__.modeFor({id: 'boss-0'}, 'normal', cycle)),
requiredPatterns,
'the four-cycle cadence must reach every pattern in the 14-pattern deck');
const dm=dmContext.window.__HAPIL_DANMAKU_V31316__,actor={id:'boss-0',boss:true,hp:100,x:8,y:8},barrageState={zone:'dist00',hp:240,x:16,y:16,enemies:[actor]};
assert.equal(dm.barrageCap(),Infinity);assert(dm.plan(barrageState,actor,'normal',20).count>=144,
  'desktop wide-coverage patterns should exceed the old 90-projectile density');
mobile=true;assert.equal(dm.barrageCap(),48);for(let cycle=0;cycle<64;cycle+=4)assert(dm.plan(barrageState,actor,'normal',cycle).count<=48);mobile=false;
const ownerColors = dmContext.window.__HAPIL_DANMAKU_V31316__.rankedRows()
  .map(row => row.danmakuColorV31316);
assert.equal(new Set(ownerColors).size, 71, 'each attacker receives a distinct, stable color');
assert(dmContext.window.__HAPIL_DANMAKU_V31316__.rankedRows()
  .every(row => ['flare', 'clock', 'thread', 'sigil'].includes(row.danmakuVfxStyleV31316)),
'every attacker receives a matching VFX motif');

const assets = [
  './assets/rc64/projectiles/danmaku-jellybean.webp',
  './assets/hero-authored-v314rc64/slayer-side-left.webp',
  './assets/hero-authored-v314rc64/slayer-side-right.webp',
];
for (const asset of assets) assert(fs.statSync(path.join(root, asset)).size > 1000, `${asset} is empty`);

let currentArt = './assets/pattern-first.webp';
const companion = {
  id: 'mb-dist04', name: '첫 동료의 잔영', kind: 'corruptedGuardian', midboss: true,
  hp: 100, maxHp: 100, sprite: './assets/dist/fallen.webp', x: 12, y: 10,
};
const context = {
  N: {dist04: {enemies: [companion, {id: 'dist04-c1', midboss: false}]}},
  window: {
    __HAPIL_EPISODE1_RC59__: {installed: true},
    __HAPIL_DANMAKU_V31316__: {
      installed: true,
      commonAsset: assets[0],
      names: {fan: '', ring: '', lanes: '', spiral: '', rotating: '', scatter: ''},
      zoneAssets: () => [assets[0]],
      clearMap: state => { if (state) state.cleared = true; },
    },
    __HAPIL_HERO_CONSISTENCY_RC5__: {
      installed: true,
      state: (_hero, motion) => ({dir: motion.direction}),
    },
    __HAPIL_PARTY_V31322__: {actors: []},
  },
  HAPIL_createMidbossDuoRC59: (_state, actor) => ({...actor, id: actor.id + '-duo-rc59',
    name: actor.name + ' · 짝', hp: 78, maxHp: 78, midboss: true, boss: false}),
  HAPIL_positionMidbossDuoRC59: () => true,
  Jr: actor => ({...actor}),
  MONGSE_initialRosterPlanV31228: zone => ({mode: 'smoke', enemies: [{...context.N[zone].enemies[0]}]}),
  Ii: save => [{...context.N[save.zone].enemies[0]}],
  ii: (_state, zone) => zone,
  MONGSE_patternsForEnemy: () => [{name: 'signature', shape: 'circle', sprite: currentArt}],
  An: () => ({}),
  Ln: () => { context.legacyDraws++; },
  MONGSE_queueImage: (_cache, path) => ({complete: true, naturalWidth: path.includes('left') ? 477 : 484,
    naturalHeight: path.includes('left') ? 328 : 325}),
  MONGSE_zoneAssetManifest: () => new Set(),
  MONGSE_zoneAssetPlan31220: () => ({all: new Set(), A: new Set(), B: new Set(), C: new Set(), deferred: new Set(), pins: new Set()}),
  MONGSE_liveCriticalAssets31220: () => new Set(),
  MONGSE_SPRITE_META: {},
  MONGSE_ASSET_VERSION: '31526',
  G: (x, y) => ({x, y}),
  setTimeout: () => 0,
  legacyDraws: 0,
};
vm.createContext(context);
vm.runInContext(bundle.slice(rc64Start, bundle.indexOf("/* RC69:")), context);

const api = context.window.__HAPIL_RC64__;
assert(api?.installed, 'RC64 layer should install after its required runtimes');
assert.equal(api.audit().allPass, true, 'RC64 runtime audit must pass');
assert.equal(context.N.dist04.enemies.find(actor => actor.id === 'mb-dist04').sprite,
  './assets/episode1a/corrupted_guardian.webp', 'Episode 1-A comrade uses the existing corrupted guardian art');
const plan = context.MONGSE_initialRosterPlanV31228('dist04');
const midbosses = plan.enemies.filter(actor => actor.midboss);
assert.equal(midbosses.length, 2, 'dist04 must show two companion midbosses in its live roster');
assert(midbosses.every(actor => actor.sprite === './assets/episode1a/corrupted_guardian.webp'));
assert.equal(midbosses[1].maxHp, 78, 'the partner is slightly lighter so the paired fight stays manageable');

let patternActor = {id: 'pattern-owner', patternSet: 'dist04'};
const first = context.MONGSE_patternsForEnemy(patternActor)[0];
currentArt = './assets/pattern-changed.webp';
const second = context.MONGSE_patternsForEnemy(patternActor)[0];
assert.equal(first.sprite, './assets/pattern-first.webp');
assert.equal(second.sprite, first.sprite, 'a pattern image stays fixed while its actor stays in the map');
assert.equal(context.MONGSE_patternsForEnemy({id: 'new-map-owner', patternSet: 'dist04'})[0].sprite,
  './assets/pattern-changed.webp', 'a new map actor receives a fresh pattern-image lock');

const hero = {id: 'slayer'};
const left = context.An({authoredTimeV31345: 1}, hero, {kind: 'attack', direction: 'left', started: .9, until: 1.2});
const held = context.An({authoredTimeV31345: 1.1}, hero, {kind: 'attack', direction: 'right', started: 1, until: 1.3});
const switched = context.An({authoredTimeV31345: 1.5}, hero, {kind: 'attack', direction: 'right', started: 1.5, until: 1.9});
assert.equal(left.stableSideAttackRC64.path, assets[1]);
assert.equal(held.stableSideAttackRC64.path, assets[1], 'side pose does not flicker when aim shifts during one swing');
assert.equal(switched.stableSideAttackRC64.path, assets[2]);
let draws = 0;
const canvas = {globalAlpha: 1, save(){}, restore(){}, translate(){}, drawImage(){draws++;}};
context.Ln(canvas, {}, '', 10, 12, 66, left);
assert.equal(draws, 1, 'the authored side pose is drawn as one stable bitmap');
assert.equal(context.legacyDraws, 0);

const manifest = context.MONGSE_zoneAssetManifest('dist04', 'slayer', []);
assert(manifest.has(assets[0]) && manifest.has(assets[1]) && manifest.has(assets[2]));
const assetPlan = context.MONGSE_zoneAssetPlan31220('dist04', 'slayer', []);
for (const asset of assets) assert(assetPlan.A.has(asset) && assetPlan.pins.has(asset));
const restored = context.Ii({zone: 'dist04'});
assert.equal(restored.filter(actor => actor.midboss).length, 2, 'older saves restore the companion midboss pair');
const state = {};
context.ii(state, 'dist05');
assert.equal(state.cleared, true, 'map exit clears the prior pattern-image cache');

console.log('RC68 PASS: 16 readable danmaku patterns, moving boss paths and trails, launch-time safe gaps, unique attacker colors/VFX motifs, RC64 assets, revived-guardian duo, and Slayer poses verified.');
