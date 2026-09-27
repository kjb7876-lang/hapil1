const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const bundle = fs.readFileSync(path.join(__dirname, '../assets/index-v31526.js'), 'utf8');
function section(from, to) {
  const start = bundle.indexOf(from), end = bundle.indexOf(to, start);
  assert.ok(start >= 0 && end > start, 'missing shipped section: ' + from);
  return bundle.slice(start, end);
}

const actor = {id: 'dist00-boss', x: 2, y: 8, hp: 80, maxHp: 100, boss: true};
const owners = [{actor, zone: 'dist00'}];
for (let i = 0; i < 70; i++) owners.push({
  actor: {id: 'test-boss-' + i, hp: 100, midboss: true}, zone: 'test-zone-' + i
});
const sound = [];
let native = 0;
const game = {
  window: {
    __HAPIL_V31315_RELEASE__: {allPass: true},
    __HAPIL_SKILL_VISUAL_V31311__: {rankedRows: () => owners},
    __HAPIL_GAMEPLAY_V31309__: {saveRevision: 14},
    __HAPIL_BOSS_V31315__: {
      profile: () => ({theme: 'blood'}),
      assets: {blood: './assets/test-blood.webp'}
    }
  },
  functionPlaceholder: undefined,
  MONGSE_zoneAssetManifest: () => new Set(),
  MONGSE_zoneAssetPlan31220: () => ({}),
  MONGSE_bossPatternBusyV31230: () => false,
  MONGSE_runtimeProjectileCapRC47: () => game.window.__HAPIL_COMBAT_RC47__?.projectileCap?.() ?? 72,
  MONGSE_isEncounterLocked31226: () => false,
  MONGSE_enemyActivePhase: () => 1,
  MONGSE_bossBarragePalette: () => ({color: '#cf5060', accent: '#fff3e5'}),
  MONGSE_bossDirectorProfile31210: () => ({speedScale: 1, sizeScale: 1}),
  MONGSE_lockAtomicBossCast31210: () => 'cast-44',
  MONGSE_pushThemeProjectile3129: (s, a, options) => s.hostileProjectiles.push({
    id: s.fxSerial++, sourceId: a.id, born: s.time, color: '#cf5060', ...options
  }),
  MONGSE_queueImage: () => ({complete: true, naturalWidth: 64, naturalHeight: 64}),
  MONGSE_skillFxOpacity: () => 1,
  MONGSE_compensateGlobalTimeStop31216: () => {},
  MONGSE_extendProjectileTimeline31214: () => {},
  MONGSE_enemyAttackSfx: () => 'boss-fire.wav',
  We: (file, gain) => sound.push([file, gain]),
  G: (x, y) => ({x: x * 10, y: y * 10}),
  MONGSE_enemyTorsoOffset: () => ({y: -20}),
  MONGSE_spawnBossCombatPatternV31230: (_s, _a, family) => {
    native++;
    return {family, projectiles: 1, lasers: 0};
  },
  MONGSE_tickBossCombatPatternsV31230: function HAPIL_tickBossPatternsV31310() {},
  Jn: () => {},
  Gn: () => {},
  setTimeout: () => {}
};
vm.runInNewContext(
  section('/* HAPIL_V31316_DANMAKU_PATCH', '/* HAPIL_V31316_CLARITY_PATCH') +
  section('/* v31365: deliberate family order', '/* v31365: boss pattern record room'),
  game
);
const danmaku = game.window.__HAPIL_DANMAKU_V31316__;
const grammar = game.window.__HAPIL_GRAMMAR_V31365__;
assert.equal(danmaku.audit().allPass, true);
assert.equal(grammar.installed, true);

function state(extra = {}) {
  const a = {...actor, recoverUntil: 0};
  return {zone: 'dist00', time: 10, x: 12, y: 8, hp: 100, enemies: [a],
    hostileProjectiles: [], pendingHits: [], impactQueue: [], effects: [],
    floatTexts: [], fxSerial: 1, ...extra};
}
const s = state(), boss = s.enemies[0], plan = danmaku.plan(s, boss, 'snipe-sword-wave');
assert.equal(plan.mode, 'fan');
assert.equal(plan.count, 18);
const selected = grammar.schedule(s, boss, 'snipe-sword-wave', 0);
assert.equal(selected.danmakuV31316, true);
assert.equal(selected.name, plan.name);
assert.equal(native, 0, 'one director slot must not also create a native attack');
assert.equal(s.hostileProjectiles.length, 18);
assert.equal(s.pendingHits.length, 0, 'the native projectile queue owns damage');
assert.equal(boss.shmupPatternPlanV31365.label, selected.name);
const last = Math.max(...s.hostileProjectiles.map(q => q.motionReleaseAt31219));
for (const q of s.hostileProjectiles) {
  const difference = Math.abs(Math.atan2(Math.sin(q.danmakuAngleV31316 - plan.aim),
    Math.cos(q.danmakuAngleV31316 - plan.aim)));
  assert.ok(difference >= plan.gap, 'every bullet leaves the aimed safe corridor open');
  assert.equal(q.bodySpawned31219, false);
  assert.ok(q.collisionDisabledUntil31219 >= q.motionReleaseAt31219);
}
assert.ok(boss.recoverUntil >= last + 10 / 3.6 + .85 - 1e-8);
assert.equal(danmaku.trySchedule(s, boss, 'snipe-sword-wave', 0), null,
  'a second barrage cannot overlap the active cast');

let mobileRC47 = false;
game.window.__HAPIL_COMBAT_RC47__ = {
  mobile: () => mobileRC47,
  projectileCap: () => mobileRC47 ? 72 : Infinity,
  barrageCap: () => mobileRC47 ? 48 : Infinity
};
const scattered = state(), scatteredBoss = scattered.enemies[0];
const scatteredPlan = danmaku.plan(scattered, scatteredBoss, 'snipe-sword-wave', 4);
assert.equal(scatteredPlan.mode, 'scatter');
assert.equal(scatteredPlan.count, 60, 'PC scatters more images than the old 48 shot gate');
const scatteredCast = danmaku.trySchedule(scattered, scatteredBoss, 'snipe-sword-wave', 4);
assert.equal(scatteredCast.projectiles, 60);
scatteredBoss.x = 4;
scattered.time += .1;
danmaku.tick(scattered);
assert(scattered.hostileProjectiles.every(q => q.x === 4 && q.previousX === 4),
  'pending volleys must depart from the moving boss');
assert(scatteredBoss.danmakuChoreoUntilV31316 > scattered.time);
mobileRC47 = true;
const compact = state();
assert.equal(danmaku.plan(compact, compact.enemies[0], 'snipe-sword-wave', 4).count, 36);
assert.equal(danmaku.trySchedule(compact, compact.enemies[0], 'snipe-sword-wave', 4).projectiles, 36);
mobileRC47 = false;

const first = Math.min(...s.hostileProjectiles.map(q => q.motionReleaseAt31219));
s.time = first - .01;
danmaku.tick(s);
assert.equal(sound.length, 0);
assert.ok(s.hostileProjectiles.every(q => !q.bodySpawned31219));
s.time = first + .01;
danmaku.tick(s);
assert.equal(sound.length, 1, 'one sound cue is emitted per volley, not per bullet');
assert.equal(s.hostileProjectiles.filter(q => q.bodySpawned31219).length, 6);

const calls = [];
const ctx = {
  globalAlpha: 1, save() {}, restore() {}, translate() {}, rotate() {},
  beginPath() {}, moveTo() {}, lineTo() {}, stroke() {calls.push('trail');},
  drawImage() {calls.push('bitmap');}, setLineDash() {}, arc() {calls.push('pulse');}
};
const shot = s.hostileProjectiles.find(q => q.bodySpawned31219);
assert.equal(danmaku.drawShot(ctx, {}, shot, s.time, {}), true);
assert.ok(calls.includes('trail') && calls.includes('bitmap'));
calls.length = 0;
danmaku.drawShot(ctx, {}, shot, s.time, {lowFx: true});
assert.deepEqual(calls, ['bitmap'], 'low FX draws the same bullet without extra strokes');
calls.length = 0;
danmaku.drawCue(ctx, {}, s.effects.find(e => e.danmakuCueV31316), first - .2, {});
assert.ok(calls.includes('pulse'));

const crowded = state({bossLaserCastsV31330: [{endAt: 20}]});
assert.equal(danmaku.trySchedule(crowded, crowded.enemies[0], 'snipe-sword-wave', 0), null);
assert.equal(crowded.hostileProjectiles.length, 0);

vm.runInNewContext(
  section('/* HAPIL_V31317_PATTERNS_PATCH', 'function owned(s,run)') +
  'globalThis.__RC44_SPECTACLE={plan,trySchedule,metrics};})();', game
);
const spectacle = game.__RC44_SPECTACLE;
game.window.__HAPIL_PATTERNS_V31317__ = spectacle;
const monolith = {id: 'h103-boss', x: 15, y: 16, hp: 100, maxHp: 100, boss: true};
const second = state({zone: 'hando03', enemies: [monolith]});
const special = grammar.schedule(second, monolith, 'rolling-ordnance', 1);
assert.equal(special.family, 'spectacle-monolith');
assert.equal(second.enemies[0].shmupPatternPlanV31365.label, special.name);
assert.equal(second.pendingHits.length, 4);
assert.ok(second.pendingHits.every(h => h.shape === 'circle' && h.spectacleV31317));
assert.ok(second.pendingHits.every(h => h.bossCastId31210 === 'cast-44'));
assert.ok(monolith.recoverUntil >= 10 + 2.84 + .85);
assert.equal(native, 0);

const beam = {id: 'u203-boss', x: 16, y: 16, hp: 100, maxHp: 100, boss: true};
const beamState = state({zone: 'u203', enemies: [beam]});
const sweep = grammar.schedule(beamState, beam, 'rotating-laser', 1);
assert.equal(sweep.family, 'spectacle-beam');
assert.equal(beamState.pendingHits.length, 1);
assert.equal(beamState.pendingHits[0].shape, 'line');
assert.ok(beamState.pendingHits[0].width > 10 && beamState.pendingHits[0].width < 12,
  'the full-length sweep reserves about a fifth of the axis outside its damage width');
assert.equal(beamState.hostileProjectiles.length, 0);

const third = state(), fallback = grammar.schedule(third, third.enemies[0], 'rotating-laser', 2);
assert.equal(fallback.family, 'rotating-laser');
assert.equal(native, 1, 'failed admission falls back to the existing native attack');

// The production Jn path is the owned ordnance renderer. Exercise its real
// repair, bitmap selection and draw code, including the RC43 selected sprite.
const bloodied = './assets/generated-v31342-rc39/kitchen_knife_projectile_bloodied.webp';
const defaultArt = './assets/test-blood.webp';
const renderOwner = {id: actor.id, assets: [defaultArt, bloodied], routes: {
  'rolling-ordnance': {projectile: defaultArt, telegraph: defaultArt, impact: defaultArt}
}};
const render = {
  window: {},
  owner: e => e?.sourceId === actor.id ? renderOwner : null,
  special: () => false,
  clean: p => p,
  queueBase: (_cache, p) => ({complete: true, naturalWidth: 64, naturalHeight: 64, src: p}),
  metrics: {pending: 0, repairs: 0},
  num: (n, fallback = 0) => Number.isFinite(Number(n)) ? Number(n) : fallback,
  clamp: (n, min, max) => Math.max(min, Math.min(max, n)),
  G: (x, y) => ({x: x * 10, y: y * 10}),
  radial: () => false,
  heading: () => 0,
  MONGSE_skillFxOpacity: () => 1
};
vm.runInNewContext(
  section('function candidates(row,e,purpose,requested)', 'function withOwner(e,purpose,callback)') +
  section('function bullet(ctx,cache,e,time,settings={})', 'function syncFlights(s)'), render
);
const visible = {...shot, sprite: bloodied, fallbackSprite: bloodied};
assert.equal(render.repair(visible).sprite, bloodied, 'owner repair retains a valid RC43 art path');
calls.length = 0;
const paint = {...ctx, drawImage(img) {calls.push(img.src);}};
assert.equal(render.bullet(paint, {}, visible, s.time, {}), true);
assert.deepEqual(calls, ['trail', bloodied], 'the active renderer draws the RC43 art and its trail');
assert.equal(visible.ordnanceBitmapPathV31322, bloodied);
calls.length = 0;
render.bullet(paint, {}, visible, s.time, {lowFx: true});
assert.deepEqual(calls, [bloodied], 'mobile low FX keeps weapon art without extra strokes');
calls.length = 0;
render.bullet(paint, {}, {...visible, bodySpawned31219: false}, s.time, {});
assert.deepEqual(calls, [], 'the bitmap stays hidden before its scheduled launch');

console.log('RC44: authored patterns, safe lane, timing, recovery, audio, production bitmap/RC43 art, low FX and fallback OK');
