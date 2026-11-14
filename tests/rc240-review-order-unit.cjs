'use strict';
// RC240 review round 2: draw order of the second-form white-out. The boss-form
// overlay (boss-centred additive flash + ring) must be the last RC240 drawing of
// the frame: after the danmaku world pass (telegraphs, formation trails, native
// projectile outlines, bullets), after the danmaku screen pass (spell banner,
// flash, hit vignette) and after the STG-feel / arcade-kit HUD, on PC and phone,
// so during its peak it covers bullets and formations. Loads the shipped
// danmaku-layer, stg-feel, arcade-kit and boss-form in one vm (no browser).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..', 'assets', 'rc240');
const src = f => fs.readFileSync(path.join(dir, f), 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } }

// Every canvas operation appends to one shared sequence, tagged with the module
// that issued it (taken from the call stack: the vm filename of the caller).
function stubCtx(seq, W, H) {
  const who = () => { const st = new Error().stack.split('\n'); for (const l of st.slice(3)) { const m = /(danmaku-layer|stg-feel|arcade-kit|boss-form)\.js/.exec(l); if (m) return m[1]; } return 'other'; };
  const op = (k, extra) => seq.push({ k, who: who(), ...extra });
  const c = {
    canvas: { width: W, height: H, getBoundingClientRect: () => ({ width: W / 2, height: H / 2 }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineCap: 'butt', lineJoin: 'miter', lineDashOffset: 0, shadowBlur: 0,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createRadialGradient: (...a) => ({ radial: a, addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage() { op('drawImage', { op: this.globalCompositeOperation, alpha: this.globalAlpha }); },
    fillRect(x, y, w, h) { op('fillRect', { op: this.globalCompositeOperation, alpha: this.globalAlpha, w, h, radial: !!(this.fillStyle && this.fillStyle.radial) }); },
    fillText(t) { op('fillText', { t: String(t) }); }, strokeText(t) { op('strokeText', { t: String(t) }); },
    stroke() { op('stroke'); }, fill() { op('fill'); },
  };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'ellipse', 'moveTo', 'lineTo', 'closePath', 'setTransform', 'setLineDash', 'rect', 'clip', 'bezierCurveTo', 'quadraticCurveTo', 'strokeRect', 'clearRect', 'resetTransform']) c[k] = function () {};
  return c;
}
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });

function makeEnv(W, H, innerW, innerH) {
  const timers = [], raf = [];
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; } set src(v) { this._s = v; } get src() { return this._s; } }
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp,
    location: { search: '?rc240=1' }, innerWidth: innerW, innerHeight: innerH,
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: fn => { raf.push(fn); return raf.length; },
    performance: { now: () => 0 }, Image: FakeImage, addEventListener() {},
    document: { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => stubCtx([], 64, 64), toDataURL: () => 'data:,' }), querySelector: () => null, body: null },
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb);
  let ps = (cache, a) => a.sprite;
  sb.__HAPIL_RC86_BRIDGE__ = { project, zoneActors: z => (/^rest|^hub/.test(z) ? [] : [{ id: 'z-' + z }]), actor: () => null, runtimeSprite: (c, p, f) => p ?? f, get phaseSprite() { return ps; }, set phaseSprite(v) { ps = v; } };
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() {}, draw() {}, danger() { return 0; } };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ installed: true, mode: s => s?.gameModeV31346 ?? 'STORY', draw() {} });
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ installed: true, afterHit() {}, render() {}, background() {}, imminent: () => null, decorateAttack() {} });
  sb.__HAPIL_COMBAT_V31333__ = { core: s => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; } };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount) { s.hp -= amount; return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0 && !s.paused, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: s => s.phaseStub ?? null };
  sb.__HAPIL_CHANNEL_V31364__ = { active: () => false, blockDamage: () => true };
  const binding = { phase: 'game', settings: { current: { sound: false } }, state: { current: null }, input: { current: new Set() }, modal: { current: null }, cache: { current: {} }, actions: { sound() {} } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => 'auto', hasHeldLogical: () => false };
  const run = f => vm.runInContext(src(f), sb, { filename: f });
  const flush = () => { for (let i = 0; i < 80 && timers.length; i++) timers.shift()(); };
  run('danmaku-layer.js'); flush(); run('stg-feel.js'); run('arcade-kit.js'); flush(); run('boss-form.js'); flush();
  return { sb, binding, rc: sb.__HAPIL_DANMAKU_RC240__, feel: sb.__HAPIL_STG_FEEL_RC240__, bf: sb.__HAPIL_BOSS_FORM_RC240__, W, H };
}
const envy = (o = {}) => ({ id: 'b03-boss', name: '레비아탄', boss: true, x: 27.4, y: 11.5, hp: 37197, maxHp: 37197, humanPhase0: true, phaseCount: 3, phaseSprites: ['a', 'b_human', 'c_demon.webp'], sprite: 'b', ...o });
const phase = (o = {}) => ({ ownerId: 'b03-boss', serial: 0, index: 0, band: 1, stage: 'active', elapsed: 2, remaining: 10, duration: 12, ...o });
function world() {
  return { zone: 'ep1b03', time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [envy()], hostileProjectiles: [], effects: [], fxSerial: 1, invulnerableUntil: 1e9, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], pendingStrikes: [], activeHeroId: 'hunter', awakeningUntil: 0, combatFeedbackV31329: [], phaseStub: phase({ elapsed: 0 }), targetEnemyId: 'b03-boss' };
}
function step(env, s, dt = 1 / 60) { s.time += dt; s.phaseStub.elapsed += dt; env.sb.__HAPIL_LASERS_V31330__.tick(s, dt); env.rc.__test.simTick?.(s, dt); env.bf.__test.tick(s, dt); }

for (const [label, W, H, iw, ih, set] of [['PC', 2560, 1288, 1280, 644, { reducedFlash: false }], ['phone', 1624, 750, 812, 375, { reducedFlash: true, lowFx: true }]]) {
  test(label + ': the second-form overlay is the last RC240 drawing of the frame, after bullets, formations, banner and HUD', () => {
    const env = makeEnv(W, H, iw, ih); const s = world(); env.binding.state.current = s; env.binding.settings.current = { ...env.binding.settings.current, ...set };
    // a running spell with live RC240 bullets
    for (let i = 0; i < 600 && !(env.rc.live(s) > 20); i++) step(env, s);
    assert.ok(env.rc.live(s) > 20, 'spell running with live RC240 bullets: ' + env.rc.live(s));
    // cross 50 %: second form starts, white-out peak 0.04 s later
    s.enemies[0].hp = s.enemies[0].maxHp * .48; step(env, s); step(env, s, .03);
    const f = env.bf.form(s, 'b03-boss'); assert.ok(f && f.transforming, 'transforming');
    // native projectiles (outlined by the danmaku world pass) are still on the field during the flash
    s.hostileProjectiles = Array.from({ length: 8 }, (_, i) => ({ x: 16 + i, y: 14, damage: 10, radius: .5 }));
    const seq = [];
    env.rc.__test.drawLayer(stubCtx(seq, W, H), s, set);
    const flash = seq.findIndex(o => o.who === 'boss-form' && o.k === 'fillRect' && o.op === 'lighter' && o.radial && o.alpha > 0);
    assert.ok(flash >= 0, 'overlay flash drawn in the frame');
    const danmaku = seq.map((o, i) => o.who === 'danmaku-layer' && /draw|fill|stroke|Text/.test(o.k) ? i : -1).filter(i => i >= 0);
    const feel = seq.map((o, i) => (o.who === 'stg-feel' || o.who === 'arcade-kit') && /draw|fill|stroke|Text/.test(o.k) ? i : -1).filter(i => i >= 0);
    assert.ok(danmaku.length > 0, 'danmaku world/screen pass drew something (native outlines, banner)');
    assert.ok(Math.max(...danmaku) < flash, 'every danmaku drawing precedes the flash: last danmaku op ' + Math.max(...danmaku) + ' vs flash ' + flash);
    if (feel.length) assert.ok(Math.max(...feel) < flash, 'every STG-feel / arcade-kit HUD drawing precedes the flash');
    assert.ok(seq.slice(flash + 1).every(o => o.who === 'boss-form' || !/draw|fill|stroke|Text/.test(o.k)), 'nothing but the overlay itself draws after the flash');
    // the under-HUD fallback flash in boss-form render() stays off while the overlay is live
    const wseq = []; env.bf.__test.render(stubCtx(wseq, W, H), s, set);
    assert.ok(!wseq.some(o => o.k === 'fillRect' && o.op === 'lighter' && o.radial), 'no duplicate flash under the bullets');
  });
}

console.log(`rc240-review-order-unit: ${passed} passed`);
