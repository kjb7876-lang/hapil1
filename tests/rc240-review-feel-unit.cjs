'use strict';
// RC240 review round 1 fixes owned by stg-feel / arcade-kit / boss-form:
// beat order (title -> warning -> combat), ornamented warning band, callout band,
// kill beat + tally rows, charge beam to target, heart ring, Michaela impact tint,
// HUD pips / bomb stock / x2 hint, iso bomb ring, familiars, second-form flash +
// persistent form, particles without blocky squares, villager floor shadows,
// weak-point reticle and the portrait gate.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..', 'assets', 'rc240');
const src = f => fs.readFileSync(path.join(dir, f), 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } }

function stubCtx(log, W = 1280, H = 720) {
  log.texts = log.texts || []; log.fillRects = log.fillRects || []; log.strokes = log.strokes || []; log.images = log.images || []; log.ellipses = log.ellipses || []; log.fills = log.fills || [];
  const c = {
    canvas: { width: W, height: H, getBoundingClientRect: () => ({ width: W, height: H }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineCap: 'butt', lineJoin: 'miter', lineDashOffset: 0,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createRadialGradient: (...a) => ({ radial: a, addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage(im, ...a) { log.images.push({ alpha: this.globalAlpha, op: this.globalCompositeOperation, a }); },
    fillRect(x, y, w, h) { log.fillRects.push({ alpha: this.globalAlpha, style: this.fillStyle, op: this.globalCompositeOperation, x, y, w, h }); },
    fillText(t, x, y) { log.texts.push({ t: String(t), x, y, alpha: this.globalAlpha, font: this.font }); },
    strokeText() {},
    stroke() { log.strokes.push({ alpha: this.globalAlpha, style: this.strokeStyle, lw: this.lineWidth, op: this.globalCompositeOperation }); },
    fill() { log.fills.push({ alpha: this.globalAlpha, style: this.fillStyle, op: this.globalCompositeOperation }); },
    ellipse(x, y, rx, ry) { log.ellipses.push({ x, y, rx, ry }); log.ellipse = (log.ellipse || 0) + 1; },
  };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'moveTo', 'lineTo', 'closePath', 'setTransform', 'setLineDash', 'rect', 'clip', 'bezierCurveTo', 'quadraticCurveTo', 'strokeRect', 'clearRect'])
    c[k] = function () { log[k] = (log[k] || 0) + 1; };
  return c;
}
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });

// ---------------------------------------------------------------- feel + kit environment (danmaku layer real)
function makeEnv(opts = {}) {
  const timers = [], sounds = [], held = { a: false }, handlers = {}, intervals = [];
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, WeakSet, Float32Array, Int32Array, Uint8Array, Uint16Array, Error,
    location: { search: '?rc240=1' }, innerWidth: opts.innerWidth ?? 1280, innerHeight: opts.innerHeight ?? 720,
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: fn => { intervals.push(fn); return intervals.length; },
    performance: { now: () => 0 },
    addEventListener: (type, fn) => { (handlers[type] ??= []).push(fn); },
    document: opts.document ?? { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => stubCtx({}) }), querySelector: () => null },
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb);
  const settings = { sound: true, sfxVolume: 1, ...(opts.settings || {}) };
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
  sb.__HAPIL_FEEDBACK_RC128__ = { heroes: { hunter: { color: '#d5aa68', accent: '#f2ddd0', dark: '#2b2018' }, neon: { color: '#ec65d4', accent: '#72f8ee', dark: '#21152f' }, michaela: { color: '#ecd994', accent: '#c5a3f6', dark: '#281d2c' } } };
  if (opts.title) sb.__HAPIL_BOSS_FORM_RC240__ = opts.title;
  const binding = { phase: 'game', settings: { current: settings }, state: { current: null }, input: { current: new Set() }, modal: { current: null }, actions: { sound: (p, g, c) => sounds.push({ p, g, c }) } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => 'manual', hasHeldLogical: k => k === 'KeyA' && held.a };
  vm.runInContext(src('danmaku-layer.js'), sb, { filename: 'danmaku-layer.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  vm.runInContext(src('stg-feel.js'), sb, { filename: 'stg-feel.js' });
  if (opts.kit !== false) vm.runInContext(src('arcade-kit.js'), sb, { filename: 'arcade-kit.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  const key = (type, code, extra = {}) => { for (const fn of handlers[type] ?? []) fn({ type, code, repeat: false, ...extra }); };
  return { sb, sounds, held, binding, settings, intervals, key, rc: sb.__HAPIL_DANMAKU_RC240__, feel: sb.__HAPIL_STG_FEEL_RC240__, kit: sb.__HAPIL_ARCADE_KIT_RC240__ };
}
const boss = (id = 'b1', hp = 1e6) => ({ id, boss: true, hp, maxHp: hp, x: 27.4, y: 11.5, name: '시험 거체' });
const phase = (o = {}) => ({ ownerId: 'b1', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 2, remaining: 10, duration: 12, ...o });
function world(extra = {}) {
  return { zone: 'z1', time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [boss()], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 1e9, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], pendingStrikes: [], activeHeroId: 'hunter', awakeningUntil: 0, combatFeedbackV31329: [], phaseStub: phase({ elapsed: 0 }), targetEnemyId: 'b1', ...extra };
}
function arena(opts = {}) { const env = makeEnv(opts); const s = world(opts.world || {}); env.binding.state.current = s; return { env, s }; }
function tick(env, s, dt = 1 / 60) { s.time += dt; env.sb.__HAPIL_LASERS_V31330__.tick(s, dt); }
function run(env, s, sec, dt = 1 / 60) { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) tick(env, s, dt); }
function screen(env, s, set = {}, W = 1280, H = 720) { const log = {}; env.feel.drawScreen(stubCtx(log, W, H), s, env.rc.world(s), set); return log; }
function worldDraw(env, s, set = {}) { const log = {}; env.feel.draw(stubCtx(log), s, env.rc.world(s), set); return log; }
const has = (log, re) => log.texts.some(x => re.test(x.t));
const textAt = (log, re) => log.texts.find(x => re.test(x.t));
function makeNative(s, power = 10, period = .25) {
  const st = { next: s.time };
  st.step = () => { if (s.time >= st.next) { st.next += period; s.pendingStrikes.push({ id: s.fxSerial++, at: s.time + .1, actionKey: 'A', heroId: s.activeHeroId, power, targetId: 'b1' }); }
    s.pendingStrikes = s.pendingStrikes.filter(r => r.at > s.time); };
  return st;
}

// ---------------------------------------------------------------- 1. beat order
test('beat order: warning waits for the stage title card, never both on screen; accessors warningActive/warnUntil', () => {
  let until = 0; const title = Object.freeze({ titleUntil: () => until });
  const { env, s } = arena({ title }); until = s.time + 1.5;
  tick(env, s); const F = env.feel;
  assert.strictEqual(typeof F.warningActive, 'function'); assert.strictEqual(typeof F.warnUntil, 'function');
  assert.strictEqual(F.warningActive(s), true, 'pending warning counts as active (danmaku holds spawns)');
  const W = F.state(s).warn; assert.ok(W && W.at >= until, 'warning starts after the title card: ' + (W && W.at) + ' vs ' + until);
  assert.ok(env.rc.world(s).warnHoldUntil >= W.at, 'first spell held past the warning start');
  for (let k = 0; k < 80; k++) { tick(env, s); const log = screen(env, s); assert.ok(!(s.time < until && has(log, /경고/)), 'no warning text while the title card is up @' + s.time); }
  let shown = false; for (let k = 0; k < 120; k++) { tick(env, s); if (has(screen(env, s), /경고 · 거대 반응 접근/)) shown = true; }
  assert.ok(shown, 'warning shows after the title card');
  assert.ok(Math.abs(F.warnUntil(s) - (W.at + W.dur)) < 1e-9);
  run(env, s, 3); assert.strictEqual(F.warningActive(s), false); assert.strictEqual(F.warnUntil(s), -1);
});

test('warning band: top third, clear of hero/boss boxes and the phone phase panel; ornamented frame, no diagonal hazard stripes', () => {
  for (const [W, H, mobile] of [[1280, 643, false], [812, 375, true]]) {
    const { env, s } = arena({ innerWidth: W, innerHeight: H }); tick(env, s); run(env, s, .5);
    const log = screen(env, s, {}, W, H); const t = textAt(log, /경고 · 거대 반응 접근/); assert.ok(t, 'warning text');
    assert.ok(t.y <= H * .27, 'warning in the upper band: y=' + t.y + ' h=' + H);
    if (mobile) { const half = t.t.length * 8 / 2; assert.ok(t.y > 52 || t.x - half > 340, 'clear of the phase panel'); }
    // the old tape drew ~50 slanted quads per band; the frame uses a handful of rules
    assert.ok((log.lineTo || 0) < 60, 'no hazard stripe quads: lineTo=' + log.lineTo);
    assert.ok(log.fills.some(f => /c9a65a|e8c46a|d8b46a/i.test(String(f.style))) || log.fillRects.some(f => /c9a65a|e8c46a|d8b46a/i.test(String(f.style))), 'gold rule lines');
    assert.ok(!log.fillRects.some(f => f.style === '#d4122c'), 'no red hazard colour');
  }
});

test('callouts: charge / wipe callouts go to the screen band, not native world floats over the hero', () => {
  const { env, s } = arena({ world: { invulnerableUntil: 1e9 } }); const nat = makeNative(s);
  for (let i = 0; i < 480; i++) { tick(env, s); nat.step(); }
  env.held.a = true; run(env, s, 1.6); env.held.a = false; tick(env, s, .001);
  assert.ok(!s.floatTexts.some(f => /기합/.test(f.text)), 'no native float for the charge');
  assert.strictEqual(typeof env.feel.callout, 'function'); assert.strictEqual(typeof env.feel.calloutY, 'function');
  const log = screen(env, s); const t = textAt(log, /기합/); assert.ok(t, 'callout drawn in screen space'); assert.ok(t.y <= 720 * .3, 'callout band y=' + t.y);
  assert.ok(env.feel.calloutY(812, 375, true) < 375 * .3 && env.feel.calloutY(1280, 643, false) < 643 * .3);
});

// ---------------------------------------------------------------- 4. kill beat and tally
test('kill beat precedes the tally; tally hides rows that would read 0/0 or 0', () => {
  const { env, s } = arena({ world: { phaseStub: phase() } }); run(env, s, 3);
  const b = s.enemies[0]; b.hp = 0; tick(env, s); const t0 = s.time;
  assert.strictEqual(typeof env.feel.killBeat, 'function'); assert.ok(env.feel.killBeat(s), 'kill beat active');
  const T = env.feel.state(s).tally; assert.ok(T && T.at >= t0 + .6, 'tally slides in after the beat');
  const w0 = worldDraw(env, s); assert.ok(w0.images.length + (w0.arc || 0) > 3, 'beat burst drawn');
  const l0 = screen(env, s); assert.ok(!has(l0, /격파 결산/), 'no tally during the beat');
  run(env, s, 1.6); const l1 = screen(env, s); assert.ok(has(l1, /격파 결산/), 'tally after the beat');
  assert.ok(!l1.texts.some(x => x.t === '0/0'), 'no 0/0 row'); assert.ok(!has(l1, /주문 획득/), 'spell row hidden with no spells');
  // reduced flash: beat flash capped
  const { env: e2, s: s2 } = arena({ world: { phaseStub: phase() } }); run(e2, s2, 3); s2.enemies[0].hp = 0; tick(e2, s2);
  let max = 0; for (let k = 0; k < 30; k++) { tick(e2, s2); const L = screen(e2, s2, { reducedFlash: true }); for (const f of L.fills.concat(L.fillRects)) if (f.op === 'lighter') max = Math.max(max, f.alpha); }
  assert.ok(max <= .25, 'reduced flash beat ' + max);
});

// ---------------------------------------------------------------- 6. charge beam
test('charge beam: ends at the target with an impact flare, hero colour family (not cyan / not magenta)', () => {
  const { env, s } = arena(); const nat = makeNative(s);
  for (let i = 0; i < 480; i++) { tick(env, s); nat.step(); }
  env.held.a = true; run(env, s, 1.6); env.held.a = false; tick(env, s, .001);
  const beams = env.feel.__test.beamRows(s); assert.ok(beams.length >= 1);
  const q = project(27.4, 11.5); const B = beams[0];
  assert.ok(Math.hypot(B.tx - q.x, B.ty - (q.y - 46)) < 2, 'drawn end at the target');
  assert.strictEqual(B.color.toLowerCase(), '#d5aa68', 'hunter amber, not cyan');
  const log = worldDraw(env, s); assert.ok(log.images.some(i => i.op === 'lighter'), 'impact flare sprite');
  assert.ok(!/#7ff6ff/i.test(B.color));
  const tone = env.feel.heroTone({ activeHeroId: 'neon' }); assert.ok(!/ec65d4/i.test(tone.body), 'magenta hero colour swapped for its accent');
});

// ---------------------------------------------------------------- 8. heart ring
test('heart ring: high-contrast ring always on with the dense layer, brightens near bullets, steady under reducedFlash', () => {
  const { env, s } = arena(); run(env, s, 3); const m = env.rc.world(s); m.pool.live = 0;
  const far = env.feel.__test.heartRing(s, m, {}); assert.ok(far && far.on, 'ring on while the layer is active'); assert.ok(far.near < .05);
  const log = worldDraw(env, s); assert.ok(log.strokes.some(x => /#ffffff/i.test(x.style)) && log.strokes.some(x => /0a0612/i.test(x.style)), 'white ring with dark outline');
  const P = m.pool, i = P.live++; P.x[i] = m.hx + 22; P.y[i] = m.hy; P.age[i] = 1; P.life[i] = 60; P.type[i] = 0;
  tick(env, s, 1e-4); m.pool.x[0] = m.hx + 22; m.pool.y[0] = m.hy; m.pool.live = 1;
  const near = env.feel.__test.heartRing(s, m, {}); assert.ok(near.near > .4, 'brightens near a bullet ' + near.near); assert.ok(near.alpha > far.alpha);
  const a1 = env.feel.__test.heartRing(s, m, { reducedFlash: true }); s.time += .013; const a2 = env.feel.__test.heartRing(s, m, { reducedFlash: true }); assert.strictEqual(a1.r, a2.r, 'no pulse under reducedFlash');
});

// ---------------------------------------------------------------- 10. Michaela impact
test("Michaela heart impact gets a hero-gold outline ring and a dark separation halo", () => {
  const { env, s } = arena({ world: { activeHeroId: 'michaela' } }); run(env, s, .5);
  assert.ok(env.feel.heartImpact(s, { x: 27, y: 11 }, { heroId: 'michaela', actionKey: 'A' }));
  const log = worldDraw(env, s);
  assert.ok(log.strokes.some(x => /ecd994/i.test(x.style)), 'hero gold ring'); assert.ok(log.fills.some(x => /rgba\(10,6,20/.test(String(x.style))), 'dark halo');
});

// ---------------------------------------------------------------- 9. HUD
test('HUD: power pips + bomb stock near the resonance bar on PC and phone, clear of native HUD and touch controls', () => {
  const K = makeEnv().kit.__test;
  const ctrl = [[650, 321, 48, 48], [704, 321, 48, 48], [758, 321, 48, 48], [766, 275, 40, 40], [6, 293, 76, 76]], panel = [0, 0, 340, 52], reso = [8, 54, 96, 20];
  const hit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
  const ph = K.hudBox(812, 375, true); for (const r of [...ctrl, panel, reso]) assert.ok(!hit(ph, r), 'phone hud ' + ph + ' vs ' + r);
  assert.ok(ph[0] < 120 && ph[1] < 110, 'phone: just under the resonance bar');
  const pc = K.hudBox(1280, 643, false); assert.ok(pc[1] + pc[3] <= 643 && pc[0] < 120 && pc[1] > 560, 'pc: bottom-left above the resonance strip ' + pc);
  const { env, s } = arena(); run(env, s, 1); const log = screen(env, s);
  assert.ok((log.arc || 0) + (log.moveTo || 0) >= 6, 'pips and stock drawn'); assert.ok(!log.fillRects.some(f => f.alpha > .08), 'no fillRect wash beyond the cap');
});

test('x2 bomb hint badge on the D / 공명 button for the first bombs only (DOM overlay, no new button)', () => {
  const made = [];
  const btn = { dataset: { mobileAction: 'D' }, getBoundingClientRect: () => ({ left: 704, top: 321, width: 48, height: 48, right: 752, bottom: 369 }) };
  const document = { body: { appendChild(e) { made.push(e); } }, createElement: tag => ({ tag, style: {}, textContent: '', setAttribute() {}, width: 0, height: 0, getContext: () => stubCtx({}) }), querySelector: sel => (/"D"/.test(sel) ? btn : null), hidden: false };
  const { env, s } = arena({ document }); run(env, s, .5);
  env.kit.__test.badge(); const b = made.find(e => e.textContent === '×2'); assert.ok(b, 'badge created'); assert.strictEqual(b.style.display, 'block');
  assert.strictEqual(b.style.pointerEvents, 'none'); assert.ok(!/button/i.test(b.tag));
  const k = env.kit.__test.worlds.get(s); k.stock = 0; env.kit.__test.badge(); assert.strictEqual(b.style.display, 'none', 'hidden without stock');
  k.stock = 2; env.kit.__test.seen.bombs = 2; env.kit.__test.badge(); assert.strictEqual(b.style.display, 'none', 'hidden after the player has used the bomb twice');
});

// ---------------------------------------------------------------- 5. bomb / 7. familiars
test('bomb: 2:1 isometric floor ring at the hero feet, soft sprite ring, no box; phone radius bounded', () => {
  for (const mobile of [false, true]) {
    const { env, s } = arena({ innerWidth: mobile ? 812 : 1280, innerHeight: mobile ? 375 : 720 }); run(env, s, 1);
    env.key('keydown', 'KeyD'); tick(env, s, .1); env.key('keydown', 'KeyD'); tick(env, s); tick(env, s, .2);
    const g = env.kit.__test.bombGeom(s); assert.ok(g, 'bomb fx live'); assert.ok(Math.abs(g.rx - 2 * g.ry) < 1e-6, '2:1 ellipse');
    const h = env.sb.__HAPIL_COMBAT_V31333__.core(s); assert.ok(Math.abs(g.cy - (h.y + 42)) < 1e-6, 'on the floor at the feet');
    assert.ok(g.rmax <= (mobile ? 280 : 600), 'radius bounded ' + g.rmax);
    const log = worldDraw(env, s); assert.ok(log.images.some(i => i.op === 'lighter'), 'soft ring sprite'); assert.ok(!(log.strokeRect || 0) && !(log.rect || 0), 'no box');
  }
});

test('familiars: ~0.4 hero height, dark outline, bright body, short trail, floor shadow', () => {
  const { env, s } = arena(); run(env, s, .5); const k = env.kit.__test.worlds.get(s); k.points = 14; k.level = 4; run(env, s, .5);
  assert.ok(env.kit.__test.famSize() >= 26 && env.kit.__test.famSize() <= 40, 'size ' + env.kit.__test.famSize());
  const log = worldDraw(env, s);
  assert.ok(log.strokes.some(x => /0a0612/i.test(x.style) && x.lw >= 2.5), 'dark outline');
  assert.ok(log.ellipses.filter(e => e.ry > 0 && e.rx / e.ry >= 2).length >= 4, 'floor shadows');
  assert.ok(log.fills.filter(x => x.op === 'lighter').length >= 4, 'trails');
});

// ---------------------------------------------------------------- boss form
function bfEnv(opts = {}) {
  const timers = [], raf = [];
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } set src(v) { this._s = v; } get src() { return this._s; } }
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp,
    location: { search: '?rc240=1' }, innerWidth: opts.innerWidth ?? 1280, setTimeout: fn => { timers.push(fn); return 1; }, setInterval: () => 0, performance: { now: () => 0 }, Image: FakeImage,
    requestAnimationFrame: fn => { raf.push(fn); return raf.length; },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx({}), toDataURL: () => 'data:,' }), querySelector: () => null, body: null } };
  sb.window = sb; sb.globalThis = sb;
  let ps = (cache, a) => a.sprite;
  sb.__HAPIL_RC86_BRIDGE__ = { project, zoneActors: z => (/^rest|^hub/.test(z) ? [] : [{ id: 'z-' + z }]), actor: () => null, runtimeSprite: (c, p, f) => p ?? f, get phaseSprite() { return ps; }, set phaseSprite(v) { ps = v; } };
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ afterHit() {}, render() {}, background() {}, imminent: () => null });
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ mode: s => s?.gameModeV31346 ?? 'STORY' });
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { state: { current: null }, cache: { current: {} }, settings: { current: {} } } };
  if (opts.portrait) sb.__HAPIL_ORIENTATION_PAUSE_RC152__ = { paused: () => true };
  vm.createContext(sb); vm.runInContext(src('boss-form.js'), sb, { filename: 'boss-form.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  return { sb, raf, api: sb.__HAPIL_BOSS_FORM_RC240__ };
}
const envy = (o = {}) => ({ id: 'b03-boss', name: '레비아탄', boss: true, x: 24, y: 12, hp: 37197, maxHp: 37197, humanPhase0: true, phaseCount: 3, phaseSprites: ['a', 'b_human', 'c_demon.webp'], sprite: 'b', ...o });
const balrog = (o = {}) => ({ id: 'dist06-boss', name: '발록', boss: true, x: 24, y: 12, hp: 18170, maxHp: 18170, sprite: 'x', ...o });
const bw = (o = {}) => ({ x: 8, y: 12, hp: 200, maxHp: 240, time: 100, zone: 'ep1b03', gameModeV31346: 'STORY', activeHeroId: 'hunter', enemies: [], effects: [], ...o });

test('boss-form accessors for other owners: transforming / transformUntil / titleUntil', () => {
  const { api } = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60);
  assert.strictEqual(api.transforming(s), false); assert.strictEqual(api.transformUntil(s), -1);
  s.enemies[0].hp = 100; s.time += .1; api.__test.tick(s, .1);
  assert.strictEqual(api.transforming(s), true); assert.ok(Math.abs(api.transformUntil(s) - (s.time + api.__test.TRANSFORM_DUR)) < 1e-9);
  s.time += 1.3; api.__test.tick(s, .1); assert.strictEqual(api.transforming(s), false);
  s.zone = 'dist06'; s.time += .1; api.__test.tick(s, .1); assert.ok(api.titleUntil(s) > s.time, 'title until'); s.zone = 'restEp1b'; s.time += .1; api.__test.tick(s, .1); assert.strictEqual(api.titleUntil(s), -1);
});

test('second-form flash: additive boss-centred gradient above the HUD (overlay), full screen on phone, reducedFlash <= .25, no flat grey wash', () => {
  for (const reduced of [false, true]) {
    const { api } = bfEnv(); const s = bw({ enemies: [envy({ hp: 100 })] }); api.__test.tick(s, 1 / 60);
    let max = 0, lighter = true, radial = true;
    for (let i = 0; i < 40; i++) { s.time += 1 / 60; api.__test.tick(s, 1 / 60);
      const wl = {}; api.__test.render(stubCtx(wl, 1624, 750), s, { reducedFlash: reduced });
      const log = {}; api.drawOverlay(stubCtx(log, 1624, 750), s, { reducedFlash: reduced }, 812, 375);
      for (const r of log.fillRects) { if (r.w >= 812 && r.h >= 375) { max = Math.max(max, r.alpha); if (r.op !== 'lighter') lighter = false; if (!r.style || !r.style.radial) radial = false; } } }
    assert.ok(max > (reduced ? .05 : .4), 'visible ' + max); assert.ok(max <= (reduced ? .25 : .75), 'cap ' + max); assert.ok(lighter && radial, 'additive radial gradient, not a flat wash');
    // render skips its own full-screen flash once the overlay draws above the HUD
    const wl = {}; s.time = s.time; api.__test.render(stubCtx(wl), s, { reducedFlash: reduced }); assert.ok(!wl.fillRects.some(r => r.w >= 1280 && r.alpha > 0), 'no duplicate flash under the HUD');
  }
});

test('particles are soft sprites, never fillRect squares (the blocky white squares)', () => {
  const { api } = bfEnv(); const s = bw({ enemies: [envy({ hp: 100 })] }); api.__test.tick(s, 1 / 60); api.__test.burst(s, 600, 300, 40);
  const log = {}; api.__test.render(stubCtx(log), s, {}); assert.ok(!log.fillRects.some(r => r.w < 200), 'no small fillRects');
  assert.ok(log.images.length >= 20, 'sprite sparks ' + log.images.length);
});

test('second form stays visibly different for the rest of the fight (art and no-art bosses): halo, tint/cracks, shards', () => {
  for (const make of [envy, balrog]) {
    const { api } = bfEnv(); const s = bw({ zone: make === envy ? 'ep1b03' : 'dist06', enemies: [make({ hp: 100 })] }); api.__test.tick(s, 1 / 60);
    s.time += 30; api.__test.tick(s, 1 / 60);
    const log = {}; api.__test.render(stubCtx(log), s, {});
    assert.ok(log.images.filter(i => i.op === 'lighter').length >= 1, 'persistent halo ' + make().id);
    assert.ok((log.fills.length) >= 4, 'procedural shards');
    const fl = {}; api.drawFloor(stubCtx(fl), s, {}); assert.ok(fl.ellipses.length >= 2, 'floor sigil under the boss');
  }
});

test('weak-point reticle: three broken arcs per live part (no cross)', () => {
  const { api } = bfEnv(); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60);
  const log = {}; api.__test.render(stubCtx(log), s, {}); assert.ok((log.arc || 0) >= 2 * 4, 'arcs ' + log.arc);
  assert.ok(api.__test.RETICLE_ARCS === 3);
});

test('last302 villagers get a soft floor contact shadow (floor pass, under actors)', () => {
  const { api } = bfEnv(); const s = bw({ zone: 'last302', enemies: [{ id: 'l302-e1', name: 'v', hp: 10, maxHp: 10, x: 20, y: 10 }, { id: 'l302-e2', name: 'v', hp: 0, maxHp: 10, x: 21, y: 10 }] });
  api.__test.tick(s, 1 / 60); const log = {}; const n = api.drawFloor(stubCtx(log), s, {});
  assert.strictEqual(n, 1, 'one live villager shadow'); assert.ok(log.images.length >= 1);
  const s2 = bw({ zone: 'last302', gameModeV31346: 'DREAM', enemies: [{ id: 'l302-e1', hp: 10, x: 20, y: 10 }] }); api.__test.tick(s2, 1 / 60); assert.strictEqual(api.drawFloor(stubCtx({}), s2, {}), 0, 'story only');
});

test('feel.drawBackground forwards the floor pass to boss-form and stays inert without it', () => {
  let calls = 0; const title = Object.freeze({ titleUntil: () => -1, drawFloor: () => { calls++; return 0; } });
  const { env, s } = arena({ title }); run(env, s, .5); const m = env.rc.world(s);
  env.feel.drawBackground(stubCtx({}), s, m, {}); assert.strictEqual(calls, 1);
});

test('portrait gate: boss-form raf loop does not tick while the orientation pause is up', () => {
  const { api, raf } = bfEnv({ portrait: true }); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 0);
  const t0 = api.metrics().ticks; api.__test.rafStep(s); assert.strictEqual(api.metrics().ticks, t0);
});

test('warning band never overlaps the RC240 spell card (top-centre card, big card, settled card; PC and phone)', () => {
  const env = makeEnv(); const wb = env.feel.__test.warnBox;
  const cases = [[1280, 640, false], [812, 375, true]];
  for (const [W, H, mob] of cases) for (const top of [false, true]) for (const age of [.3, 1.7, 3]) {
    const m = { mobile: mob, banner: { born: 10, top } }; const r = wb(W, H, mob, true, m, 10 + age); const cy = r[1], ph = r[3];
    const big = age > 1.52 ? 1 - (1 - Math.pow(1 - Math.min(1, (age - 1.52) / .35), 3)) : 1, sh = (mob ? 40 : 50) + (mob ? 6 : 8) * big;
    const y = top ? (mob ? 22 : 46) + sh / 2 : H * .24 * big + (mob ? 74 : 62) * (1 - big);
    assert.ok(cy + ph / 2 <= y - sh / 2 || cy - ph / 2 >= y + sh / 2, `overlap ${W}x${H} top=${top} age=${age}: band ${cy - ph / 2}..${cy + ph / 2} card ${y - sh / 2}..${y + sh / 2}`);
    assert.ok(cy - ph / 2 >= 0 && cy + ph / 2 <= H * .5, 'band stays in the upper half: ' + cy);
  }
  const r0 = wb(1280, 640, false, true); assert.ok(Number.isFinite(r0[1]), 'no banner: default slot');
});

console.log('rc240-review-feel-unit: ' + passed + ' tests OK');
