'use strict';
// RC240 danmaku layer: install/seam contracts, gates, damage packet safety,
// mercy/cap/no-one-shot, D-channel credit bucketing, pool lifecycle, governor
// and render discipline. Loads the shipped script in a vm with stubbed globals.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = path.join(__dirname, '..', 'assets', 'rc240', 'danmaku-layer.js');
const source = fs.readFileSync(file, 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } }

function stubCtx(counter) {
  const c = {
    canvas: { width: 1280, height: 720, getBoundingClientRect: () => ({ width: 1280, height: 720 }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineDashOffset: 0, lineCap: 'butt',
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage() { counter.drawImage++; },
  };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'closePath', 'fillRect', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo'])
    c[k] = function () { counter[k] = (counter[k] || 0) + 1; };
  let blur = 0;
  Object.defineProperty(c, 'shadowBlur', { get: () => blur, set: v => { blur = v; if (v) counter.shadowBlurNonZero++; }, enumerable: true });
  return c;
}

function makeEnv(search = '?rc240=1', opts = {}) {
  const timers = [];
  const counter = { drawImage: 0, shadowBlurNonZero: 0 };
  const store = new Map();
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, Float32Array, Int32Array,
    location: { search }, innerWidth: opts.innerWidth ?? 1280,
    localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)) },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0,
    performance: { now: () => 0 },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx({ drawImage: 0, shadowBlurNonZero: 0 }) }), querySelector: () => null },
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInContext(source, sb, { filename: file });
  const flush = (max = 50) => { for (let i = 0; i < max && timers.length; i++) timers.shift()(); };
  return { sb, timers, counter, flush, store };
}

const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
function installDeps(env) {
  const sb = env.sb, log = { tick: 0, gdraw: 0, ldraw: 0, packets: [], credits: [], hpFactor: 1.4 };
  sb.__HAPIL_RC86_BRIDGE__ = { project };
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() { log.tick++; }, draw() { log.ldraw++; }, danger() { return 0; } };
  const grammarBase = { version: '3.13.65', installed: true, FAMILIES: ['a'], TITLE: { a: 'A' }, phase: () => 1, mode: s => s?.gameModeV31346 ?? 'STORY', family: () => 'a', schedule: () => null, nextAt: () => 0, draw() { log.gdraw++; }, metrics: () => ({}) };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ ...grammarBase });
  const loop = { version: 'L', installed: true, background() {}, imminent: () => null, render() {}, graze() {}, heal() {}, afterHit() {}, queueEcho() {}, blocked: () => false };
  Object.defineProperty(loop, 'rc225Wrapped', { value: true });
  Object.defineProperty(loop, 'rc226Wrapped', { value: true });
  sb.__HAPIL_LOOP_V31365__ = Object.freeze(loop);
  sb.__HAPIL_COMBAT_V31333__ = { core: s => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; } };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount, x, y, p) { log.packets.push({ amount, p }); if (s.time < s.invulnerableUntil) return false; s.hp -= amount * log.hpFactor; return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0 && !s.paused && !(s.timeStopUntil > s.time) && !s.lockedFlag && !s.guestFlag && !s.practiceV31329, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: s => !!s.lockedFlag };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: s => s.phaseStub ?? null };
  sb.__HAPIL_CHANNEL_V31364__ = { active: s => !!s.dHeld, blockDamage(s, a, h) { log.credits.push(h.id); return true; } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { settings: { current: {} }, state: { current: null } }, effective: () => 'manual' };
  return log;
}
function world(extra = {}) {
  const s = { zone: 'z1', time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99, gameModeV31346: 'STORY', resonance: 0, floatTexts: [], ...extra };
  return s;
}
const boss = () => ({ id: 'b1', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '테스트 보스' });
function place(api, s, dx = 0, dy = 0, o = {}) {
  const m = api.__test.mem(s), P = m.pool, i = P.live++, c = { x: m.hx ?? 0, y: m.hy ?? 0 };
  const hc = s.__core ?? (() => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; })();
  const set = { x: hc.x + dx, y: hc.y + dy, px: hc.x + dx, py: hc.y + dy, vx: 0, vy: 0, ang: Math.PI, spd: 0, acc: 0, vmin: -1e4, vmax: 1e4, om: 0, amp: 0, aT: 1, aPh: 0, gvx: 0, gvy: 0, gy: 0, age: .5, life: 30, stAt: -1, stKind: 0, stA: 0, stB: 0, stC: 0, stD: 0, stE: 0, type: 0, hue: 4, flags: 0, bounce: 0, ox: 0, oy: 0, dir: 0, ...o };
  for (const k in set) P[k][i] = set[k];
  void c; return i;
}
function tick(env, s, dt = 1 / 60) { s.time += dt; env.sb.__HAPIL_LASERS_V31330__.tick(s, dt); }

// ------------------------------------------------------------------ install
test('install waits for dependencies and is idempotent', () => {
  const env = makeEnv('?rc240=1');
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  assert.ok(api && api.installed === false, 'not installed before deps');
  env.flush(5); assert.strictEqual(api.installed, false);
  const log = installDeps(env); env.flush(5);
  assert.strictEqual(api.installed, true);
  const tickFn = env.sb.__HAPIL_LASERS_V31330__.tick, g = env.sb.__HAPIL_GRAMMAR_V31365__, lp = env.sb.__HAPIL_LOOP_V31365__;
  assert.strictEqual(api.__test.install(), true);
  api.__test.recheck(); api.__test.recheck();
  assert.strictEqual(env.sb.__HAPIL_LASERS_V31330__.tick, tickFn, 'no double wrap of tick');
  assert.strictEqual(env.sb.__HAPIL_GRAMMAR_V31365__, g, 'no double wrap of grammar');
  assert.strictEqual(env.sb.__HAPIL_LOOP_V31365__, lp, 'no double wrap of loop');
  // Loading the script a second time is a no-op.
  vm.runInContext(source, env.sb); assert.strictEqual(env.sb.__HAPIL_DANMAKU_RC240__, api);
  void log;
});

test('GRAMMAR keeps members and stays frozen; LOOP keeps members incl. non-enumerable markers', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
  const g = env.sb.__HAPIL_GRAMMAR_V31365__;
  for (const k of ['family', 'schedule', 'nextAt', 'mode', 'phase', 'FAMILIES', 'TITLE', 'metrics', 'installed', 'version']) assert.ok(k in g, 'grammar.' + k);
  assert.ok(Object.isFrozen(g)); assert.strictEqual(g.mode({ gameModeV31346: 'DREAM' }), 'DREAM'); assert.strictEqual(g.nextAt(), 0);
  const lp = env.sb.__HAPIL_LOOP_V31365__;
  for (const k of ['render', 'graze', 'heal', 'afterHit', 'queueEcho', 'blocked', 'background', 'imminent', 'installed']) assert.ok(typeof lp[k] !== 'undefined', 'loop.' + k);
  assert.strictEqual(lp.rc225Wrapped, true); assert.strictEqual(lp.rc226Wrapped, true); assert.ok(Object.isFrozen(lp));
});

test('wrappers re-install after another layer replaces them, without double simulation', () => {
  const env = makeEnv('?rc240=1'); const log = installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const g = env.sb.__HAPIL_GRAMMAR_V31365__; env.sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ ...g, draw() { log.gdraw += 100; } });
  const L = env.sb.__HAPIL_LASERS_V31330__, prev = L.tick; L.tick = function (s, dt) { return prev.call(this, s, dt); };
  api.__test.recheck();
  assert.strictEqual(env.sb.__HAPIL_GRAMMAR_V31365__.draw, api.__test.seams.grammarDraw);
  assert.strictEqual(L.tick, api.__test.seams.tick);
  const s = world({ enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 3, remaining: 9, duration: 12 } });
  const before = api.metrics().steps; tick(env, s, 1 / 60);
  assert.strictEqual(api.metrics().steps - before, 1, 'one substep per frame despite nested wrappers');
  assert.strictEqual(log.tick, 1, 'original tick called exactly once');
});

// ------------------------------------------------------------------ gates
test('tick is a no-op for dt=0, time stop, lock, guest and qa-off', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world(); tick(env, s, 1 / 60);
  const i = place(api, s, 200, 0, { vx: -50, spd: 50 });
  const P = api.__test.mem(s).pool, x0 = P.x[i];
  tick(env, s, 0); assert.strictEqual(P.x[i], x0, 'dt=0');
  s.timeStopUntil = s.time + 5; tick(env, s); assert.strictEqual(P.x[i], x0, 'time stop'); s.timeStopUntil = 0;
  s.lockedFlag = true; tick(env, s); assert.strictEqual(P.x[i], x0, 'locked'); s.lockedFlag = false;
  s.guestFlag = true; tick(env, s); assert.strictEqual(P.x[i], x0, 'guest'); s.guestFlag = false;
  tick(env, s); assert.ok(P.x[i] < x0, 'moves when open');
  const off = makeEnv('?qa=1'); installDeps(off); off.flush();
  const api2 = off.sb.__HAPIL_DANMAKU_RC240__; assert.strictEqual(api2.enabled(), false);
  const s2 = world({ enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 3, remaining: 9, duration: 12 } });
  for (let k = 0; k < 120; k++) tick(off, s2);
  assert.strictEqual(api2.__test.mem(s2), undefined, 'qa default off: no world memory');
  const on = makeEnv('?qa=1&rc240=1'); installDeps(on); on.flush(); assert.strictEqual(on.sb.__HAPIL_DANMAKU_RC240__.enabled(), true);
});

test('emits a curtain during an active spell and holds during encounter lock', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 2, stage: 'active', elapsed: 0, remaining: 12, duration: 12 } });
  for (let k = 0; k < 360; k++) tick(env, s);
  const snap = api.snapshot(s);
  assert.ok(snap.live > 20, 'dense curtain after 6 s: ' + snap.live);
  assert.ok(snap.spell && /「/.test(snap.spellName), 'original spell name');
  const runT = api.__test.mem(s).run.t;
  env.sb.__HAPIL_RC95_NATIVE__.locked = () => true; s.lockedFlag = false;
  for (let k = 0; k < 60; k++) tick(env, s);
  assert.strictEqual(api.__test.mem(s).run.t, runT, 'spell emission clock holds while locked (live bullets keep moving)');
});

// ------------------------------------------------------------------ damage
test('hit packet is heart:false, rc240Danmaku, RC25 contact id; mercy blocks repeat hits', () => {
  const env = makeEnv('?rc240=1'); const log = installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ enemies: [boss()] }); tick(env, s);
  place(api, s); tick(env, s);
  assert.strictEqual(log.packets.length, 1);
  const p = log.packets[0].p;
  assert.strictEqual(p.rc240Danmaku, true); assert.strictEqual(p.heartContactV31336.heart, false); assert.strictEqual(p.heartContactV31336.target, '__host');
  assert.ok(String(p.damageContactIdRC25).startsWith('rc240:')); assert.ok(!String(p.id).startsWith('melee:')); assert.strictEqual(p.boss, true);
  assert.ok(!p.bodyContact && !p.heavyBossSkill && !p.heartContactRC24);
  const loss = 1000 - s.hp; assert.ok(loss > 25 && loss < 60, 'STORY ~4% maxHp, got ' + loss);
  place(api, s); tick(env, s); assert.strictEqual(log.packets.length, 1, 'mercy window');
  for (let k = 0; k < 100; k++) tick(env, s);
  place(api, s); tick(env, s); assert.strictEqual(log.packets.length, 2, 'hit after mercy');
});

test('rolling 4 s cap and no one-shot', () => {
  const env = makeEnv('?rc240=1'); const log = installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ gameModeV31346: 'DREAM', enemies: [boss()] }); tick(env, s);
  const start = s.hp;
  for (let k = 0; k < 240; k++) { if (k % 50 === 0) place(api, s); tick(env, s); }
  assert.ok(start - s.hp <= .30 * 1000 + 1, 'DREAM 4 s cap 30%: lost ' + (start - s.hp));
  assert.ok(api.metrics().capped >= 1, 'cap engaged');
  const s2 = world({ gameModeV31346: 'DREAM', hp: 300, enemies: [boss()] }); tick(env, s2);
  log.hpFactor = 50; place(api, s2); tick(env, s2);
  assert.ok(s2.hp >= 1, 'no one-shot above 25% hp: ' + s2.hp);
});

test('blink passes through and forwards one perfect-dodge contact', () => {
  const env = makeEnv('?rc240=1'); const log = installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ enemies: [boss()] }); tick(env, s);
  s.invulnerableUntil = s.time + .46; s.lastDodgeAt = s.time;
  for (let k = 0; k < 10; k++) { place(api, s); tick(env, s); }
  assert.strictEqual(log.packets.length, 1, 'one forward per blink'); assert.strictEqual(log.packets[0].amount, 1);
  assert.strictEqual(s.hp, 1000, 'no damage during blink');
});

test('D channel absorbs and credits at most once per second', () => {
  const env = makeEnv('?rc240=1'); const log = installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ enemies: [boss()], dHeld: true }); tick(env, s);
  for (let k = 0; k < 180; k++) { place(api, s, (k % 3) - 1); tick(env, s); }
  assert.strictEqual(log.packets.length, 0, 'no damage packet while D held');
  assert.ok(log.credits.length >= 2 && log.credits.length <= 4, 'credits over 3 s: ' + log.credits.length);
  assert.strictEqual(new Set(log.credits).size, log.credits.length, 'bucketed ids unique per second');
  assert.ok(api.metrics().absorbed > 100);
});

// ------------------------------------------------------------------ lifecycle
test('pool clears on zone change and cancels on spell serial change', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 2, remaining: 10, duration: 12 } });
  for (let k = 0; k < 240; k++) tick(env, s);
  assert.ok(api.snapshot(s).live > 0);
  s.phaseStub = { ...s.phaseStub, serial: 1, index: 1, elapsed: 0 };
  tick(env, s);
  const after = api.snapshot(s); assert.ok(after.live < 3, 'cancelled on serial change: ' + after.live); assert.ok(after.sparks > 0, 'converted to sparks');
  for (let k = 0; k < 240; k++) tick(env, s);
  assert.ok(api.snapshot(s).live > 0);
  s.zone = 'z2'; tick(env, s); assert.strictEqual(api.snapshot(s).live, 0, 'cleared on zone change');
  for (let k = 0; k < 60; k++) tick(env, s);
  s.enemies[0].hp = 0; tick(env, s); assert.strictEqual(api.snapshot(s).live, 0, 'owner death cancels');
});

test('density setting persists in localStorage only and governor reduces density', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__, X = api.__test;
  assert.strictEqual(api.setDensity('high'), 'high'); assert.strictEqual(env.store.get('hapil.danmakuDensityRC240'), 'high');
  assert.strictEqual(api.setDensity('bogus'), 'high');
  const hi = X.makeCtx({ mode: 'STORY', band: 3, setting: 1.3 }), lo = X.makeCtx({ mode: 'STORY', band: 3, setting: .6 });
  assert.ok(lo.budget < hi.budget && lo.dens < hi.dens);
  const s = world(); tick(env, s); for (let k = 0; k < 30; k++) place(api, s, 300 + k * 3, 0, { vx: -1, spd: 1 }); tick(env, s);
  let t = 1000; for (let k = 0; k < 80; k++) { t += 30; X.governor.sample(30, 1, t); }
  assert.ok(X.getGov() < .9 && X.getGov() >= .35, 'governor lowered density: ' + X.getGov());
  const g = X.makeCtx({ mode: 'STORY', band: 2, gov: X.getGov() }), f = X.makeCtx({ mode: 'STORY', band: 2, gov: 1 });
  assert.ok(g.dens < f.dens && g.budget < f.budget);
  for (let k = 0; k < 400; k++) { t += 16; X.governor.sample(16, .5, t); }
  assert.ok(X.getGov() > .5, 'recovers');
  const mob = X.makeCtx({ mode: 'DREAM', band: 3, mobile: true, setting: 1.3 });
  assert.ok(mob.budget <= 260 && mob.budget <= X.peakFor('DREAM', 3, true) * 1.15 + 1);
});

// ------------------------------------------------------------------ render
test('draw never advances the simulation; no shadowBlur; drawImage bounded', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 3, stage: 'active', elapsed: 2, remaining: 10, duration: 12 } });
  for (let k = 0; k < 300; k++) tick(env, s);
  const m = api.__test.mem(s), P = m.pool, N = P.live; assert.ok(N > 20);
  const xs = Array.from(P.x.slice(0, N)), ages = Array.from(P.age.slice(0, N)), time = s.time, steps = api.metrics().steps, sparks = m.sparks.length;
  const ctx = stubCtx(env.counter);
  for (const set of [{}, { lowFx: true }, { reducedFlash: true, skillFxOpacity: .4 }]) {
    env.counter.drawImage = 0;
    env.sb.__HAPIL_GRAMMAR_V31365__.draw(ctx, s, set);
    assert.ok(env.counter.drawImage <= N * 1.45 + 8, `drawImage ${env.counter.drawImage} for ${N} bullets`);
    assert.ok(env.counter.drawImage >= N, 'every bullet drawn');
    env.sb.__HAPIL_LOOP_V31365__.background(ctx, s, { x: 0, y: 0, width: 10, height: 10 });
    env.sb.__HAPIL_LASERS_V31330__.draw(ctx, {}, s, set);
  }
  assert.strictEqual(env.counter.shadowBlurNonZero, 0, 'no shadowBlur');
  assert.strictEqual(s.time, time); assert.strictEqual(api.metrics().steps, steps); assert.strictEqual(m.sparks.length, sparks);
  assert.deepStrictEqual(Array.from(P.x.slice(0, N)), xs); assert.deepStrictEqual(Array.from(P.age.slice(0, N)), ages);
  assert.strictEqual(env.counter.save, env.counter.restore, 'balanced save/restore');
  assert.ok(env.counter.save < 40, 'no per-bullet save/restore: ' + env.counter.save);
});

test('full-auto danger and imminent providers see RC240 bullets', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world(); tick(env, s);
  place(api, s, 40, 0, { vx: -200, vy: 0, spd: 200, px: 0 });
  const d = env.sb.__HAPIL_LASERS_V31330__.danger(s, { x: s.x, y: s.y }, .36);
  assert.ok(d >= 36, 'danger ' + d);
  const im = env.sb.__HAPIL_LOOP_V31365__.imminent(s, .3);
  assert.ok(im && im.kind === 'projectile' && im.q.rc240 === true, 'imminent');
  assert.strictEqual(env.sb.__HAPIL_LASERS_V31330__.danger(s, { x: s.x + 8, y: s.y - 8 }, .36), 0, 'far point safe');
});

test('between spells: few fast aimed volleys, each telegraphed >= .3 s; lock, mercy and owner loss stop them', () => {
  for (const mode of ['STORY', 'DREAM']) {
    const env = makeEnv('?rc240=1'); installDeps(env); env.flush();
    const api = env.sb.__HAPIL_DANMAKU_RC240__;
    const s = world({ gameModeV31346: mode, enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'rest', elapsed: 0, remaining: 0, duration: 12 } });
    const m0 = api.__test.mem(s); let firstSpawnAt = null, firstTele = null, maxLive = 0;
    for (let k = 0; k < 600; k++) { tick(env, s); const m = api.__test.mem(s);
      if (!firstTele && m.tele && m.tele.length) firstTele = { born: m.tele[0].born };
      if (firstSpawnAt == null && api.metrics().fillerSpawned > 0) firstSpawnAt = s.time;
      maxLive = Math.max(maxLive, api.snapshot(s).live); }
    const met = api.metrics(), m = api.__test.mem(s); assert.strictEqual(m.run, null, 'no spell during rest');
    assert.ok(met.volleys >= 3, 'volleys ' + met.volleys); assert.ok(met.fillerSpawned >= 9);
    assert.ok(met.teleMin >= api.__test.TELE_MIN - 1e-9, 'telegraph lead ' + met.teleMin);
    assert.ok(firstTele && firstSpawnAt - firstTele.born >= .3 - 1e-9, 'first shot waits for its telegraph');
    assert.ok(met.volleyNMin >= 3 && met.volleyNMax <= 7, 'shots/volley ' + met.volleyNMin + '..' + met.volleyNMax);
    assert.ok(maxLive <= 30, 'few bullets, not a curtain: ' + maxLive);
    const snap = api.snapshot(s); for (const r of snap.rows) { const v = Math.hypot(r.vx, r.vy); assert.ok(v >= 239 && v <= 341, 'fast speed ' + v); }
    for (const mob of [false, true]) for (const auto of [false, true]) { const P = api.__test.volleyPlan(mode, 3, mob, auto, 1, () => .99); assert.ok(P.n >= 3 && P.n <= 7 && P.spd >= 240 && P.spd <= 340 && P.tele >= .3); }
    void m0;
  }
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush(); const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = world({ enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'rest', elapsed: 0, remaining: 0, duration: 12 } });
  for (let k = 0; k < 120; k++) tick(env, s); const m = api.__test.mem(s);
  m.mercyUntil = s.time + 5; const f1 = api.metrics().fillerSpawned; for (let k = 0; k < 120; k++) tick(env, s); assert.strictEqual(api.metrics().fillerSpawned, f1, 'mercy stops volleys'); assert.strictEqual(m.tele.length, 0, 'pending telegraphs dropped');
  m.mercyUntil = -1; for (let k = 0; k < 240; k++) tick(env, s); assert.ok(api.metrics().fillerSpawned > f1);
  s.enemies = []; tick(env, s); assert.strictEqual(api.snapshot(s).live, 0, 'owner gone cancels volley bullets');
});

test('palette: hero-side colour family is never an enemy hue on any map', () => {
  const env = makeEnv('?rc240=1'); installDeps(env); env.flush(); const X = env.sb.__HAPIL_DANMAKU_RC240__.__test;
  const used = new Set(); for (const sp of X.SPELLS) for (const l of sp.layers) if (Number.isFinite(l.p.hue)) used.add(l.p.hue);
  used.add(X.HUES.findIndex(h => h[0] === 'red')); used.add(X.HUES.findIndex(h => h[0] === 'magenta'));
  for (const fam of Object.keys(X.FAMILY_SPELLS)) { const map = X.REMAP[fam]; assert.ok(map, 'remap for ' + fam);
    const enemy = new Set([...used].map(h => X.HUES[map[h]][0])); const side = X.heroPalette(fam).key;
    const banned = side === 'cyan' ? ['cyan'] : ['gold', 'yellow', 'orange'];
    for (const b of banned) assert.ok(!enemy.has(b), fam + ' enemy uses hero hue ' + b); }
});

test('banner rows never overlap; RC129 title line hidden only while the banner shows', () => {
  for (const w of [1280, 844]) {
    const env = makeEnv('?rc240=1', { innerWidth: w }); installDeps(env); env.flush();
    const api = env.sb.__HAPIL_DANMAKU_RC240__;
    const s = world({ enemies: [boss()], phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 2, remaining: 10, duration: 12 } });
    for (let k = 0; k < 10; k++) tick(env, s);
    const m = api.__test.mem(s); assert.ok(m.banner);
    for (const age of [.6, 3]) {
      const rows = []; const ctx = { font: '', textAlign: 'left', fillStyle: '', globalAlpha: 1, measureText: t => ({ width: String(t).length * 7 }), createLinearGradient: () => ({ addColorStop() {} }), fillRect() {},
        fillText(t, x, y) { rows.push({ t: String(t), x, y, px: +(/(\d+)px/.exec(this.font) || [0, 10])[1], align: this.textAlign }); } };
      m.banner.born = s.time - age; m.banner.result = null;
      api.__test.drawBanner(ctx, s, m, {}, m.banner, w, w * 9 / 16);
      const left = rows.filter(r => r.t.includes('주문') || r.t === m.banner.name || r.t.endsWith('…'));
      const right = rows.filter(r => /^\d+\.\d$/.test(r.t) || r.t.startsWith('보너스'));
      for (const col of [left, right]) { assert.strictEqual(col.length, 2, 'two rows: ' + JSON.stringify(rows.map(r => r.t)));
        const [a, b] = col; assert.ok(Math.abs(a.y - b.y) >= (a.px + b.px) / 2, 'rows separated ' + JSON.stringify(col)); }
      const lx = Math.max(...left.map(r => r.x)), rx = Math.min(...right.map(r => r.x - r.t.length * 7));
      assert.ok(lx <= rx, 'columns separated');
    }
    // RC129 HUD title filter.
    const drawn = [];
    const ownCtx = { fillText(t) { drawn.push(String(t)); } };
    const hudCtx = Object.create(ownCtx);
    env.sb.__HAPIL_DANMAKU_RC129__ = { phase: () => ({ ...s.phaseStub, title: '원본 주문', bossName: 'B' }) };
    env.sb.__HAPIL_FEEDBACK_RC128__ = { heroes: {}, draw(ctx) { ctx.fillText('B · 1/3', 0, 0); ctx.fillText('원본 주문  |  9.0s', 0, 0); ctx.fillText('원본 주…', 0, 0); return 1; } };
    api.__test.wrapFeedback();
    env.sb.__HAPIL_FEEDBACK_RC128__.draw(hudCtx, s, {}, {});
    assert.deepStrictEqual(drawn, ['B · 1/3'], 'title line hidden');
    assert.ok(!Object.prototype.hasOwnProperty.call(hudCtx, 'fillText'), 'ctx restored');
    m.banner = null; drawn.length = 0; env.sb.__HAPIL_FEEDBACK_RC128__.draw(hudCtx, s, {}, {});
    assert.strictEqual(drawn.length, 3, 'shown again without the banner');
    assert.ok(env.sb.__HAPIL_FEEDBACK_RC128__.heroes, 'overlay keeps members');
  }
});

console.log(`rc240-danmaku-unit: ${passed} tests OK`);
