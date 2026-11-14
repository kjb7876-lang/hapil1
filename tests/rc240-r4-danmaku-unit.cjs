'use strict';
// RC240 review round 3 fixes for the danmaku layer (assets/rc240/danmaku-layer.js):
// 1. the Balrog flame sword reads as a sword: white-hot fuller, a filled tapered blade body with an
//    outline and tip glint while it is formed, and the lava curtain walls rest while it is up; the
//    lava curtain moves off hot magenta to crimson (ember rim kept);
// 2. Lucifer's big curtain orbs leave the red boss / blood floor / hero family: violet with a white
//    core and a light outer stroke over the dark rim (the lance tips stay crimson);
// 3. spell dim ~35% lighter, luminance only (neutral multiply, minimal desaturation) and lighter
//    on the walkable floor than off it, so the floor edge stays readable;
// 4. Envy mirror: an outlined oval frame stroked through the rim while the pane is up; the bloom
//    ring no longer bursts in near-white glass over the boss;
// 5. phone bullets drawn ~15% larger, trail / link lines >= 1.5 CSS px;
// 6. band 3 escalates with a new curved pattern of a second shape (not one more wall);
// 7. native hostile projectiles get a thin red hostile rim (same two arcs per projectile).
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
    getTransform: () => ({ a: o.k || 1, b: 0, c: 0, d: o.k || 1, e: 0, f: 0 }), createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText(t) { return { width: String(t).length * 8 }; },
    drawImage(img, ...a) { c.calls.push('drawImage'); const dx = a.length >= 8 ? a[4] : a[0], dy = a.length >= 8 ? a[5] : a[1], dw = a.length >= 8 ? a[6] : a[2]; (c.imgs ||= []).push({ x: dx + dw / 2, y: dy + dw / 2, w: dw, alpha: this.globalAlpha }); },
    stroke() { c.calls.push('stroke'); (c.strokes ||= []).push({ w: this.lineWidth, style: String(this.strokeStyle), alpha: this.globalAlpha, op: this.globalCompositeOperation, closed: c.closed }); },
    fill(rule) { c.calls.push('fill'); (c.fills ||= []).push({ style: String(this.fillStyle), alpha: this.globalAlpha, op: this.globalCompositeOperation, rule, pts: c.pts }); },
    fillRect() { c.calls.push('fillRect'); (c.rects ||= []).push({ style: String(this.fillStyle), alpha: this.globalAlpha, op: this.globalCompositeOperation }); },
    beginPath() { c.calls.push('beginPath'); c.closed = false; c.pts = 0; },
    moveTo() { c.calls.push('moveTo'); c.pts = (c.pts || 0) + 1; }, lineTo() { c.calls.push('lineTo'); c.pts = (c.pts || 0) + 1; c.lineTo = (c.lineTo || 0) + 1; },
    closePath() { c.calls.push('closePath'); c.closed = true; c.closePath = (c.closePath || 0) + 1; },
    arc() { c.calls.push('arc'); c.arc = (c.arc || 0) + 1; } };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'clip', 'ellipse'])
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

// ------------------------------------------------------------------ 1. Balrog sword
function bladePhrase(band, mobile) {
  const sim = X.headless({ spell: 'S3', band, mode: 'STORY', seed: 0, mobile: !!mobile, weapon: 'dist06-boss', sigOrder: 0, sigBeats: [1.4, 7.2] });
  const P = sim.pool; let still = null;
  while (sim.time < 5) { sim.step(H, 300, 560); const rows = []; let moving = 0;
    for (let i = 0; i < P.live; i++) { if (!(P.flags[i] & F_SIG)) continue; if (Math.hypot(P.vx[i], P.vy[i]) > 1) moving++; rows.push({ type: P.type[i], hue: X.HUES[X.REMAP.rage[P.hue[i] | 0]][0] }); }
    if (rows.length && !moving) still = rows; if (moving) break; }
  return { still, last: sim.run.sig.last };
}
test('Balrog sword: flame edges with a white-hot fuller (RICE) down the blade', () => {
  for (const band of [1, 2, 3]) for (const mobile of [false, true]) {
    const r = bladePhrase(band, mobile); assert.ok(r.still && r.last.g === 'blade', 'blade formation');
    const white = r.still.filter(b => b.hue === 'white').length, flame = r.still.filter(b => b.hue === 'flame').length;
    assert.ok(white >= (mobile ? 5 : 8), `b${band} ${mobile ? 'mob' : 'pc'}: white-hot fuller ${white}`);
    assert.ok(flame >= white, `b${band}: flame edges ${flame} vs fuller ${white}`);
  }
});

test('Balrog sword: the lava walls rest while the sword is traced and held (no wall beat until it moves)', () => {
  for (const band of [1, 2, 3]) {
    const w = X.BOSS_WEAPONS['dist06-boss'];
    const run = X.makeRun('S3', { band, seed: 5, emitEnd: 11.4, weapon: w.list, sigOrder: 0, sigBeats: [1.4, 7.2] }), ctx = X.makeCtx({ mode: 'STORY', band, seed: 5 }), out = [];
    const wallIdx = new Set(run.layers.map((l, i) => l.kind === 'wall' ? i : -1).filter(i => i >= 0));
    let during = 0, outside = 0, upFrames = 0;
    for (let t = 0; t < 11; t += H) { X.frameCtx(ctx, 1071, 425, 300, 560, 300, 560, run.t); out.length = 0; ctx.live = 0; X.runStep(run, H, ctx, out);
      const S = run.sig, up = S && S.active && S.last && S.last.g === 'blade' && run.t - S.t0 < S.rel; if (up) upFrames++;
      for (const b of out) if (wallIdx.has(b.layer)) { if (up) during++; else outside++; } }
    assert.ok(upFrames > 30, 'sword up frames ' + upFrames);
    assert.ok(outside > 0, `b${band}: walls outside the sword`);
    assert.strictEqual(during, 0, `b${band}: wall bullets while the sword is formed`);
  }
});

test('Balrog sword: a filled tapered blade body with an outline is drawn under the bullets while it is formed', () => {
  let filled = 0, outlined = 0, glint = 0, order = 0;
  const frames = formedFrames(BOSS.balrog, 'blade', (api, s, m) => {
    const c = {}; api.__test.drawLayer(stubCtx(c), s, {});
    const body = (c.fills || []).filter(f => f.pts >= 10 && /255,\s*90,\s*26|ff5a1a|255,\s*1[0-9]{2},\s*[0-9]+/i.test(f.style));
    if (body.length) filled++;
    if ((c.strokes || []).some(x => x.closed && /^rgba\(7,4,13/.test(x.style))) outlined++;
    const fi = c.calls.indexOf('fill'), di = c.calls.lastIndexOf('drawImage'); if (fi >= 0 && di > fi) order++;
    if ((c.imgs || []).length) glint++;
  });
  assert.ok(frames > 20, 'formed frames ' + frames);
  assert.ok(filled >= frames * .8, `filled blade body on ${filled}/${frames} frames`);
  assert.ok(outlined >= frames * .8, `closed dark outline on ${outlined}/${frames} frames`);
  assert.ok(order >= frames * .8, 'bullets drawn over the body');
});

test('lava curtain is crimson (not hot magenta), keeps its ember rim and dark outline', () => {
  const lm = X.HUES[HI('lavam')]; assert.ok(crimson(lm[1]), 'lavam body ' + lm[1] + ' ' + JSON.stringify(hsv(lm[1])));
  assert.ok(lm[3], 'ember rim'); const c = hsv(lm[1]); assert.ok(!(c.h >= 290 && c.h <= 335), 'not magenta');
  // the walls (blue -> lava) are crimson
  assert.strictEqual(X.HUES[X.REMAP.rage[HI('blue')]][0], 'lavam');
});

// ------------------------------------------------------------------ 2. Lucifer orbs
test('Lucifer big curtain orbs are violet with a light outer stroke over the dark rim; the lances keep a crimson point', () => {
  for (const src of ['gold', 'red']) { const h = X.HUES[X.REMAP.lucifer[HI(src)]];
    assert.ok(violet(h[1]), `${src} -> ${h[0]} ${h[1]} is not violet`);
    assert.ok(h[3] && hsv(h[3]).v >= .85 && hsv(h[3]).s <= .35, `${src} -> ${h[0]}: light outer stroke ${h[3]}`); }
  const sim = X.headless({ spell: 'S7', band: 2, mode: 'STORY', seed: 0, weapon: 'a11-boss', sigOrder: 0, sigBeats: [1.4, 7.2] }), P = sim.pool, hues = new Set();
  while (sim.time < 3.4) { sim.step(H, 300, 560); for (let i = 0; i < P.live; i++) if (P.flags[i] & F_SIG) hues.add(X.HUES[P.hue[i] | 0][1]); }
  assert.ok([...hues].some(crimson), 'lance tips crimson: ' + [...hues]);
  // the light stroke is painted on BIG and ORB bodies
  const c = {}, g = stubCtx(c); X.bodyPaint(g, T.BIG, X.REMAP.lucifer[HI('gold')], 0, false);
  assert.ok((c.strokes || []).some(x => x.style === X.HUES[X.REMAP.lucifer[HI('gold')]][3] && x.w >= 1.2), 'BIG light rim stroke >= 1.2 px: ' + JSON.stringify(c.strokes));
});

// ------------------------------------------------------------------ 3. spell dim
const poly = [{ x: 10, y: 10 }, { x: 24, y: 10 }, { x: 24, y: 24 }, { x: 10, y: 24 }];
function dimmed(boss, o = {}) {
  const sb = makeEnv(o), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...boss });
  for (let k = 0; k < 3 * 60; k++) tick(sb, s); const m = api.__test.mem(s); assert.ok(m.dim > .9, 'dim up');
  return { sb, api, s, m };
}
const grey = st => { const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(st); return m ? [+m[1], +m[2], +m[3]] : null; };
test('spell dim: ~35% lighter, luminance only (neutral multiply, desaturation <= .06)', () => {
  const OLD = { rage: .5, envy: .4, lucifer: .46 };
  for (const [nm, fam] of [['balrog', 'rage'], ['envy', 'envy'], ['lucifer', 'lucifer']]) {
    const { api, s, m } = dimmed(BOSS[nm]); assert.ok(m.dimLevel <= OLD[fam] * .7 && m.dimLevel >= OLD[fam] * .5, `${fam} level ${m.dimLevel}`);
    const c = {}; api.__test.drawDim(stubCtx(c), s, m, {});
    const mul = [...(c.rects || []), ...(c.fills || [])].filter(r => r.op === 'multiply');
    assert.ok(mul.length >= 1, 'multiply'); for (const r of mul) { const v = grey(r.style); assert.ok(v && v[0] === v[1] && v[1] === v[2], 'neutral multiply ' + r.style); }
    for (const r of (c.rects || []).filter(r => r.op === 'saturation')) assert.ok(r.alpha <= .06 + 1e-9, 'desaturation ' + r.alpha);
  }
});
test('spell dim: lighter on the walkable floor than off it (floor edge stays readable)', () => {
  const { api, s, m } = dimmed(BOSS.envy, { duel: { polygon: () => poly } });
  m.wm = new Float64Array([1, 0, 0, 1, 0, 0]); m.wmOk = true;
  const c = {}; api.__test.drawDim(stubCtx(c), s, m, {});
  const mul = (c.fills || []).filter(r => r.op === 'multiply');
  assert.ok(mul.length >= 2, 'floor + off-floor multiply fills ' + JSON.stringify(c.fills));
  const off = mul.find(f => f.rule === 'evenodd'), on = mul.find(f => f.rule !== 'evenodd');
  assert.ok(off && on, 'evenodd outside + floor inside');
  assert.ok(grey(on.style)[0] > grey(off.style)[0], `floor ${on.style} lighter than outside ${off.style}`);
});

// ------------------------------------------------------------------ 4. Envy mirror
test('Envy mirror: an outlined oval frame (ellipse, glass line over a dark stroke) is drawn round the rim while the pane is up, closed once traced', () => {
  let ok = 0, closed = 0;
  const frames = formedFrames(BOSS.envy, 'mirror', (api, s, m) => {
    const c = {}; api.__test.drawLayer(stubCtx(c), s, {});
    if ((c.strokes || []).some(x => x.closed && /e2d8ff|226,\s*216,\s*255/i.test(x.style))) closed++;
    const st = (c.ellipse || 0) >= 2 ? (c.strokes || []) : [];
    if (st.some(x => /^rgba\(7,4,13/.test(x.style)) && st.some(x => /e2d8ff|226,\s*216,\s*255/i.test(x.style))) ok++;
  });
  assert.ok(frames > 20, 'mirror frames ' + frames); assert.ok(ok >= frames * .8, `outlined frame on ${ok}/${frames}`); assert.ok(closed >= frames * .3, `closed oval on ${closed}/${frames}`);
});
test('Envy bloom ring is not near-white glass (no white-pink cloud over the boss)', () => {
  const r = X.HUES[X.REMAP.envy[HI('yellow')]]; const c = hsv(r[1]);
  assert.ok(r[0] !== 'glass' && c.s >= .45, 'ring ' + r[0] + ' ' + r[1]);
});

// ------------------------------------------------------------------ 5. phone scale
test('phone bullets are drawn ~15% larger than PC (same type); trail lines >= 1.5 CSS px', () => {
  const size = mobile => { const sb = makeEnv({ innerWidth: mobile ? 700 : 1280 }), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.envy });
    for (let k = 0; k < 4 * 60; k++) tick(sb, s); const m = api.__test.mem(s), P = m.pool; P.live = Math.min(P.live, 1); P.x[0] = 640; P.y[0] = 470; P.type[0] = T.ORB; P.age[0] = 1; P.flags[0] = 0;
    const c = {}; api.__test.drawLayer(stubCtx(c), s, {}); const im = (c.imgs || []).filter(i => Math.abs(i.x - 640) < .5 && Math.abs(i.y - 470) < .5);
    return im.length ? im[im.length - 1].w : 0; };// the body pass draws after the glow pass
  const pc = size(false), ph = size(true); assert.ok(ph >= pc * 1.14 && ph <= pc * 1.25, `phone ${ph} vs pc ${pc}`);
  // trail (whip links) on phone: >= 1.5 CSS px for every stroke
  const k = .634 * 2; let n = 0;
  formedFrames(BOSS.balrog, 'whip', (api, s) => { const c = {}; api.__test.drawLayer(stubCtx(c, { k, w: 1688, h: 780, cssW: 844, cssH: 390 }), s, {});
    for (const x of c.strokes || []) { if (x.op === 'lighter') continue; n++; assert.ok(x.w * k / 2 >= 1.5 - 1e-9, 'stroke ' + (x.w * k / 2).toFixed(2) + ' CSS px'); } }, { innerWidth: 700 });
});

// ------------------------------------------------------------------ 6. band 3
test('band 3 escalates with a curved pattern of a new shape (not another wall)', () => {
  for (const sp of ['S3']) {
    const types = band => { const run = X.makeRun(sp, { band, seed: 2 }), ctx = X.makeCtx({ mode: 'STORY', band, seed: 2 }), out = [], ty = new Set(); let curved = 0;
      for (let t = 0; t < 10; t += H) { X.frameCtx(ctx, 1071, 425, 300, 560, 300, 560, run.t); out.length = 0; X.runStep(run, H, ctx, out); for (const b of out) { ty.add(b.type); if (b.amp || b.om) curved++; } }
      return { ty, curved }; };
    const b2 = types(2), b3 = types(3); const fresh = [...b3.ty].filter(t => !b2.ty.has(t));
    assert.ok(fresh.length >= 1, `${sp}: band 3 adds no new shape (${[...b3.ty]} vs ${[...b2.ty]})`);
    assert.ok(b3.curved >= 20 && b3.curved > b2.curved, `${sp}: curved bullets b3 ${b3.curved} vs b2 ${b2.curved}`);
    // a band-3 wall, if any, is not one more column of the band 1-2 wall shape
    const L = X.SPELLS.find(s => s.id === sp).layers, low = new Set(L.filter(l => l.kind === 'wall' && (l.bandMin || 1) < 3).map(l => l.p.type));
    assert.ok(!L.some(l => l.kind === 'wall' && (l.bandMin || 1) === 3 && low.has(l.p.type)), sp + ': band-3 layer is the same columns again');
  }
});

// ------------------------------------------------------------------ 7. native hostile rim
test('native hostile projectiles: a thin red hostile rim on the dark outline, still two arcs each', () => {
  const sb = makeEnv(), api = sb.__HAPIL_DANMAKU_RC240__, s = world({ ...BOSS.envy });
  for (let k = 0; k < 30; k++) tick(sb, s);
  const c0 = {}; api.__test.drawLayer(stubCtx(c0), s, {});
  s.hostileProjectiles = []; for (let i = 0; i < 10; i++) s.hostileProjectiles.push({ x: 10 + i * .3, y: 14, damage: 10, radius: .45 });
  const c1 = {}; api.__test.drawLayer(stubCtx(c1), s, {});
  assert.strictEqual((c1.arc || 0) - (c0.arc || 0), 20, 'two arcs per projectile');
  const red = (c1.strokes || []).filter(x => { const m = /^#([0-9a-f]{6})$/i.exec(x.style); return m && crimson(x.style); });
  assert.ok(red.length >= 1 && red.every(x => x.w <= 1.6), 'red rim strokes ' + JSON.stringify(red));
});

console.log(`rc240-r4-danmaku-unit: ${passed} tests OK`);
if (process.exitCode) console.error('rc240-r4-danmaku-unit: FAILED');
