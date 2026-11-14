'use strict';
// RC240 review round 4 fixes for the danmaku layer (assets/rc240/danmaku-layer.js):
// 1. Balrog blade: the sword is drawn by its bullets; the body is only a faint additive ember glow
//    (<= 25% alpha), no hard vector outline / hue line through the edges;
// 2. Balrog colours leave the red-dressed hero's family: white-hot cores with violet / magenta rims
//    (no ember-orange rim), the chain whip's ovals are not orange, bullets near the hero get a dark
//    underlay ring and no additive halo;
// 3. bloom bursts are born off the boss toward the hero and open toward the hero (no ring bullets
//    drifting back over the boss); Envy rings vary in tint; released formations travel at the hero;
// 4. Lucifer wings: two mirrored wing arcs (a leading-edge bone per wing, feathers graduated in length);
// 5. volley telegraph: white dashed core over a magenta glow, wider;
// 6. every bullet body carries a dark outer shadow stroke / ring (reads over bright native beams);
// 7. phone spell dim matches PC (the floor is not dimmed less on phone);
// 8. bullets ~40 px outside the walkable floor are not drawn.
// RC240_SRC=<file> runs it against another copy.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = process.env.RC240_SRC || path.join(__dirname, '..', 'assets', 'rc240', 'danmaku-layer.js');
const source = fs.readFileSync(file, 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); console.error(String(e && e.stack || e).split('\n').slice(0, 4).join('\n')); process.exitCode = 1; } }
function load(search = '?qa=1&rc240=1', innerWidth = 1280) {
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array,
    location: { search }, innerWidth, localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, setInterval: () => 0, performance: { now: () => 0 },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => null }), querySelector: () => null } };
  sb.window = sb; sb.globalThis = sb; vm.createContext(sb); vm.runInContext(source, sb, { filename: file });
  return sb;
}
const X = load().__HAPIL_DANMAKU_RC240__.__test, F_SIG = 32, F_AIMED = 2, H = 1 / 60, T = X.T;
const HI = nm => X.HUES.findIndex(h => h[0] === nm);
function rgb(hex) { const v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
function hsv(hex) { const [r, g, b] = rgb(hex).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return { h, s: mx ? d / mx : 0, v: mx }; }
const crimson = hex => { const c = hsv(hex); return (c.h >= 340 || c.h <= 10) && c.s >= .6; };
const violet = hex => { const c = hsv(hex); return c.h >= 250 && c.h <= 290 && c.s >= .45; };

// ------------------------------------------------------------------ runtime env + stub canvas
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
function stubCtx(c, o = {}) {
  const W = o.w || 1280, Hh = o.h || 720; c.calls = c.calls || [];
  const ctx = { canvas: { width: W, height: Hh, getBoundingClientRect: () => ({ width: o.cssW || W, height: o.cssH || Hh }) }, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px x', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineDashOffset: 0, lineCap: 'butt', lineJoin: 'miter',
    getTransform: () => ({ a: o.k || 1, b: 0, c: 0, d: o.k || 1, e: 0, f: 0 }), createRadialGradient: (...a) => { const G = { a, stops: [], addColorStop(p, col) { G.stops.push([p, col]); } }; (c.grads ||= []).push(G); return G; }, createLinearGradient: () => ({ addColorStop() {} }),
    measureText(t) { return { width: String(t).length * 8 }; },
    drawImage(img, ...a) { c.calls.push('drawImage'); const dx = a.length >= 8 ? a[4] : a[0], dy = a.length >= 8 ? a[5] : a[1], dw = a.length >= 8 ? a[6] : a[2]; (c.imgs ||= []).push({ x: dx + dw / 2, y: dy + dw / 2, w: dw, alpha: this.globalAlpha, op: this.globalCompositeOperation }); },
    stroke() { c.calls.push('stroke'); (c.strokes ||= []).push({ w: this.lineWidth, style: String(this.strokeStyle), alpha: this.globalAlpha, op: this.globalCompositeOperation, closed: c.closed, pts: c.pts, dash: c.dash }); },
    fill(rule) { c.calls.push('fill'); (c.fills ||= []).push({ style: String(this.fillStyle), alpha: this.globalAlpha, op: this.globalCompositeOperation, rule, pts: c.pts }); },
    fillRect() { c.calls.push('fillRect'); (c.rects ||= []).push({ style: String(this.fillStyle), alpha: this.globalAlpha, op: this.globalCompositeOperation }); },
    beginPath() { c.calls.push('beginPath'); c.closed = false; c.pts = 0; },
    moveTo() { c.calls.push('moveTo'); c.pts = (c.pts || 0) + 1; }, lineTo() { c.calls.push('lineTo'); c.pts = (c.pts || 0) + 1; c.lineTo = (c.lineTo || 0) + 1; },
    closePath() { c.calls.push('closePath'); c.closed = true; c.closePath = (c.closePath || 0) + 1; },
    arc() { c.calls.push('arc'); c.arc = (c.arc || 0) + 1; } };
  ctx.setLineDash = function (d) { c.dash = d && d.length ? d.slice() : null; };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'setTransform', 'fillText', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'clip', 'ellipse'])
    ctx[k] = function () { c[k] = (c[k] || 0) + 1; c.calls.push(k); };
  return ctx;
}
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
  sb.document.createElement = () => ({ width: 0, height: 0, getContext: () => stubCtx({}) });
  return sb;
}
function world(boss) {
  return { zone: 'z1', time: 100, hp: 1e6, maxHp: 1e6, x: 12, y: 20, enemies: [boss], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], __core: { x: 300, y: 560 },
    phaseStub: { ownerId: boss.id, serial: 0, index: 0, band: 2, stage: 'active', elapsed: 0, remaining: 12, duration: 12 } };
}
function tick(sb, s, dt = H) { const ph = s.phaseStub; if (ph && ph.stage === 'active') { ph.elapsed += dt; ph.remaining = Math.max(0, ph.duration - ph.elapsed); } s.time += dt; s.hp = s.maxHp; sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
const BOSS = {
  lucifer: { id: 'a11-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '루시퍼 · 가면 벗은 초천사', fam: 'lucifer' },
  balrog: { id: 'dist06-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '발록 · 지옥의 문지기', fam: 'rage' },
  envy: { id: 'b03-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '호텔 부매니저 · 레비아탄', fam: 'envy' } };
// Frames while the boss's formation is traced and held (before anything moves), drawn through drawLayer.
function formedFrames(boss, want, fn, o = {}) {
  const sb = makeEnv(o), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...boss }); let frames = 0;
  for (let k = 0; k < 12 * 60; k++) {
    tick(sb, s); const m = api.__test.mem(s), S = m.run && m.run.sig; if (!S || !S.active || !S.last || S.last.g !== want) continue;
    if (m.run.t - S.t0 >= S.rel - .02) continue; frames++; fn(api, s, m);
  }
  return frames;
}

// ------------------------------------------------------------------ 1. Balrog blade
const FLAME = /255,\s*90,\s*26|ff5a1a/i;
test('Balrog blade: body is a faint additive glow (<= 25% alpha), no hard closed outline, no hue line along the edges', () => {
  let faint = 0, soft = 0, glow = 0;
  const frames = formedFrames(BOSS.balrog, 'blade', (api, s, m) => {
    const c = {}; api.__test.drawLayer(stubCtx(c), s, {});
    const body = (c.fills || []).filter(f => f.pts >= 10);
    if (body.length && body.every(f => f.op === 'lighter' && f.alpha <= .25)) faint++;
    const hard = (c.strokes || []).filter(x => x.op !== 'lighter' && x.pts >= 6 && x.alpha > .3);// outline, edge / fuller trail lines
    if (!hard.length) soft++;
    if ((c.imgs || []).filter(i => i.op === 'lighter' && i.w >= 60 && i.alpha <= .25).length >= 4) glow++;
  });
  assert.ok(frames > 20, 'formed frames ' + frames);
  assert.ok(faint >= frames * .8, `faint additive body on ${faint}/${frames}`);
  assert.ok(soft >= frames * .95, `no hard vector line on ${soft}/${frames}`);
  assert.ok(glow >= frames * .6, `soft ember glow sprites along the blade on ${glow}/${frames}`);
});
test('Balrog blade: edge needles touch (gap <= one needle length, 25.3 G px, PC), so the bullets alone draw the edges', () => {
  for (const band of [1, 2, 3]) {
    const sim = X.headless({ spell: 'S3', band, mode: 'STORY', seed: 0, weapon: 'dist06-boss', sigOrder: 0, sigBeats: [1.4, 7.2] });
    while (sim.time < 2.2) sim.step(H, 300, 560); const B = sim.run.sig.buf;
    for (const st of [0, 1]) { const p = []; for (let j = 0; j < B.n; j++) if (B.st[j] === st) p.push([B.x[j], B.y[j]]); assert.ok(p.length >= 14, `b${band} edge ${st}: ${p.length} needles`);
      let mx = 0; for (let i = 1; i < p.length; i++) mx = Math.max(mx, Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); assert.ok(mx <= 25.3, `b${band} edge ${st}: gap ${mx.toFixed(1)}`); }
  }
});

// ------------------------------------------------------------------ 2. Balrog colours
const orange = hex => { const c = hsv(hex); return c.h >= 12 && c.h <= 50 && c.s >= .4; };
test('lava curtain: white-hot core (>= 50% of the body radius) and a violet / magenta / pale rim, never an orange rim', () => {
  for (const nm of ['lavam', 'lavav']) { const h = X.HUES[HI(nm)]; assert.ok(h[3] && !orange(h[3]), nm + ' rim ' + h[3]);
    const r = hsv(h[3]); assert.ok(r.s <= .4 || (r.h >= 255 && r.h <= 335), nm + ' rim hue ' + JSON.stringify(r));
    const c = {}; X.bodyPaint(stubCtx(c), T.ORB, HI(nm), 0, false); const core = c.grads.find(G => G.a[5] === 10.5); assert.ok(core, 'core gradient');
    const whiteTo = Math.max(...core.stops.filter(s => s[1] === '#ffffff').map(s => s[0])); assert.ok(whiteTo >= .5, nm + ' white core to ' + whiteTo.toFixed(2)); }
});
test('Balrog chain whip is not orange / crimson (off the hero chain shot and dress); the sword keeps its flame edges', () => {
  const hues = k => { const sim = X.headless({ spell: 'S3', band: 2, mode: 'STORY', seed: 0, weapon: 'dist06-boss', sigOrder: k, sigBeats: [1.4, 7.2] }), P = sim.pool, set = new Set();
    while (sim.time < 3.2) { sim.step(H, 300, 560); for (let i = 0; i < P.live; i++) if (P.flags[i] & F_SIG) set.add(X.REMAP.rage[P.hue[i] | 0]); } assert.ok(sim.run.sig.last.g === (k ? 'whip' : 'blade')); return [...set].map(h => X.HUES[h]); };
  for (const h of hues(1)) assert.ok(!orange(h[1]) && !crimson(h[1]), 'whip hue ' + h[0] + ' ' + h[1]);
  assert.ok(hues(0).some(h => h[0] === 'flame'), 'sword flame edges');
});
test('bullets near the hero: a dark underlay ring under the body and no additive halo; far bullets unchanged', () => {
  const sb = makeEnv(), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.balrog });
  for (let k = 0; k < 4 * 60; k++) tick(sb, s); const m = api.__test.mem(s), P = m.pool; assert.ok(P.live >= 2);
  P.live = 2; const put = (i, x, y) => { P.x[i] = x; P.y[i] = y; P.flags[i] = 0; P.age[i] = 1; P.type[i] = T.ORB; };
  put(0, m.hx + 50, m.hy - 20); put(1, m.hx + 330, m.hy - 60);
  const c = {}; api.__test.drawLayer(stubCtx(c), s, {});
  const at = i => c.imgs.filter(q => Math.abs(q.x - P.x[i]) < .5 && Math.abs(q.y - P.y[i]) < .5);
  const near = at(0), far = at(1);
  assert.ok(far.some(q => q.op === 'lighter'), 'far bullet keeps its glow'); assert.ok(!near.some(q => q.op === 'lighter'), 'near bullet: no additive halo');
  const so = q => q.op === 'source-over';
  assert.strictEqual(far.filter(so).length, 1, 'far: body only'); assert.strictEqual(near.filter(so).length, 2, 'near: underlay + body');
  const n2 = near.filter(so); assert.ok(n2[0].w > n2[1].w, 'underlay drawn first and larger: ' + n2.map(q => q.w));
});

// ------------------------------------------------------------------ 3. blooms and travel
function blooms(spell, fam, beats) {
  const run = X.makeRun(spell, { band: 2, seed: 4 }), ctx = X.makeCtx({ mode: 'STORY', band: 2, seed: 4, remap: X.REMAP[fam] }), out = [], res = [];
  for (let t = 0; t < beats; t += H) { X.frameCtx(ctx, 1071, 425, 300, 560, 300, 560, run.t); out.length = 0; ctx.live = 0; X.runStep(run, H, ctx, out); for (const b of out) if (b.stKind === 2 && b.type === T.BIG) res.push({ ...b }); }
  return { res, ctx };
}
test('bloom bursts are born off the boss toward the hero (>= 50 G px from the muzzle)', () => {
  for (const sp of ['S1', 'S6']) { const { res } = blooms(sp, 'envy', 8); assert.ok(res.length >= 4, sp + ' blooms ' + res.length);
    for (const b of res) assert.ok(1071 - b.x >= 50, `${sp}: bloom born ${(1071 - b.x).toFixed(0)} px toward the hero`); }
});
test('bloom rings open toward the hero: no ring bullet heads back over the boss; Envy rings vary in tint', () => {
  const { res, ctx } = blooms('S1', 'envy', 10), pool = X.createPool(1024), hues = new Set(); let kids = 0;
  for (const b of res) { pool.live = 0; ctx.budget = ctx.peak = 900; assert.ok(X.spawn(pool, b, ctx)); const out = [];
    for (let k = 0; k < 200 && !out.length; k++) X.stepPool(pool, H, ctx, out, null);
    assert.ok(out.length >= 8, 'ring ' + out.length);
    for (const q of out) { kids++; assert.ok(Math.cos(q.ang - ctx.dir) >= -.3, 'ring bullet heading ' + (q.ang * 180 / Math.PI).toFixed(0) + ' deg (boss side)'); hues.add(X.REMAP.envy[q.hue]); } }
  assert.ok(kids > 30); assert.ok(hues.size >= 2, 'ring tints ' + [...hues].map(h => X.HUES[h][0]));
  for (const h of hues) { const c = hsv(X.HUES[h][1]); assert.ok(!(c.s > .2 && c.h >= 36 && c.h <= 62), 'no gold'); }
});
test('released Envy mirror and Lucifer wings travel at the hero (mean bullet velocity >= 60 G px/s toward it)', () => {
  for (const [id, g, sp] of [['b03-boss', 'mirror', 'S1'], ['a11-boss', 'wings', 'S7']]) {
    const sim = X.headless({ spell: sp, band: 2, mode: 'STORY', seed: 0, weapon: id, sigOrder: 0, sigBeats: [1.4, 7.2] }), P = sim.pool;
    const st = () => { let v = 0, k = 0, mv = 0; for (let i = 0; i < P.live; i++) if (P.flags[i] & F_SIG) { v -= P.vx[i]; k++; if (Math.hypot(P.vx[i], P.vy[i]) > 5) mv++; } return { v: k ? v / k : 0, k, mv }; };
    let done = false; while (sim.time < 8 && !done) { sim.step(H, 300, 560); const S = sim.run.sig;
      if (S && S.active && S.last && S.last.g === g && sim.run.t - S.t0 >= S.end - .5 + .1) { const c = st(); assert.ok(c.k >= 20, g + ' bullets ' + c.k); assert.ok(c.v >= 60, `${g}: ${c.v.toFixed(0)} px/s toward the hero`); done = true; } }
    assert.ok(done, g + ' released');
  }
});

// ------------------------------------------------------------------ 4. Lucifer wings
test('Lucifer wings: two mirrored wing arcs, each with a leading-edge bone and feathers graduated shoulder -> tip', () => {
  for (const mobile of [false, true]) {
    const sim = X.headless({ spell: 'S7', band: 2, mode: 'STORY', seed: 0, mobile, weapon: 'a11-boss', sigOrder: 0, sigBeats: [1.4, 7.2] });
    while (sim.time < 2.4) sim.step(H, 300, 560); const B = sim.run.sig.buf, last = sim.run.sig.last; assert.strictEqual(last.g, 'wings'); const cy = last.cy;
    const pts = []; for (let j = 0; j < B.n; j++) pts.push({ x: B.x[j], y: B.y[j] - cy, st: B.st[j], ty: B.ty[j] });
    const up = pts.filter(p => p.y < -2), dn = pts.filter(p => p.y > 2); assert.ok(up.length >= 12 && dn.length >= 12, `wings ${up.length}/${dn.length}`);
    assert.ok(Math.abs(up.length - dn.length) <= Math.max(3, pts.length * .15), 'balanced');
    const mir = up.filter(p => dn.some(q => Math.hypot(q.x - p.x, q.y + p.y) < 10)).length; assert.ok(mir >= up.length * .8, `mirrored ${mir}/${up.length}`);
    for (const side of [up, dn]) {
      const bone = side.filter(p => p.st >= 40); assert.ok(bone.length >= 3, 'bone bullets ' + bone.length);
      const h = Math.max(...bone.map(p => Math.abs(p.y))); assert.ok(h >= 80, 'wing arcs >= 80 px off the axis: ' + h.toFixed(0));
      const rows = new Map(); for (const p of side) if (p.st >= 16 && p.st < 30) { if (!rows.has(p.st)) rows.set(p.st, []); rows.get(p.st).push(p); }
      const len = [...rows.keys()].sort((a, b) => a - b).map(k => { const r = rows.get(k); let d = 0; for (const a of r) for (const b of r) d = Math.max(d, Math.hypot(a.x - b.x, a.y - b.y)); return d; });
      assert.ok(len.length >= 3, 'feathers per wing ' + len.length); assert.ok(len[len.length - 1] >= len[0] * 1.6, 'graduated feathers ' + len.map(v => v.toFixed(0)));
    }
    // open centre: nothing on the axis between the wings past the shoulder
    const x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), onAxis = pts.filter(p => Math.abs(p.y) < 10 && p.x < x1 - (x1 - x0) * .2).length;
    assert.ok(onAxis <= 1, 'bullets on the axis ' + onAxis);
  }
});

// ------------------------------------------------------------------ 5. volley telegraph
test('volley telegraph: white dashed core >= 1.6 G px over a magenta glow, whatever the volley hue', () => {
  for (const boss of [BOSS.envy, BOSS.balrog]) {
    const sb = makeEnv(), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...boss }); s.phaseStub.stage = 'rest';
    let m; for (let i = 0; i < 400; i++) { tick(sb, s); m = api.__test.mem(s); if (m.tele && m.tele.some(v => v.shot === 0)) break; }
    assert.ok(m.tele.some(v => v.shot === 0), 'telegraph up');
    const c = {}; api.__test.drawLayer(stubCtx(c), s, {});
    const core = c.strokes.filter(x => x.style === '#ffffff' && x.op !== 'lighter'); assert.ok(core.length && Math.max(...core.map(x => x.w)) >= 1.6, 'core ' + core.map(x => x.w));
    assert.ok(core.some(x => x.dash && x.dash.length >= 2), 'marching dashes on the core');
    const glow = c.strokes.filter(x => x.op === 'lighter'); assert.ok(glow.length, 'glow');
    for (const g of glow) { const v = hsv(g.style); assert.ok(v.h >= 290 && v.h <= 335 && v.s >= .5, 'magenta glow ' + g.style); }
    assert.ok(Math.max(...glow.map(x => x.w)) >= 12, 'wide glow ' + glow.map(x => x.w));
  }
});

// ------------------------------------------------------------------ 6. outer shadow
test('every bullet body carries a soft dark outer shadow (stroke or ring) outside its dark outline', () => {
  const sh = st => { const m = /^rgba\(7,4,13,([\d.]+)\)/.exec(String(st)); return m ? Number(m[1]) : null; };
  for (const mobile of [false, true]) {
    for (const ty of [T.RICE, T.NEEDLE, T.STAR]) { const c = {}; X.bodyPaint(stubCtx(c), ty, 0, 0, mobile);
      assert.ok((c.strokes || []).some(x => /^rgba\(7,4,13/.test(x.style) && x.w >= 2.4 && x.alpha * (sh(x.style) ?? 1) <= .5), 'type ' + ty + ' shadow stroke ' + JSON.stringify(c.strokes)); }
    for (const ty of [T.DOT, T.ORB, T.BIG]) { const c = {}; X.bodyPaint(stubCtx(c), ty, 0, 0, mobile);
      assert.ok((c.grads || []).some(G => G.stops.length && sh(G.stops[0][1]) != null && sh(G.stops[0][1]) <= .6 && G.a[5] - G.a[2] >= 2), 'type ' + ty + ' shadow ring'); }
  }
});

// ------------------------------------------------------------------ 7. phone dim
const poly = [{ x: 10, y: 10 }, { x: 24, y: 10 }, { x: 24, y: 24 }, { x: 10, y: 24 }];
const grey = st => { const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(st); return m ? +m[1] : null; };
test('phone spell dim: the floor is dimmed at >= 90% of the level (PC keeps its lighter floor), still lighter than off-floor', () => {
  const run = mobile => { const sb = makeEnv({ innerWidth: mobile ? 700 : 1280, duel: { polygon: () => poly } }), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.balrog });
    for (let k = 0; k < 3 * 60; k++) tick(sb, s); const m = api.__test.mem(s); assert.ok(m.dim > .9); m.wm = new Float64Array([1, 0, 0, 1, 0, 0]); m.wmOk = true;
    const c = {}; api.__test.drawDim(stubCtx(c), s, m, {}); const mul = (c.fills || []).filter(r => r.op === 'multiply');
    return { on: grey(mul.find(f => f.rule !== 'evenodd').style) / 255, off: grey(mul.find(f => f.rule === 'evenodd').style) / 255, a: m.dimLevel * m.dim }; };
  const ph = run(true), pc = run(false);
  assert.ok(1 - ph.on >= ph.a * .9 - .005, `phone floor darkened ${(1 - ph.on).toFixed(3)} of level ${ph.a.toFixed(3)}`);
  assert.ok(ph.on > ph.off, 'floor still lighter than outside'); assert.ok(1 - pc.on <= pc.a * .7, 'PC floor unchanged ' + (1 - pc.on).toFixed(3));
});

// ------------------------------------------------------------------ 8. floor cull
test('bullets ~40 px or more outside the walkable floor are not drawn; inside the fade band they fade; on the floor full', () => {
  const sb = makeEnv({ duel: { polygon: () => poly } }), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.envy });
  for (let k = 0; k < 4 * 60; k++) tick(sb, s); const m = api.__test.mem(s), P = m.pool; assert.ok(P.live >= 3); P.live = 3;
  const put = (i, x, y) => { P.x[i] = x; P.y[i] = y; P.flags[i] = 0; P.age[i] = 1; P.type[i] = T.ORB; };
  put(0, 640, 420); put(1, 300, 330); put(2, 421, 330);// on floor; ~60 px beyond the upper-left edge; ~15 px beyond it
  const c = {}; api.__test.drawLayer(stubCtx(c), s, {});
  const at = i => c.imgs.filter(q => Math.abs(q.x - P.x[i]) < .5 && Math.abs(q.y - P.y[i]) < .5 && q.alpha > .02);
  assert.ok(at(0).some(q => q.alpha >= .99), 'on floor'); assert.strictEqual(at(1).length, 0, 'far off-floor bullet drawn: ' + JSON.stringify(at(1)));
  const mid = at(2); assert.ok(mid.length && mid.every(q => q.alpha < .95), 'fade band ' + JSON.stringify(mid));
});

console.log(`rc240-r5-danmaku-unit: ${passed} tests OK`);
if (process.exitCode) console.error('rc240-r5-danmaku-unit: FAILED');
