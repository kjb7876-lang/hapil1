'use strict';
// RC240 fix round 4 (visual review round 4) for stg-feel / arcade-kit / boss-form and the danmaku spell card:
// 1. kill beat clamped to the frame, capped flash, tapered rays + boss-colour embers, score above it
// 2. bomb: dark dim + additive gold shockwave + sparks (no milky fill / veil)
// 3. second form: native bullets cancelled and RC240 firing held through transform + banner (PC and phone)
// 4. plate hierarchy: hazard warning, widest title, largest second-form banner with a dim; no intro
//    warning for a boss first met at ~50% HP; own "제2형태" tag; card collapses on break; tally total line
// 5/6. phone HUD pips inline with the resonance bar; bands clear of the phase panel; GRAZE clear of the gear
// 7. status label ghosted near bullets; Michaela impact in the hero family; familiars as friendly motes
// 8. PC "D×2 폭탄" hint; score plate
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
  Object.assign(sb, opts.globals || {});
  vm.createContext(sb); vm.runInContext(src('boss-form.js'), sb, { filename: 'boss-form.js' });
  for (let i = 0; i < 50 && timers.length; i++) timers.shift()();
  return opts.full ? { sb, api: sb.__HAPIL_BOSS_FORM_RC240__ } : sb.__HAPIL_BOSS_FORM_RC240__;
}
const envy = (o = {}) => ({ id: 'b03-boss', name: '레비아탄', boss: true, x: 24, y: 12, hp: 37197, maxHp: 37197, humanPhase0: true, phaseCount: 3, phaseSprites: ['a', 'b_human', 'c_demon.webp'], sprite: 'b', ...o });
const bw = (o = {}) => ({ x: 8, y: 12, hp: 200, maxHp: 240, time: 100, zone: 'ep1b03', gameModeV31346: 'STORY', activeHeroId: 'hunter', enemies: [], effects: [], ...o });


const hueOf = c => { const r = parseInt(c.slice(1, 3), 16) / 255, g = parseInt(c.slice(3, 5), 16) / 255, b = parseInt(c.slice(5, 7), 16) / 255, mx = Math.max(r, g, b), d = mx - Math.min(r, g, b); if (d < 1e-6) return { h: -1, s: 0 }; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; return { h: h < 0 ? h + 360 : h, s: d / mx }; };
function killAt(W, H, age, bx = 27.4, by = 11.5, set = {}) {
  const { env, s } = arena({ innerWidth: W, innerHeight: H }); run(env, s, 3); const m = env.rc.world(s); ident(m);
  s.enemies[0].x = bx; s.enemies[0].y = by; tick(env, s); s.enemies[0].hp = 0; tick(env, s); if (age > 0) run(env, s, age);
  return { env, s, m, scr: feelScreen(env, s, set, W, H), wld: worldDraw(env, s, set) };
}

// ---------------------------------------------------------------- 1. kill beat
test('kill beat: every screen ring / flash stays inside the frame (boss near the right/top edge, PC and phone)', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) for (const [bx, by] of [[27.4, 11.5], [34, 2], [40, 12]]) for (const age of [.05, .15, .3, .5]) {
    const k = killAt(W, H, age, bx, by); const top = W < 900 ? 4 : 50;
    for (const e of k.scr.ellipses.filter(e => e.rx > 20)) assert.ok(e.x - e.rx >= 0 && e.x + e.rx <= W && e.y - e.ry >= top && e.y + e.ry <= H, W + ' ring in frame ' + JSON.stringify(e) + ' age ' + age);
    for (const a of k.scr.arcs.filter(a => a.r > 30)) assert.ok(a.x - a.r >= 0 && a.x + a.r <= W && a.y - a.r >= top && a.y + a.r <= H, W + ' arc in frame ' + JSON.stringify(a));
    for (const f of k.scr.fills.concat(k.scr.fillRects).filter(f => f.op === 'lighter')) {
      assert.ok(f.style && f.style.radial, 'no flat additive full-screen flash: ' + JSON.stringify(f.style));
      const [cx, cy, , , , R] = f.style.radial; assert.ok(Math.PI * R * R <= .4 * W * H + 1, W + ' flash covers <= 40% of the screen: R ' + R);
      assert.ok(cx - R * .6 >= 0 && cx + R * .6 <= W && cy + R * .6 <= H, 'flash centre clamped ' + cx + ',' + cy + ' R ' + R);
    }
  }
});
test('kill beat: peak is capped (no near-white additive stack), world rings stay on the floor near the boss', () => {
  const k = killAt(1280, 720, .1);
  for (const f of k.scr.fills.filter(f => f.op === 'lighter' && f.style && f.style.radial)) for (const [, c] of f.style.stops) { const q = rgba(c); if (q) assert.ok(q[3] * f.alpha <= .62, 'flash stop alpha ' + c + ' x ' + f.alpha); }
  for (const i of k.wld.images.filter(i => i.op === 'lighter' && i.a.length >= 4 && i.a[2] > 100)) assert.ok(i.alpha <= .6 && i.a[2] <= 420, 'world glow capped ' + i.alpha + ' ' + i.a[2]);
});
test('kill beat: tapered glowing rays (filled), not hairline spokes; ember particles in the boss colour', () => {
  for (const age of [.1, .25, .4]) { const k = killAt(1280, 720, age);
    const hair = k.scr.strokes.concat(k.wld.strokes).filter(x => /fff3c8|ffe59a/i.test(String(x.style)) && x.lw <= 4);
    assert.strictEqual(hair.length, 0, 'no hairline spoke strokes ' + JSON.stringify(hair.slice(0, 2)));
    assert.ok(k.scr.fills.filter(f => f.op === 'lighter' && !(f.style && f.style.radial)).length + k.wld.fills.filter(f => f.op === 'lighter').length >= 1 || age > .35, 'tapered rays are filled paths'); }
  const { env, s } = arena(); run(env, s, 3); s.enemies[0].color = '#59d6c2'; tick(env, s); s.enemies[0].hp = 0; tick(env, s);
  const f = env.feel.__test.worlds.get(s); assert.ok(f.kill && /^#[0-9a-f]{6}$/i.test(f.kill.col), 'kill colour'); assert.strictEqual(f.kill.col.toLowerCase(), '#59d6c2');
  assert.ok(f.sparks.filter(q => q.c.toLowerCase() === '#59d6c2').length >= 10, 'embers in the boss colour');
});
test('score: drawn above the kill beat, on a high-contrast plate', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) { const k = killAt(W, H, .1); const seq = k.scr.seq;
    const si = seq.findIndex(e => e[0] === 'text' && /점수/.test(e[1].t)); assert.ok(si >= 0, 'score shown during the beat');
    let last = -1; seq.forEach((e, i) => { if ((e[0] === 'fill' || e[0] === 'fillRect') && e[1].op === 'lighter') last = i; });
    assert.ok(last >= 0 && si > last, W + ': score after the flash (' + si + ' > ' + last + ')');
    const plate = seq.slice(0, si).reverse().find(e => e[0] === 'fill' && /^#0[0-9a-f]{5}$/i.test(String(e[1].style)));
    assert.ok(plate && plate[1].alpha >= .7, 'score plate alpha ' + (plate && plate[1].alpha)); }
});

// ---------------------------------------------------------------- 2. bomb
function bombAt(mobile, set = {}, wait = .1) {
  const { env, s } = arena({ innerWidth: mobile ? 844 : 1280, innerHeight: mobile ? 390 : 720 }); run(env, s, 1); const m = env.rc.world(s); ident(m);
  env.key('keydown', 'KeyD'); tick(env, s, .1); env.key('keydown', 'KeyD'); tick(env, s); tick(env, s, wait);
  return { env, s, m, w: worldDraw(env, s, set), scr: feelScreen(env, s, set, mobile ? 844 : 1280, mobile ? 390 : 720) };
}
test('bomb: no milky fill (no white/hero additive disc, no light full-frame veil); a dark dim instead', () => {
  for (const mobile of [false, true]) for (const wait of [.03, .1, .2]) { const b = bombAt(mobile, {}, wait); const tone = b.env.feel.heroTone(b.s);
    assert.ok(!b.w.fills.some(f => f.op === 'lighter' && /^#fff/i.test(String(f.style)) && f.alpha > .2 && b.w.ellipses.some(e => e.rx > 80)) || !b.w.fills.some(f => f.op === 'lighter' && /^#fff(fff)?$/i.test(String(f.style)) && f.alpha >= .2), 'no white additive fill');
    assert.ok(b.w.images.filter(i => i.op === 'lighter' && i.a[2] > 300 && i.alpha > .12).length <= 1, 'no big additive glow disc (ring sprite only) ' + JSON.stringify(b.w.images.filter(i => i.a[2] > 300).map(i => [i.alpha, i.a[2]])));
    assert.ok(!b.scr.fillRects.some(r => r.w >= 800), 'no full-frame veil fillRect');
    if (wait <= .1) { const dim = b.scr.fills.find(f => f.op === 'source-over' && f.style && f.style.radial && f.style.stops.some(([, c]) => { const q = rgba(c); return q && q[0] + q[1] + q[2] < 40 && q[3] * f.alpha >= .15; }));
      assert.ok(dim, 'dark dim'); const first = rgba(dim.style.stops[0][1]), last = rgba(dim.style.stops[dim.style.stops.length - 1][1]); assert.ok(first[3] * dim.alpha <= .3 && last[3] * dim.alpha <= .45, 'characters stay readable ' + first[3] * dim.alpha); assert.ok(first[3] >= .5 * last[3], 'even darkening (no bright window around the hero)'); }
    assert.ok(b.w.strokes.some(x => x.op === 'lighter' && x.lw >= 8 && x.style === tone.body), 'additive hero-gold shockwave'); }
});
test('bomb: spark particles ride the shockwave (pooled, additive unless reducedFlash)', () => {
  const b = bombAt(false, {}, .15); const st = b.env.kit.__test.debris(b.s); assert.ok(st.live >= 20 && st.cap <= 64, JSON.stringify(st));
  assert.ok(b.w.fills.some(f => f.op === 'lighter' && f.alpha >= .5 && !/^#fff(fff)?$/i.test(String(f.style))), 'additive gold sparks');
  const q = bombAt(false, { reducedFlash: true }, .15); assert.ok(Math.max(0, ...q.w.fills.filter(f => f.op === 'lighter').map(f => f.alpha)) <= .15, 'reduced');
});

// ---------------------------------------------------------------- 3. second form clears / freezes
test('kit: cancelNative(s) runs the bomb cancel path on native hostile bullets (story or not), keeps protected rows', () => {
  let calls = 0; const bridge = { clearHostile(s) { calls++; const n = s.hostileProjectiles.length; s.hostileProjectiles = []; return n; } };
  const { env, s } = arena({ bridge }); run(env, s, .5); assert.strictEqual(typeof env.kit.cancelNative, 'function');
  s.hostileProjectiles = [{ damage: 5 }, { damage: 5 }, { damage: 5, narrativeAttack: true }, { damage: 0 }, { damage: 3, friendly: true }];
  assert.strictEqual(env.kit.cancelNative(s), 2); assert.strictEqual(s.hostileProjectiles.length, 3); assert.strictEqual(calls, 1);
});
test('second form: native bullets cancelled and RC240 firing held through the transform and the banner (PC and phone)', () => {
  for (const W of [1280, 844]) { const m = { warnHoldUntil: -1 }; let natives = 0, wipes = 0;
    const globals = { __HAPIL_DANMAKU_RC240__: { cancelAll() { wipes++; return 0; }, world: () => m }, __HAPIL_ARCADE_KIT_RC240__: { cancelNative() { natives++; return 3; } } };
    const api = bfEnv({ innerWidth: W, innerHeight: W < 900 ? 390 : 720, globals }); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += 3; api.__test.tick(s, .1);
    s.enemies[0].hp = 100; s.time += .02; api.__test.tick(s, .02); const t0 = s.time;
    assert.ok(natives >= 1 && wipes >= 1, W + ': cancelled at the transform ' + natives + '/' + wipes);
    const end = api.formBannerUntil(s); assert.ok(end > t0 + 1.5, 'banner window'); assert.ok(m.warnHoldUntil >= end - 1e-6, W + ': RC240 firing held until the banner ends: ' + m.warnHoldUntil + ' vs ' + end);
    for (let i = 0; i < 60; i++) { s.time += 1 / 30; api.__test.tick(s, 1 / 30); } assert.ok(natives >= 3 && wipes === 1, W + ': natives kept clear through the window, RC240 cancelled once (pin) ' + natives + '/' + wipes);
    const n1 = natives; for (let i = 0; i < 60; i++) { s.time += 1 / 30; api.__test.tick(s, 1 / 30); } assert.ok(natives - n1 <= 1, 'stops after the banner'); assert.ok(m.warnHoldUntil <= end + .2, 'hold ends with the banner'); }
});

// ---------------------------------------------------------------- 4. plate hierarchy
test('warning: hazard language (red field, chevrons, larger type), still few path segments', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) { const { env, s } = arena({ innerWidth: W, innerHeight: H }); run(env, s, .6); const l = feelScreen(env, s, {}, W, H);
    const t = textAt(l, /경고 · 거대 반응 접근/); assert.ok(t, 'warning'); assert.ok(px(t.font) >= (W < 900 ? 20 : 30), W + ' larger type ' + t.font);
    assert.ok(l.fills.some(f => { const q = rgba(String(f.style)); return q && q[0] >= 90 && q[1] <= 30 && q[2] <= 40 && q[3] * f.alpha >= .4; }), 'red field');
    assert.ok(l.strokes.filter(x => /ff5a62|ffb84a|ff8a3a/i.test(String(x.style)) && x.lw >= 2).length >= 2, 'chevron strokes'); assert.ok((l.lineTo || 0) < 60, 'lineTo ' + l.lineTo); }
});
test('warning: a boss first met already damaged (~50% HP) gets a short pulse, not the intro band', () => {
  const { env, s } = arena(); s.enemies[0].hp = s.enemies[0].maxHp * .56; run(env, s, .4); const st = env.feel.state(s).warn;
  assert.ok(st && st.pulse === true && st.dur <= .9, 'pulse ' + JSON.stringify(st)); const l = feelScreen(env, s); assert.ok(!has(l, /경고/), 'no intro band text');
  assert.ok(l.fills.some(f => f.style && f.style.radial), 'edge pulse drawn'); run(env, s, 1); assert.ok(!env.feel.warningActive(s), 'over within a second');
  const b = arena(); run(b.env, b.s, .4); assert.ok(!b.env.feel.state(b.s).warn.pulse && has(feelScreen(b.env, b.s), /경고/), 'fresh boss keeps the full warning');
  b.s.enemies[0].hp = b.s.enemies[0].maxHp * .56; run(b.env, b.s, .4); assert.ok(!b.env.feel.warningActive(b.s) && !has(feelScreen(b.env, b.s), /경고/), 'intro band leaves within .3 s once the boss is at ~50% HP');
});
test('second-form banner: the largest type of the three plates, with a short arena dim; title card is the widest', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) { const dpr = 2;
    const api = bfEnv({ innerWidth: W, innerHeight: H }); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += .6; api.__test.tick(s, .1);
    const lt = {}; api.__test.render(stubCtx(lt, W * dpr, H * dpr), s, {}); const title = lt.texts.find(x => /금이 간 안경/.test(x.t)); assert.ok(title, 'title'); const TB = api.__test.lastBand();
    s.time += 3; api.__test.tick(s, .1); s.enemies[0].hp = 100; s.time += .1; api.__test.tick(s, .1); s.time += .8; api.__test.tick(s, .1);
    const lf = {}; api.drawOverlay(stubCtx(lf, W * dpr, H * dpr), s, {}, W, H); const name = lf.texts.find(x => /레비아탄/.test(x.t)); assert.ok(name, 'form banner'); const FB = api.__test.lastBand();
    assert.ok(px(name.font) >= px(title.font) / dpr * 1.25, W + ': form type ' + name.font + ' vs title ' + title.font + ' (/dpr)');
    assert.ok(px(name.font) >= (W < 900 ? 26 : 38), W + ': form type ' + name.font);
    assert.ok(TB.bw / dpr >= FB.bw - 1, 'title widest ' + TB.bw / dpr + ' vs ' + FB.bw);
    const dim = lf.fills.find(f => f.op === 'source-over' && /^#0[0-9a-f]{5}$/i.test(String(f.style)) && f.alpha >= .2 && f.alpha <= .5); assert.ok(dim, W + ': arena dim under the banner');
    assert.ok(!lf.fillRects.some(r => r.w >= W && !(r.style && r.style.radial)), 'dim is a path fill, not a fillRect wash'); }
});
test('phone: title band clear of the native boss-phase panel (y <= 51) and of the inline pips (x < 226)', () => {
  const api = bfEnv({ innerWidth: 844, innerHeight: 390 }); const s = bw({ enemies: [envy()] }); api.__test.tick(s, 1 / 60); s.time += .6; api.__test.tick(s, .1);
  api.__test.render(stubCtx({}, 1688, 780), s, {}); const B = api.__test.lastBand();
  assert.ok((B.cy - B.bh / 2) / 2 >= 60, 'band top ' + (B.cy - B.bh / 2) / 2); assert.ok(B.x0 / 2 >= 226, 'band left ' + B.x0 / 2); assert.ok((B.cy + B.bh / 2) / 2 <= 120, 'above the hero row');
});
test('spell card: "제2형태" is its own bold tag (not buried in the small boss line); phone and PC', () => {
  for (const [W, H] of [[1280, 720], [844, 390]]) { const form = { titleUntil: () => -1, formBannerUntil: () => -1, transforming: () => false, formStage: () => 1 };
    const { env, s } = arena({ form, innerWidth: W, innerHeight: H }); run(env, s, 4); const l = layerScreen(env, s, {}, W, H);
    const tag = l.texts.find(x => /^제2형태$/.test(x.t)); assert.ok(tag, W + ': own tag ' + JSON.stringify(l.texts.map(x => x.t)));
    assert.ok(/bold/.test(tag.font) && px(tag.font) >= 10 && tag.alpha >= .9, 'bold, opaque ' + tag.font + ' ' + tag.alpha); assert.ok(/ff/i.test(String(tag.style).slice(1, 3)), 'red/rose tag ' + tag.style); }
});
test('spell card: collapses within .45 s of the spell break (no card sitting there without a timer)', () => {
  const { env, s } = arena(); run(env, s, 4); const m = env.rc.world(s); assert.ok(m.banner); m.banner.result = 'fail'; m.banner.resultAt = s.time; m.banner.resultPosted = true; m.run = null;
  s.time += .2; const l1 = layerScreen(env, s); const n1 = l1.texts.find(x => x.t === m.banner.name); assert.ok(n1 && n1.alpha < .8, 'fading ' + (n1 && n1.alpha));
  s.time += .3; layerScreen(env, s); assert.strictEqual(m.banner, null, 'gone .5 s after the break');
});
test('tally: counts up, then a total line', () => {
  const { env, s } = arena(); run(env, s, 3); const m = env.rc.world(s); ident(m); s.enemies[0].hp = 0; tick(env, s); run(env, s, 1.2);
  const early = feelScreen(env, s); assert.ok(has(early, /격파 결산/) && !has(early, /^합계$/), 'no total while counting');
  run(env, s, 1.3); const late = feelScreen(env, s); const tot = textAt(late, /^합계$/); assert.ok(tot, 'total line'); const rows = late.texts.filter(x => /획득 점수|격파 시간/.test(x.t));
  assert.ok(tot.y > Math.max(...rows.map(r => r.y)), 'total under the rows'); const v = late.texts[late.texts.indexOf(tot) + 1]; assert.ok(v && px(v.font) > px(rows[0].font), 'total value larger ' + (v && v.font));
  assert.strictEqual(String(v.t).replace(/\D/g, ''), String(Math.round(env.feel.state(s).score)), 'total = score');
});

// ---------------------------------------------------------------- 5/6. phone HUD
test('phone HUD: pips inline with the resonance bar (not a row under it); warning band clear of them', () => {
  const K = makeEnv().kit.__test; const ph = K.hudBox(844, 390, true);
  assert.ok(ph[0] >= 106 && ph[1] >= 52 && ph[1] + ph[3] <= 75, 'inline box ' + ph); assert.ok(ph[0] + ph[2] <= 226, 'compact ' + ph);
  const F = makeEnv().feel.__test; const B = F.warnBox(844, 390, true, true, null, 0); assert.ok(B[0] - B[2] / 2 >= ph[0] + ph[2] + 2, 'warning left ' + (B[0] - B[2] / 2)); assert.ok(B[0] + B[2] / 2 <= 844 - 56, 'clear of the gear');
});
test('phone: the native "GRAZE n" label is moved fully clear of the settings gear (text hook); PC untouched', () => {
  for (const [W, H, moved] of [[844, 390, true], [1280, 720, false]]) { const rec = [];
    class C2D { fillText(t, x, y) { rec.push([t, x, y]); } strokeText() {} }
    const { sb } = bfEnv({ innerWidth: W, innerHeight: H, full: true, globals: { CanvasRenderingContext2D: C2D, MutationObserver: undefined } });
    const c = new C2D(); c.textAlign = 'right'; c.fillText('GRAZE 12', W - 10, 21); c.fillText('피해 5% 감소 · 1.2s', W - 10, 35); c.fillText('점수 10', W - 10, 21);
    if (moved) { assert.ok(rec[0][1] <= W - 100, 'left of the gear (x <= w-100): ' + rec[0][1]); assert.ok(rec[0][2] >= 36, 'under the score line: ' + rec[0][2]); assert.ok(rec[1][1] <= W - 100 && rec[1][2] > rec[0][2], 'guard line follows'); }
    else { assert.deepStrictEqual(rec[0], ['GRAZE 12', W - 10, 21]); } assert.deepStrictEqual(rec[2], ['점수 10', W - 10, 21]); }
});

// ---------------------------------------------------------------- 7. heart readability
test('native status label: ghosted above the head while hostile bullets are near, native when clear', () => {
  const seen = []; const fb = function (ctx, s) { seen.push(s.lifestealSuppressedUntil > s.time); if (s.lifestealSuppressedUntil > s.time) ctx.fillText('흡혈 억제', 600, 300); return true; };
  const { env, s } = arena({ feedback: fb }); run(env, s, 3); const m = env.rc.world(s); ident(m); env.recheck(); env.recheck();
  s.lifestealSuppressedUntil = s.time + 5; const F = env.sb.__HAPIL_FEEDBACK_RC128__;
  m.pool.live = 0; feelScreen(env, s); let log = {}; F.draw(stubCtx(log), s, { width: 1280, height: 720 }, {});
  assert.strictEqual(seen.pop(), true, 'native label untouched with no bullets near'); assert.ok(log.texts.filter(x => /흡혈 억제/.test(x.t)).length === 1);
  m.pool.live = 1; m.pool.x[0] = m.hx + 30; m.pool.y[0] = m.hy; feelScreen(env, s); log = {}; F.draw(stubCtx(log), s, { width: 1280, height: 720 }, {});
  assert.strictEqual(seen.pop(), false, 'native label suppressed for this draw'); assert.ok(s.lifestealSuppressedUntil > s.time, 'state restored');
  const g = log.texts.find(x => /흡혈 억제/.test(x.t)); assert.ok(g, 'ghost label'); assert.ok(g.alpha <= .45, 'ghost alpha ' + g.alpha); assert.ok(g.y <= m.hy - 50, 'above the head: ' + g.y + ' vs heart ' + m.hy);
});
test('Michaela heart impact: hero colour family only (no red/pink burst), sheet tinted once', () => {
  const { env, s } = arena({ world: { activeHeroId: 'michaela' } }); run(env, s, .5); env.feel.heartImpact(s, { x: 27, y: 11 }, { heroId: 'michaela', actionKey: 'A' });
  const l = worldDraw(env, s); for (const f of l.fills.concat(l.strokes)) { const c = String(f.style); if (/^#[0-9a-f]{6}$/i.test(c) && !/0a0612/i.test(c)) { const h = hueOf(c); assert.ok(h.s < .15 || (h.h >= 25 && h.h <= 65), 'hero family colour ' + c); } }
  assert.strictEqual(typeof env.feel.__test.tintHit, 'function', 'hue layer baked through a helper');
});
test('familiars: bigger soft motes in a friendly rose-white (not the hero/boss gold), no glyph, wider orbit', () => {
  const { env, s } = arena(); run(env, s, .5); const k = env.kit.__test.worlds.get(s); k.points = 14; k.level = 4; run(env, s, .5); for (const sh of k.shots) sh.on = false; for (const F of k.fam) F.flash = -9;
  const K = env.kit.__test, col = K.famColor(), tone = env.feel.heroTone(s); assert.ok(/^#[0-9a-f]{6}$/i.test(col) && col.toLowerCase() !== tone.body.toLowerCase(), 'own colour ' + col);
  const h = hueOf(col); assert.ok(!(h.h >= 30 && h.h <= 62 && h.s > .25), 'not gold ' + JSON.stringify(h)); assert.ok(!/^#fff(fff)?$/i.test(col), 'not pure white');
  assert.ok(K.famSize() >= 36 && K.famSize() <= 40, 'size ' + K.famSize());
  const l = worldDraw(env, s); const glow = l.images.filter(i => i.op === 'lighter'); assert.ok(glow.length >= 4 && Math.min(...glow.map(i => i.a[2])) >= 52, 'glow >= 52 px ' + glow.map(i => Math.round(i.a[2])));
  assert.ok(!l.fills.some(f => f.style === tone.body), 'no hero-gold glyph / trail fills'); assert.ok(l.fills.filter(f => String(f.style).toLowerCase() === col.toLowerCase()).length >= 4, 'mote bodies in the friendly colour');
  const xs = []; for (let i = 0; i < 120; i++) { tick(env, s); xs.push(k.fam[0].x - env.rc.world(s).hx); } assert.ok(Math.max(...xs) - Math.min(...xs) >= 16, 'orbit width ' + (Math.max(...xs) - Math.min(...xs)));
});

// ---------------------------------------------------------------- 8. PC hint / score plate
test('PC: "D×2 폭탄" hint next to the bomb discs; phone keeps the badge only', () => {
  const pc = arena(); run(pc.env, pc.s, 3); const l = feelScreen(pc.env, pc.s); const B = pc.env.kit.__test.hudBox(1280, 720, false), hint = pc.env.kit.__test.hint();
  assert.strictEqual(hint.text, 'D×2 폭탄'); assert.ok(hint.sprite && hint.h >= 20, 'baked hint sprite');
  const im = l.images.find(i => i.a.length === 4 && i.a[2] === hint.w && i.a[3] === hint.h); assert.ok(im, 'hint drawn'); const [x, y, w, h] = im.a;
  assert.ok(y >= B[1] && y + h <= B[1] + B[3] && x >= B[0] + 150 && x + w <= B[0] + B[2], 'inside the plate, after the discs ' + im.a + ' box ' + B);
  const ph = arena({ innerWidth: 844, innerHeight: 390 }); run(ph.env, ph.s, 1); const lp = feelScreen(ph.env, ph.s, {}, 844, 390);
  assert.ok(!lp.images.some(i => i.a.length === 4 && i.a[2] === hint.w && i.a[3] === hint.h) && !has(lp, /D×2/), 'phone: no text hint');
});
test('score/combo: backing plate >= .7 alpha; combo line bright', () => {
  const { env, s } = arena(); run(env, s, 1); const f = env.feel.__test.worlds.get(s); f.chain = 12; f.chainUntil = s.time + 5; const l = feelScreen(env, s);
  const si = l.seq.findIndex(e => e[0] === 'text' && /점수/.test(e[1].t)); const plate = l.seq.slice(0, si).reverse().find(e => e[0] === 'fill' && /^#0/.test(String(e[1].style))); assert.ok(plate && plate[1].alpha >= .7, 'plate ' + JSON.stringify(plate && plate[1]));
  const c = textAt(l, /연쇄/); assert.ok(c && px(c.font) >= 13, 'combo size ' + (c && c.font));
});

console.log('rc240-r5-feel-unit: ' + passed + ' passed');
if (process.exitCode) console.error('rc240-r5-feel-unit: FAILED');
