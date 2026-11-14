'use strict';
// RC240 fix round 2 (visual review round 2) for stg-feel / arcade-kit / boss-form and the danmaku
// spell-card (drawBanner + its call in drawScreen): one presentation queue (title -> warning ->
// second-form banner -> spell card), full spell names while sliding, score and callouts out of the
// banner column, warning as a dark red edge vignette (no declaration white lift under it), bomb
// shockwave + flash + debris, kill beat ring + centred count-up tally, full-width title band, second
// form re-declared with a banner, heart ring above native art in the screen pass, bigger pips, x2
// hint pulse, hollow familiars and weak points.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..', 'assets', 'rc240');
const src = f => fs.readFileSync(path.join(dir, f), 'utf8');
let passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { failed++; console.error('FAIL -', name); console.error(String(e && e.stack || e).split('\n').slice(0, 3).join('\n')); process.exitCode = 1; } }

function stubCtx(log, W = 1280, H = 720) {
  for (const k of ['texts', 'fillRects', 'strokes', 'images', 'ellipses', 'fills']) log[k] = log[k] || [];
  const c = {
    canvas: { width: W, height: H, getBoundingClientRect: () => ({ width: W, height: H }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineCap: 'butt', lineJoin: 'miter', lineDashOffset: 0,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createRadialGradient: (...a) => ({ radial: a, addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage(im, ...a) { log.images.push({ alpha: this.globalAlpha, op: this.globalCompositeOperation, a }); },
    fillRect(x, y, w, h) { log.fillRects.push({ alpha: this.globalAlpha, style: this.fillStyle, op: this.globalCompositeOperation, x, y, w, h }); },
    fillText(t, x, y) { log.texts.push({ t: String(t), x, y, alpha: this.globalAlpha, font: this.font, align: this.textAlign }); },
    strokeText() {},
    stroke() { log.strokes.push({ alpha: this.globalAlpha, style: this.strokeStyle, lw: this.lineWidth, op: this.globalCompositeOperation }); },
    fill() { log.fills.push({ alpha: this.globalAlpha, style: this.fillStyle, op: this.globalCompositeOperation }); },
    ellipse(x, y, rx, ry) { log.ellipses.push({ x, y, rx, ry }); },
  };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'moveTo', 'lineTo', 'closePath', 'setTransform', 'setLineDash', 'rect', 'clip', 'bezierCurveTo', 'quadraticCurveTo', 'strokeRect', 'clearRect'])
    c[k] = function () { log[k] = (log[k] || 0) + 1; };
  return c;
}
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
const px = f => +(/(\d+(?:\.\d+)?)px/.exec(f || '') || [0, 0])[1];

function makeEnv(opts = {}) {
  const timers = [], handlers = {}, intervals = [], held = { a: false };
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, WeakSet, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array, Error,
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
  sb.__HAPIL_FEEDBACK_RC128__ = { heroes: { hunter: { color: '#d5aa68', accent: '#f2ddd0', dark: '#2b2018' }, michaela: { color: '#ecd994', accent: '#c5a3f6', dark: '#281d2c' } } };
  if (opts.form) sb.__HAPIL_BOSS_FORM_RC240__ = opts.form;
  const binding = { phase: 'game', settings: { current: { sound: true, sfxVolume: 1 } }, state: { current: null }, input: { current: new Set() }, modal: { current: null }, actions: { sound() {} } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => 'manual', hasHeldLogical: k => k === 'KeyA' && held.a };
  vm.runInContext(src('danmaku-layer.js'), sb, { filename: 'danmaku-layer.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  vm.runInContext(src('stg-feel.js'), sb, { filename: 'stg-feel.js' });
  vm.runInContext(src('arcade-kit.js'), sb, { filename: 'arcade-kit.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  const key = (type, code) => { for (const fn of handlers[type] ?? []) fn({ type, code, repeat: false }); };
  return { sb, held, binding, intervals, key, rc: sb.__HAPIL_DANMAKU_RC240__, feel: sb.__HAPIL_STG_FEEL_RC240__, kit: sb.__HAPIL_ARCADE_KIT_RC240__ };
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

// ---------------------------------------------------------------- 1. presentation queue
test('queue: while the boss warning is up the spell card is held (not drawn, not truncated), then plays its full intro', () => {
  const { env, s } = arena(); let both = false;
  for (let k = 0; k < 200; k++) { tick(env, s); const m = env.rc.world(s); if (m.banner && env.feel.warningActive(s)) { both = true; break; } }
  assert.ok(both, 'fixture: banner declared during the warning');
  const m = env.rc.world(s), name = m.banner.name;
  const l = layerScreen(env, s); assert.ok(!has(l, new RegExp(name.slice(0, 2))), 'no card text under the warning: ' + JSON.stringify(l.texts.map(x => x.t)));
  assert.ok(!l.texts.some(x => x.t.endsWith('…')), 'nothing truncated');
  while (env.feel.warningActive(s)) { tick(env, s); layerScreen(env, s); }
  tick(env, s); const l2 = layerScreen(env, s); assert.ok(has(l2, /./) && l2.texts.some(x => x.t === name), 'card after the warning with the full name');
  assert.ok(s.time - m.banner.born < .2, 'intro restarts when the card is first shown (born ' + (s.time - m.banner.born).toFixed(2) + ')');
});

test('queue: no white declaration lift while the warning is up (that read as a grey haze)', () => {
  const { env, s } = arena(); let any = false;
  for (let k = 0; k < 200; k++) { tick(env, s); if (!env.feel.warningActive(s)) continue; const l = layerScreen(env, s);
    for (const r of l.fillRects) if (/^#fff/i.test(String(r.style)) && r.alpha > .01 && r.w >= 1280) any = true; }
  assert.ok(!any, 'white full-screen fill under the warning');
});

test('queue: card held during the title card and the second-form banner (boss-form accessors)', () => {
  let tu = -1, fb = -1; const form = { titleUntil: () => tu, formBannerUntil: () => fb, transforming: () => false };
  const { env, s } = arena({ form }); run(env, s, 4); const m = env.rc.world(s); assert.ok(m.banner && !env.feel.warningActive(s));
  assert.ok(layerScreen(env, s).texts.some(x => x.t === m.banner.name), 'shown normally');
  fb = s.time + 1; assert.ok(!layerScreen(env, s).texts.some(x => x.t === m.banner.name), 'held under the form banner'); fb = -1;
  tu = s.time + 1; assert.ok(!layerScreen(env, s).texts.some(x => x.t === m.banner.name), 'held under the title'); tu = -1;
});

test('card: the full name is drawn while the card slides in (no "질…" mid-slide)', () => {
  const { env, s } = arena(); run(env, s, 4); const m = env.rc.world(s);
  for (const [w, h] of [[1280, 643], [844, 390]]) for (const age of [.03, .08, .15]) {
    const log = {}; m.banner.born = s.time - age; m.banner.result = null; env.rc.__test.drawBanner(stubCtx(log, w, h), s, m, {}, m.banner, w, h);
    assert.ok(log.texts.some(x => x.t === m.banner.name), w + ' age ' + age + ': ' + JSON.stringify(log.texts.map(x => x.t)));
    assert.ok(!log.texts.some(x => x.t.endsWith('…')), 'no ellipsis');
  }
});

test('score/chain sit at the top right, out of the banner column (PC and phone)', () => {
  for (const [W, H] of [[1280, 643], [844, 390]]) {
    const { env, s } = arena({ innerWidth: W, innerHeight: H }); run(env, s, 1); for (let k = 0; k < 12; k++) { s.time += .05; env.feel.onGraze(s, 0, 0); }
    const t = textAt(feelScreen(env, s, {}, W, H), /점수/); assert.ok(t, 'score drawn');
    assert.ok(t.x >= W * .72 && t.align === 'right', W + ': score x ' + t.x + ' ' + t.align);
  }
});

test('transient callouts go to the hero-side lane, out of the centre banner column (band y kept)', () => {
  for (const [W, H] of [[1280, 643], [844, 390]]) {
    const { env, s } = arena({ innerWidth: W, innerHeight: H }); run(env, s, .5); env.feel.callout(s, '폭탄 탄 소거 +9', '#fff', 1);
    const t = textAt(feelScreen(env, s, {}, W, H), /탄 소거/); assert.ok(t, 'callout'); assert.ok(t.x <= W * .36, W + ': lane x ' + t.x); assert.ok(t.y <= H * .3);
  }
});

test('spell result ("주문 격파") is posted to the callout lane, not drawn under the card', () => {
  const { env, s } = arena(); run(env, s, 4); const m = env.rc.world(s); m.banner.result = 'capture'; m.banner.resultAt = s.time; m.banner.award = 12;
  const l = layerScreen(env, s); const f = feelScreen(env, s); const t = textAt(f, /주문 격파/);
  assert.ok(t && t.x <= 1280 * .36, 'result in the lane ' + JSON.stringify(t)); assert.ok(!has(l, /주문 격파/), 'not under the card');
});

// ---------------------------------------------------------------- 2. warning vignette
test('warning: dark red edge vignette sprite (source-over, no lighter lift), not a flat wash', () => {
  const { env, s } = arena(); run(env, s, .6); assert.ok(env.feel.warningActive(s));
  const l = feelScreen(env, s); const full = l.fills.filter(f => f.style && f.style.radial && f.style.radial[5] >= 600);
  assert.ok(full.length >= 1 && full.every(r => r.op === 'source-over'), 'full-screen radial vignette ' + JSON.stringify(full)); assert.strictEqual(l.images.length, 0, 'no image draws in the HUD pass');
  assert.ok(!l.fills.concat(l.fillRects).some(f => f.op === 'lighter'), 'no additive lift');
  assert.ok(typeof env.feel.__test.warnVignette === 'function' && /^rgba\((\d+),/.test(env.feel.__test.warnVignette().edge), 'vignette edge colour exposed');
  const e = /rgba\((\d+),(\d+),(\d+),([\d.]+)\)/.exec(env.feel.__test.warnVignette().edge); assert.ok(+e[1] > +e[2] && +e[1] <= 60 && +e[4] >= .4, 'dark red edge ' + e[0]);
});

// ---------------------------------------------------------------- 3. bomb
function bombAt(mobile, set = {}, dt = .08) {
  const { env, s } = arena({ innerWidth: mobile ? 844 : 1280, innerHeight: mobile ? 390 : 720 }); run(env, s, 1);
  env.key('keydown', 'KeyD'); tick(env, s, .1); env.key('keydown', 'KeyD'); tick(env, s); tick(env, s, dt);
  return { env, s, w: worldDraw(env, s, set) };
}
test('bomb: thick shockwave ring + short filled flash + pooled debris; thicker on phone; reducedFlash keeps the ring', () => {
  const pc = bombAt(false), ph = bombAt(true), q = bombAt(false, { reducedFlash: true });
  const thick = l => Math.max(0, ...l.strokes.map(x => x.lw));
  assert.ok(thick(pc.w) >= 8, 'pc ring lw ' + thick(pc.w)); assert.ok(thick(ph.w) > thick(pc.w), 'phone thicker ' + thick(ph.w));
  assert.ok(thick(q.w) >= 8, 'reducedFlash still has the shockwave');
  const flash = l => Math.max(0, ...l.fills.filter(f => f.op === 'lighter').map(f => f.alpha));
  assert.ok(flash(pc.w) >= .25, 'flash ' + flash(pc.w)); assert.ok(flash(q.w) <= .15, 'reduced flash ' + flash(q.w));
  const st = pc.env.kit.__test.debris(pc.s); assert.ok(st.live >= 12 && st.cap <= 64, 'debris pool ' + JSON.stringify(st));
});
test('bomb: room wash is light and short (<= .12, gone by .35 s)', () => {
  const b = bombAt(false, {}, .01); const l = feelScreen(b.env, b.s); const a = Math.max(0, ...l.fillRects.filter(r => r.w >= 1280).map(r => r.alpha));
  assert.ok(a <= .12, 'wash ' + a); run(b.env, b.s, .36); const l2 = feelScreen(b.env, b.s); assert.ok(!l2.fillRects.some(r => r.w >= 1280 && r.alpha > 0), 'wash gone');
});

// ---------------------------------------------------------------- 4. kill beat + tally
test('kill beat: screen-space ring burst at the boss; tally centred, larger, counting up', () => {
  const { env, s } = arena(); run(env, s, 3); const m = env.rc.world(s); m.wm = [1, 0, 0, 1, 0, 0]; m.wmOk = true;
  s.enemies[0].hp = 0; tick(env, s); run(env, s, .15);
  const b = feelScreen(env, s); assert.ok(b.strokes.some(x => x.lw >= 4), 'thick beat ring');
  run(env, s, .85); const t0 = feelScreen(env, s); const h = textAt(t0, /격파 결산/); assert.ok(h, 'tally');
  assert.ok(Math.abs(h.x - 640) < 2, 'centred x ' + h.x); assert.ok(px(h.font) >= 20, 'larger title ' + h.font);
  const row = l => { const i = l.texts.findIndex(x => /획득 점수/.test(x.t)); return l.texts[i + 1]?.t; };
  const v0 = row(t0); run(env, s, 1.5); const v1 = row(feelScreen(env, s)); assert.ok(v0 != null && v1 != null);
  assert.ok(+String(v0).replace(/\D/g, '') < +String(v1).replace(/\D/g, ''), 'count-up ' + v0 + ' -> ' + v1);
});

// ---------------------------------------------------------------- 6. heart ring above native art
test('heart ring: also drawn in the screen pass (above native labels/art), coloured, dark under-disc', () => {
  const { env, s } = arena(); run(env, s, 3); const m = env.rc.world(s); m.wm = [1, 0, 0, 1, 0, 0]; m.wmOk = true;
  const l = feelScreen(env, s); const tone = env.feel.heroTone(s);
  assert.ok(l.strokes.some(x => x.style === tone.body && x.lw >= 2), 'hero-colour ring in screen pass ' + JSON.stringify(l.strokes.slice(0, 6)));
  assert.ok(l.strokes.some(x => /0a0612/i.test(x.style) && x.lw >= 4), 'dark outline');
  assert.ok(l.fills.some(f => f.op === 'source-over' && f.style && f.style.radial), 'dark separation disc');
});

// ---------------------------------------------------------------- 7. HUD
test('HUD: bigger pips (r >= 6) in a taller box; pins kept', () => {
  const K = makeEnv().kit.__test; assert.ok(K.PIP_R.pc >= 6 && K.PIP_R.mobile >= 5.5, JSON.stringify(K.PIP_R));
  assert.ok(K.hudBox(1280, 643, false)[3] >= 22 && K.hudBox(844, 390, true)[3] >= 20);
});
test('x2 hint: tap-icon badge (not a plain number) with a one-time pulse', () => {
  const made = []; const btn = { dataset: { mobileAction: 'D' }, getBoundingClientRect: () => ({ left: 704, top: 321, width: 48, height: 48, right: 752, bottom: 369 }) };
  const document = { body: { appendChild(e) { made.push(e); } }, createElement: tag => ({ tag, style: {}, textContent: '', setAttribute() {}, width: 0, height: 0, getContext: () => stubCtx({}) }), querySelector: sel => (/"D"/.test(sel) ? btn : null), hidden: false };
  const { env, s } = arena({ document }); run(env, s, .5);
  const tr = []; for (let i = 0; i < 12; i++) { env.kit.__test.badge(); const b = made.find(e => e.textContent === '×2'); tr.push(b.style.transform || ''); }
  const b = made.find(e => e.textContent === '×2'); assert.ok(/url\(/.test(b.style.backgroundImage || ''), 'tap icon');
  assert.ok(new Set(tr).size >= 2, 'pulses ' + tr); for (let i = 0; i < 20; i++) env.kit.__test.badge(); const late = []; for (let i = 0; i < 6; i++) { env.kit.__test.badge(); late.push(b.style.transform || ''); }
  assert.ok(new Set(late).size === 1, 'pulse is one-time ' + late);
});

// ---------------------------------------------------------------- 8. familiars / weak points
test('familiars: hollow outline glyphs (no filled hero-colour body), orbiting', () => {
  const { env, s } = arena(); run(env, s, .5); const k = env.kit.__test.worlds.get(s); k.points = 14; k.level = 4; run(env, s, .5);
  for (const sh of k.shots) sh.on = false; const tone = env.feel.heroTone(s);
  const l = worldDraw(env, s); assert.ok(l.strokes.filter(x => x.style === tone.body && x.lw >= 2).length >= 4, 'hollow hero outlines');
  assert.ok(l.fills.filter(x => x.style === tone.body && x.op === 'source-over' && x.alpha > .5).length === 0, 'no solid hero-colour bodies');
  const p0 = k.fam.map(F => [F.x, F.y]); run(env, s, .4); const moved = k.fam.filter((F, i) => Math.hypot(F.x - p0[i][0], F.y - p0[i][1]) > 1).length; assert.ok(moved >= 3, 'orbit motion ' + moved);
});

// ---------------------------------------------------------------- boss form
function bfEnv() {
  const timers = [];
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } set src(v) { this._s = v; } get src() { return this._s; } }
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp,
    location: { search: '?rc240=1' }, innerWidth: 1280, setTimeout: fn => { timers.push(fn); return 1; }, setInterval: () => 0, performance: { now: () => 0 }, Image: FakeImage, requestAnimationFrame: () => 0,
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

test('title card: full-width letterbox band with a larger name', () => {
  const api = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += .6; api.__test.tick(s, .1);
  const log = {}; api.__test.render(stubCtx(log, 2560, 1288), s, {});
  const t = textAt(log, /금이 간 안경/); assert.ok(t, 'text'); assert.ok(px(t.font) >= 28 * 2, 'font ' + t.font);
  const B = api.__test.lastBand(); assert.ok(B.bw >= 2560 && B.bh >= 60 && B.bh < 400, 'full-width band ' + JSON.stringify(B));
});
test('second form: re-declared with a full-width banner (boss name + 제2형태), formBannerUntil accessor', () => {
  const api = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += 3; api.__test.tick(s, .1);
  s.enemies[0].hp = 100; s.time += .1; api.__test.tick(s, .1); assert.strictEqual(typeof api.formBannerUntil, 'function'); const fu = api.formBannerUntil(s); assert.ok(fu > s.time + 1, 'until ' + fu);
  s.time += .6; api.__test.tick(s, .1); const log = {}; api.drawOverlay(stubCtx(log, 1280, 720), s, {}, 1280, 720);
  assert.ok(has(log, /레비아탄/) && has(log, /제2형태/), JSON.stringify(log.texts.map(x => x.t)));
  const B = api.__test.lastBand(); assert.ok(B.bw >= 1280 && B.bh < 200, 'full-width band ' + JSON.stringify(B));
  s.time += 3; api.__test.tick(s, .1); assert.strictEqual(api.formBannerUntil(s), -1);
});
test('weak points: hollow outline glyph, no additive glow orb (reads as a bullet)', () => {
  const api = bfEnv(); const s = bw({ zone: 'ep1b03', enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += 3; api.__test.tick(s, .1);
  const log = {}; api.__test.render(stubCtx(log), s, {}); assert.ok(!log.images.some(i => i.op === 'lighter'), 'no glow orb sprite');
  assert.ok(log.strokes.filter(x => /0a0612/i.test(x.style) && x.lw >= 3).length >= 2, 'dark outline under each glyph');
});

console.log('rc240-r2-feel-unit: ' + passed + ' passed, ' + failed + ' failed');
