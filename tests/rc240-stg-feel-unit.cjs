'use strict';
// RC240 STG feel: charge shot tiers and strike rows, eligibility gates, damage
// share, spirit coins (sources, caps, homing), chain/multiplier, beam cuts,
// EGO wipe, boss warning/tally, resets, qa inertness and draw discipline.
// Loads danmaku-layer.js then stg-feel.js into one vm with stubbed globals.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const layerFile = path.join(__dirname, '..', 'assets', 'rc240', 'danmaku-layer.js');
const feelFile = path.join(__dirname, '..', 'assets', 'rc240', 'stg-feel.js');
const layerSrc = fs.readFileSync(layerFile, 'utf8'), feelSrc = fs.readFileSync(feelFile, 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } }

function stubCtx(counter) {
  const c = {
    canvas: { width: 1280, height: 720, getBoundingClientRect: () => ({ width: 1280, height: 720 }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineCap: 'butt', shadowBlur: 0,
    createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage() { counter.drawImage++; },
  };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'closePath', 'fillRect', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'rect', 'clip'])
    c[k] = function () { counter[k] = (counter[k] || 0) + 1; };
  return c;
}
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
function makeEnv(search = '?rc240=1', opts = {}) {
  const timers = [], sounds = [], held = { a: false }, counter = { drawImage: 0 };
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, WeakSet, Float32Array, Int32Array, Uint8Array, Uint16Array,
    location: { search }, innerWidth: opts.innerWidth ?? 1280,
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0,
    performance: { now: () => 0 },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx({ drawImage: 0 }) }), querySelector: () => null },
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb);
  const settings = { sound: true, sfxVolume: 1, ...(opts.settings || {}) };
  sb.__HAPIL_RC86_BRIDGE__ = { project };
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() {}, draw() {}, danger() { return 0; } };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ installed: true, mode: s => s?.gameModeV31346 ?? 'STORY', draw() {} });
  const loop = { installed: true, background() {}, imminent: () => null };
  sb.__HAPIL_LOOP_V31365__ = Object.freeze(loop);
  sb.__HAPIL_COMBAT_V31333__ = { core: s => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; } };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount) { s.hp -= amount; return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0 && !s.paused, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: s => s.phaseStub ?? null };
  sb.__HAPIL_CHANNEL_V31364__ = { active: s => !!s.dHeld, blockDamage: () => true };
  const binding = { settings: { current: settings }, state: { current: null }, input: { current: new Set() }, actions: { sound: (p, g, c) => sounds.push({ p, g, c }) } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => (opts.full ? 'full' : 'manual'), hasHeldLogical: k => k === 'KeyA' && held.a };
  vm.runInContext(layerSrc, sb, { filename: layerFile });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  vm.runInContext(feelSrc, sb, { filename: feelFile });
  return { sb, timers, sounds, held, binding, settings, counter, rc: sb.__HAPIL_DANMAKU_RC240__, feel: sb.__HAPIL_STG_FEEL_RC240__ };
}
function world(extra = {}) {
  return { zone: 'z1', time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], pendingStrikes: [], activeHeroId: 'gunner', awakeningUntil: 0, ...extra };
}
const boss = (id = 'b1') => ({ id, boss: true, hp: 1e6, maxHp: 1e6, x: 27.4, y: 11.5, name: '시험 거체' });
const phase = (o = {}) => ({ ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 2, remaining: 10, duration: 12, ...o });
function tick(env, s, dt = 1 / 60) { s.time += dt; env.sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
// Native-like A stream: one row per period; resolved rows are removed and summed.
function makeNative(s, power = 10, period = .25) {
  const st = { next: s.time, a: 0, tame: 0 };
  st.step = () => {
    if (s.time >= st.next) { st.next += period; s.pendingStrikes.push({ id: s.fxSerial++, at: s.time + .1, actionKey: 'A', heroId: 'gunner', power, targetId: 'b1' }); }
    const keep = [];
    for (const r of s.pendingStrikes) { if (r.at <= s.time) { if (r.actionKey === 'A') st.a += r.power; else if (r.actionKey === 'RC240_TAME') st.tame += r.power; } else keep.push(r); }
    s.pendingStrikes = keep;
  };
  return st;
}
function arena(opts = {}) {
  const env = makeEnv(opts.search ?? '?rc240=1', opts);
  const s = world({ enemies: [boss()], phaseStub: phase(), targetEnemyId: 'b1', ...(opts.world || {}) });
  env.binding.state.current = s;
  return { env, s };
}
function run(env, s, sec, native, dt = 1 / 60) { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) { tick(env, s, dt); native?.step(); } }
// Stationary bullet at (x,y); every SoA field is reset so stale slots never move it.
function put(P, x, y, type = 0) {
  const i = P.live++;
  for (const k of ['ang', 'spd', 'acc', 'om', 'amp', 'aPh', 'gvx', 'gvy', 'gy', 'stKind', 'stAt', 'stA', 'stB', 'stC', 'stD', 'stE', 'flags', 'bounce', 'vx', 'vy', 'dir']) P[k][i] = 0;
  P.x[i] = x; P.y[i] = y; P.px[i] = x; P.py[i] = y; P.ox[i] = x; P.oy[i] = y; P.age[i] = 1; P.life[i] = 60; P.vmin[i] = -1e4; P.vmax[i] = 1e4; P.aT[i] = 1; P.type[i] = type; P.hue[i] = 4;
  return i;
}
const tameRows = s => s.pendingStrikes.filter(r => r.actionKey === 'RC240_TAME');
// Hold A for exactly `hold` seconds of sim time, then release.
function charge(env, s, hold) { env.held.a = true; tick(env, s, .001); tick(env, s, hold); env.held.a = false; tick(env, s, 0.0001); }

test('both scripts install; feel exposes hooks and RC240 exposes cutSegment/cancelAll', () => {
  const { env } = arena();
  assert.ok(env.rc.installed);
  for (const k of ['tick', 'draw', 'drawScreen', 'drawBackground', 'onCancel', 'onGraze', 'onSpellEnd', 'onHit', 'onOwner', 'reset']) assert.strictEqual(typeof env.feel[k], 'function', k);
  assert.strictEqual(typeof env.rc.cutSegment, 'function'); assert.strictEqual(typeof env.rc.cancelAll, 'function');
});

test('charge tiers: .69 s nothing, .70 s T1, 1.50 s T2; rows are well formed', () => {
  const { env, s } = arena(); const nat = makeNative(s);
  run(env, s, 8, nat);
  charge(env, s, .69); assert.strictEqual(tameRows(s).length, 0, 'no strike below T1');
  charge(env, s, .7 + 1e-6); const t1 = tameRows(s); assert.strictEqual(t1.length, 1, 'T1 fires');
  for (const r of t1) {
    assert.ok(Number.isFinite(r.at) && Number.isFinite(r.power) && r.power > 0); assert.strictEqual(typeof r.targetId, 'string'); assert.strictEqual(r.targetId, 'b1');
    assert.strictEqual(r.actionKey, 'RC240_TAME'); assert.strictEqual(r.rc226LaunchSound, true); assert.strictEqual(r.rc240TameTier, 1); assert.ok(!('committedRouteV31333' in r));
  }
  assert.ok(Math.abs(t1[0].power - 16) < 1e-6, 'T1 = 1.6 x base: ' + t1[0].power);
  run(env, s, 2.1, nat);
  charge(env, s, 1.5); const t2 = tameRows(s).filter(r => r.rc240TameTier === 2); assert.strictEqual(t2.length, 1, 'T2 fires');
  assert.strictEqual(t2[0].critical, true); assert.ok(Math.abs(t2[0].power - 30) < 1e-6, 'T2 = 3 x base');
  assert.ok(env.sounds.some(x => /arcane/.test(x.p)) && env.sounds.some(x => /laser/.test(x.p)) && env.sounds.some(x => /shot/.test(x.p)));
});

test('no strike while awake, D, guest, cooling down, without A history, or with a full queue', () => {
  const cases = {
    awake: (env, s) => { s.awakeningUntil = s.time + 30; },
    d: (env, s) => { s.dHeld = true; },
    guest: (env, s) => { env.sb.__HAPIL_PARTY_V31322__ = { state: s, status: { role: 'guest' } }; },
    full: (env, s) => { for (let i = 0; i < 96; i++) s.pendingStrikes.push({ id: 'x' + i, at: s.time + 99, actionKey: 'Q', heroId: 'gunner', power: 1 }); },
  };
  for (const [k, setup] of Object.entries(cases)) {
    const { env, s } = arena(); const nat = makeNative(s); run(env, s, 6, nat); setup(env, s);
    charge(env, s, 1.6); assert.strictEqual(tameRows(s).length, 0, k);
  }
  { const { env, s } = arena(); run(env, s, 6); charge(env, s, 1.6); assert.strictEqual(tameRows(s).length, 0, 'no A seen → visual only'); assert.ok(env.feel.state(s).beams >= 0); }
  { const { env, s } = arena(); const nat = makeNative(s); run(env, s, 8, nat); charge(env, s, .8); assert.strictEqual(tameRows(s).length, 1);
    charge(env, s, 1.6); assert.strictEqual(tameRows(s).length, 1, 'cooldown blocks'); }
});

test('60 s sim: TAME damage <= 25% of A (manual) and <= 12% (full-auto)', () => {
  { const { env, s } = arena(); const nat = makeNative(s, 10, .25);
    for (let k = 0; k < 24; k++) { env.held.a = true; run(env, s, 1.6, nat); env.held.a = false; run(env, s, .9, nat); }
    assert.ok(nat.tame > 0, 'some tame damage'); assert.ok(nat.tame <= .25 * nat.a, 'manual share ' + (nat.tame / nat.a).toFixed(3)); }
  { const { env, s } = arena({ full: true }); const nat = makeNative(s, 10, .25); run(env, s, 60, nat);
    assert.ok(env.rc.metrics().live >= 0); assert.ok(nat.tame <= .12 * nat.a, 'auto share ' + (nat.tame / nat.a).toFixed(3)); }
});

test('hit cancel yields 0 coins; capture <= 48 coins; coins resolve within 4 s', () => {
  { const { env, s } = arena(); run(env, s, 3); const m = env.rc.world(s); const before = env.feel.metrics().coinsSpawned;
    const P = m.pool; const i = P.live++; P.x[i] = m.hx + 1; P.y[i] = m.hy; P.px[i] = m.hx + 1; P.py[i] = m.hy; P.vx[i] = 0; P.vy[i] = 0; P.age[i] = 1; P.life[i] = 30; P.type[i] = 0; P.spd[i] = 0; P.vmin[i] = -1e4; P.vmax[i] = 1e4; P.aT[i] = 1;
    tick(env, s); assert.ok(env.rc.metrics().hits >= 1, 'hit registered'); assert.strictEqual(env.feel.metrics().coinsSpawned, before, 'no coins on hit'); }
  { const { env, s } = arena(); run(env, s, 3); const m = env.rc.world(s); const P = m.pool;
    while (P.live < 300) { const i = P.live++; P.x[i] = 300 + (i % 30) * 10; P.y[i] = 400 + Math.floor(i / 30) * 5; P.px[i] = P.x[i]; P.py[i] = P.y[i]; P.vx[i] = 0; P.vy[i] = 0; P.age[i] = 1; P.life[i] = 60; P.type[i] = 0; P.spd[i] = 0; P.vmin[i] = -1e4; P.vmax[i] = 1e4; P.aT[i] = 1; P.ang[i] = 0; }
    const c0 = env.feel.metrics().coinsSpawned; s.phaseStub = phase({ stage: 'rest' }); tick(env, s);
    const got = env.feel.metrics().coinsSpawned - c0; assert.ok(got > 0 && got <= 48, 'capture coins ' + got);
    run(env, s, 4.05); assert.strictEqual(env.feel.state(s).coins, 0, 'all coins resolved'); assert.ok(env.feel.state(s).score > 0); }
});

test('coin pool caps: 256 PC / 96 mobile / 64 lowFx', () => {
  for (const [opts, cap] of [[{}, 256], [{ innerWidth: 600 }, 96], [{ settings: { lowFx: true } }, 64]]) {
    const { env, s } = arena(opts); run(env, s, 1); const m = env.rc.world(s);
    for (let k = 0; k < 2000; k++) { s.time += 1e-4; env.feel.onCancel(s, m, 400, 400, 0, 1, 'owner'); }
    tick(env, s, 1e-4); assert.ok(env.feel.state(s).coins <= cap, 'cap ' + cap + ' got ' + env.feel.state(s).coins);
    for (let k = 0; k < 2000; k++) { s.time += 1e-4; env.feel.onCancel(s, m, 400, 400, 0, 1, 'owner'); }
    assert.ok(env.feel.state(s).coins <= cap);
  }
});

test('chain grows with grazes, multiplier caps at x4, a hit resets the chain', () => {
  const { env, s } = arena(); run(env, s, 1);
  for (let k = 0; k < 400; k++) { s.time += .01; env.feel.onGraze(s, 0, 0); }
  const st = env.feel.state(s); assert.strictEqual(st.mult, 4); assert.ok(st.chain >= 400);
  env.feel.onHit(s); assert.strictEqual(env.feel.state(s).chain, 0); assert.strictEqual(env.feel.state(s).mult, 1); assert.ok(env.feel.state(s).maxChain >= 400);
  s.time += .01; env.feel.onGraze(s, 0, 0); s.time += 2; tick(env, s); assert.strictEqual(env.feel.state(s).chain, 0, 'lapse resets');
});

test('beam never cancels BIG and cuts at most 24 bullets per beam', () => {
  const { env, s } = arena(); const nat = makeNative(s); run(env, s, 8, nat);
  const m = env.rc.world(s); const P = m.pool; P.live = 0;
  const mz = m.lastMuzzle; let big = 0; const bigs = [];
  for (let k = 0; k < 80; k++) { const u = .12 + .85 * k / 80, isBig = k % 8 === 0, i = put(P, m.hx + (mz.x - m.hx) * u, m.hy + (mz.y - m.hy) * u, isBig ? 2 : 0); if (isBig) { big++; bigs.push(P.x[i] + ',' + P.y[i]); } }
  const live0 = P.live; charge(env, s, 1.6); run(env, s, .5);
  let bigLeft = 0; for (let i = 0; i < P.live; i++) if (P.type[i] === 2 && bigs.includes(P.x[i] + ',' + P.y[i])) bigLeft++;
  assert.strictEqual(bigLeft, big, 'BIG untouched'); const cut = env.feel.metrics().beamCuts; assert.ok(cut > 0 && cut <= 24, 'cuts ' + cut);
});

test('EGO wipe on rising edge cancels into coins and guards spawns near the heart', () => {
  const { env, s } = arena(); run(env, s, 5); const m = env.rc.world(s); assert.ok(m.pool.live > 0);
  const c0 = env.feel.metrics().coinsSpawned; s.awakeningUntil = s.time + 10; tick(env, s);
  assert.ok(env.feel.metrics().wipes === 1); assert.ok(env.feel.metrics().coinsSpawned - c0 <= 40); assert.ok(m.spawnGuardUntil > s.time);
  run(env, s, 1); assert.strictEqual(env.feel.metrics().wipes, 1, 'only on the rising edge');
});

test('warning once per zone|boss and holds the first spell; tally once per boss death', () => {
  const { env, s } = arena({ world: { phaseStub: phase({ elapsed: 0 }) } });
  tick(env, s); const st = env.feel.state(s); assert.ok(st.warn && st.warn.big); assert.strictEqual(env.feel.metrics().warnings, 1);
  const m = env.rc.world(s); assert.ok(m.warnHoldUntil > s.time); run(env, s, .5); assert.strictEqual(m.run, null, 'spell held during warning');
  run(env, s, .7); assert.ok(m.run, 'spell starts after the hold');
  const b = s.enemies[0]; s.enemies = []; tick(env, s); s.enemies = [b]; tick(env, s); assert.strictEqual(env.feel.metrics().warnings, 1, 'no repeat for same zone|boss');
  for (let k = 0; k < 20; k++) { s.time += .05; env.feel.onGraze(s, 0, 0); }
  b.hp = 0; tick(env, s); const T = env.feel.state(s).tally; assert.ok(T, 'tally shown'); assert.strictEqual(T.nohit, 100000);
  run(env, s, 1); assert.strictEqual(env.feel.metrics().tallies, 1, 'once per death');
});

test('resets on zone change and hero death clear feel state; save key set unchanged', () => {
  const { env, s } = arena(); const keys0 = Object.keys(s).sort(); const nat = makeNative(s);
  run(env, s, 6, nat); for (let k = 0; k < 30; k++) { s.time += .02; env.feel.onGraze(s, 0, 0); } charge(env, s, .8);
  assert.ok(env.feel.state(s).score > 0);
  const extra = Object.keys(s).filter(k => !keys0.includes(k)); assert.deepStrictEqual(extra, [], 'no new world keys: ' + extra);
  s.zone = 'z2'; tick(env, s); assert.strictEqual(env.feel.state(s).score, 0); assert.strictEqual(env.feel.state(s).coins, 0);
  for (let k = 0; k < 30; k++) { s.time += .02; env.feel.onGraze(s, 0, 0); } assert.ok(env.feel.state(s).score > 0);
  s.hp = 0; tick(env, s); assert.strictEqual(env.feel.state(s).score, 0, 'hero death resets');
});

test('?qa without rc240=1: no side effects', () => {
  const { env, s } = arena({ search: '?qa=1' }); const nat = makeNative(s);
  const snap = JSON.stringify({ ...s, time: 0, awakeningUntil: 0, pendingStrikes: [] });
  for (let k = 0; k < 6; k++) { env.held.a = true; run(env, s, 1.6, nat); env.held.a = false; run(env, s, .5, nat); }
  s.awakeningUntil = s.time + 5; run(env, s, 1, nat);
  assert.strictEqual(nat.tame, 0); assert.strictEqual(env.feel.state(s), null); assert.strictEqual(s.floatTexts.length, 0);
  assert.strictEqual(JSON.stringify({ ...s, time: 0, awakeningUntil: 0, pendingStrikes: [] }).replace(/"fxSerial":\d+/, ''), snap.replace(/"fxSerial":\d+/, ''));
  assert.strictEqual(env.sounds.length, 0);
});

test('draw discipline: one drawImage per coin, streaks <= 3 strokes', () => {
  const { env, s } = arena(); run(env, s, 2); const m = env.rc.world(s);
  for (let k = 0; k < 40; k++) env.feel.onCancel(s, m, 400 + k, 400, 0, 1, 'owner');
  const counter = { drawImage: 0 }; const ctx = stubCtx(counter); const n = env.feel.draw(ctx, s, m, {});
  assert.ok(n <= env.feel.state(s).coins && counter.drawImage <= env.feel.state(s).coins, 'drawImage ' + counter.drawImage);
  m.dim = 1; const c2 = { drawImage: 0 }; const strokes = env.feel.drawBackground(stubCtx(c2), s, m, {}); assert.ok(strokes <= 3 && (c2.stroke || 0) <= 3, 'strokes ' + strokes);
  assert.strictEqual(env.feel.drawBackground(stubCtx({ drawImage: 0 }), s, m, { lowFx: true }), 0, 'lowFx: no streaks');
  const c3 = { drawImage: 0 }; env.feel.drawScreen(stubCtx(c3), s, m, {}); assert.strictEqual(c3.drawImage, 0);
});

test('hero-keyed bolts (michaela heart, upright hexagram), separated palette, gain tiers, NaN-safe draw/audio', () => {
  const { env, s } = arena(); const X = env.feel.__test;
  env.sb.__HAPIL_SHOOTER_RC225__ = { SHOTS: { rian: 'ricochet-cross', ion: 'piercing-lance', michaela: 'winged-bolt' } };
  assert.strictEqual(X.boltShape('michaela'), 'heart'); assert.strictEqual(X.boltShape('rian'), 'hexagram', 'user 2026-11-13: hexagram replaces cross'); for (const v of Object.values(X.SHAPE_BY_SHOT)) assert.ok(!/cross/.test(v), 'no cross shape key: ' + v); assert.strictEqual(X.boltShape('ion'), 'lance'); assert.strictEqual(X.boltShape('nobody'), 'diamond');
  const G = X.GAIN; assert.ok(G.charge > G.boss && G.shot > G.boss && G.ready > G.boss && G.boss > G.confirm && G.charge <= .35, 'gain ordering');
  // Upright shapes never rotate.
  s.activeHeroId = 'michaela'; const nat = makeNative(s); nat.step = (o => () => { for (const r of s.pendingStrikes) if (r.actionKey === 'A') r.heroId = 'michaela'; o(); })(nat.step);
  run(env, s, 6, nat); for (let k = 0; k < 6; k++) s.pendingStrikes.push({ id: 'm' + k, at: s.time + .1, actionKey: 'A', heroId: 'michaela', power: 10 }); run(env, s, .5, nat);
  charge(env, s, 1.6); run(env, s, .08); const st = env.feel.state(s); assert.ok(st.bolts > 0, 'bolts in flight');
  const m = env.rc.world(s); const c = { drawImage: 0 }; const ctx = stubCtx(c); ctx.bezierCurveTo = () => { c.bez = (c.bez || 0) + 1; };
  env.feel.draw(ctx, s, m, {}); assert.ok(c.bez > 0, 'heart path drawn'); assert.ok(!(c.rotate > 0), 'heart is never rotated');
  const pal = X.palette(m); for (const h of [pal.body, pal.coin[1]]) assert.ok(!/ff3048|ff4fd8|b45cff/i.test(h));
  // NaN safety.
  env.sounds.length = 0; m.hx = NaN; const c2 = { drawImage: 0 }; env.feel.draw(stubCtx(c2), s, m, {}); env.feel.onCancel(s, m, NaN, 5, 0, 1, 'owner');
  for (const v of env.sounds) assert.ok(Number.isFinite(v.g) && v.g >= 0 && v.g <= 1);
});

console.log('rc240-stg-feel-unit: ' + passed + ' tests OK');
