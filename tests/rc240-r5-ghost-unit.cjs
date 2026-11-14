'use strict';
// RC240 fix round 4 follow-up: the native status-label ghosting in stg-feel (assets/rc240/stg-feel.js)
// hides the native debuff label by reading the hero's ailment timers as expired for one synchronous
// native draw. That must never change game state:
// 1. the timers after a ghosted frame are exactly the timers before it;
// 2. a native draw that throws still restores them;
// 3. a re-entrant draw through the global feedback API (a later wrapper calling it again) neither
//    loses the outer frame's saved timers nor leaves them zeroed;
// 4. a failure while reading the timers never writes values saved on an earlier frame back onto the
//    hero (a cleansed ailment stays cleansed);
// 5. a timer the native draw itself changes keeps the native value.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..', 'assets', 'rc240');
const src = f => fs.readFileSync(path.join(dir, f), 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); console.error(String(e && e.stack || e).split('\n').slice(0, 4).join('\n')); process.exitCode = 1; } }

function grad(kind, a) { const g = { kind, radial: kind === 'radial' ? a : null, stops: [], addColorStop(o, c) { this.stops.push([o, String(c)]); } }; return g; }
function stubCtx(log, W = 1280, H = 720, who = '') {
  for (const k of ['texts', 'fillRects', 'strokes', 'images', 'ellipses', 'fills', 'seq', 'arcs']) log[k] = log[k] || [];
  const c = {
    canvas: { width: W, height: H, getBoundingClientRect: () => ({ width: W, height: H }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineCap: 'butt', lineJoin: 'miter', lineDashOffset: 0,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createRadialGradient: (...a) => grad('radial', a), createLinearGradient: (...a) => grad('linear', a),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage(im, ...a) { const r = { alpha: this.globalAlpha, op: this.globalCompositeOperation, a }; log.images.push(r); log.seq.push(['image', r]); },
    fillRect(x, y, w, h) { const r = { alpha: this.globalAlpha, style: this.fillStyle, op: this.globalCompositeOperation, x, y, w, h }; log.fillRects.push(r); log.seq.push(['fillRect', r]); },
    fillText(t, x, y) { const r = { t: String(t), x, y, alpha: this.globalAlpha, font: this.font, align: this.textAlign, style: this.fillStyle }; log.texts.push(r); log.seq.push(['text', r]); },
    strokeText() {},
    stroke() { const r = { alpha: this.globalAlpha, style: this.strokeStyle, lw: this.lineWidth, op: this.globalCompositeOperation }; log.strokes.push(r); log.seq.push(['stroke', r]); },
    fill() { const r = { alpha: this.globalAlpha, style: this.fillStyle, op: this.globalCompositeOperation }; log.fills.push(r); log.seq.push(['fill', r]); },
    ellipse(x, y, rx, ry) { log.ellipses.push({ x, y, rx, ry }); },
    arc(x, y, r, a0, a1) { log.arcs.push({ x, y, r, a0, a1 }); },
  };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'setTransform', 'setLineDash', 'rect', 'clip', 'bezierCurveTo', 'quadraticCurveTo', 'strokeRect', 'clearRect', 'roundRect'])
    c[k] = function () { log[k] = (log[k] || 0) + 1; };
  return c;
}
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
const px = f => +(/(\d+(?:\.\d+)?)px/.exec(f || '') || [0, 0])[1];
const rgba = c => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(c); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; };

function makeEnv(opts = {}) {
  const timers = [], handlers = {}, intervals = [], held = { a: false };
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, WeakSet, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array, Error, Proxy, Reflect, Symbol, RegExp,
    location: { search: '?rc240=1' }, innerWidth: opts.innerWidth ?? 1280, innerHeight: opts.innerHeight ?? 720,
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: fn => { intervals.push(fn); return intervals.length; },
    performance: { now: () => 0 },
    addEventListener: (type, fn) => { (handlers[type] ??= []).push(fn); },
    document: opts.document ?? { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => stubCtx({}) }), querySelector: () => null },
  };
  sb.window = sb; sb.globalThis = sb; vm.createContext(sb);
  sb.__HAPIL_RC86_BRIDGE__ = { project };
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() {}, draw() {}, danger() { return 0; } };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ installed: true, mode: s => s?.gameModeV31346 ?? 'STORY', draw() {} });
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ installed: true, background() {}, imminent: () => null, decorateAttack() {} });
  sb.__HAPIL_COMBAT_V31333__ = { core: s => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; } };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount) { s.hp -= amount; return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0 && !s.paused, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: s => s.phaseStub ?? null };
  sb.__HAPIL_CHANNEL_V31364__ = { active: s => !!s.dHeld, blockDamage: () => true };
  const heroes = { hunter: { color: '#d5aa68', accent: '#f2ddd0', dark: '#2b2018' }, michaela: { color: '#ecd994', accent: '#c5a3f6', dark: '#281d2c' } };
  sb.__HAPIL_FEEDBACK_RC128__ = opts.feedback ? { heroes, draw: typeof opts.feedback === 'function' ? opts.feedback : function (ctx) { ctx.fillText('흡혈 억제', 600, 300); return true; } } : { heroes };
  if (opts.form) sb.__HAPIL_BOSS_FORM_RC240__ = opts.form;
  if (opts.bridge) sb.__HAPIL_PATTERN_CODEX_BRIDGE_V31410__ = opts.bridge;
  const binding = { phase: 'game', settings: { current: { sound: true, sfxVolume: 1 } }, state: { current: null }, input: { current: new Set() }, modal: { current: null }, actions: { sound() {} } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => 'manual', hasHeldLogical: k => k === 'KeyA' && held.a };
  vm.runInContext(src('danmaku-layer.js'), sb, { filename: 'danmaku-layer.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  vm.runInContext(src('stg-feel.js'), sb, { filename: 'stg-feel.js' });
  vm.runInContext(src('arcade-kit.js'), sb, { filename: 'arcade-kit.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  const key = (type, code) => { for (const fn of handlers[type] ?? []) fn({ type, code, repeat: false }); };
  const recheck = () => { for (const fn of intervals.slice()) { try { fn(); } catch (e) {} } };
  return { sb, held, binding, intervals, key, recheck, rc: sb.__HAPIL_DANMAKU_RC240__, feel: sb.__HAPIL_STG_FEEL_RC240__, kit: sb.__HAPIL_ARCADE_KIT_RC240__ };
}
const boss = (hp = 1e6) => ({ id: 'b1', boss: true, hp, maxHp: hp, x: 27.4, y: 11.5, name: '시험 거체' });
const phase = (o = {}) => ({ ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 0, remaining: 10, duration: 12, ...o });
function world(extra = {}) {
  return { zone: 'z1', time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [boss()], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 1e9, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], pendingStrikes: [], activeHeroId: 'hunter', awakeningUntil: 0, combatFeedbackV31329: [], phaseStub: phase(), targetEnemyId: 'b1', ...extra };
}
function arena(opts = {}) { const env = makeEnv(opts); const s = world(opts.world || {}); env.binding.state.current = s; return { env, s }; }
function tick(env, s, dt = 1 / 60) { s.time += dt; env.sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
function run(env, s, sec, dt = 1 / 60) { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) tick(env, s, dt); }
function feelScreen(env, s, set = {}, W = 1280, H = 720) { const log = {}; env.feel.drawScreen(stubCtx(log, W, H), s, env.rc.world(s), set); return log; }
function layerScreen(env, s, set = {}, W = 1280, H = 720) { const log = {}; env.rc.__test.drawScreen(stubCtx(log, W, H), s, env.rc.world(s), set); return log; }
function worldDraw(env, s, set = {}) { const log = {}; env.feel.draw(stubCtx(log), s, env.rc.world(s), set); return log; }
const has = (log, re) => log.texts.some(x => re.test(x.t));
const textAt = (log, re) => log.texts.find(x => re.test(x.t));
const ident = m => { m.wm = [1, 0, 0, 1, 0, 0]; m.wmOk = true; };

const KEYS = ['heroSleepUntil', 'heroCharmUntil', 'heroBleedUntil', 'heroBurnUntil', 'heroEnvyPoisonUntil', 'heroSlowUntil', 'heroHealingBlockedUntil', 'lifestealSuppressedUntil', 'themeRootUntilV31323'];
const snap = s => KEYS.map(k => s[k]);
function ghostArena(fb) {
  const box = { fn: fb }; const { env, s } = arena({ feedback: function (ctx, s2, ...r) { return box.fn.call(this, ctx, s2, ...r); } });
  run(env, s, 3); const m = env.rc.world(s); ident(m); env.recheck(); env.recheck();
  const near = () => { m.pool.live = 1; m.pool.x[0] = m.hx + 30; m.pool.y[0] = m.hy; feelScreen(env, s); };
  return { env, s, m, box, near, F: () => env.sb.__HAPIL_FEEDBACK_RC128__ };
}
const draw = (F, s) => F.draw(stubCtx({}), s, { width: 1280, height: 720 }, {});

test('ghosted frame: every ailment timer identical before and after (and hidden during the native draw)', () => {
  const seen = []; const g = ghostArena(function (ctx, s) { seen.push(snap(s)); return true; });
  const { s } = g; s.lifestealSuppressedUntil = s.time + 5; s.heroBurnUntil = s.time + 2.5; s.heroSlowUntil = s.time - 1; s.heroSleepUntil = 0;
  const before = snap(s); g.near(); draw(g.F(), s);
  assert.ok(seen.length === 1 && seen[0][7] <= s.time && seen[0][3] <= s.time, 'hidden during the native draw');
  assert.deepStrictEqual(snap(s), before, 'timers restored exactly');
  for (let i = 0; i < 30; i++) { tick(g.env, s); g.near(); draw(g.F(), s); }
  assert.strictEqual(s.lifestealSuppressedUntil, before[7]); assert.strictEqual(s.heroBurnUntil, before[3]);
});
test('a throwing native draw still restores the timers', () => {
  const g = ghostArena(function () { throw new Error('native draw fault'); }); const { s } = g;
  s.lifestealSuppressedUntil = s.time + 5; const before = snap(s); g.near();
  assert.throws(() => draw(g.F(), s), /native draw fault/); assert.deepStrictEqual(snap(s), before);
});
test('re-entrant draw through the global feedback API: no timer is lost or left zeroed', () => {
  let depth = 0; const g = ghostArena(function (ctx, s) { if (depth++ === 0) { g.near(); draw(g.F(), s); } depth--; return true; });
  const { s } = g; s.lifestealSuppressedUntil = s.time + 5; s.heroBleedUntil = s.time + 3; const before = snap(s); g.near(); draw(g.F(), s);
  assert.deepStrictEqual(snap(s), before, 're-entrant ghosting leaves the hero\'s ailments as they were');
});
test('a failure reading the timers never resurrects an ailment saved on an earlier frame', () => {
  const g = ghostArena(function () { return true; }); const { s } = g;
  s.lifestealSuppressedUntil = s.time + 5; s.themeRootUntilV31323 = s.time + 4; g.near(); draw(g.F(), s);
  assert.ok(s.themeRootUntilV31323 > s.time, 'restored after a normal ghosted frame');
  s.themeRootUntilV31323 = 0; // cleansed by the game
  Object.defineProperty(s, 'heroCharmUntil', { configurable: true, get() { throw new Error('getter fault'); }, set(v) {} });
  tick(g.env, s); g.near(); try { draw(g.F(), s); } catch (e) {}
  assert.strictEqual(s.themeRootUntilV31323, 0, 'cleansed ailment stays cleansed');
  assert.ok(s.lifestealSuppressedUntil > s.time, 'live ailment kept');
});
test('a timer the native draw changes keeps the native value', () => {
  const g = ghostArena(function (ctx, s) { s.heroBurnUntil = s.time + 9; return true; }); const { s } = g;
  s.heroBurnUntil = s.time + 2; s.lifestealSuppressedUntil = s.time + 5; const t = s.time; g.near(); draw(g.F(), s);
  assert.strictEqual(s.heroBurnUntil, t + 9, 'native write kept'); assert.strictEqual(s.lifestealSuppressedUntil, t + 5);
});

console.log('rc240-r5-ghost-unit: ' + passed + ' passed');
if (process.exitCode) console.error('rc240-r5-ghost-unit: FAILED');
