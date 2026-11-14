'use strict';
// RC240 fix round 3 (visual review round 3) for stg-feel / arcade-kit / boss-form and the danmaku spell card:
// 1. warning tint is an edge-only, luminance-only vignette (playfield centre keeps native hue and luminance)
// 2. heart ring drawn after the native RC128 HUD (debuff labels) via the feedback seam; hero rim during
//    spells; thin outline on phone
// 3. familiars are companion motes (soft glow, trail, muzzle flash), no white bullet core
// 4. presentation queue: warning dropped instantly on the kill, title band in the top band and thinner,
//    phone banners clear of the left HUD stack, callouts held behind the second-form banner, "제2형태" tag
//    on the spell card after the second form, tally anchored clear of the hero row
// 5. second-form white-out shaped radially from the boss after its first frame (no full-frame haze)
// 6. HUD: PC pips ~1.5x on a backing plate, score always visible in a fight, bigger x2 badge
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

// ---------------------------------------------------------------- 1. warning vignette
test('warning vignette: edge-only (clear centre), luminance-only stops (no hue cast), at most ~35% darkening', () => {
  const { env, s } = arena(); run(env, s, .6); assert.ok(env.feel.warningActive(s), 'fixture: warning up');
  for (let k = 0; k < 40; k++) {
    tick(env, s); const l = feelScreen(env, s);
    const v = l.fills.filter(f => f.style && f.style.radial && f.style.radial[5] >= 600);
    assert.ok(v.length >= 1, 'vignette drawn');
    for (const f of v) {
      const [cx, cy, r0, , , r1] = f.style.radial; assert.ok(r0 >= .38 * 720, 'clear centre radius ' + r0);
      for (const [o, c] of f.style.stops) { const q = rgba(c); if (!q) continue;
        assert.ok(Math.max(q[0], q[1], q[2]) - Math.min(q[0], q[1], q[2]) <= 14, 'no hue cast: ' + c);
        assert.ok(q[3] * f.alpha <= .55, 'darkening at most ~.55 at the very edge: ' + c + ' x ' + f.alpha.toFixed(2));
        if (o <= .3) assert.ok(q[3] * f.alpha <= .06, 'inner ring stays native: ' + o + ' ' + c); }
    }
  }
});

// ---------------------------------------------------------------- 4a. warning dropped instantly on the kill
test('kill: the warning band is dropped on the kill frame (no ghost under the kill beat)', () => {
  const { env, s } = arena(); run(env, s, .8); assert.ok(env.feel.warningActive(s));
  const m = env.rc.world(s); ident(m);
  s.enemies[0].hp = 0; tick(env, s); assert.ok(env.feel.killBeat(s), 'kill beat');
  assert.strictEqual(env.feel.warningActive(s), false, 'warning gone at once');
  tick(env, s, .1); assert.ok(!has(feelScreen(env, s), /경고/), 'no warning text during the kill');
});

// ---------------------------------------------------------------- 2. heart ring after the native HUD
function ringEnv(W = 1280, H = 720) {
  const { env, s } = arena({ feedback: true, innerWidth: W, innerHeight: H }); run(env, s, 3); const m = env.rc.world(s); ident(m);
  env.recheck(); env.recheck(); feelScreen(env, s, {}, W, H); return { env, s, m }; // frame order: RC240 screen pass, then the native HUD
}
test('heart ring: drawn after the native debuff label through the RC128 feedback seam', () => {
  const { env, s } = ringEnv(); const F = env.sb.__HAPIL_FEEDBACK_RC128__; const tone = env.feel.heroTone(s);
  const log = {}; F.draw(stubCtx(log), s, { width: 1280, height: 720 }, {});
  const li = log.seq.findIndex(e => e[0] === 'text' && /흡혈 억제/.test(e[1].t)); assert.ok(li >= 0, 'native label drawn');
  const ri = log.seq.findIndex((e, i) => i > li && e[0] === 'stroke' && e[1].style === tone.body && e[1].lw >= 1.4);
  assert.ok(ri > li, 'hero-colour ring after the label: ' + JSON.stringify(log.seq.slice(0, 8).map(e => e[0])));
  // de-duplicated: the next frame's RC240 screen pass leaves the ring to the feedback pass
  tick(env, s); const l2 = feelScreen(env, s); assert.ok(!l2.strokes.some(x => x.style === tone.body), 'no second ring in the RC240 screen pass');
});
test('heart ring: wrapping the feedback seam is stable (no chain growth across rechecks), members kept', () => {
  const { env } = ringEnv(); const depth = () => { let d = 0, o = env.sb.__HAPIL_FEEDBACK_RC128__; while (o && d < 50) { o = Object.getPrototypeOf(o); d++; } return d; };
  const d0 = depth(); for (let i = 0; i < 6; i++) env.recheck(); assert.strictEqual(depth(), d0, 'stable'); assert.ok(env.sb.__HAPIL_FEEDBACK_RC128__.heroes.hunter, 'members kept');
});
test('heart ring: subtle hero rim (soft additive halo around the hero) while a spell runs', () => {
  const { env, s, m } = ringEnv(); assert.ok(m.run || m.banner, 'fixture: spell up');
  const log = {}; env.sb.__HAPIL_FEEDBACK_RC128__.draw(stubCtx(log), s, {}, {});
  const hx = m.hx, hy = m.hy; const halo = log.images.filter(i => i.op === 'lighter' && Math.abs(i.a[0] + i.a[2] / 2 - hx) < 6 && i.a[3] >= 60 && i.alpha <= .5);
  assert.ok(halo.length >= 1, 'rim halo around the hero ' + JSON.stringify(log.images.map(i => [i.op, i.alpha, i.a.map(Math.round)])));
});
test('heart ring: phone keeps a thin outline (no heavy dark disc burying the hero)', () => {
  const { env, s } = ringEnv(844, 390); const log = {}; env.sb.__HAPIL_FEEDBACK_RC128__.draw(stubCtx(log, 844, 390), s, {}, {});
  const tone = env.feel.heroTone(s); assert.ok(log.strokes.some(x => x.style === tone.body), 'ring drawn');
  assert.ok(Math.max(...log.strokes.filter(x => /0a0612|ffffff/i.test(x.style) || x.style === tone.body).map(x => x.lw)) <= 3, 'thin strokes on phone');
  assert.ok(!log.fills.some(f => f.style && f.style.radial && f.alpha > .4), 'no heavy separation disc on phone');
});

// ---------------------------------------------------------------- 3. familiars as companion motes
test('familiars: companion motes (soft additive glow, trail), no white bullet core; muzzle flash when they fire', () => {
  const { env, s } = arena(); run(env, s, .5); const k = env.kit.__test.worlds.get(s); k.points = 14; k.level = 4; run(env, s, .5);
  for (const sh of k.shots) sh.on = false; for (const F of k.fam) F.flash = -9;
  const l = worldDraw(env, s);
  assert.ok(!l.fills.some(f => /^#fff(fff)?$/i.test(String(f.style)) || /rgba\(255,\s*255,\s*255/.test(String(f.style))), 'no white core fills');
  const glow = l.images.filter(i => i.op === 'lighter').length; assert.ok(glow >= 4, 'soft glow sprite per mote ' + glow);
  for (const F of k.fam) F.flash = s.time; const l2 = worldDraw(env, s);
  assert.ok(l2.images.filter(i => i.op === 'lighter').length >= glow + 4, 'muzzle flash sprite per firing mote');
});

// ---------------------------------------------------------------- 4b. presentation queue
function bfEnv(opts = {}) {
  const timers = [];
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } set src(v) { this._s = v; } get src() { return this._s; } }
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp,
    location: { search: '?rc240=1' }, innerWidth: opts.innerWidth ?? 1280, innerHeight: opts.innerHeight ?? 720, setTimeout: fn => { timers.push(fn); return 1; }, setInterval: () => 0, performance: { now: () => 0 }, Image: FakeImage, requestAnimationFrame: () => 0,
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx({}), toDataURL: () => 'data:,' }), querySelector: () => null, body: null } };
  sb.window = sb; sb.globalThis = sb; let ps = (c, a) => a.sprite;
  sb.__HAPIL_RC86_BRIDGE__ = { project, zoneActors: z => (/^rest|^hub/.test(z) ? [] : [{ id: 'z-' + z }]), actor: () => null, runtimeSprite: (c, p, f) => p ?? f, get phaseSprite() { return ps; }, set phaseSprite(v) { ps = v; } };
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ afterHit() {}, render() {}, background() {}, imminent: () => null });
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ mode: s => s?.gameModeV31346 ?? 'STORY' });
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { state: { current: null }, cache: { current: {} }, settings: { current: {} } } };
  vm.createContext(sb); vm.runInContext(src('boss-form.js'), sb, { filename: 'boss-form.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  return sb.__HAPIL_BOSS_FORM_RC240__;
}
const envy = (o = {}) => ({ id: 'b03-boss', name: '레비아탄', boss: true, x: 24, y: 12, hp: 37197, maxHp: 37197, humanPhase0: true, phaseCount: 3, phaseSprites: ['a', 'b_human', 'c_demon.webp'], sprite: 'b', ...o });
const bw = (o = {}) => ({ x: 8, y: 12, hp: 200, maxHp: 240, time: 100, zone: 'ep1b03', gameModeV31346: 'STORY', activeHeroId: 'hunter', enemies: [], effects: [], ...o });

test('title card: in the top band above the arena (where the warning sits) and thinner, PC', () => {
  const api = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += .6; api.__test.tick(s, .1);
  api.__test.render(stubCtx({}, 2560, 1440), s, {}); const B = api.__test.lastBand();
  assert.ok(B.cy <= 1440 * .2, 'top band cy ' + B.cy); assert.ok(B.bh <= 60 * 2 && B.bh >= 60, 'thinner band ' + B.bh); assert.ok(B.bw >= 2560, 'full width');
});
test('phone: title card and second-form banner stay clear of the left HUD stack (pips, F button) and the hero row', () => {
  const api = bfEnv({ innerWidth: 844, innerHeight: 390 }); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += .6; api.__test.tick(s, .1);
  api.__test.render(stubCtx({}, 1688, 780), s, {}); let B = api.__test.lastBand();
  assert.ok(B.x0 >= 156 * 2 - 1 && B.cy + B.bh / 2 <= 120 * 2, 'title clear of left HUD / hero row ' + JSON.stringify(B));
  s.time += 3; api.__test.tick(s, .1); s.enemies[0].hp = 100; s.time += .1; api.__test.tick(s, .1); s.time += .8; api.__test.tick(s, .1);
  const log = {}; api.drawOverlay(stubCtx(log, 1688, 780), s, {}, 844, 390); assert.ok(has(log, /제2형태/), 'form banner drawn'); B = api.__test.lastBand();
  assert.ok(B.x0 >= 156 && B.x0 + B.bw <= 844 - 50 && B.cy + B.bh / 2 <= 120, 'form banner clear of pips/F and hero row ' + JSON.stringify(B));
});
test('second form: formStage accessor; the spell card carries a "제2형태" tag afterwards (no new spell name)', () => {
  const api = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60);
  assert.strictEqual(typeof api.formStage, 'function'); assert.strictEqual(api.formStage(s, 'b03-boss'), 0);
  s.enemies[0].hp = 100; s.time += .1; api.__test.tick(s, .1); assert.strictEqual(api.formStage(s, 'b03-boss'), 1);
  const form = { titleUntil: () => -1, formBannerUntil: () => -1, transforming: () => false, formStage: () => 1 };
  const { env, s: w } = arena({ form }); run(env, w, 4); const m = env.rc.world(w); assert.ok(m.banner);
  const l = layerScreen(env, w); assert.ok(l.texts.some(x => x.t === m.banner.name), 'same spell name'); assert.ok(has(l, /제2형태/), 'second-form tag ' + JSON.stringify(l.texts.map(x => x.t)));
});
test('callouts (spell result) wait behind the second-form banner, then show', () => {
  let fb = -1; const form = { titleUntil: () => -1, formBannerUntil: () => fb, transforming: () => false };
  const { env, s } = arena({ form }); run(env, s, 4); fb = s.time + 1;
  env.feel.callout(s, '주문 격파!  공명 +12', '#ffe59a', 1.3, 'big'); tick(env, s);
  assert.ok(!has(feelScreen(env, s), /주문 격파/), 'held under the banner');
  run(env, s, 1.05); fb = -1; tick(env, s); assert.ok(has(feelScreen(env, s), /주문 격파/), 'shown after the banner');
});
test('tally: anchored high, clear of the hero row and its status tag (PC and phone)', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) {
    const { env, s } = arena({ innerWidth: W, innerHeight: H, world: { y: W < 900 ? 10 : 20, x: W < 900 ? 8 : 12 } }); run(env, s, 3); const m = env.rc.world(s); ident(m);
    s.enemies[0].hp = 0; tick(env, s); run(env, s, 1.6); const l = feelScreen(env, s, {}, W, H);
    const head = textAt(l, /격파 결산/); assert.ok(head, 'tally'); const ys = l.texts.filter(x => x.y >= head.y).map(x => x.y);
    const heroTop = m.hy - (W < 900 ? 60 : 90); // status tag + the tally's dark backing strip
    assert.ok(Math.max(...ys) <= heroTop, W + ': tally bottom ' + Math.max(...ys) + ' above the hero tag ' + heroTop);
  }
});

// ---------------------------------------------------------------- 5. second-form white-out
test('PC second-form white-out: radial from the boss after the first frame, no full-frame lift', () => {
  const api = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += 3; api.__test.tick(s, .1);
  s.enemies[0].hp = 100; s.time += .02; api.__test.tick(s, .02);
  const lift = age => { const t0 = api.form(s, 'b03-boss').at; s.time = t0 + age; api.__test.tick(s, 0);
    api.__test.render(stubCtx({}, 1280, 720), s, {}); const log = {}; api.drawOverlay(stubCtx(log, 1280, 720), s, {}, 1280, 720);
    const f = log.fillRects.find(r => r.style && r.style.radial && r.w >= 1280); if (!f) return 0;
    const [cx, cy, , , , R] = f.style.radial, st = f.style.stops.map(([o, c]) => [o, rgba(c)[3]]);
    const at = d => { const u = d / R; if (u >= 1) return 0; for (let i = 1; i < st.length; i++) if (u <= st[i][0]) { const [o0, a0] = st[i - 1], [o1, a1] = st[i]; return a0 + (a1 - a0) * (u - o0) / Math.max(1e-6, o1 - o0); } return 0; };
    let sum = 0, n = 0; for (let y = 0; y <= 720; y += 40) for (let x = 0; x <= 1280; x += 40) { sum += at(Math.hypot(x - cx, y - cy)) * f.alpha; n++; } return sum / n; };
  const l1 = lift(.2), l2 = lift(.35);
  assert.ok(l1 <= .05 && l2 <= .03, 'mean full-frame lift after the first frame: ' + l1.toFixed(3) + ' / ' + l2.toFixed(3));
});

// ---------------------------------------------------------------- 6. HUD
test('HUD: PC pips ~1.5x (r >= 9.5) on a backing plate; phone stays compact', () => {
  const K = makeEnv().kit.__test; assert.ok(K.PIP_R.pc >= 9.5, 'pc pip ' + K.PIP_R.pc); assert.ok(K.PIP_R.mobile <= 7, 'phone compact');
  const pc = K.hudBox(1280, 643, false); assert.ok(pc[3] >= 34 && pc[1] + pc[3] <= 643 && pc[1] > 560, 'pc box ' + pc);
  const { env, s } = arena(); run(env, s, 1); const l = feelScreen(env, s);
  assert.ok(l.fills.some(f => /#0[0-9a-f]{5}/i.test(String(f.style)) && f.alpha >= .7) && l.strokes.some(x => /c9a65a/i.test(String(x.style))), 'dark plate with a gold border');
});
test('score: always visible during a fight (also at 0), bright', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) {
    const { env, s } = arena({ innerWidth: W, innerHeight: H }); run(env, s, 1); const t = textAt(feelScreen(env, s, {}, W, H), /점수/);
    assert.ok(t, W + ': score shown at 0'); assert.ok(/^#f{3,6}$/i.test(String(t.style)), 'bright white ' + t.style);
  }
});
test('x2 badge: bigger (>= 13 px font, >= 16 px icon)', () => {
  const made = []; const btn = { dataset: { mobileAction: 'D' }, getBoundingClientRect: () => ({ left: 704, top: 321, width: 48, height: 48, right: 752, bottom: 369 }) };
  const document = { body: { appendChild(e) { made.push(e); } }, createElement: tag => ({ tag, style: {}, textContent: '', setAttribute() {}, width: 0, height: 0, getContext: () => stubCtx({}) }), querySelector: sel => (/"D"/.test(sel) ? btn : null), hidden: false };
  const { env, s } = arena({ document }); run(env, s, .5); env.kit.__test.badge(); const b = made.find(e => e.textContent === '×2'); assert.ok(b);
  assert.ok(px(b.style.font) >= 13, 'font ' + b.style.font); assert.ok(px(b.style.backgroundSize) >= 16, 'icon ' + b.style.backgroundSize);
});

// ---------------------------------------------------------------- 7. bomb sweep
test('bomb screen sweep: 2:1 floor ellipse, kept below the top HUD (no screen circle)', () => {
  const { env, s } = arena(); run(env, s, 1); const m = env.rc.world(s); ident(m);
  env.key('keydown', 'KeyD'); tick(env, s, .1); env.key('keydown', 'KeyD'); tick(env, s);
  for (const dt of [.05, .1, .15]) { tick(env, s, dt); const l = feelScreen(env, s);
    assert.ok(!l.arcs.some(a => a.r > 150), 'no big screen circle ' + JSON.stringify(l.arcs.filter(a => a.r > 150).slice(0, 2)));
    const e = l.ellipses.filter(x => x.rx > 60); assert.ok(e.length >= 1, 'sweep ellipse');
    for (const x of e) { assert.ok(Math.abs(x.rx - 2 * x.ry) < 1e-6, '2:1'); assert.ok(x.y - x.ry >= 720 * .08 - 1e-6, 'below the top HUD: top ' + (x.y - x.ry)); } }
});

console.log('rc240-r4-feel-unit: ' + passed + ' passed');
if (process.exitCode) console.error('rc240-r4-feel-unit: FAILED');
