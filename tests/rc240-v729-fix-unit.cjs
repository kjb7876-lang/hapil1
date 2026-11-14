'use strict';
// RC240 v7.29 build (87768e36) defect fixes, from visual review round 3 (review-pack4). Look kept; only:
// 1. phone: the native RC129 "GRAZE n" readout moves out from under the settings gear
// 2. text collisions: callouts wait behind the second-form banner; phone title band inset clear of the
//    left HUD stack; PC title band in the top band above the arena and never on screen with the boss
//    warning (title -> warning); tally anchored clear of the hero and its status tag
// 3. the intro boss warning is not shown once the fight is past its opening (boss HP <= 60% or down
//    >= 15% since it was queued): no warning band over native telegraphs at ~50% HP
// 4. the warning band is dropped on the kill frame
// 5. the warning tint is an edge-only, luminance-only vignette (centre hue kept)
// 6. the heart ring is drawn after the native RC128 HUD (status labels) through the feedback seam
// 7. PC second-form white-out: radial from the boss after its first ~50 ms (no full-frame haze)
// 7. bomb screen sweep is a 2:1 floor ellipse kept below the top HUD
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
  sb.__HAPIL_FEEDBACK_RC128__ = opts.feedback ? { heroes, draw(ctx) { ctx.fillText('흡혈 억제', 600, 300); return true; } } : { heroes };
  if (opts.form) sb.__HAPIL_BOSS_FORM_RC240__ = opts.form;
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
function bfEnv(opts = {}) {
  const timers = [], drawn = [];
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } set src(v) { this._s = v; } get src() { return this._s; } }
  function C2D() { this.textAlign = 'left'; } C2D.prototype.fillText = function (t, x, y) { drawn.push({ t: String(t), x, y }); }; C2D.prototype.strokeText = function () {};
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp,
    location: { search: '?rc240=1' }, innerWidth: opts.innerWidth ?? 1280, innerHeight: opts.innerHeight ?? 720, setTimeout: fn => { timers.push(fn); return 1; }, setInterval: () => 0, performance: { now: () => 0 }, Image: FakeImage, requestAnimationFrame: () => 0,
    CanvasRenderingContext2D: C2D,
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx({}), toDataURL: () => 'data:,' }), querySelector: () => null, body: null } };
  sb.window = sb; sb.globalThis = sb; let ps = (c, a) => a.sprite;
  sb.__HAPIL_RC86_BRIDGE__ = { project, zoneActors: z => (/^rest|^hub/.test(z) ? [] : [{ id: 'z-' + z }]), actor: () => null, runtimeSprite: (c, p, f) => p ?? f, get phaseSprite() { return ps; }, set phaseSprite(v) { ps = v; } };
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ afterHit() {}, render() {}, background() {}, imminent: () => null });
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ mode: s => s?.gameModeV31346 ?? 'STORY' });
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { state: { current: null }, cache: { current: {} }, settings: { current: {} } } };
  vm.createContext(sb); vm.runInContext(src('boss-form.js'), sb, { filename: 'boss-form.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  const api = sb.__HAPIL_BOSS_FORM_RC240__; api.__drawn = drawn; api.__C2D = C2D; return api;
}
const envy = (o = {}) => ({ id: 'b03-boss', name: '레비아탄', boss: true, x: 24, y: 12, hp: 37197, maxHp: 37197, humanPhase0: true, phaseCount: 3, phaseSprites: ['a', 'b_human', 'c_demon.webp'], sprite: 'b', ...o });
const bw = (o = {}) => ({ x: 8, y: 12, hp: 200, maxHp: 240, time: 100, zone: 'ep1b03', gameModeV31346: 'STORY', activeHeroId: 'hunter', enemies: [], effects: [], ...o });

// ---------------------------------------------------------------- 1. GRAZE readout
test('phone: native "GRAZE n" (right-aligned at w-10, y 21) moves left of the settings gear, under the score line', () => {
  const api = bfEnv({ innerWidth: 844, innerHeight: 390 }); assert.ok(api.installed, 'installed'); const c = new api.__C2D(); c.textAlign = 'right';
  c.fillText('GRAZE 12', 834, 21); c.fillText('피해 5% 감소 · 1.2s', 834, 35);
  const g = api.__drawn.find(x => /^GRAZE/.test(x.t)), d = api.__drawn.find(x => /^피해/.test(x.t));
  assert.ok(g.x <= 844 - 50, 'GRAZE right edge left of the gear (x >= 800): ' + g.x); assert.ok(g.y >= 34 && g.y <= 60, 'below the score / chain lines: ' + g.y);
  assert.ok(d.x === g.x && d.y > g.y, 'guard line follows: ' + JSON.stringify(d));
  c.textAlign = 'left'; c.fillText('GRAZE 3', 834, 21); assert.strictEqual(api.__drawn[api.__drawn.length - 1].x, 834, 'only the right-aligned readout moves');
});
test('PC: GRAZE readout unchanged', () => {
  const api = bfEnv(); const c = new api.__C2D(); c.textAlign = 'right'; c.fillText('GRAZE 12', 1270, 21);
  assert.deepStrictEqual(api.__drawn[0], { t: 'GRAZE 12', x: 1270, y: 21 });
});

// ---------------------------------------------------------------- 2. text collisions
test('callouts (spell result) wait behind the second-form banner, then show', () => {
  let fb = -1; const form = { titleUntil: () => -1, formBannerUntil: () => fb, transforming: () => false };
  const { env, s } = arena({ form }); run(env, s, 4); fb = s.time + 1;
  env.feel.callout(s, '주문 격파!  공명 +12', '#ffe59a', 1.3, 'big'); tick(env, s);
  assert.ok(!has(feelScreen(env, s), /주문 격파/), 'held under the banner');
  run(env, s, 1.05); fb = -1; tick(env, s); assert.ok(has(feelScreen(env, s), /주문 격파/), 'shown after the banner');
});
test('phone: title band inset clear of the left HUD stack (pips / F) and the settings gear, below the native phase panel', () => {
  const api = bfEnv({ innerWidth: 844, innerHeight: 390 }); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += .6; api.__test.tick(s, .1);
  api.__test.render(stubCtx({}, 1688, 780), s, {}); const B = api.__test.lastBand(), k = 2;
  assert.ok(B.x0 >= 156 * k - 1, 'clear of pips / F: x0 ' + B.x0); assert.ok(B.x0 + B.bw <= (844 - 50) * k + 1, 'clear of the gear: x1 ' + (B.x0 + B.bw));
  assert.ok(B.cy - B.bh / 2 - 6 * k >= (51 + 8) * k, 'below the native phase panel (bottom 51): top ' + (B.cy - B.bh / 2 - 6 * k) / k);
});
test('PC: title band in the top band above the arena (above the actor heads), clear of the native phase panel', () => {
  const api = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += .6; api.__test.tick(s, .1);
  api.__test.render(stubCtx({}, 2560, 1440), s, {}); const B = api.__test.lastBand();
  assert.ok(B.cy + B.bh / 2 + 12 <= 1440 * .26, 'above the action lane: bottom ' + (B.cy + B.bh / 2)); assert.ok(B.cy - B.bh / 2 - 12 >= 51 * 2 + 8, 'below the phase panel: top ' + (B.cy - B.bh / 2));
  assert.ok(B.bw >= 2560, 'full width (look kept)'); assert.ok(B.bh === 68 * 2, 'same band height (look kept) ' + B.bh);
});
test('title and warning are never on screen together: a title card that appears over a running warning pushes it after the title', () => {
  let tu = -1; const form = { titleUntil: () => tu, formBannerUntil: () => -1, transforming: () => false };
  const { env, s } = arena({ form }); run(env, s, .5); assert.ok(env.feel.warningActive(s), 'fixture: warning up');
  tu = s.time + 1.2; tick(env, s); assert.ok(!has(feelScreen(env, s), /경고/), 'no warning while the title card is up');
  run(env, s, 1.25); tu = -1; run(env, s, .3); assert.ok(has(feelScreen(env, s), /경고/), 'warning after the title');
});
test('tally: clear of the hero and its status tag (PC and phone)', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) {
    const { env, s } = arena({ innerWidth: W, innerHeight: H, world: { y: W < 900 ? 10 : 20, x: W < 900 ? 8 : 12 } }); run(env, s, 3); const m = env.rc.world(s); ident(m);
    s.enemies[0].hp = 0; tick(env, s); run(env, s, 1.6); const l = feelScreen(env, s, {}, W, H);
    const head = textAt(l, /격파 결산/); assert.ok(head, 'tally'); const ys = l.texts.filter(x => x.y >= head.y).map(x => x.y);
    const heroTop = m.hy - (W < 900 ? 60 : 90);
    const xs = l.texts.filter(x => x.y >= head.y).map(x => x.x); const clearX = Math.min(...xs) > m.hx + 70 || Math.max(...xs) < m.hx - 70;
    assert.ok(Math.max(...ys) <= heroTop || clearX, W + ': tally bottom ' + Math.max(...ys) + ' vs hero tag top ' + heroTop);
  }
});

// ---------------------------------------------------------------- 3. intro warning not over the mid fight
test('intro warning: dropped once the boss is past its opening (HP <= 60%), not shown over native telegraphs', () => {
  const { env, s } = arena(); run(env, s, .3); assert.ok(env.feel.warningActive(s), 'fixture: warning queued/up at full HP');
  s.enemies[0].hp = s.enemies[0].maxHp * .54; tick(env, s);
  assert.strictEqual(env.feel.warningActive(s), false, 'warning dropped'); run(env, s, .5); assert.ok(!has(feelScreen(env, s), /경고/), 'no warning band');
  run(env, s, 3); assert.ok(!has(feelScreen(env, s), /경고/), 'not re-shown');
});
test('intro warning: a boss that enters already below 60% HP gets no warning band', () => {
  const b = { id: 'b1', boss: true, hp: 540, maxHp: 1000, x: 27.4, y: 11.5, name: '시험 거체' };
  const { env, s } = arena({ world: { enemies: [b] } }); for (let i = 0; i < 90; i++) { tick(env, s); assert.ok(!has(feelScreen(env, s), /경고/), 'no warning at ' + i); }
});
test('intro warning at full HP is unchanged (still shown)', () => {
  const { env, s } = arena(); run(env, s, .6); assert.ok(has(feelScreen(env, s), /경고/), 'warning shown');
});

// ---------------------------------------------------------------- 4. kill
test('kill: the warning band is dropped on the kill frame (no ghost under the kill beat)', () => {
  const { env, s } = arena(); run(env, s, .8); assert.ok(env.feel.warningActive(s));
  const m = env.rc.world(s); ident(m);
  s.enemies[0].hp = 0; tick(env, s); assert.ok(env.feel.killBeat(s), 'kill beat');
  assert.strictEqual(env.feel.warningActive(s), false, 'warning gone at once');
  assert.ok(!has(feelScreen(env, s), /경고/), 'no warning text on the kill frame');
});

// ---------------------------------------------------------------- 5. vignette
test('warning vignette: edge-only (clear centre), luminance-only stops (no hue cast), at most ~-55% at the very edge', () => {
  const { env, s } = arena(); run(env, s, .6); assert.ok(env.feel.warningActive(s), 'fixture: warning up');
  for (let k = 0; k < 40; k++) {
    tick(env, s); const l = feelScreen(env, s);
    const v = l.fills.filter(f => f.style && f.style.radial && f.style.radial[5] >= 600);
    assert.ok(v.length >= 1, 'vignette drawn');
    for (const f of v) {
      const [, , r0] = f.style.radial; assert.ok(r0 >= .38 * 720, 'clear centre radius ' + r0);
      for (const [o, c] of f.style.stops) { const q = rgba(c); if (!q) continue;
        assert.ok(Math.max(q[0], q[1], q[2]) - Math.min(q[0], q[1], q[2]) <= 14, 'no hue cast: ' + c);
        assert.ok(q[3] * f.alpha <= .55, 'darkening at most ~.55 at the very edge: ' + c + ' x ' + f.alpha.toFixed(2));
        if (o <= .3) assert.ok(q[3] * f.alpha <= .06, 'inner ring stays native: ' + o + ' ' + c); }
    }
  }
});

// ---------------------------------------------------------------- 6. heart ring draw order
function ringEnv(W = 1280, H = 720) {
  const { env, s } = arena({ feedback: true, innerWidth: W, innerHeight: H }); run(env, s, 3); const m = env.rc.world(s); ident(m);
  env.recheck(); env.recheck(); feelScreen(env, s, {}, W, H); return { env, s, m };
}
test('heart ring: drawn after the native status label through the RC128 feedback seam; not twice', () => {
  const { env, s } = ringEnv(); const F = env.sb.__HAPIL_FEEDBACK_RC128__; const tone = env.feel.heroTone(s);
  const log = {}; F.draw(stubCtx(log), s, { width: 1280, height: 720 }, {});
  const li = log.seq.findIndex(e => e[0] === 'text' && /흡혈 억제/.test(e[1].t)); assert.ok(li >= 0, 'native label drawn');
  const ri = log.seq.findIndex((e, i) => i > li && e[0] === 'stroke' && e[1].style === tone.body);
  assert.ok(ri > li, 'hero-colour ring after the label');
  tick(env, s); const l2 = feelScreen(env, s); assert.ok(!l2.strokes.some(x => x.style === tone.body), 'no second ring in the RC240 screen pass');
});
test('heart ring: same look as before (PC stroke widths 5 / 2.4 / 1, dark disc), phone unchanged widths', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) { const { env, s } = ringEnv(W, H); const log = {}; env.sb.__HAPIL_FEEDBACK_RC128__.draw(stubCtx(log, W, H), s, {}, {});
    const tone = env.feel.heroTone(s), lw = log.strokes.filter(x => x.style === tone.body).map(x => x.lw);
    assert.deepStrictEqual(lw, [2.4], W + ' ring body width'); assert.ok(log.strokes.some(x => /0a0612/i.test(x.style) && x.lw === 5), 'dark outline 5');
    assert.ok(log.fills.some(f => f.style && f.style.radial), 'separation disc kept'); assert.ok(!log.images.length, 'no added rim sprite'); }
});
test('heart ring: wrapping the feedback seam is stable (no chain growth across rechecks), members kept', () => {
  const { env } = ringEnv(); const depth = () => { let d = 0, o = env.sb.__HAPIL_FEEDBACK_RC128__; while (o && d < 50) { o = Object.getPrototypeOf(o); d++; } return d; };
  const d0 = depth(); for (let i = 0; i < 6; i++) env.recheck(); assert.strictEqual(depth(), d0, 'stable'); assert.ok(env.sb.__HAPIL_FEEDBACK_RC128__.heroes.hunter, 'members kept');
});

// ---------------------------------------------------------------- 7. white-out
test('PC second-form white-out: radial from the boss after the first ~50 ms, no full-frame lift; first frames unchanged', () => {
  const api = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += 3; api.__test.tick(s, .1);
  s.enemies[0].hp = 100; s.time += .02; api.__test.tick(s, .02);
  const lift = age => { const t0 = api.form(s, 'b03-boss').at; s.time = t0 + age; api.__test.tick(s, 0);
    api.__test.render(stubCtx({}, 1280, 720), s, {}); const log = {}; api.drawOverlay(stubCtx(log, 1280, 720), s, {}, 1280, 720);
    const f = log.fillRects.find(r => r.style && r.style.radial && r.w >= 1280); if (!f) return 0;
    const [cx, cy, , , , R] = f.style.radial, st = f.style.stops.map(([o, c]) => [o, rgba(c)[3]]);
    const at = d => { const u = d / R; if (u >= 1) return 0; for (let i = 1; i < st.length; i++) if (u <= st[i][0]) { const [o0, a0] = st[i - 1], [o1, a1] = st[i]; return a0 + (a1 - a0) * (u - o0) / Math.max(1e-6, o1 - o0); } return 0; };
    let sum = 0, n = 0; for (let y = 0; y <= 720; y += 40) for (let x = 0; x <= 1280; x += 40) { sum += at(Math.hypot(x - cx, y - cy)) * f.alpha; n++; } return sum / n; };
  const l0 = lift(.03), l1 = lift(.2), l2 = lift(.35);
  assert.ok(l0 > .1, 'first frames keep the wide white-out ' + l0.toFixed(3));
  assert.ok(l1 <= .05 && l2 <= .03, 'mean full-frame lift after the first frame: ' + l1.toFixed(3) + ' / ' + l2.toFixed(3));
});
console.log('rc240-v729-fix-unit: ' + passed + ' passed');
if (process.exitCode) console.error('rc240-v729-fix-unit: FAILED');
