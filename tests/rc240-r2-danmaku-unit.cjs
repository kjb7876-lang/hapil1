'use strict';
// RC240 review round 2 fixes for the danmaku layer (assets/rc240/danmaku-layer.js):
// per-boss weapon palettes apart from the hero's warm-gold family (Balrog flame, Lucifer violet /
// crimson lances, Envy lilac glass), Lucifer feathers as oriented lance rows with no connecting
// line, formations anchored in front of the boss sprite (Envy toward mid-field), spirals / blooms
// retired while a weapon formation is up, dark outlines on rice and large orbs (phone too), a
// multiply-style spell dim with halved desaturation, soft-glow telegraphs, and bullets faded off the
// walkable floor. RC240_SRC=<file> runs it against another copy.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = process.env.RC240_SRC || path.join(__dirname, '..', 'assets', 'rc240', 'danmaku-layer.js');
const source = fs.readFileSync(file, 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); console.error(e && e.stack || e); process.exitCode = 1; } }
function load(search = '?qa=1&rc240=1', innerWidth = 1280) {
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array,
    location: { search }, innerWidth, localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, setInterval: () => 0, performance: { now: () => 0 },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => null }), querySelector: () => null } };
  sb.window = sb; sb.globalThis = sb; vm.createContext(sb); vm.runInContext(source, sb, { filename: file });
  return sb;
}
const X = load().__HAPIL_DANMAKU_RC240__.__test, F_SIG = 32, H = 1 / 60, T = X.T;

// ------------------------------------------------------------------ colour helpers
function rgb(hex) { const v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
function hsv(hex) { const [r, g, b] = rgb(hex).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return { h, s: mx ? d / mx : 0, v: mx }; }
// Hero family: warm gold / yellow / pale gold (hue 36-62, any saturation above .2) and, on the cool
// maps, the hero's cyan (hue 170-200).
const HERO_GOLD = hex => { const c = hsv(hex); return c.s > .2 && c.h >= 36 && c.h <= 62; };
const HERO_CYAN = hex => { const c = hsv(hex); return c.s > .3 && c.h >= 170 && c.h <= 200; };
const base = h => X.HUES[h][1];

// One phrase in the headless sim; returns the formation hues (after the family remap) and the
// still formation.
function phrase(id, k, fam, o = {}) {
  const sim = X.headless({ spell: o.spell || 'S6', band: o.band || 2, mode: 'STORY', seed: 0, mobile: !!o.mobile, weapon: id, sigOrder: k, sigBeats: [1.4, 7.2] });
  if (o.bscale) sim.ctx.bscale = o.bscale;
  const P = sim.pool, remap = X.REMAP[fam]; let still = null; const hues = new Set();
  while (sim.time < 5) {
    sim.step(H, o.hx ?? 300, o.hy ?? 560);
    const rows = []; let moving = 0;
    for (let i = 0; i < P.live; i++) { if (!(P.flags[i] & F_SIG)) continue; if (Math.hypot(P.vx[i], P.vy[i]) > 1) moving++; rows.push({ x: P.x[i], y: P.y[i], type: P.type[i] }); hues.add(remap[P.hue[i] | 0]); }
    if (rows.length && !moving) still = rows; if (moving) break;
  }
  return { still, hues: [...hues], bx: sim.ctx.bx, sim };
}
const BOSSES = { balrog: ['dist06-boss', 'rage'], lucifer: ['a11-boss', 'lucifer'], envy: ['b03-boss', 'envy'] };

// ------------------------------------------------------------------ 1. palettes
test('each boss has its own formation palette (2-3 hues), apart from the hero gold / cyan family', () => {
  const main = {};
  for (const [nm, [id, fam]] of Object.entries(BOSSES)) {
    const ks = id === 'dist06-boss' ? [0, 1] : [0]; const all = new Set();
    for (const k of ks) { const r = phrase(id, k, fam); assert.ok(r.still && r.still.length >= 30, nm + ' formation'); r.hues.forEach(h => all.add(h)); }
    assert.ok(all.size >= 2 && all.size <= 3, `${nm}: ${all.size} formation hues ${[...all].map(h => X.HUES[h][0])}`);
    for (const h of all) {
      assert.ok(!HERO_GOLD(base(h)), `${nm}: formation hue ${X.HUES[h][0]} ${base(h)} is in the hero gold family`);
      if (fam !== 'rage') assert.ok(!HERO_CYAN(base(h)), `${nm}: formation hue ${X.HUES[h][0]} is the hero cyan`);
    }
    main[nm] = all;
  }
  // Balrog reads as fire: its main hue is a deep orange-red (hue 4-28), not pale.
  const fire = [...main.balrog].filter(h => { const c = hsv(base(h)); return c.h >= 4 && c.h <= 28 && c.s >= .75; });
  assert.ok(fire.length >= 1, 'balrog fire hue: ' + [...main.balrog].map(h => base(h)));
  // No two bosses share a formation hue.
  const names = Object.keys(main);
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) for (const h of main[names[i]]) assert.ok(!main[names[j]].has(h), `${names[i]} and ${names[j]} share ${X.HUES[h][0]}`);
});

test('Envy spells: no yellow / gold bullets anywhere in its curtain (S1, S5) after the family remap', () => {
  for (const sp of ['S1', 'S5']) for (let band = 1; band <= 3; band++) {
    const run = X.makeRun(sp, { band, seed: 3 }), ctx = X.makeCtx({ mode: 'STORY', band, seed: 3, remap: X.REMAP.envy }), out = [];
    for (let t = 0; t < 10; t += H) { X.frameCtx(ctx, 1071, 425, 300, 560, 300, 560, run.t); X.runStep(run, H, ctx, out); }
    const hues = new Set(out.map(b => X.REMAP.envy[b.hue])); for (const b of out) if (b.stKind === 2) hues.add(X.REMAP.envy[b.stC & 15]);
    for (const h of hues) assert.ok(!HERO_GOLD(base(h)), `${sp} b${band}: ${X.HUES[h][0]}`);
  }
});

// ------------------------------------------------------------------ 2. shapes
test('Lucifer wings: lance rows (each feather row shares one orientation, no zigzag barbs)', () => {
  for (const mobile of [false, true]) {
    const r = phrase('a11-boss', 0, 'lucifer', { mobile }), B = r.sim.run.sig.buf; assert.ok(B.n >= 20, 'wing bullets ' + B.n);
    const rows = new Map(); for (let j = 0; j < B.n; j++) { if (B.ty[j] === T.BIG || B.ty[j] === T.ORB) continue; const st = B.st[j]; if (!rows.has(st)) rows.set(st, []); rows.get(st).push(B.o[j]); }
    assert.ok(rows.size >= 4, 'feathers ' + rows.size);
    for (const [st, os] of rows) { const spread = Math.max(...os) - Math.min(...os); assert.ok(spread < 6 * Math.PI / 180, `feather ${st}: orientation spread ${(spread * 180 / Math.PI).toFixed(1)} deg`); }
  }
});

const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
function makeEnv(o = {}) {
  const sb = load('?rc240=1&rc240gov=0', o.innerWidth || 1280);
  const loop = { version: 'L', installed: true, background() {}, imminent: () => null, render() {}, graze() {}, heal() {}, afterHit() {}, queueEcho() {}, blocked: () => false };
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
  if (o.duel) sb.__HAPIL_PERSONA_DUEL_RC134__ = o.duel;
  let g = 0; while (!sb.__HAPIL_DANMAKU_RC240__.installed && g++ < 5) sb.__HAPIL_DANMAKU_RC240__.__test.install();
  sb.document.createElement = () => ({ width: 0, height: 0, getContext: () => stubCtx({ calls: [] }) });
  return sb;
}
function world(boss) {
  return { zone: 'z1', time: 100, hp: 1e6, maxHp: 1e6, x: 12, y: 20, enemies: [boss], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], __core: { x: 300, y: 560 },
    phaseStub: { ownerId: boss.id, serial: 0, index: 0, band: 2, stage: 'active', elapsed: 0, remaining: 12, duration: 12 } };
}
function tick(sb, s, dt = H) { const ph = s.phaseStub; if (ph && ph.stage === 'active') { ph.elapsed += dt; ph.remaining = Math.max(0, ph.duration - ph.elapsed); } s.time += dt; s.hp = s.maxHp; sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
function stubCtx(c, o = {}) {
  const W = o.w || 1280, Hh = o.h || 720;
  const ctx = { canvas: { width: W, height: Hh, getBoundingClientRect: () => ({ width: W, height: Hh }) }, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px x', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineDashOffset: 0, lineCap: 'butt', lineJoin: 'miter',
    getTransform: () => ({ a: o.k || 1, b: 0, c: 0, d: o.k || 1, e: 0, f: 0 }), createRadialGradient: (...a) => { const G = { a, stops: [], addColorStop(p, col) { G.stops.push([p, col]); } }; (c.grads ||= []).push(G); return G; }, createLinearGradient: () => ({ addColorStop() {} }),
    measureText(t) { return { width: String(t).length * 8 }; },
    drawImage(img, ...a) { c.calls.push('drawImage'); const dx = a.length >= 8 ? a[4] : a[0], dy = a.length >= 8 ? a[5] : a[1], dw = a.length >= 8 ? a[6] : a[2]; (c.imgs ||= []).push({ x: dx + dw / 2, y: dy + dw / 2, alpha: this.globalAlpha }); },
    stroke() { c.calls.push('stroke'); (c.strokes ||= []).push({ w: this.lineWidth, style: this.strokeStyle, alpha: this.globalAlpha, op: this.globalCompositeOperation }); },
    fill() { c.calls.push('fill'); (c.fills ||= []).push({ style: this.fillStyle, r: c.lastArc, alpha: this.globalAlpha }); },
    arc(x, y, r) { c.calls.push('arc'); c.lastArc = r; },
    fillRect() { c.calls.push('fillRect'); (c.rects ||= []).push({ style: this.fillStyle, alpha: this.globalAlpha, op: this.globalCompositeOperation }); },
    lineTo() { c.calls.push('lineTo'); c.lineTo = (c.lineTo || 0) + 1; } };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'moveTo', 'closePath', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'clip', 'ellipse'])
    ctx[k] = function () { c[k] = (c[k] || 0) + 1; c.calls.push(k); };
  return ctx;
}
const BOSS = {
  lucifer: { id: 'a11-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '루시퍼 · 가면 벗은 초천사', fam: 'lucifer' },
  balrog: { id: 'dist06-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '발록 · 지옥의 문지기', fam: 'rage', scale: 1.32 },
  envy: { id: 'b03-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '호텔 부매니저 · 레비아탄', fam: 'envy' } };

test('Lucifer lances draw no connecting lines (no polyline trail), the Balrog sword keeps its edge trail', () => {
  const count = boss => { const sb = makeEnv(), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...boss }); let frames = 0, lines = 0;
    for (let k = 0; k < 10 * 60; k++) { tick(sb, s); const m = api.__test.mem(s), S = m.run && m.run.sig; if (!S || !S.active || (m.tele && m.tele.some(v => v.shot === 0))) continue;
      m.sparks.length = 0; const c = { calls: [] }; api.__test.drawLayer(stubCtx(c), s, {}); frames++; lines += c.lineTo || 0; }
    return { frames, lines }; };
  const l = count(BOSS.lucifer); assert.ok(l.frames > 30, 'lucifer phrase frames ' + l.frames); assert.strictEqual(l.lines, 0, 'lucifer polyline segments');
  const b = count(BOSS.balrog); assert.ok(b.frames > 30 && b.lines > 0, 'balrog trail ' + JSON.stringify(b));
});

test('formations sit in front of the boss sprite (toward the hero), clear of its column; Envy spreads toward mid-field', () => {
  for (const [nm, [id, fam]] of Object.entries(BOSSES)) for (const bs of [1, 1.56]) {
    const r = phrase(id, 0, fam, { bscale: bs }), xs = r.still.map(p => p.x), near = Math.max(...xs), cx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const col = 50 * bs + 8 + 24;// sprite half width + margin
    assert.ok(near <= r.bx - col, `${nm} bs${bs}: nearest bullet ${(r.bx - near).toFixed(0)} G in front of the boss (want >= ${col.toFixed(0)})`);
    if (nm === 'envy') assert.ok(r.bx - cx >= 260, `envy centre only ${(r.bx - cx).toFixed(0)} G in front of the boss`);
  }
});

test('while a weapon formation is traced and held, spiral and bloom layers are retired (no spiral / dice-cluster look over the weapon)', () => {
  for (const [sp, id] of [['S6', 'a11-boss'], ['S1', 'b03-boss'], ['S2', 'b06-boss']]) {
    const w = X.BOSS_WEAPONS[id], run = X.makeRun(sp, { band: 3, seed: 1, emitEnd: 11.4, weapon: w.list, sigBeats: [1.4, 6.2] }), ctx = X.makeCtx({ mode: 'STORY', band: 3, seed: 1 }), out = [];
    const kinds = run.layers.map(l => l.kind); let during = 0, outside = 0;
    for (let t = 0; t < 10; t += H) { X.frameCtx(ctx, 1071, 425, 300, 560, 300, 560, run.t); out.length = 0; ctx.live = 0; X.runStep(run, H, ctx, out);
      const S = run.sig; if (S.active) assert.ok(S.rel > 0, sp + ': formation release time (sig.rel) known'); const act = S.active && run.t - S.t0 < S.rel; for (const b of out) { if (b.layer == null || b.layer < 0) continue; const k = kinds[b.layer]; if (k !== 'spiral' && k !== 'bloom') continue; if (act) during++; else outside++; } }
    assert.ok(outside > 0, sp + ': spiral/bloom present outside the formation');
    assert.strictEqual(during, 0, sp + ': spiral/bloom bullets while the formation is up');
  }
});

// ------------------------------------------------------------------ 3. bullet art
function paint(type, hue, mobile) { const c = { calls: [] }, g = stubCtx(c); X.bodyPaint(g, type, hue, 0, mobile); return c; }
test('large orbs keep a crisp dark rim (>= 3.5 G px PC, >= 4 G px phone) and a bright white core; rice gets a >= 1.8 px dark outline', () => {
  assert.ok(typeof X.bodyPaint === 'function', 'bodyPaint exposed');
  for (const mobile of [false, true]) {
    const c = paint(T.BIG, X.HUES.findIndex(h => h[0] === 'red'), mobile);
    const dark = c.fills.filter(f => /^rgba\(7,4,13/.test(String(f.style))).map(f => f.r), body = 19;
    assert.ok(dark.length && Math.max(...dark) - body >= (mobile ? 4 : 3.5), `${mobile ? 'phone' : 'pc'} BIG rim ${Math.max(...dark) - body}`);
    const core = c.grads.find(G => G.a[5] === body); assert.ok(core, 'core gradient');
    const whiteTo = Math.max(...core.stops.filter(s => s[1] === '#ffffff').map(s => s[0]));
    assert.ok(whiteTo >= .45, 'white core reaches ' + whiteTo.toFixed(2) + ' of the body radius');
    const halo = c.grads.find(G => G.a[5] > body + 6); const a0 = halo && Number(/,([\d.]+)\)$/.exec(halo.stops[0][1])[1]);
    assert.ok(halo && halo.a[2] >= body + 3.5 && a0 <= .4, 'halo starts outside the rim and is soft: ' + (halo && halo.a[2]) + ' ' + a0);
  }
  for (const mobile of [false, true]) {
    const c = paint(T.RICE, 0, mobile); assert.ok(c.fills.length >= 2);
    // RICE outline is the first fill (dark ellipse, radius 7.5 + ow).
    assert.ok(c.fills[0].r - 7.5 >= (mobile ? 2.4 : 1.8), 'rice outline ' + (c.fills[0].r - 7.5));
  }
});

// ------------------------------------------------------------------ 4. dim, telegraph, floor
test('spell dim darkens by multiply and desaturates at most .2 (PC), never on phone', () => {
  for (const mobile of [false, true]) {
    const sb = makeEnv({ innerWidth: mobile ? 700 : 1280 }), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.envy });
    for (let k = 0; k < 3 * 60; k++) tick(sb, s); const m = api.__test.mem(s); assert.ok(m.dim > .9, 'dim up ' + m.dim);
    const c = { calls: [] }; api.__test.drawDim(stubCtx(c), s, m, {});
    assert.ok(c.rects.some(r => r.op === 'multiply'), (mobile ? 'phone' : 'pc') + ': multiply darken');
    const sat = c.rects.filter(r => r.op === 'saturation');
    if (mobile) assert.strictEqual(sat.length, 0); else assert.ok(sat.length === 1 && sat[0].alpha <= .2 + 1e-9, 'saturation ' + JSON.stringify(sat));
  }
});

test('volley telegraph: soft additive glow under a 2-3 px line, still pulsing', () => {
  const sb = makeEnv(), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.envy }); s.phaseStub.stage = 'rest';
  let m; for (let i = 0; i < 400; i++) { tick(sb, s); m = api.__test.mem(s); if (m.tele && m.tele.some(v => v.shot === 0)) break; }
  assert.ok(m.tele.some(v => v.shot === 0), 'telegraph up');
  const c = { calls: [] }; api.__test.drawLayer(stubCtx(c), s, {});
  const glow = c.strokes.filter(x => x.op === 'lighter'), line = c.strokes.filter(x => x.op !== 'lighter' && x.style !== '#ffffff' && !/^rgba\((6,3,12|7,4,13)/.test(x.style));
  assert.ok(glow.length >= 1, 'glow stroke');
  const lw = Math.max(...line.map(x => x.w)); assert.ok(lw >= 2 && lw <= 4, 'line ' + lw);
  assert.ok(Math.max(...glow.map(x => x.w)) >= 2.5 * lw && Math.max(...glow.map(x => x.alpha)) <= .5, 'soft wide glow');
});

test('bullets beyond the walkable floor polygon are faded; bullets on the floor stay full strength', () => {
  // Floor: tiles 10..24 (G-space diamond (640,270) (1018,459) (640,648) (262,459)).
  const poly = [{ x: 10, y: 10 }, { x: 24, y: 10 }, { x: 24, y: 24 }, { x: 10, y: 24 }];
  const sb = makeEnv({ duel: { polygon: () => poly } }), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.envy });
  for (let k = 0; k < 4 * 60; k++) tick(sb, s);
  const m = api.__test.mem(s), P = m.pool; assert.ok(P.live >= 2);
  // i=0 on the floor (bullets ride ~40 px above the floor), i=1 ~60 px beyond the upper-left edge.
  const put = (i, x, y) => { P.x[i] = x; P.y[i] = y; P.flags[i] = 0; P.age[i] = 1; P.type[i] = T.ORB; };
  put(0, 640, 420); put(1, 300, 330);
  const c = { calls: [] }; api.__test.drawLayer(stubCtx(c), s, {});
  const at = (x, y) => c.imgs.filter(i => Math.abs(i.x - x) < .5 && Math.abs(i.y - y) < .5 && i.alpha > 0);
  const a0 = Math.max(...at(640, 420).map(i => i.alpha)), a1 = Math.max(...at(300, 330).map(i => i.alpha));
  assert.ok(a0 >= .99, 'on-floor alpha ' + a0); assert.ok(a1 <= .5, 'off-floor alpha ' + a1);
});

console.log(`rc240-r2-danmaku-unit: ${passed} tests OK`);
if (process.exitCode) console.error('rc240-r2-danmaku-unit: FAILED');
