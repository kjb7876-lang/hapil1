'use strict';
// RC240 review round 1 fixes for the danmaku layer (assets/rc240/danmaku-layer.js):
// weapon silhouettes from oriented bullets, clear of the boss body box, coherent release, iso floor
// squash for ground formations; boss-fitting palettes (lava, Lucifer); curtain thinned over the boss;
// spell card sized to the full name, moved off the boss, gone with the boss; spawns held through the
// boss warning and declarations held through the second-form white-out; thick pulsing telegraphs;
// native hostile projectiles outlined; a fading swing arc. RC240_SRC=<file> runs it against another copy.
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
const BX = 1071, BY = 425, BOX = { x0: BX - 58, x1: BX + 58, y0: BY - 98, y1: BY + 138 };// boss body box + margin (muzzle-relative)

// ------------------------------------------------------------------ formations
// Runs one phrase; returns the last still frame and, keyed by spawn point, positions at release and
// .4 s later.
function phrase(id, k, o = {}) {
  const sim = X.headless({ spell: 'S6', band: o.band || 2, mode: o.mode || 'STORY', seed: 0, mobile: !!o.mobile, weapon: id, sigOrder: k, sigBeats: [1.4, 7.2] });
  const P = sim.pool, hx = o.hx ?? 300, hy = o.hy ?? 560; let still = null, rel = null, later = null, relT = null;
  while (sim.time < 7) {
    sim.step(H, hx, hy, hx, hy);
    const rows = []; let moving = 0;
    for (let i = 0; i < P.live; i++) { if (!(P.flags[i] & F_SIG)) continue; if (Math.hypot(P.vx[i], P.vy[i]) > 1) moving++; rows.push({ x: P.x[i], y: P.y[i], type: P.type[i], key: P.ox[i].toFixed(2) + ',' + P.oy[i].toFixed(2) }); }
    if (!rows.length) continue;
    // Release = the end of the swing (the earliest scheduled release in the phrase buffer).
    const S = sim.run.sig, B = S && S.buf; let minR = 1e9; if (S && S.active) for (let j = 0; j < B.n; j++) if (B.r[j] < minR) minR = B.r[j];
    const released = S && S.active && sim.run.t - S.t0 >= minR;
    if (!moving && relT == null) still = rows;
    if (released && relT == null) { relT = sim.time; rel = rows; }
    if (relT != null && sim.time >= relT + .4) { later = rows; break; }
  }
  return { still, rel, later };
}
const SHAPES = [['mirror', 'b03-boss', 0], ['wings', 'a11-boss', 0], ['blade', 'dist06-boss', 0], ['whip', 'dist06-boss', 1]];

test('weapon silhouettes: elongated oriented bullets (RICE/NEEDLE >= 60%, BIG+ORB <= 20%), none in the boss body box', () => {
  for (const [g, id, k] of SHAPES) for (const band of [1, 2, 3]) {
    const r = phrase(id, k, { band }); assert.ok(r.still && r.still.length >= 30, g + ' formation drawn');
    const n = r.still.length, elong = r.still.filter(b => b.type === T.RICE || b.type === T.NEEDLE).length, round = r.still.filter(b => b.type === T.BIG || b.type === T.ORB).length;
    assert.ok(elong / n >= .6, `${g} b${band}: elongated ${elong}/${n}`);
    assert.ok(round / n <= .2, `${g} b${band}: BIG/ORB ${round}/${n}`);
    const inBox = r.still.filter(b => b.x > BOX.x0 && b.x < BOX.x1 && b.y > BOX.y0 && b.y < BOX.y1).length;
    assert.strictEqual(inBox, 0, `${g} b${band}: ${inBox} bullets on the boss body box`);
  }
});

test('mirror is a cracked oval pane, not a dashed rectangle (few bullets on the bounding-box edges)', () => {
  const r = phrase('b03-boss', 0, { band: 2 }), pts = r.still;
  const x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
  const onEdge = pts.filter(p => Math.min(p.x - x0, x1 - p.x, p.y - y0, y1 - p.y) < 8).length;
  assert.ok(onEdge / pts.length < .35, `edge share ${onEdge}/${pts.length}`);
});

// Shape kept through the first .4 s of travel: Procrustes with translation + uniform scale only,
// residual RMS <= 9% of the silhouette's RMS radius.
function residual(a, b) {
  const A = new Map(a.map(p => [p.key, p])), pairs = b.filter(p => A.has(p.key)).map(p => [A.get(p.key), p]);
  if (pairs.length < 12) return { r: 1, n: pairs.length };
  const ca = [0, 0], cb = [0, 0]; for (const [p, q] of pairs) { ca[0] += p.x; ca[1] += p.y; cb[0] += q.x; cb[1] += q.y; }
  ca[0] /= pairs.length; ca[1] /= pairs.length; cb[0] /= pairs.length; cb[1] /= pairs.length;
  let va = 0, cov = 0; for (const [p, q] of pairs) { const ax = p.x - ca[0], ay = p.y - ca[1], bx = q.x - cb[0], by = q.y - cb[1]; va += ax * ax + ay * ay; cov += ax * bx + ay * by; }
  const s = cov / va; let e = 0; for (const [p, q] of pairs) { const ax = p.x - ca[0], ay = p.y - ca[1], bx = q.x - cb[0], by = q.y - cb[1]; e += (bx - s * ax) ** 2 + (by - s * ay) ** 2; }
  return { r: Math.sqrt(e / pairs.length) / Math.sqrt(va / pairs.length), n: pairs.length };
}
test('release is coherent: the silhouette is still recognisable .4 s into its travel', () => {
  for (const [g, id, k] of SHAPES) for (const mode of ['STORY', 'DREAM']) {
    const r = phrase(id, k, { band: 2, mode }); assert.ok(r.rel && r.later, g + ' released');
    const q = residual(r.rel, r.later);
    if (process.env.VERBOSE) console.log(g, mode, q.r.toFixed(3), q.n);
    assert.ok(q.r <= .09, `${g} ${mode}: shape residual ${q.r.toFixed(3)} over ${q.n} bullets`);
  }
});

// (The sound rings are arcs of 2:1 ellipses, but their fan is not a full ellipse, so only the
// hexagram's bounding box can show the squash; the rings are checked on the captures.)
test('ground-area formations lie on the floor: the hexagram sigil is squashed ~2:1', () => {
  for (const [id, k] of [['b08-boss', 0], ['b09-boss', 0]]) {
    const r = phrase(id, k, { band: 2, hx: 300, hy: 520 }), pts = r.still;
    const w = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x)), h = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y));
    assert.ok(w / h >= 1.5, `${id}: ${w.toFixed(0)}x${h.toFixed(0)}`);
  }
});

// ------------------------------------------------------------------ palette
test('palette fits the boss: lava = white-hot magenta/violet with an ember rim (no blue/cyan), Lucifer = crimson/violet (no gold/yellow/white)', () => {
  const used = new Set(); for (const sp of X.SPELLS) for (const l of sp.layers) { if (Number.isFinite(l.p.hue)) used.add(l.p.hue); if (Number.isFinite(l.p.hue2)) used.add(l.p.hue2); }
  for (const nm of ['white', 'violet', 'cyan', 'magenta', 'red', 'orange']) used.add(X.HUES.findIndex(h => h[0] === nm));// weapon edge/accents, volleys
  const names = fam => new Set([...used].map(h => X.HUES[X.REMAP[fam][h]][0]));
  const rage = names('rage');
  for (const b of ['blue', 'cyan', 'gold', 'yellow', 'orange']) assert.ok(!rage.has(b), 'rage uses ' + b);
  for (const h of rage) if (h !== 'white') { const row = X.HUES.find(r => r[0] === h); assert.ok(row[3], 'rage body ' + h + ' has an ember rim'); }
  const luc = names('lucifer');
  for (const b of ['gold', 'yellow', 'white', 'orange', 'cyan']) assert.ok(!luc.has(b), 'lucifer uses ' + b);
});

// ------------------------------------------------------------------ runtime env
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
  if (o.feel) sb.__HAPIL_STG_FEEL_RC240__ = o.feel;
  if (o.form) sb.__HAPIL_BOSS_FORM_RC240__ = o.form;
  let g = 0; while (!sb.__HAPIL_DANMAKU_RC240__.installed && g++ < 5) sb.__HAPIL_DANMAKU_RC240__.__test.install();
  return sb;
}
function world(boss) {
  return { zone: 'z1', time: 100, hp: 1e6, maxHp: 1e6, x: 12, y: 20, enemies: [boss], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], __core: { x: 300, y: 560 },
    phaseStub: { ownerId: boss.id, serial: 0, index: 0, band: 2, stage: 'active', elapsed: 0, remaining: 12, duration: 12 } };
}
function tick(sb, s, dt = H) { const ph = s.phaseStub; if (ph && ph.stage === 'active') { ph.elapsed += dt; ph.remaining = Math.max(0, ph.duration - ph.elapsed); } s.time += dt; s.hp = s.maxHp; sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
const envyBoss = () => ({ id: 'b03-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '호텔 부매니저 · 레비아탄', fam: 'envy' });
function stubCtx(c, o = {}) {
  const W = o.w || 1280, Hh = o.h || 720;
  const ctx = { canvas: { width: W, height: Hh, getBoundingClientRect: () => ({ width: W, height: Hh }) }, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px x', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineDashOffset: 0, lineCap: 'butt', lineJoin: 'miter',
    getTransform: () => ({ a: o.k || 1, b: 0, c: 0, d: o.k || 1, e: 0, f: 0 }), createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText(t) { const px = +(/(\d+)px/.exec(this.font) || [0, 10])[1]; return { width: String(t).length * px * .95 }; },
    drawImage(img, ...a) { c.drawImage = (c.drawImage || 0) + 1; c.calls.push('drawImage'); const dx = a.length >= 8 ? a[4] : a[0], dy = a.length >= 8 ? a[5] : a[1], dw = a.length >= 8 ? a[6] : a[2]; (c.imgs ||= []).push({ x: dx + dw / 2, y: dy + dw / 2, alpha: this.globalAlpha }); },
    stroke() { c.stroke = (c.stroke || 0) + 1; c.calls.push('stroke'); (c.strokes ||= []).push({ w: this.lineWidth, style: this.strokeStyle, alpha: this.globalAlpha }); },
    fillText(t, x, y) { (c.text ||= []).push({ t: String(t), x, y, font: this.font }); } };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'fill', 'moveTo', 'lineTo', 'closePath', 'fillRect', 'setTransform', 'setLineDash', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'clip', 'ellipse'])
    ctx[k] = function () { c[k] = (c[k] || 0) + 1; c.calls.push(k); };
  let blur = 0; Object.defineProperty(ctx, 'shadowBlur', { get: () => blur, set: v => { blur = v; if (v) c.blur = (c.blur || 0) + 1; } });
  return ctx;
}

// ------------------------------------------------------------------ beat order
test('beat order: nothing spawns while the boss warning is up (even after a world reset); spell may be declared at 1 s', () => {
  let warn = null;
  const feel = { onOwner(s, m, a) { warn = { at: s.time, dur: 2.2, big: true }; m.warnHoldUntil = s.time + 1; }, state: () => ({ warn: warn ? { ...warn } : null }), reset() {} };
  const sb = makeEnv({ feel }), api = sb.__HAPIL_DANMAKU_RC240__, s = world(envyBoss());
  tick(sb, s); const t0 = warn.at; let maxLive = 0, sawRun = false;
  while (s.time < t0 + 2.2) { tick(sb, s); const m = api.__test.mem(s); maxLive = Math.max(maxLive, m.pool.live); if (m.run) sawRun = true; if (Math.abs(s.time - t0 - .5) < H / 2) { m.warnHoldUntil = -1; } }
  assert.strictEqual(maxLive, 0, 'bullets live during the warning: ' + maxLive);
  assert.ok(sawRun, 'spell declared during the warning tail (card first, bullets after)');
  for (let k = 0; k < 150; k++) tick(sb, s);
  assert.ok(api.__test.mem(s).pool.live > 0, 'spawns resume after the warning');
});

test('beat order: the feel module\'s warnUntil / warningActive hooks hold spawns the same way', () => {
  let warn = null;
  const feel = { onOwner(s, m) { warn = { at: s.time, dur: 2.2 }; m.warnHoldUntil = s.time + 1; }, warningActive: s => !!warn && s.time < warn.at + warn.dur, warnUntil: s => warn && s.time < warn.at + warn.dur ? warn.at + warn.dur : -1, reset() {} };
  const sb = makeEnv({ feel }), api = sb.__HAPIL_DANMAKU_RC240__, s = world(envyBoss());
  tick(sb, s); const t0 = warn.at; let maxLive = 0;
  while (s.time < t0 + 2.2) { tick(sb, s); maxLive = Math.max(maxLive, api.__test.mem(s).pool.live); }
  assert.strictEqual(maxLive, 0, 'bullets during the warning');
  for (let k = 0; k < 150; k++) tick(sb, s); assert.ok(api.__test.mem(s).pool.live > 0, 'resumes');
});

test('beat order: no spell declaration while boss-form reports transforming(s)', () => {
  let until = 101; const form = { transforming: s => s.time < until, form: () => null };
  const sb = makeEnv({ form }), api = sb.__HAPIL_DANMAKU_RC240__, s = world(envyBoss());
  for (let k = 0; k < 50; k++) { tick(sb, s); assert.strictEqual(api.__test.mem(s).run, null); }
  for (let k = 0; k < 20; k++) tick(sb, s); assert.ok(api.__test.mem(s).run);
});

test('beat order: no spell declaration under the second-form white-out', () => {
  let busyUntil = 101;
  const form = { form: (s, id) => ({ stage: 1, at: 100, transforming: s.time < busyUntil }) };
  const sb = makeEnv({ form }), api = sb.__HAPIL_DANMAKU_RC240__, s = world(envyBoss());
  for (let k = 0; k < 50; k++) { tick(sb, s); assert.strictEqual(api.__test.mem(s).run, null, 'declared at ' + s.time.toFixed(2)); }
  for (let k = 0; k < 20; k++) tick(sb, s);
  assert.ok(api.__test.mem(s).run, 'declared after the transformation');
});

// ------------------------------------------------------------------ spell card
test('spell card shows every full spell name (PC and phone), never an ellipsis', () => {
  for (const [w, h, inner] of [[1280, 720, 1280], [812, 375, 812]]) {
    const sb = makeEnv({ innerWidth: inner }), api = sb.__HAPIL_DANMAKU_RC240__, s = world(envyBoss());
    for (let k = 0; k < 10; k++) tick(sb, s);
    const m = api.__test.mem(s); assert.ok(m.banner, 'banner');
    for (const sp of X.SPELLS) for (const age of [.6, 3]) {
      const c = { calls: [] }, ctx = stubCtx(c, { w, h }); m.banner.name = sp.name; m.banner.born = s.time - age; m.banner.result = null;
      api.__test.drawBanner(ctx, s, m, {}, m.banner, w, h);
      const texts = (c.text || []).map(r => r.t);
      assert.ok(texts.includes(sp.name), `${w}px: "${sp.name}" drawn as ${JSON.stringify(texts)}`);
      assert.ok(!texts.some(t => t.endsWith('…')), `${w}px: ellipsis in ${JSON.stringify(texts)}`);
    }
  }
});

test('phone: a card that would cover the boss moves to the top centre', () => {
  const sb = makeEnv({ innerWidth: 812 }), api = sb.__HAPIL_DANMAKU_RC240__, s = world(envyBoss());
  for (let k = 0; k < 10; k++) tick(sb, s);
  const m = api.__test.mem(s); m.mobile = true;
  m.bossScr = new Float64Array([560, 60, 760, 260]); m.bossScrOk = true; m.wmOk = true;
  const c = { calls: [] }, ctx = stubCtx(c, { w: 812, h: 375 }); m.banner.born = s.time - 3;
  api.__test.drawBanner(ctx, s, m, {}, m.banner, 812, 375);
  const name = c.text.find(r => r.t === m.banner.name); assert.ok(name, 'name drawn');
  assert.ok(name.y < 60, 'card at the top: name y ' + name.y.toFixed(0));
  const left = Math.min(...c.text.map(r => r.x)); assert.ok(left < 560 || name.y < 60);
});

test('spell card goes the moment the boss dies', () => {
  const sb = makeEnv(), api = sb.__HAPIL_DANMAKU_RC240__, boss = envyBoss(), s = world(boss);
  for (let k = 0; k < 30; k++) tick(sb, s);
  const m = api.__test.mem(s); assert.ok(m.banner);
  boss.hp = 0; tick(sb, s);
  assert.strictEqual(m.banner, null, 'card cleared on death');
  const c = { calls: [] }; api.__test.drawLayer(stubCtx(c), s, {});
  assert.ok(!(c.text || []).length, 'nothing drawn after death');
});

// ------------------------------------------------------------------ draw
function envDraw(o = {}) {
  const sb = makeEnv(o), api = sb.__HAPIL_DANMAKU_RC240__, boss = o.boss || envyBoss(), s = world(boss);
  sb.document.createElement = () => ({ width: 0, height: 0, getContext: () => stubCtx({ calls: [] }) });
  return { sb, api, s, boss };
}
test('curtain over the boss body is drawn thin (<= 35% alpha), elsewhere at full strength', () => {
  const { sb, api, s } = envDraw();
  for (let k = 0; k < 6 * 60; k++) tick(sb, s);
  const m = api.__test.mem(s), P = m.pool; assert.ok(P.live > 20);
  const mz = m.lastMuzzle; P.x[0] = mz.x + 5; P.y[0] = mz.y + 10; P.flags[0] = 0; P.age[0] = 1; P.type[0] = T.ORB;
  const c = { calls: [] }; api.__test.drawLayer(stubCtx(c), s, {});
  const on = c.imgs.filter(i => Math.abs(i.x - P.x[0]) < .5 && Math.abs(i.y - P.y[0]) < .5);
  assert.ok(on.length >= 1 && on.every(i => i.alpha <= .35), 'over-boss alpha ' + JSON.stringify(on));
});

test('telegraph lines: >= 2.4 CSS px (3+ on phone) with a dark underlay and a pulse', () => {
  for (const [mobile, k, min] of [[false, .82, 2.4], [true, .634 * 2, 3]]) {
    const { sb, api, s } = envDraw({ innerWidth: mobile ? 812 : 1280 });
    s.phaseStub.stage = 'rest';
    let m; for (let i = 0; i < 400; i++) { tick(sb, s); m = api.__test.mem(s); if (m.tele && m.tele.some(v => v.shot === 0)) break; }
    assert.ok(m.tele.some(v => v.shot === 0), 'a telegraph is up');
    const widths = [];
    for (const dt of [0, .05]) { s.time += dt; const c = { calls: [] }, ctx = stubCtx(c, { k: mobile ? k : k * 2, w: mobile ? 1624 : 2560, h: mobile ? 750 : 1440 });
      ctx.canvas.getBoundingClientRect = () => ({ width: mobile ? 812 : 1280, height: mobile ? 375 : 720 });
      api.__test.drawLayer(ctx, s, {}); const kc = (mobile ? k : k * 2) / 2;
      const st = c.strokes.filter(x => x.style !== '#ffffff' && !/^rgba\(6,3,12/.test(x.style) && !/^rgba\(7,4,13/.test(x.style));
      assert.ok(c.strokes.some(x => /^rgba\(6,3,12/.test(x.style)), 'dark underlay');
      const css = Math.max(...st.map(x => x.w * kc)); widths.push(css);
      assert.ok(css >= min, `${mobile ? 'phone' : 'pc'} line ${css.toFixed(2)} CSS px`); }
    assert.ok(Math.abs(widths[0] - widths[1]) > .05, 'pulses: ' + widths.map(v => v.toFixed(2)));
  }
});

test('native hostile projectiles get the outline + white core, damaging ones only, capped, no images', () => {
  const { sb, api, s } = envDraw();
  for (let k = 0; k < 30; k++) tick(sb, s);
  s.hostileProjectiles = []; for (let i = 0; i < 100; i++) s.hostileProjectiles.push({ x: 10 + i * .05, y: 14, damage: i % 5 ? 10 : 0, friendly: i % 7 === 0, radius: .45 });
  const c0 = { calls: [] }, saved = s.hostileProjectiles; s.hostileProjectiles = []; api.__test.drawLayer(stubCtx(c0), s, {}); s.hostileProjectiles = saved;
  const c1 = { calls: [] }; api.__test.drawLayer(stubCtx(c1), s, {});
  const arcs = (c1.arc || 0) - (c0.arc || 0), want = Math.min(64, saved.filter(q => q.damage > 0 && !q.friendly).length);
  assert.ok(arcs === 2 * want, `arcs ${arcs} for ${want} damaging projectiles`);
  assert.strictEqual(c1.drawImage || 0, c0.drawImage || 0, 'no extra images');
  s.hostileProjectiles.push({ x: NaN, y: 1, damage: 5 }); const c2 = { calls: [] }; api.__test.drawLayer(stubCtx(c2), s, {});
});

test('swing arc: fading arcs stroked behind the bullets while a formation swings', () => {
  const { sb, api, s } = envDraw({ boss: { id: 'dist06-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '발록 · 지옥의 문지기', fam: 'rage' } });
  let arcFrames = 0;
  for (let k = 0; k < 12 * 60; k++) {
    tick(sb, s); const m = api.__test.mem(s); const S = m.run && m.run.sig; if (!S || !S.active) continue;
    const c = { calls: [] }; api.__test.drawLayer(stubCtx(c), s, {});
    const la = c.calls.lastIndexOf('arc');// bullets (drawImage) are drawn after the arc strokes
    if (la >= 0 && c.calls.indexOf('stroke', la) > la && c.calls.lastIndexOf('drawImage') > la) arcFrames++;
    assert.ok(!(c.blur > 0)); assert.strictEqual(c.save || 0, c.restore || 0);
  }
  assert.ok(arcFrames >= 15, 'swing arc frames ' + arcFrames);
});

console.log(`rc240-review-danmaku-unit: ${passed} tests OK`);
if (process.exitCode) console.error('rc240-review-danmaku-unit: FAILED');
