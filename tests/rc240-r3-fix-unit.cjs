'use strict';
// RC240 review round 3 fixes (review pack 4):
// 1. the spell dim (multiply darken, vignette, PC desaturation) never paints on transparent canvas pixels
//    (letterbox bars on PC, the strip above the map on phone): it darkens drawn pixels only and keeps
//    every pixel's alpha, with a cached buffer (no per-frame canvas allocation);
// 2. a boss that dies ends its warning band quickly (fades out within .3 s of the kill beat).
// Pixel checks run on a small software canvas (straight RGBA, W3C compositing formulas).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..', 'assets', 'rc240');
const src = f => fs.readFileSync(path.join(dir, f), 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); console.error(String(e && e.stack || e).split('\n').slice(0, 4).join('\n')); process.exitCode = 1; } }

// ------------------------------------------------------------------ software canvas
function parseColor(c) {
  if (c && typeof c === 'object') { const st = c.stops || []; return st.length ? parseColor(st[st.length - 1][1]) : [0, 0, 0, .5]; }
  c = String(c).trim(); let m;
  if ((m = /^#([0-9a-f]{3})$/i.exec(c))) return [...m[1]].map(h => parseInt(h + h, 16) / 255).concat(1);
  if ((m = /^#([0-9a-f]{6})$/i.exec(c))) { const v = parseInt(m[1], 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255, 1]; }
  if ((m = /^rgba?\(([^)]+)\)$/i.exec(c))) { const p = m[1].split(',').map(Number); return [p[0] / 255, p[1] / 255, p[2] / 255, p.length > 3 ? p[3] : 1]; }
  return [0, 0, 0, 1];
}
const lum = c => .3 * c[0] + .59 * c[1] + .11 * c[2];
function blend(op, cb, cs) {
  if (op === 'multiply') return cs.map((v, i) => v * cb[i]);
  if (op === 'saturation') { const l = lum(cb); return [l, l, l]; } // grey source: zero saturation at the backdrop's luminosity
  if (op === 'screen') return cs.map((v, i) => v + cb[i] - v * cb[i]);
  return cs;
}
const SEPARABLE = new Set(['source-over', 'multiply', 'saturation', 'screen', 'color', 'luminosity', 'overlay', 'darken', 'lighten', 'hue']);
function composite(px, i, cs, as, op) {
  const cb = [px[i], px[i + 1], px[i + 2]], ab = px[i + 3]; let co, ao;
  if (SEPARABLE.has(op)) { const B = blend(op, cb, cs); ao = as + ab * (1 - as); co = [0, 1, 2].map(k => as * (1 - ab) * cs[k] + as * ab * B[k] + (1 - as) * ab * cb[k]); }
  else if (op === 'source-atop') { ao = ab; co = [0, 1, 2].map(k => as * ab * cs[k] + (1 - as) * ab * cb[k]); }
  else if (op === 'destination-in') { ao = ab * as; co = cb.map(v => v * ao); }
  else if (op === 'destination-out') { ao = ab * (1 - as); co = cb.map(v => v * ao); }
  else if (op === 'destination-over') { ao = ab + as * (1 - ab); co = [0, 1, 2].map(k => ab * cb[k] + as * (1 - ab) * cs[k]); }
  else if (op === 'copy') { ao = as; co = cs.map(v => v * as); }
  else if (op === 'lighter') { ao = Math.min(1, as + ab); co = [0, 1, 2].map(k => Math.min(1, as * cs[k] + ab * cb[k])); }
  else throw Error('unsupported op ' + op);
  for (let k = 0; k < 3; k++) px[i + k] = ao > 1e-9 ? Math.min(1, Math.max(0, co[k] / ao)) : 0; px[i + 3] = ao;
}
const canvases = { made: 0 };
function makeCanvas() {
  let W = 0, Hh = 0; const cv = { px: new Float64Array(0) };
  Object.defineProperty(cv, 'width', { get: () => W, set: v => { W = v | 0; cv.px = new Float64Array(W * Hh * 4); } });
  Object.defineProperty(cv, 'height', { get: () => Hh, set: v => { Hh = v | 0; cv.px = new Float64Array(W * Hh * 4); } });
  cv.getBoundingClientRect = () => ({ width: W, height: Hh });
  let ctx = null; cv.getContext = () => ctx || (ctx = makeCtx(cv)); canvases.made++;
  return cv;
}
function makeCtx(cv) {
  const st = []; let T = [1, 0, 0, 1, 0, 0];
  const c = {
    canvas: cv, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px x', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', lineCap: 'butt', lineJoin: 'miter', direction: 'ltr', lineDashOffset: 0,
    log: [],
    save() { st.push({ a: this.globalAlpha, op: this.globalCompositeOperation, fs: this.fillStyle, T: T.slice() }); },
    restore() { const s = st.pop(); if (s) { this.globalAlpha = s.a; this.globalCompositeOperation = s.op; this.fillStyle = s.fs; T = s.T; } },
    setTransform(a, b, cc, d, e, f) { T = [a, b, cc, d, e, f]; }, getTransform: () => ({ a: T[0], b: T[1], c: T[2], d: T[3], e: T[4], f: T[5] }),
    translate(x, y) { T[4] += T[0] * x; T[5] += T[3] * y; }, scale(x, y) { T[0] *= x; T[3] *= y; },
    createRadialGradient() { const G = { stops: [], addColorStop(p, col) { G.stops.push([p, col]); } }; return G; }, createLinearGradient() { return this.createRadialGradient(); },
    fillRect(x, y, w, h) { this.log.push({ k: 'fillRect', op: this.globalCompositeOperation, alpha: this.globalAlpha });
      const col = parseColor(this.fillStyle), as = col[3] * this.globalAlpha, x0 = T[0] * x + T[4], y0 = T[3] * y + T[5], x1 = x0 + T[0] * w, y1 = y0 + T[3] * h;
      for (let py = 0; py < cv.height; py++) for (let qx = 0; qx < cv.width; qx++) { if (qx + .5 < x0 || qx + .5 > x1 || py + .5 < y0 || py + .5 > y1) continue; composite(cv.px, (py * cv.width + qx) * 4, col.slice(0, 3), as, this.globalCompositeOperation); } },
    drawImage(img, dx, dy, dw, dh) { this.log.push({ k: 'drawImage', op: this.globalCompositeOperation, alpha: this.globalAlpha, img });
      if (!img || !img.px) return; dw = dw ?? img.width; dh = dh ?? img.height;
      const x0 = T[0] * dx + T[4], y0 = T[3] * dy + T[5], sw = T[0] * dw, sh = T[3] * dh;
      for (let py = 0; py < cv.height; py++) for (let qx = 0; qx < cv.width; qx++) {
        const u = (qx + .5 - x0) / sw, v = (py + .5 - y0) / sh; if (!(u >= 0 && u < 1 && v >= 0 && v < 1)) { if (this.globalCompositeOperation === 'destination-in' || this.globalCompositeOperation === 'copy') composite(cv.px, (py * cv.width + qx) * 4, [0, 0, 0], 0, this.globalCompositeOperation); continue; }
        const j = (Math.floor(v * img.height) * img.width + Math.floor(u * img.width)) * 4;
        composite(cv.px, (py * cv.width + qx) * 4, [img.px[j], img.px[j + 1], img.px[j + 2]], img.px[j + 3] * this.globalAlpha, this.globalCompositeOperation); } },
    measureText: t => ({ width: String(t).length * 8 }),
  };
  for (const k of ['beginPath', 'moveTo', 'lineTo', 'closePath', 'arc', 'ellipse', 'rect', 'clip', 'stroke', 'fill', 'fillText', 'strokeText', 'setLineDash', 'rotate', 'quadraticCurveTo', 'bezierCurveTo', 'clearRect', 'strokeRect']) c[k] = function () { this.log.push({ k }); };
  return c;
}
// Main canvas 8 x 4: columns 0-1 transparent (letterbox), 2 half-transparent, 3-7 opaque mid grey.
function scene() {
  const cv = makeCanvas(); cv.width = 8; cv.height = 4;
  for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) { const i = (y * 8 + x) * 4; if (x < 2) continue; cv.px[i] = .6; cv.px[i + 1] = .5; cv.px[i + 2] = .4; cv.px[i + 3] = x === 2 ? .5 : 1; }
  return cv;
}
const at = (cv, x, y) => { const i = (y * cv.width + x) * 4; return [...cv.px.slice(i, i + 4)]; };

// ------------------------------------------------------------------ danmaku env (as rc240-r2-danmaku-unit)
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
function danmakuEnv(innerWidth = 1280) {
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array,
    location: { search: '?rc240=1&rc240gov=0' }, innerWidth, localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, setInterval: () => 0, performance: { now: () => 0 },
    document: { createElement: () => makeCanvas(), querySelector: () => null } };
  sb.window = sb; sb.globalThis = sb; vm.createContext(sb);
  const loop = { version: 'L', installed: true, background() {}, imminent: () => null, render() {}, graze() {}, heal() {}, afterHit() {}, queueEcho() {}, blocked: () => false };
  vm.runInContext(src('danmaku-layer.js'), sb, { filename: 'danmaku-layer.js' });
  sb.__HAPIL_RC86_BRIDGE__ = { project };
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() {}, draw() {}, danger() { return 0; } };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ version: '3.13.65', installed: true, FAMILIES: ['a'], TITLE: { a: 'A' }, phase: () => 1, mode: s => s?.gameModeV31346 ?? 'STORY', family: () => 'a', schedule: () => null, nextAt: () => 0, draw() {}, metrics: () => ({}) });
  sb.__HAPIL_LOOP_V31365__ = Object.freeze(loop);
  sb.__HAPIL_COMBAT_V31333__ = { core: s => s.__core };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount) { s.hp -= amount; return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: s => s.phaseStub ?? null };
  sb.__HAPIL_CHANNEL_V31364__ = { active: () => false, blockDamage: () => false };
  sb.__HAPIL_CHOICE_RC97__ = { profile: a => ({ family: a.fam }) };
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { settings: { current: {} }, state: { current: null } }, effective: () => 'manual' };
  let g = 0; while (!sb.__HAPIL_DANMAKU_RC240__.installed && g++ < 5) sb.__HAPIL_DANMAKU_RC240__.__test.install();
  return sb;
}
const ENVY = { id: 'b03-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '호텔 부매니저 · 레비아탄', fam: 'envy' };
function dimWorld() {
  return { zone: 'z1', time: 100, hp: 1e6, maxHp: 1e6, x: 12, y: 20, enemies: [{ ...ENVY }], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], __core: { x: 300, y: 560 },
    phaseStub: { ownerId: ENVY.id, serial: 0, index: 0, band: 2, stage: 'active', elapsed: 0, remaining: 12, duration: 12 } };
}
function dimTick(sb, s, dt = 1 / 60) { const ph = s.phaseStub; if (ph && ph.stage === 'active') { ph.elapsed += dt; ph.remaining = Math.max(0, ph.duration - ph.elapsed); } s.time += dt; s.hp = s.maxHp; sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
function dimmed(innerWidth) { const sb = danmakuEnv(innerWidth), api = sb.__HAPIL_DANMAKU_RC240__, s = dimWorld(); for (let k = 0; k < 3 * 60; k++) dimTick(sb, s); const m = api.__test.mem(s); assert.ok(m.dim > .9, 'dim up ' + m.dim); return { sb, api, s, m }; }

// ------------------------------------------------------------------ 1. dim never paints transparent pixels
for (const [label, iw] of [['PC', 1280], ['phone', 700]]) {
  test(`${label}: spell dim darkens drawn pixels and leaves transparent pixels (letterbox) transparent`, () => {
    const { sb, api, s, m } = dimmed(iw);
    for (const via of ['drawDim', 'background']) {
      const cv = scene(), ctx = cv.getContext('2d'), before = at(cv, 5, 1);
      if (via === 'drawDim') api.__test.drawDim(ctx, s, m, {}); else dimLoop(sb, ctx, s);
      for (let y = 0; y < 4; y++) for (const x of [0, 1]) { const p = at(cv, x, y); assert.ok(p[3] < 1e-6, `${via}: letterbox pixel (${x},${y}) lifted to alpha ${p[3].toFixed(3)} rgb ${p.slice(0, 3).map(v => Math.round(v * 255))}`); }
      const half = at(cv, 2, 1); assert.ok(Math.abs(half[3] - .5) < 1e-6, `${via}: half-transparent pixel alpha kept (${half[3].toFixed(3)})`);
      const p = at(cv, 5, 1); assert.ok(Math.abs(p[3] - 1) < 1e-9, 'opaque stays opaque');
      assert.ok(lum(p) < lum(before) * (1 - .5 * m.dimLevel), `${via}: drawn pixel darkened ${lum(before).toFixed(3)} -> ${lum(p).toFixed(3)} (level ${m.dimLevel})`);
    }
  });
}
function dimLoop(sb, ctx, s) { return sb.__HAPIL_LOOP_V31365__.background(ctx, s, { x: -1200, y: -1200, width: 4200, height: 3400 }); }

test('dim buffer is cached: no canvas allocation per frame, at most 3 image blits per dim frame', () => {
  const { sb, api, s, m } = dimmed(1280);
  const cv = scene(), ctx = cv.getContext('2d'); api.__test.drawDim(ctx, s, m, {}); dimLoop(sb, ctx, s);
  const made0 = canvases.made;
  for (let k = 0; k < 30; k++) { ctx.log.length = 0; dimTick(sb, s); dimLoop(sb, ctx, s); assert.ok(ctx.log.filter(e => e.k === 'drawImage').length <= 3, 'blits ' + ctx.log.filter(e => e.k === 'drawImage').length); }
  assert.strictEqual(canvases.made, made0, 'canvases made during 30 dim frames');
});

// ------------------------------------------------------------------ 2. warning ends with the boss
function feelEnv() {
  const timers = [];
  const stub = log => { for (const k of ['texts', 'fills', 'images']) log[k] = log[k] || [];
    const c = { canvas: { width: 1280, height: 720, getBoundingClientRect: () => ({ width: 1280, height: 720 }) }, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineCap: 'butt', lineJoin: 'miter', lineDashOffset: 0,
      getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }), createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }), measureText: t => ({ width: String(t).length * 8 }),
      drawImage() { log.images.push(this.globalAlpha); }, fillText(t) { log.texts.push({ t: String(t), alpha: this.globalAlpha }); }, fill() { log.fills.push({ alpha: this.globalAlpha }); } };
    for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'moveTo', 'lineTo', 'closePath', 'setTransform', 'setLineDash', 'rect', 'clip', 'bezierCurveTo', 'quadraticCurveTo', 'strokeRect', 'clearRect', 'fillRect', 'stroke', 'strokeText', 'ellipse']) c[k] = function () {};
    return c; };
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, WeakSet, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array, Error,
    location: { search: '?rc240=1' }, innerWidth: 1280, innerHeight: 720, localStorage: { getItem: () => null, setItem() {} },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0, performance: { now: () => 0 }, addEventListener() {},
    document: { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => stub({}) }), querySelector: () => null } };
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
  sb.__HAPIL_CHANNEL_V31364__ = { active: () => false, blockDamage: () => true };
  const binding = { phase: 'game', settings: { current: { sound: true, sfxVolume: 1 } }, state: { current: null }, input: { current: new Set() }, modal: { current: null }, actions: { sound() {} } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => 'manual', hasHeldLogical: () => false };
  vm.runInContext(src('danmaku-layer.js'), sb, { filename: 'danmaku-layer.js' }); for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  vm.runInContext(src('stg-feel.js'), sb, { filename: 'stg-feel.js' }); vm.runInContext(src('arcade-kit.js'), sb, { filename: 'arcade-kit.js' }); for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  const s = { zone: 'z1', time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [{ id: 'b1', boss: true, hp: 1e6, maxHp: 1e6, x: 27.4, y: 11.5, name: '시험 거체' }], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 1e9, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], pendingStrikes: [], activeHeroId: 'hunter', awakeningUntil: 0, combatFeedbackV31329: [], targetEnemyId: 'b1',
    phaseStub: { ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 0, remaining: 10, duration: 12 } };
  binding.state.current = s;
  const feel = sb.__HAPIL_STG_FEEL_RC240__, rc = sb.__HAPIL_DANMAKU_RC240__;
  const tick = (sec = 1 / 60) => { const n = Math.max(1, Math.round(sec * 60)); for (let i = 0; i < n; i++) { s.time += 1 / 60; sb.__HAPIL_LASERS_V31330__.tick(s, 1 / 60); } };
  const screen = () => { const log = {}; feel.drawScreen(stub(log), s, rc.world(s), {}); return log; };
  return { s, feel, tick, screen };
}
const warnText = log => log.texts.filter(x => /경고/.test(x.t));

test('boss kill: the warning band ends within .3 s of the kill beat (no band over the kill / tally)', () => {
  const { s, feel, tick, screen } = feelEnv();
  tick(.8); assert.ok(feel.warningActive(s), 'fixture: warning up'); assert.ok(warnText(screen()).length, 'fixture: warning drawn');
  const full = feel.warnUntil(s); assert.ok(full > s.time + .8, 'fixture: warning would last ' + (full - s.time).toFixed(2) + ' s more');
  s.enemies[0].hp = 0; tick(); const t0 = s.time; assert.ok(feel.killBeat(s), 'kill beat');
  assert.ok(feel.warnUntil(s) <= t0 + .3 + 1e-9, 'warning ends by kill +.3 s: ' + (feel.warnUntil(s) - t0).toFixed(2));
  tick(.32); assert.strictEqual(feel.warningActive(s), false, 'warning over during the kill beat'); assert.strictEqual(warnText(screen()).length, 0, 'no warning band drawn');
  assert.ok(feel.killBeat(s), 'kill beat still running');
});

test('boss kill before its warning starts (queued behind a title card): the warning is dropped', () => {
  const { s, feel, tick } = feelEnv();
  tick(.2); const W = feel.__test.worlds.get(s).warn; assert.ok(W, 'fixture: warning'); W.at = s.time + 1; W.sounded = false; // still queued
  s.enemies[0].hp = 0; tick(); assert.strictEqual(feel.warningActive(s), false, 'queued warning dropped'); tick(1.5); assert.strictEqual(feel.warningActive(s), false);
});

test('a living boss keeps its full warning (no early end)', () => {
  const { s, feel, tick } = feelEnv();
  tick(.5); const u = feel.warnUntil(s); tick(1.2); assert.ok(feel.warningActive(s) && Math.abs(feel.warnUntil(s) - u) < 1e-9, 'warning unchanged');
});

console.log(`rc240-r3-fix-unit: ${passed} tests OK`);
if (process.exitCode) console.error('rc240-r3-fix-unit: FAILED');
