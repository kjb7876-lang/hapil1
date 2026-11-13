'use strict';
// RC240 arcade kit (story mode only): power items and levels, familiars,
// bomb (double-tap D), sound tiers and ducking, rank, mode gating and
// inertness. Loads danmaku-layer.js, stg-feel.js and arcade-kit.js into one vm.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..', 'assets', 'rc240');
const files = ['danmaku-layer.js', 'stg-feel.js', 'arcade-kit.js'].map(f => path.join(dir, f));
const srcs = files.map(f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''));
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
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'closePath', 'fillRect', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'rect', 'clip', 'bezierCurveTo', 'ellipse', 'quadraticCurveTo'])
    c[k] = function () { counter[k] = (counter[k] || 0) + 1; };
  const fr = c.fillRect; c.fillRect = function (...a) { counter.alphas = counter.alphas || []; counter.alphas.push(this.globalAlpha); return fr.apply(this, a); };
  return c;
}
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
const unproject = (sx, sy) => { const u = (sx - 640) / 27, w = (sy + 42) / 13.5; return { x: (u + w) / 2, y: (w - u) / 2 }; };
function makeEnv(search = '?rc240=1', opts = {}) {
  const timers = [], sounds = [], held = { a: false }, handlers = {}, clears = [], base = { decorate: 0 };
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, WeakSet, Float32Array, Int32Array, Uint8Array, Uint16Array,
    location: { search }, innerWidth: opts.innerWidth ?? 1280,
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0,
    performance: { now: () => 0 },
    addEventListener: (type, fn) => { (handlers[type] ??= []).push(fn); },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx({ drawImage: 0 }) }), querySelector: () => null },
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb);
  const settings = { sound: true, sfxVolume: 1, ...(opts.settings || {}) };
  sb.__HAPIL_RC86_BRIDGE__ = { project };
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() {}, draw() {}, danger() { return 0; } };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ installed: true, mode: s => s?.gameModeV31346 ?? 'STORY', draw() {} });
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ installed: true, background() {}, imminent: () => null, decorateAttack() { base.decorate++; } });
  sb.__HAPIL_COMBAT_V31333__ = { core: s => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; } };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount) { s.hp -= amount; return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0 && !s.paused, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: s => s.phaseStub ?? null };
  sb.__HAPIL_CHANNEL_V31364__ = { active: s => !!s.dHeld, blockDamage: () => true };
  if (opts.bridge !== false) sb.__HAPIL_PATTERN_CODEX_BRIDGE_V31410__ = { clearHostile(s, reason) { const n = s.hostileProjectiles.length; clears.push({ reason, ids: s.hostileProjectiles.map(q => q.id) }); s.hostileProjectiles = []; return n; } };
  const binding = { settings: { current: settings }, state: { current: null }, input: { current: new Set() }, actions: { sound: (p, g, c) => sounds.push({ p, g, c }) } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => (opts.full ? 'full' : 'manual'), hasHeldLogical: k => k === 'KeyA' && held.a };
  vm.runInContext(srcs[0], sb, { filename: files[0] });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  vm.runInContext(srcs[1], sb, { filename: files[1] });
  vm.runInContext(srcs[2], sb, { filename: files[2] });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  const key = (type, code, extra = {}) => { for (const fn of handlers[type] ?? []) fn({ type, code, key: code === 'KeyD' ? 'd' : code, repeat: false, ...extra }); };
  return { sb, timers, sounds, held, binding, settings, handlers, clears, base, key, rc: sb.__HAPIL_DANMAKU_RC240__, feel: sb.__HAPIL_STG_FEEL_RC240__, kit: sb.__HAPIL_ARCADE_KIT_RC240__ };
}
function world(extra = {}) {
  return { zone: 'z1', time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], pendingStrikes: [], activeHeroId: 'gunner', awakeningUntil: 0, combatFeedbackV31329: [], ...extra };
}
const boss = (id = 'b1', hp = 1e6) => ({ id, boss: true, hp, maxHp: hp, x: 27.4, y: 11.5, name: '시험 거체' });
const mob = (id, x = 22, y = 14) => ({ id, hp: 30, maxHp: 30, x, y, name: '잡몹' });
const phase = (o = {}) => ({ ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 2, remaining: 10, duration: 12, ...o });
function tick(env, s, dt = 1 / 60) { s.time += dt; env.sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
function makeNative(s, power = 10, period = .25, env = null) {
  const st = { next: s.time, a: 0, tame: 0, fam: 0, bomb: 0, maxLen: 0 };
  st.step = () => {
    if (s.time >= st.next) { st.next += period; const before = new Set(s.pendingStrikes); s.pendingStrikes.push({ id: s.fxSerial++, at: s.time + .1, actionKey: 'A', heroId: s.activeHeroId, power, targetId: 'b1' }); env?.sb.__HAPIL_LOOP_V31365__.decorateAttack(s, before); }
    st.maxLen = Math.max(st.maxLen, s.pendingStrikes.length);
    const keep = [];
    for (const r of s.pendingStrikes) { if (r.at <= s.time) { if (r.actionKey === 'A') st.a += r.power; else if (r.actionKey === 'RC240_TAME') st.tame += r.power; else if (r.actionKey === 'RC240_FAM') st.fam += r.power; else if (r.actionKey === 'RC240_BOMB') st.bomb += r.power; } else keep.push(r); }
    s.pendingStrikes = keep;
  };
  return st;
}
function arena(opts = {}) {
  const env = makeEnv(opts.search ?? '?rc240=1', opts);
  // Heart invulnerable by default so stray RC240 hits never change the power level mid-test;
  // tests that exercise hits/mercy pass world.invulnerableUntil: 0.
  const s = world({ enemies: [boss('b1', opts.bossHp ?? 1e6)], phaseStub: phase(), targetEnemyId: 'b1', invulnerableUntil: 1e9, ...(opts.world || {}) });
  env.binding.state.current = s;
  return { env, s };
}
function run(env, s, sec, native, dt = 1 / 60) { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) { tick(env, s, dt); native?.step(); } }
function put(P, x, y, vx = 0, vy = 0, type = 0) {
  const i = P.live++;
  for (const k of ['ang', 'spd', 'acc', 'om', 'amp', 'aPh', 'gvx', 'gvy', 'gy', 'stKind', 'stAt', 'stA', 'stB', 'stC', 'stD', 'stE', 'flags', 'bounce', 'vx', 'vy', 'dir']) P[k][i] = 0;
  P.x[i] = x; P.y[i] = y; P.px[i] = x; P.py[i] = y; P.ox[i] = x; P.oy[i] = y; P.age[i] = 1; P.life[i] = 60; P.vmin[i] = -1e4; P.vmax[i] = 1e4; P.aT[i] = 1; P.type[i] = type; P.hue[i] = 4;
  const sp = Math.hypot(vx, vy); P.spd[i] = sp; P.ang[i] = Math.atan2(vy, vx); P.vx[i] = vx; P.vy[i] = vy;
  return i;
}
const rows = (s, key) => s.pendingStrikes.filter(r => r.actionKey === key);
function powerUp(env, s, points) { const h = env.sb.__HAPIL_COMBAT_V31333__.core(s); env.feel.dropPower(s, h.x + 40, h.y, points); run(env, s, 2.5); }
function doubleTapD(env, s, gap = .2) { env.key('keydown', 'KeyD'); env.key('keyup', 'KeyD'); tick(env, s, gap); env.key('keydown', 'KeyD'); env.key('keyup', 'KeyD'); tick(env, s); }

test('kit installs, feel exposes dropPower/play, danmaku exposes imminent', () => {
  const { env, s } = arena();
  assert.ok(env.kit, 'arcade kit global'); assert.strictEqual(typeof env.feel.dropPower, 'function'); assert.strictEqual(typeof env.feel.play, 'function');
  assert.strictEqual(typeof env.rc.imminent, 'function');
  run(env, s, .5); assert.strictEqual(typeof env.feel.dropCoins, 'function', 'boss-form part breaks call feel.dropCoins'); const c0 = env.feel.state(s).coins; assert.strictEqual(env.feel.dropCoins(s, 600, 450, 6), 6); assert.strictEqual(env.feel.state(s).coins, c0 + 6); assert.strictEqual(env.feel.dropCoins(s, NaN, 1, 3), 0);
  const st = env.kit.state(s); assert.ok(st, 'state'); assert.strictEqual(st.level, 0); assert.strictEqual(st.stock, 2); assert.strictEqual(st.familiars, 0);
});

test('mob and midboss deaths drop P items that home and level up (thresholds 2/5/9/14, max 4)', () => {
  const { env, s } = arena({ world: { enemies: [boss(), mob('m1'), mob('m2', 23, 15), { ...mob('mb'), midboss: true, hp: 200, maxHp: 200 }] } });
  run(env, s, .5); const T = env.kit.__test.THRESH; assert.strictEqual([...T].join(','), '0,2,5,9,14');
  s.enemies[1].hp = 0; tick(env, s); assert.ok(env.kit.state(s).items >= 1, 'mob drop');
  const dead = s.enemies[2]; dead.hp = 0; s.enemies = s.enemies.filter(e => e !== dead); tick(env, s); assert.ok(env.kit.state(s).items >= 2, 'removed-dead mob still drops');
  s.enemies[2].hp = 0; tick(env, s); assert.ok(env.kit.state(s).items >= 4, 'midboss drops more');
  run(env, s, 3); assert.strictEqual(env.kit.state(s).items, 0, 'all homed'); assert.ok(env.kit.state(s).points >= 4); assert.ok(env.kit.state(s).level >= 1);
  powerUp(env, s, 40); assert.strictEqual(env.kit.state(s).level, 4); assert.strictEqual(env.kit.state(s).familiars, 4);
  // A live mob that leaves without dying drops nothing.
  const p0 = env.kit.state(s).points; s.enemies.push(mob('m9')); tick(env, s); s.enemies.pop(); run(env, s, 2); assert.strictEqual(env.kit.state(s).points, p0);
  // Pool cap and NaN safety.
  for (let k = 0; k < 500; k++) env.feel.dropPower(s, 500, 500, 1); assert.ok(env.kit.state(s).items <= env.kit.__test.ITEM_CAP);
  assert.strictEqual(env.feel.dropPower(s, NaN, 4, 2), 0);
});

test('A strike power: +8%/level through LOOP.decorateAttack, <= +40% at L4, once per row, base preserved', () => {
  const { env, s } = arena(); run(env, s, .5); const lp = env.sb.__HAPIL_LOOP_V31365__;
  const push = (extra = {}) => { const before = new Set(s.pendingStrikes); const r = { id: s.fxSerial++, at: s.time + .2, actionKey: 'A', heroId: 'gunner', power: 10, targetId: 'b1', ...extra }; s.pendingStrikes.push(r); lp.decorateAttack(s, before); return r; };
  assert.strictEqual(push().power, 10, 'L0 unchanged'); const b0 = env.base.decorate; assert.ok(b0 >= 1, 'native decorateAttack still called');
  powerUp(env, s, 14); assert.strictEqual(env.kit.state(s).level, 4);
  const r = push(); assert.ok(Math.abs(r.power - 13.2) < 1e-9, 'L4 power ' + r.power); assert.ok(r.power <= 14);
  lp.decorateAttack(s, new Set()); assert.ok(Math.abs(r.power - 13.2) < 1e-9, 'not scaled twice');
  const q = push({ actionKey: 'Q' }); assert.strictEqual(q.power, 10, 'other keys untouched');
  const p = push({ partySlotV31322: 2 }); assert.strictEqual(p.power, 10, 'party rows untouched');
  run(env, s, .5); assert.ok(Math.abs(env.feel.state(s).aPow - 10) < 1e-6, 'feel aPow uses the base power: ' + env.feel.state(s).aPow);
});

test('RC240 hit and native hit drop one level and scatter 1-2 P items re-collectable for 2 s', () => {
  const { env, s } = arena(); run(env, s, .5); powerUp(env, s, 9); assert.strictEqual(env.kit.state(s).level, 3);
  env.feel.onHit(s); const st = env.kit.state(s); assert.strictEqual(st.level, 2); assert.ok(st.items >= 1 && st.items <= 2, 'scatter ' + st.items);
  s.combatFeedbackV31329.push({ at: s.time, kind: '적 본 공격', damage: 5 }); tick(env, s); assert.strictEqual(env.kit.state(s).level, 2, 'same hit debounced');
  run(env, s, 1); assert.ok(env.kit.state(s).items >= 1, 'scattered items do not home'); run(env, s, 1.2); assert.strictEqual(env.kit.state(s).items, 0, 'expired after 2 s'); assert.strictEqual(env.kit.state(s).level, 2);
  s.combatFeedbackV31329.push({ at: s.time, kind: '적 본 공격', damage: 5 }); tick(env, s); assert.strictEqual(env.kit.state(s).level, 1, 'native hit drops');
  // Re-collect: walk the heart onto each scattered item within 2 s.
  const items = env.kit.__test.items(s); assert.ok(items.length >= 1);
  for (const it of items) { const w = unproject(it.x, it.y); s.x = w.x; s.y = w.y; tick(env, s); }
  assert.strictEqual(env.kit.state(s).level, 2, 'recollecting restores the level');
  // Level 0 hit: nothing to scatter.
  const { env: e2, s: s2 } = arena(); run(e2, s2, .5); e2.feel.onHit(s2); assert.strictEqual(e2.kit.state(s2).items, 0); assert.strictEqual(e2.kit.state(s2).level, 0);
});

test('familiars: one per level, RC240_FAM rows to valid targets only, 96 cap, small DPS share', () => {
  const ens = [boss(), { ...mob('p1'), protectedNarrativeTargetV31307: true }, { ...mob('inv'), invulnerableUntil: 1e9 }];
  const { env, s } = arena({ world: { enemies: ens, targetEnemyId: 'p1' } }); const nat = makeNative(s, 10, .25, env);
  run(env, s, 5, nat); assert.strictEqual(nat.fam, 0, 'no familiars at L0');
  powerUp(env, s, 14); assert.strictEqual(env.kit.state(s).familiars, 4);
  nat.a = 0; nat.fam = 0; const seen = new Set();
  for (let i = 0; i < 3600; i++) { tick(env, s); for (const r of rows(s, 'RC240_FAM')) seen.add(r.targetId); nat.step(); }
  assert.ok(nat.fam > 0, 'familiars deal damage'); assert.ok(nat.fam <= .13 * nat.a, 'familiar share ' + (nat.fam / nat.a).toFixed(3));
  assert.strictEqual([...seen].join(','), 'b1', 'valid targets only: ' + [...seen]);
  for (const r of rows(s, 'RC240_FAM').concat([])) { assert.strictEqual(typeof r.targetId, 'string'); assert.ok(Number.isFinite(r.at) && Number.isFinite(r.power)); }
  s.pendingStrikes = []; for (let i = 0; i < 95; i++) s.pendingStrikes.push({ id: 'x' + i, at: s.time + 999, actionKey: 'Q', power: 1, targetId: 'b1' });
  let max = 0; for (let i = 0; i < 180; i++) { tick(env, s); max = Math.max(max, s.pendingStrikes.length); } assert.ok(max <= 96, 'strike cap ' + max);
});

test('bomb: double-tap D (<=.3 s) only, stock 2 per zone, cancels RC240 + safe native, 2 s mercy, bounded damage', () => {
  const ens = [boss('b1', 1000), mob('m1'), { ...mob('p1'), protectedNarrativeTargetV31307: true }];
  const { env, s } = arena({ bossHp: 1000, world: { enemies: ens, invulnerableUntil: 0 } }); const nat = makeNative(s, 10, .25, env); run(env, s, 4, nat);
  const m = env.rc.world(s); assert.ok(m.pool.live > 0, 'bullets live');
  env.key('keydown', 'KeyD'); env.key('keyup', 'KeyD'); run(env, s, .5); assert.strictEqual(env.kit.state(s).bombs, 0, 'single tap: no bomb');
  env.key('keydown', 'KeyD'); tick(env, s, .35); env.key('keydown', 'KeyD'); tick(env, s); assert.strictEqual(env.kit.state(s).bombs, 0, 'taps .35 s apart: no bomb');
  // A real tap is seen twice: by the key listener and as a D-channel rising edge a frame later (slow frames: dt up to .04 s+).
  env.key('keydown', 'KeyD'); s.dHeld = true; tick(env, s, .05); tick(env, s, .05); s.dHeld = false; env.key('keyup', 'KeyD'); run(env, s, .5); assert.strictEqual(env.kit.state(s).bombs, 0, 'one tap (key + channel edge): no bomb');
  s.dHeld = true; tick(env, s, .05); s.dHeld = false; tick(env, s, .15); s.dHeld = true; tick(env, s, .05); s.dHeld = false; tick(env, s); assert.strictEqual(env.kit.state(s).bombs, 1, 'edge-only double tap still bombs'); env.kit.__test.worlds.get(s).stock = 2; env.kit.__test.worlds.get(s).bombs = 0;
  run(env, s, .5, nat);
  s.hostileProjectiles = [{ id: 'h1', damage: 10 }, { id: 'h2', damage: 10, narrativeAttack: true }, { id: 'h3', damage: 0, visualOnly: true }, { id: 'h4', damage: 10, friendly: true }];
  const live0 = m.pool.live, c0 = env.feel.metrics().coinsSpawned, aw0 = s.awakeningUntil; assert.ok(live0 > 0);
  doubleTapD(env, s); const st = env.kit.state(s);
  assert.strictEqual(st.bombs, 1); assert.strictEqual(st.stock, 1); assert.ok(m.pool.live <= 2, 'RC240 bullets cancelled: ' + m.pool.live);
  assert.ok(env.feel.metrics().coinsSpawned > c0, 'cancel → coins');
  assert.strictEqual(JSON.stringify(env.clears.map(c => c.ids)), JSON.stringify([['h1']]), 'only damaging hostile cleared via native API'); assert.strictEqual(env.clears[0].reason, 'parry');
  assert.strictEqual(s.hostileProjectiles.map(q => q.id).sort().join(','), 'h2,h3,h4');
  assert.ok(m.mercyUntil >= s.time + 1.9, 'mercy');
  assert.strictEqual(s.awakeningUntil, aw0, 'awakening untouched');
  const b = rows(s, 'RC240_BOMB'); assert.ok(b.length >= 2, 'bomb rows ' + b.length);
  assert.ok(!b.some(r => r.targetId === 'p1'), 'protected target skipped');
  const bossRow = b.find(r => r.targetId === 'b1'); assert.ok(bossRow && bossRow.power <= .02 * 1000 + 1e-9, 'boss capped ' + bossRow?.power);
  for (const r of b) assert.ok(r.power <= 3 * 10 + 1e-9);
  const h0 = env.rc.metrics().hits; run(env, s, 1.8); assert.strictEqual(env.rc.metrics().hits, h0, 'no RC240 hits during mercy');
  run(env, s, 3, nat); doubleTapD(env, s); assert.strictEqual(env.kit.state(s).stock, 0);
  run(env, s, 3); doubleTapD(env, s); assert.strictEqual(env.kit.state(s).bombs, 2, 'no bomb at zero stock');
  s.zone = 'z2'; run(env, s, .2); assert.strictEqual(env.kit.state(s).stock, 2, 'refill on zone entry'); assert.ok(env.kit.__test.STOCK_MAX <= 2);
  // Mobile D button and no-bridge fallback.
  const { env: e2, s: s2 } = arena({ bridge: false }); run(e2, s2, 1); s2.hostileProjectiles = [{ id: 'h1', damage: 10 }];
  const btn = { closest: sel => (/data-mobile-action/.test(sel) ? { dataset: { mobileAction: 'D' } } : null) };
  e2.key('pointerdown', undefined, { target: btn, pointerId: 1 }); tick(e2, s2, .15); e2.key('pointerdown', undefined, { target: btn, pointerId: 2 }); tick(e2, s2);
  assert.strictEqual(e2.kit.state(s2).bombs, 1, 'mobile double tap'); assert.strictEqual(s2.hostileProjectiles.length, 1, 'native untouched without the bridge');
});

test('full-auto auto-bomb when about to be hit, at most once per 20 s; manual never auto-bombs', () => {
  const { env, s } = arena({ full: true }); run(env, s, 3); const m = env.rc.world(s); m.pool.live = 0;
  put(m.pool, m.hx + 30, m.hy, -200, 0); tick(env, s); assert.strictEqual(env.kit.state(s).bombs, 1, 'auto bomb');
  run(env, s, 3); m.pool.live = 0; m.mercyUntil = 0; put(m.pool, m.hx + 30, m.hy, -200, 0); tick(env, s); assert.strictEqual(env.kit.state(s).bombs, 1, 'rate limited');
  const { env: e2, s: s2 } = arena(); run(e2, s2, 3); const m2 = e2.rc.world(s2); m2.pool.live = 0; put(m2.pool, m2.hx + 30, m2.hy, -200, 0); tick(e2, s2); assert.strictEqual(e2.kit.state(s2).bombs, 0);
});

test('sound tiers and ducking: player hit / bomb suppress lower tiers for .25 s, gains clamped, <=2 concurrent', () => {
  const { env, s } = arena(); run(env, s, .5); const G = env.feel.__test.GAIN;
  assert.ok(G.bomb >= G.shot && G.charge >= G.shot && G.shot > G.boss && G.boss > G.confirm && G.confirm > G.pickup && G.pickup >= G.familiar, 'tier order');
  for (const v of Object.values(G)) assert.ok(v > 0 && v <= .35, 'clamped ' + v);
  env.feel.onHit(s); assert.strictEqual(env.feel.play(s, 'guard', 'confirm'), false, 'ducked after player hit'); assert.strictEqual(env.feel.play(s, 'heavy', 'boss'), false);
  s.time += .3; assert.strictEqual(env.feel.play(s, 'guard', 'confirm'), true, 'duck over');
  s.time += 1; env.sounds.length = 0; let ok = 0; for (const k of ['arcane', 'laser', 'shot', 'heavy', 'guard']) ok += env.feel.play(s, k, 'shot') ? 1 : 0; assert.ok(ok <= 2, 'concurrency ' + ok);
  for (const x of env.sounds) assert.ok(x.g <= .35 && x.g >= 0);
  s.time += 1; env.sounds.length = 0; run(env, s, 3); doubleTapD(env, s); assert.ok(env.sounds.some(x => /heavy|laser/.test(x.p)), 'bomb sound');
  assert.strictEqual(env.feel.play(s, 'guard', 'pickup'), false, 'ducked after bomb');
});

test('rank: danmaku density rises with power level (not easier when powered)', () => {
  const { env, s } = arena(); run(env, s, 3); const d0 = env.rc.world(s).ctx.dens;
  powerUp(env, s, 14); run(env, s, .2); const d4 = env.rc.world(s).ctx.dens; assert.ok(d4 > d0 * 1.1, 'rank ' + d0 + ' → ' + d4);
});

test('draw: familiars/items under bullets via feel.draw, hero palette, hearts/hexagram, no cross shapes, reducedFlash wash', () => {
  const { env, s } = arena(); run(env, s, 2); powerUp(env, s, 14); const m = env.rc.world(s); const K = env.kit.__test;
  const d0 = env.kit.metrics().draws; env.feel.draw(stubCtx({ drawImage: 0 }), s, m, {}); assert.ok(env.kit.metrics().draws > d0, 'kit drawn from feel.draw');
  assert.strictEqual(K.shotShape('michaela'), 'heart'); assert.strictEqual(K.shotShape('rian'), 'hexagram');
  for (const h of ['hwando', 'seoha', 'lauren', 'hunter', 'slayer', 'gunner', 'michaela', 'rian', 'ion', 'neon', 'nobody']) { assert.ok(!/cross/.test(K.flavour(h)) && !/cross/.test(K.shotShape(h)), h); }
  assert.strictEqual(K.flavour('michaela'), 'heart-blossom'); assert.strictEqual(K.flavour('hwando'), 'ink-clone'); assert.strictEqual(K.flavour('lauren'), 'orbit-orbs');
  assert.ok(K.washAlpha({ reducedFlash: true }) <= .08 && K.washAlpha({}) <= .22);
  for (const c of K.colors(m)) assert.ok(!/ff3048|ff4fd8|b45cff|ff8a1c/i.test(c), 'hero family colour ' + c);
  for (const hero of ['michaela', 'lauren', 'gunner', 'seoha', 'hwando']) { s.activeHeroId = hero; const c = { drawImage: 0 }; env.feel.draw(stubCtx(c), s, m, {}); }
  doubleTapD(env, s); const c2 = { drawImage: 0 }; env.feel.drawScreen(stubCtx(c2), s, m, { reducedFlash: true }); assert.ok((c2.alphas || []).every(a => a <= .08 + 1e-9), 'reducedFlash wash ' + c2.alphas);
});

test('dream / hell mode: kit has no side effects; awakening wipe and native decorateAttack still work', () => {
  for (const mode of ['DREAM', 'HELL']) {
    const { env, s } = arena({ world: { gameModeV31346: mode, enemies: [boss(), mob('m1')] } }); const nat = makeNative(s, 10, .25, env);
    run(env, s, 3, nat); const keys0 = Object.keys(s).sort();
    s.enemies[1].hp = 0; tick(env, s); assert.strictEqual(env.feel.dropPower(s, 400, 400, 5), 0, mode + ' dropPower');
    run(env, s, 3, nat); assert.ok(!env.kit.state(s) || (env.kit.state(s).items === 0 && env.kit.state(s).level === 0), mode + ' no items');
    const before = new Set(s.pendingStrikes); const r = { id: 'a', at: s.time + 1, actionKey: 'A', heroId: 'gunner', power: 10, targetId: 'b1' }; s.pendingStrikes.push(r);
    const b0 = env.base.decorate; env.sb.__HAPIL_LOOP_V31365__.decorateAttack(s, before); assert.strictEqual(r.power, 10); assert.strictEqual(env.base.decorate, b0 + 1, 'native decorate passes through');
    const live = env.rc.world(s).pool.live; doubleTapD(env, s); assert.ok(!env.kit.state(s) || env.kit.state(s).bombs === 0, mode + ' no bomb'); assert.ok(env.clears.length === 0);
    assert.strictEqual(nat.fam + nat.bomb, 0); assert.strictEqual(rows(s, 'RC240_FAM').length + rows(s, 'RC240_BOMB').length, 0);
    const w0 = env.feel.metrics().wipes; s.awakeningUntil = s.time + 8; const aw = s.awakeningUntil; tick(env, s); assert.strictEqual(env.feel.metrics().wipes, w0 + 1, 'EGO wipe works'); assert.strictEqual(s.awakeningUntil, aw, 'awakening untouched');
    assert.strictEqual(Object.keys(s).sort().join(','), keys0.join(','), 'no new world keys'); assert.ok(live >= 0);
  }
});

test('?qa without rc240=1: kit inert; no save keys added in story', () => {
  { const { env, s } = arena({ search: '?qa=1', world: { enemies: [boss(), mob('m1')] } }); const nat = makeNative(s, 10, .25, env);
    run(env, s, 2, nat); s.enemies[1].hp = 0; run(env, s, 1, nat); doubleTapD(env, s);
    assert.strictEqual(env.kit.state(s), null); assert.strictEqual(nat.fam + nat.bomb, 0); assert.strictEqual(env.sounds.length, 0); }
  { const { env, s } = arena({ world: { enemies: [boss(), mob('m1')] } }); const keys0 = Object.keys(s).sort(); const nat = makeNative(s, 10, .25, env);
    run(env, s, 2, nat); s.enemies[1].hp = 0; run(env, s, 1, nat); powerUp(env, s, 14); doubleTapD(env, s); env.feel.onHit(s); run(env, s, 2, nat);
    assert.strictEqual(Object.keys(s).sort().join(','), keys0.join(','), 'no new world keys'); }
});

console.log('rc240-arcade-kit-unit: ' + passed + ' tests OK');
