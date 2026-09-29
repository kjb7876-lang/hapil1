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
  MONGSE_isEncounterLocked31226: s => !!s.dialogueLocked,
  MONGSE_enemyActivePhase: () => 1,
  MONGSE_bossBarrageTheme: () => 'sevenSins',
  MONGSE_bossBarragePalette: () => ({color: '#cf5060', accent: '#fff3e5'}),
  ft: (_zone, boss, delta) => ({x: boss.x + delta.x, y: boss.y + delta.y}),
  J: (a, b) => Math.hypot(b.x - a.x, b.y - a.y),
  MONGSE_bossDirectorProfile31210: () => ({speedScale: 1, sizeScale: 1}),
  MONGSE_lockAtomicBossCast31210: () => 'cast-44',
  MONGSE_pushThemeProjectile3129: (s, a, options) => s.hostileProjectiles.push({
    id: s.fxSerial++, sourceId: a.id, born: s.time, color: '#cf5060', ...options
  }),
  MONGSE_queueImage: () => ({complete: true, naturalWidth: 64, naturalHeight: 64}),
  MONGSE_skillFxOpacity: () => 1,
  MONGSE_compensateGlobalTimeStop31216: (s, q) => {
    const now = Number(s.time ?? 0), until = Number(s.timeStopUntil ?? 0);
    const previous = Number(q.globalTimeStopCompensatedUntil31216 ?? now);
    const shift = Math.max(0, until - Math.max(now, previous));
    if (!shift) return 0;
    for (const key of ['expiresAt', 'telegraphUntil31210', 'bossCastResolveAt31210',
      'interruptProtectedUntil31210', 'motionReleaseAt31219', 'collisionDisabledUntil31219',
      'collisionDisabledUntilV31226', 'frozenUntil'])
      if (Number.isFinite(Number(q[key]))) q[key] = Number(q[key]) + shift;
    q.globalTimeStopCompensatedUntil31216 = until;
    return shift;
  },
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
vm.runInNewContext(
  section('function MONGSE_planBossMovementSmartR1(', 'function MONGSE_wrapAngleSmartR1(') +
  'globalThis.__planDanmakuBossMove = MONGSE_planBossMovementSmartR1;', game
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
assert.equal(danmaku.deck.length, 64);
assert(danmaku.rankedRows().every(row => /^hsl\([\d.]+ 96% 62%\)$/.test(row.danmakuColorV31316)), 'assign a vivid owner color instead of reusing the shared boss palette');
const pathState = {zone: 'dist00', x: 12, y: 8, time: .5};
const pathBoss = {x: 2, y: 8, danmakuChoreoStartedV31316: 0, danmakuChoreoUntilV31316: 2,
  danmakuChoreoSideV31316: 0, danmakuChoreoModeV31316: 'gate'};
const sweepMove = game.__planDanmakuBossMove(pathState, pathBoss, {}, 1, 1, false, 10);
pathBoss.danmakuChoreoModeV31316 = 'orbit';
const orbitMove = game.__planDanmakuBossMove(pathState, pathBoss, {}, 1, 1, false, 10);
assert(sweepMove && orbitMove && Math.hypot(sweepMove.x - orbitMove.x, sweepMove.y - orbitMove.y) > 1,
  'lane-sweep and orbit attacks drive visibly different boss trajectories');
for (let i = 0; i < danmaku.deck.length; i++) {
  const varied = danmaku.plan(s, boss, 'snipe-sword-wave', i * 4);
  assert.equal(varied.patternId, danmaku.deck[i]);
  for (const beat of varied.beats) for (const angle of beat.angles) {
    const offset = Math.abs(Math.atan2(Math.sin(angle - varied.aim), Math.cos(angle - varied.aim)));
    assert(offset >= varied.gap, `${varied.mode} keeps its declared safe corridor`);
  }
}
const selected = grammar.schedule(s, boss, 'snipe-sword-wave', 0);
assert.equal(selected.danmakuV31316, true);
assert.equal(selected.name, plan.name);
assert.equal(native, 0, 'one director slot must not also create a native attack');
assert.equal(s.hostileProjectiles.length, 18);
assert(s.hostileProjectiles.every(q => q.danmakuColorV31316 === plan.color && q.danmakuAccentV31316 === plan.accent),
  'the attacker signature color is carried by each common jellybean bullet');
assert.equal(boss.danmakuChoreoModeV31316, plan.mode);
assert.equal(boss.danmakuChoreoStartedV31316, s.time + .3,
  'the boss starts moving after the pattern telegraph begins');
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
const scatteredPlan = danmaku.plan(scattered, scatteredBoss, 'rotating-laser', 16);
assert.equal(scatteredPlan.mode, 'scatter');
assert(scatteredPlan.count >= 144, 'PC scatters more images than the old 48 shot gate');
const mapFirstPlan = danmaku.plan(scattered, scatteredBoss, 'rotating-laser', 16,
  danmaku.mapSignature(scattered.zone).mode);
const scatteredCast = danmaku.trySchedule(scattered, scatteredBoss, 'rotating-laser', 16);
assert.equal(scatteredCast.projectiles, mapFirstPlan.count,
  'a fresh map opens with its own authored signature before the rotating deck resumes');
scatteredBoss.x = 4;
scattered.time += .1;
danmaku.tick(scattered);
assert(scattered.hostileProjectiles.every(q => q.x === 4 && q.previousX === 4),
  'pending volleys must depart from the moving boss');
assert(scatteredBoss.danmakuChoreoUntilV31316 > scattered.time);
scattered.time = 10.35;
danmaku.tick(scattered);
scattered.time = 10.4;
scatteredBoss.x = 4.4;
danmaku.tick(scattered);
assert(scattered.effects.find(e => e.danmakuCueV31316).movementTrailV31316.length >= 2,
  'the tell captures the boss path after its movement phase begins');
mobileRC47 = true;
const compact = state();
assert.equal(danmaku.plan(compact, compact.enemies[0], 'rotating-laser', 16).count, 36);
assert.equal(danmaku.trySchedule(compact, compact.enemies[0], 'rotating-laser', 16).projectiles,
  danmaku.plan(compact, compact.enemies[0], 'rotating-laser', 16, danmaku.mapSignature(compact.zone).patternId).count);
for (let i = 0; i < danmaku.deck.length; i++) {
  const mobilePlan = danmaku.plan(compact, compact.enemies[0], 'snipe-sword-wave', i * 4);
  assert(mobilePlan.count <= 48, `${mobilePlan.mode} remains below the mobile admission cap`);
  for (const beat of mobilePlan.beats) for (const angle of beat.angles) {
    const offset = Math.abs(Math.atan2(Math.sin(angle - mobilePlan.aim), Math.cos(angle - mobilePlan.aim)));
    assert(offset >= mobilePlan.gap, `mobile ${mobilePlan.mode} retains its safe corridor`);
  }
}
mobileRC47 = false;

const stopped = state(), stoppedBoss = stopped.enemies[0];
danmaku.trySchedule(stopped, stoppedBoss, 'snipe-sword-wave', 0);
const stoppedCue = stopped.effects.find(e => e.danmakuCueV31316);
stoppedCue.movementTrailV31316.push({x: stoppedBoss.x, y: stoppedBoss.y, at: 10.31});
const stoppedFirst = Math.min(...stopped.hostileProjectiles.map(q => q.motionReleaseAt31219));
stopped.time = 10.4;
stopped.timeStopUntil = 11.3;
danmaku.tick(stopped);
assert.equal(stoppedCue.danmakuPausedV31316, true);
assert(Math.abs(stoppedBoss.danmakuChoreoStartedV31316 - 11.2) < 1e-9,
  'time stop shifts the boss choreography by the unelapsed stopped interval');
assert(Math.abs(stoppedCue.movementTrailV31316[0].at - 11.21) < 1e-9,
  'the movement echo pauses on the same timeline as the boss');
assert(stopped.hostileProjectiles.every(q => !q.bodySpawned31219 && q.motionReleaseAt31219 >= stoppedFirst + .9),
  'time stop keeps unreleased bullets hidden and delays their collision window');
stopped.time = 11.35;
stopped.timeStopUntil = 0;
danmaku.tick(stopped);
assert.equal(stoppedCue.danmakuPausedV31316, false);
assert(stopped.hostileProjectiles.every(q => !q.bodySpawned31219),
  'the resumed pattern does not release bullets before their shifted beat');
stopped.time = stoppedFirst + .91;
danmaku.tick(stopped);
assert.equal(stopped.hostileProjectiles.filter(q => q.bodySpawned31219).length, 6,
  'the first volley releases once after the shifted time-stop deadline');

const dialogue = state(), dialogueBoss = dialogue.enemies[0];
danmaku.trySchedule(dialogue, dialogueBoss, 'snipe-sword-wave', 0);
const dialogueCue = dialogue.effects.find(e => e.danmakuCueV31316);
const dialogueFirst = Math.min(...dialogue.hostileProjectiles.map(q => q.motionReleaseAt31219));
dialogue.dialogueLocked = true;
dialogue.time = 11.4;
danmaku.tick(dialogue);
assert.equal(dialogueCue.danmakuPausedV31316, true);
assert(Math.abs(dialogueBoss.danmakuChoreoStartedV31316 - 11.7) < 1e-9,
  'dialogue lock extends the movement tell and volley schedule together');
assert(dialogue.hostileProjectiles.every(q => !q.bodySpawned31219 && q.motionReleaseAt31219 >= dialogueFirst + 1.4),
  'dialogue lock does not let a scheduled volley leak into the pause');
dialogue.dialogueLocked = false;
dialogue.time = 11.5;
danmaku.tick(dialogue);
assert.equal(dialogueCue.danmakuPausedV31316, false);
assert(dialogue.hostileProjectiles.every(q => !q.bodySpawned31219),
  'dialogue resume waits for the shifted beat instead of firing immediately');
dialogue.time = dialogueFirst + 1.41;
danmaku.tick(dialogue);
assert.equal(dialogue.hostileProjectiles.filter(q => q.bodySpawned31219).length, 6,
  'dialogue resume releases the first volley once at its extended deadline');

const first = Math.min(...s.hostileProjectiles.map(q => q.motionReleaseAt31219));
sound.length = 0;
boss.x = 12.8; boss.y = 8.5; s.x = 14; s.y = 10;
s.time = first - .01;
danmaku.tick(s);
assert.equal(sound.length, 0);
assert.ok(s.hostileProjectiles.every(q => !q.bodySpawned31219));
s.time = first + .01;
danmaku.tick(s);
assert.equal(sound.length, 1, 'one sound cue is emitted per volley, not per bullet');
assert.equal(s.hostileProjectiles.filter(q => q.bodySpawned31219).length, 6);
const releaseAim = Math.atan2(s.y - boss.y, s.x - boss.x);
const releaseDistance = Math.hypot(s.x - boss.x, s.y - boss.y);
const releaseGap = Math.max(.32, Math.asin(Math.min(.98, 1.22 / releaseDistance)) + .08);
for (const q of s.hostileProjectiles.filter(q => q.bodySpawned31219)) {
  const offset = Math.abs(Math.atan2(Math.sin(q.danmakuAngleV31316 - releaseAim), Math.cos(q.danmakuAngleV31316 - releaseAim)));
  assert.equal(q.danmakuGapV31316, releaseGap,
    'moving-origin volley recomputes a distance-scaled safe gap at release');
  assert(offset >= releaseGap, 'the moving-origin volley keeps the recalculated safe gap');
  assert.equal(q.x, boss.x);
  assert.equal(q.y, boss.y);
}

const calls = [];
const ctx = {
  globalAlpha: 1, save() {}, restore() {}, translate() {}, rotate() {},
  beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, ellipse() {},
  stroke() {calls.push('stroke');}, fill() {calls.push('glow');},
  drawImage() {calls.push('bitmap');}, setLineDash() {}, arc() {calls.push('pulse');}
};
const shot = s.hostileProjectiles.find(q => q.bodySpawned31219);
assert.equal(danmaku.drawShot(ctx, {}, shot, s.time, {}), true);
assert.ok(calls.includes('bitmap') && calls.includes('glow') && calls.includes('stroke'),
  'the shared round jellybean gains the firing enemy color glow and signature motif');
calls.length = 0;
danmaku.drawShot(ctx, {}, shot, s.time, {lowFx: true});
assert.deepEqual(calls, ['bitmap'], 'low FX suppresses cosmetic glow without changing the hit sprite');
calls.length = 0;
danmaku.drawCue(ctx, {}, s.effects.find(e => e.danmakuCueV31316), first - .2, {});
assert.ok(calls.includes('pulse'));
const movementCue = s.effects.find(e => e.danmakuCueV31316);
movementCue.movementTrailV31316 = [{x: 2, y: 8, at: first - .2}, {x: 3, y: 8.2, at: first - .1}];
calls.length = 0;
danmaku.drawCue(ctx, {}, movementCue, first - .05, {});
assert(calls.filter(call => call === 'pulse').length >= 3,
  'boss movement reads as a short color-matched wake during the danmaku tell');
calls.length = 0;
danmaku.drawCue(ctx, {}, movementCue, first - .05, {lowFx: true});
assert.equal(calls.filter(call => call === 'pulse').length, 0,
  'low FX removes the movement wake without affecting projectile collision');

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
const paint = {...ctx, stroke() {calls.push('trail');}, drawImage(img) {calls.push(img.src);}};
assert.equal(render.bullet(paint, {}, visible, s.time, {}), true);
assert.deepEqual(calls, ['trail', bloodied], 'the active renderer draws the RC43 art and its trail');
assert.equal(visible.ordnanceBitmapPathV31322, bloodied);
calls.length = 0;
render.bullet(paint, {}, visible, s.time, {lowFx: true});
assert.deepEqual(calls, [bloodied], 'mobile low FX keeps weapon art without extra strokes');
calls.length = 0;
render.bullet(paint, {}, {...visible, bodySpawned31219: false}, s.time, {});
assert.deepEqual(calls, [], 'the bitmap stays hidden before its scheduled launch');

console.log('RC44: movement choreography, 64 spell cards, safe lanes, time-stop/dialogue timing, recovery, audio, and bitmap fallback OK');
