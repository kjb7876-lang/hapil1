'use strict';
// RC240 boss form: weak-point parts, one-way two-stage transformation, stage
// title card, Michaela heart shot, last302 canon names, hexagram replacement of
// cross shapes/text, story-mode-only scope and install discipline.
// Loads the shipped script in a vm with stubbed globals (no browser needed).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = path.join(__dirname, '..', 'assets', 'rc240', 'boss-form.js');
const bundleFile = path.join(__dirname, '..', 'assets', 'index-v31526.js');
const source = fs.readFileSync(file, 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } }

function stubCtx(log) {
  const c = {
    canvas: { width: 1280, height: 720 },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', lineCap: 'butt', lineJoin: 'miter',
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage() { log.drawImage = (log.drawImage || 0) + 1; },
    fillRect(x, y, w, h) { log.fillRects.push({ alpha: this.globalAlpha, style: this.fillStyle, w, h }); },
    fillText(t) { log.texts.push(String(t)); },
  };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'ellipse', 'fill', 'stroke', 'moveTo', 'lineTo', 'closePath', 'setTransform', 'setLineDash', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo', 'clip', 'rect', 'strokeRect', 'clearRect'])
    c[k] = function () { log[k] = (log[k] || 0) + 1; };
  let blur = 0;
  Object.defineProperty(c, 'shadowBlur', { get: () => blur, set: v => { blur = v; }, enumerable: true });
  return c;
}

const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
const ENVY_SPRITES = ['./assets/generated-v31224/actors-normalized/1a8ca2c5759b_ep1b03_envy_sister_phase0.webp', './assets/generated-v31224/actors-normalized/e40217032c7a_boss_envy_human.webp', './assets/generated-v31224/actors-normalized/9101cdeb2394_boss_envy_demon.webp'];
function envy(over = {}) {
  return { id: 'b03-boss', name: '호텔 부매니저 · 레비아탄', boss: true, x: 24, y: 12, hp: 37197, maxHp: 37197, humanPhase0: true, phaseCount: 3, phaseMax: 2, phaseThresholds: [0.7, 0.36], phaseSprites: [...ENVY_SPRITES], phaseSpriteFallbacks: [...ENVY_SPRITES], sprite: ENVY_SPRITES[1], fixedPhase: 0, ...over };
}
function balrog(over = {}) {
  return { id: 'dist06-boss', name: '발록 · 지옥의 문지기', boss: true, kind: 'balrog', x: 24, y: 12, hp: 18170, maxHp: 18170, sprite: './assets/generated-v31224/actors-normalized/bbebbf19f4e6_balrog_gatekeeper.webp', ...over };
}
function world(over = {}) {
  return { x: 8, y: 12, hp: 200, maxHp: 240, time: 100, zone: 'ep1b03', gameModeV31346: 'STORY', activeHeroId: 'hunter', enemies: [], effects: [], hostileProjectiles: [], pendingStrikes: [], floatTexts: [], fxSerial: 1, ...over };
}

function makeEnv(search = '?rc240=1', opts = {}) {
  const timers = [];
  const log = { afterHitBase: 0, renderBase: 0, cancel: [], power: [], coins: [], images: [] };
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; this._src = ''; log.images.push(this); } set src(v) { this._src = String(v); } get src() { return this._src; } }
  const zones = opts.zones || {
    ep1b03: [envy()], dist06: [balrog()], ep1b08: [{ id: 'mb-ep1b08', name: '역십자가 시체경호체', midboss: true }, { id: 'l08-e1', name: '창처럼 날아오는 역십자가' }],
    last302: [{ id: 'mb-last302-v31231', name: '검은 안개 심장 · 불면의 기억', midboss: true, hp: 45200, maxHp: 45200 }, { id: 'l302-e2', name: '잠들지 못한 검은 영혼', kind: 'wolf' }],
    restEp1b: [], hub: [],
  };
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp,
    location: { search }, innerWidth: opts.innerWidth ?? 1280,
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0, clearInterval() {},
    performance: { now: () => 0 }, Image: FakeImage,
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx({ fillRects: [], texts: [] }), toDataURL: () => 'data:image/png;base64,AAAA' }), querySelector: () => null, body: null },
  };
  sb.window = sb; sb.globalThis = sb;
  const flush = (max = 50) => { for (let i = 0; i < max && timers.length; i++) timers.shift()(); };
  const deps = () => {
    let phaseSpriteFn = (cache, a) => { const ph = a.fixedPhase || 0; return Array.isArray(a.phaseSprites) ? a.phaseSprites[Math.min(a.phaseSprites.length - 1, ph)] : a.sprite; };
    sb.__HAPIL_RC86_BRIDGE__ = Object.freeze({
      project, zoneActors: z => zones[z] ?? [], actor: (z, id) => (zones[z] ?? []).find(a => a.id === id) ?? null,
      runtimeSprite: (cache, pose, fallback) => pose ?? fallback,
      get phaseSprite() { return phaseSpriteFn; }, set phaseSprite(v) { phaseSpriteFn = v; },
    });
    const loop = { version: 'L', installed: true, afterHit() { log.afterHitBase++; }, render() { log.renderBase++; }, background() {}, imminent: () => null, decorateAttack() {} };
    Object.defineProperty(loop, 'rc225Wrapped', { value: true });
    Object.defineProperty(loop, 'rc226Wrapped', { value: true });
    sb.__HAPIL_LOOP_V31365__ = Object.freeze(loop);
    sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ installed: true, mode: s => s?.gameModeV31346 ?? (s?.hellModeV31322 ? 'HELL' : 'STORY'), draw() {} });
    sb.__HAPIL_COMBAT_V31333__ = { core: s => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; } };
    sb.__HAPIL_CONTROLS_V31329__ = { binding: { state: { current: null }, cache: { current: {} }, settings: { current: { reducedFlash: false } } } };
    if (!opts.noRc240) sb.__HAPIL_DANMAKU_RC240__ = { installed: true, enabled: () => true, cancelAll(s, reason, x, y) { log.cancel.push({ reason, x, y }); return 5; } };
    if (!opts.noFeel) sb.__HAPIL_STG_FEEL_RC240__ = Object.freeze({ dropPower(s, x, y, n) { log.power.push({ x, y, n }); }, dropCoins(s, x, y, n) { log.coins.push({ x, y, n }); } });
    sb.__HAPIL_NARRATION_DISPLAY_DATA_RC139__ = { rows: [{ keys: ['ep1b08'], display: '나는 거꾸로 된 십자가와 피로 그린 문양을 보았다. 거꾸로 매달린 십자가.' }] };
  };
  if (!opts.lateDeps) deps();
  vm.createContext(sb);
  vm.runInContext(source, sb, { filename: file });
  return { sb, timers, flush, log, deps, api: () => sb.__HAPIL_BOSS_FORM_RC240__, zones };
}
function ready(search, opts) { const env = makeEnv(search, opts); env.flush(); assert.ok(env.api(), 'api exposed'); assert.strictEqual(env.api().installed, true, 'installed'); return env; }
function ctxLog() { return { fillRects: [], texts: [] }; }

// ---------------------------------------------------------------- install / flags
test('installs through polling, wraps LOOP afterHit/render and bridge.phaseSprite once (idempotent)', () => {
  const env = makeEnv('?rc240=1', { lateDeps: true });
  env.flush(3); assert.strictEqual(env.api().installed, false, 'waits for deps');
  env.deps(); env.flush();
  const api = env.api(); assert.strictEqual(api.installed, true);
  const L = env.sb.__HAPIL_LOOP_V31365__;
  assert.ok(Object.isFrozen(L), 'LOOP stays frozen');
  assert.strictEqual(L.rc226Wrapped, true, 'non-enumerable markers preserved');
  assert.strictEqual(L.rc225Wrapped, true);
  const s = world(); env.sb.__HAPIL_CONTROLS_V31329__.binding.state.current = s;
  L.afterHit(s, null, 0, 0, null); L.render(stubCtx(ctxLog()), s, {}, 'front');
  assert.strictEqual(env.log.afterHitBase, 1); assert.strictEqual(env.log.renderBase, 1);
  api.__test.recheck(); api.__test.recheck();
  const L2 = env.sb.__HAPIL_LOOP_V31365__; L2.afterHit(s, null, 0, 0, null); L2.render(stubCtx(ctxLog()), s, {}, 'front');
  assert.strictEqual(env.log.afterHitBase, 2, 'recheck does not double-wrap afterHit');
  assert.strictEqual(env.log.renderBase, 2, 'recheck does not double-wrap render');
  // Re-running the script keeps the first API.
  vm.runInContext(source, env.sb, { filename: file }); env.flush();
  assert.strictEqual(env.api(), api, 'second load is a no-op');
});

test('default OFF under ?qa unless rc240=1; ON without qa', () => {
  assert.strictEqual(ready('?qa=1').api().enabled(), false);
  assert.strictEqual(ready('?qa=1&rc240=1&rc240gov=0').api().enabled(), true);
  assert.strictEqual(ready('').api().enabled(), true);
  assert.strictEqual(ready('?rc240=0').api().enabled(), false);
});

// ---------------------------------------------------------------- parts
test('each live story boss gets two weak-point parts at ~8% maxHp each, placed from the torso anchor', () => {
  const env = ready(); const api = env.api(); const s = world({ enemies: [envy()] });
  api.__test.tick(s, 1 / 60);
  const parts = api.parts(s, 'b03-boss');
  assert.strictEqual(parts.length, 2);
  for (const p of parts) {
    assert.ok(Math.abs(p.maxHp - 37197 * 0.08) <= 37197 * 0.01, 'part hp ~8% of boss maxHp: ' + p.maxHp);
    assert.strictEqual(p.hp, p.maxHp); assert.strictEqual(p.broken, false);
    const a = project(24, 12);
    assert.ok(Math.abs(p.sx - a.x) < 140 && Math.abs(p.sy - (a.y - 120)) < 140, 'part near torso anchor');
    assert.ok(Number.isFinite(p.sx) && Number.isFinite(p.sy));
  }
  assert.notStrictEqual(Math.round(parts[0].sy), Math.round(parts[1].sy), 'parts sit on different shot lanes');
});

test('boss-targeted hero damage routes a share to the part nearest the hero shot lane; boss HP is not changed by the router', () => {
  const env = ready(); const api = env.api(); const s = world({ enemies: [envy()] });
  api.__test.tick(s, 1 / 60);
  const [p0, p1] = api.parts(s, 'b03-boss');
  const upper = p0.sy < p1.sy ? p0 : p1, lower = upper === p0 ? p1 : p0;
  // Put the hero's core on the upper part's lane.
  const target = s.enemies[0];
  const inv = sy => { const w = sy / 13.5; return w; }; // x+y for a screen y
  const coreY = upper.sy; const sum = inv(coreY + 42); s.x = sum / 2 + 1; s.y = sum / 2 - 1;
  const before = target.hp;
  env.sb.__HAPIL_LOOP_V31365__.afterHit(s, target, 500, 400, { id: 7, heroId: 'hunter', actionKey: 'A', targetId: target.id });
  assert.strictEqual(target.hp, before, 'router never touches boss HP (TTK unchanged)');
  const after = api.parts(s, 'b03-boss');
  const u2 = after.find(p => p.index === upper.index), l2 = after.find(p => p.index === lower.index);
  assert.ok(u2.hp < upper.hp, 'upper lane part damaged');
  assert.strictEqual(l2.hp, lower.hp, 'other part untouched');
  const share = (upper.hp - u2.hp) / 400; assert.ok(share > 0.1 && share <= 0.6, 'share in a sane band: ' + share);
  assert.strictEqual(env.log.afterHitBase, 1, 'base afterHit still runs');
  // NaN / non-boss / zero damage are ignored.
  env.sb.__HAPIL_LOOP_V31365__.afterHit(s, target, NaN, NaN, {});
  env.sb.__HAPIL_LOOP_V31365__.afterHit(s, { id: 'mob', hp: 10, maxHp: 10 }, 9, 9, {});
  assert.strictEqual(api.parts(s, 'b03-boss').find(p => p.index === upper.index).hp, u2.hp);
});

test('part break: burst, power/coin drops through STG feel only if present, partsBroken counts', () => {
  const env = ready(); const api = env.api(); const s = world({ enemies: [envy()] }); const t = s.enemies[0];
  api.__test.tick(s, 1 / 60);
  for (let i = 0; i < 400 && api.partsBroken(s, 'b03-boss') < 1; i++) env.sb.__HAPIL_LOOP_V31365__.afterHit(s, t, 2000, 2000, { id: i, heroId: 'hunter' });
  assert.strictEqual(api.partsBroken(s, 'b03-boss'), 1);
  assert.strictEqual(env.log.power.length, 1); assert.strictEqual(env.log.power[0].n, 2);
  assert.ok(Number.isFinite(env.log.power[0].x) && Number.isFinite(env.log.power[0].y));
  assert.strictEqual(env.log.coins.length, 1);
  assert.ok(api.metrics().bursts >= 1, 'burst VFX emitted');
  const log = ctxLog(); api.__test.render(stubCtx(log), s, {}); // must not throw while bursting
  // Without STG feel drop functions nothing throws.
  const env2 = ready('?rc240=1', { noFeel: true }); const api2 = env2.api(); const s2 = world({ enemies: [envy()] });
  api2.__test.tick(s2, 1 / 60);
  for (let i = 0; i < 400 && api2.partsBroken(s2, 'b03-boss') < 1; i++) env2.sb.__HAPIL_LOOP_V31365__.afterHit(s2, s2.enemies[0], 2000, 2000, { id: i });
  assert.strictEqual(api2.partsBroken(s2, 'b03-boss'), 1);
});

// ---------------------------------------------------------------- transformation
test('transformation triggers once at HP <= 50%, lasts 1.2 s, cancels RC240 bullets, and never flips back', () => {
  const env = ready(); const api = env.api(); const s = world({ enemies: [envy()] }); const a = s.enemies[0];
  api.__test.tick(s, 1 / 60);
  a.hp = a.maxHp * 0.6; api.__test.tick(s, 1 / 60);
  assert.strictEqual(api.form(s, 'b03-boss').stage, 0);
  a.hp = a.maxHp * 0.49; api.__test.tick(s, 1 / 60);
  const f = api.form(s, 'b03-boss');
  assert.strictEqual(f.stage, 1); assert.strictEqual(f.transforming, true);
  assert.strictEqual(env.log.cancel.length, 1, 'RC240 cancelAll called once');
  for (let i = 0; i < 80; i++) { s.time += 1 / 60; api.__test.tick(s, 1 / 60); }
  assert.strictEqual(api.form(s, 'b03-boss').transforming, false, 'transformation ends after ~1.2s');
  a.hp = a.maxHp * 0.95; s.time += .1; api.__test.tick(s, .1);
  assert.strictEqual(api.form(s, 'b03-boss').stage, 1, 'one-way: healing never reverts');
  a.hp = a.maxHp * 0.3; s.time += .1; api.__test.tick(s, .1);
  assert.strictEqual(env.log.cancel.length, 1, 'never re-triggers');
  assert.strictEqual(api.__test.TRANSFORM_DUR, 1.2);
});

test('transformation without RC240 api present does not throw', () => {
  const env = ready('?rc240=1', { noRc240: true }); const api = env.api(); const s = world({ enemies: [envy({ hp: 100, maxHp: 37197 })] });
  api.__test.tick(s, 1 / 60); assert.strictEqual(api.form(s, 'b03-boss').stage, 1);
});

test('sprite override: 7-sins human -> demon after transform, one-way, at the bridge.phaseSprite seam', () => {
  const env = ready(); const api = env.api(); const s = world({ enemies: [envy()] }); const a = s.enemies[0];
  env.sb.__HAPIL_CONTROLS_V31329__.binding.state.current = s;
  const ps = env.sb.__HAPIL_RC86_BRIDGE__.phaseSprite;
  api.__test.tick(s, 1 / 60);
  assert.ok(!/demon/.test(ps({}, a, s.time)), 'human before transform');
  a.hp = a.maxHp * 0.45; api.__test.tick(s, 1 / 60);
  for (let i = 0; i < 80; i++) { s.time += 1 / 60; api.__test.tick(s, 1 / 60); }
  assert.ok(/9101cdeb2394_boss_envy_demon/.test(ps({}, a, s.time)), 'demon after transform: ' + ps({}, a, s.time));
  a.hp = a.maxHp; s.time += .1; api.__test.tick(s, .1);
  assert.ok(/boss_envy_demon/.test(ps({}, a, s.time)), 'still demon after heal');
  assert.strictEqual(a.fixedPhase, 0, 'real actor phase data untouched');
  const F = api.__test.FORMS;
  for (const id of ['b02-boss', 'b03-boss', 'b04-boss', 'b05-boss', 'b06-boss', 'b07-boss', 'b08-boss', 'u203-boss', 'k103-boss', 'h103-boss', 'l303-boss', 'a11-boss', 'mb-dist01'])
    assert.ok(F[id], 'form config for ' + id);
});

test('no-art boss gets a procedural transformation (tint/aura/crack overlay) and is listed as needing art', () => {
  const env = ready(); const api = env.api(); const s = world({ zone: 'dist06', enemies: [balrog({ hp: 1000 })] });
  env.sb.__HAPIL_CONTROLS_V31329__.binding.state.current = s;
  api.__test.tick(s, 1 / 60);
  const f = api.form(s, 'dist06-boss'); assert.strictEqual(f.stage, 1); assert.strictEqual(f.procedural, true);
  const log = ctxLog(); api.__test.render(stubCtx(log), s, { reducedFlash: false });
  assert.ok((log.arc || 0) + (log.drawImage || 0) + (log.stroke || 0) > 0, 'overlay drawn');
  assert.ok(api.__test.NEEDS_ART.some(r => r.id === 'dist06-boss'), 'listed in 새로 필요');
});

test('white-out is reducedFlash-safe (peak alpha capped) and draw never advances the simulation', () => {
  const peak = (reduced) => {
    const env = ready(); const api = env.api(); const s = world({ enemies: [envy({ hp: 100 })] });
    api.__test.tick(s, 1 / 60); let max = 0;
    for (let i = 0; i < 72; i++) { s.time += 1 / 60; api.__test.tick(s, 1 / 60); const log = ctxLog(); api.__test.render(stubCtx(log), s, { reducedFlash: reduced });
      for (const r of log.fillRects) if (r.w >= 1280 && Number.isFinite(r.alpha)) max = Math.max(max, r.alpha); }
    const t0 = s.time, f0 = JSON.stringify(api.form(s, 'b03-boss')); for (let i = 0; i < 5; i++) api.__test.render(stubCtx(ctxLog()), s, {});
    assert.strictEqual(s.time, t0); assert.strictEqual(JSON.stringify(api.form(s, 'b03-boss')), f0);
    return max;
  };
  const full = peak(false), reduced = peak(true);
  assert.ok(full > 0.2 && full <= 0.75, 'visible white-out pulse: ' + full);
  assert.ok(reduced <= 0.25, 'reducedFlash caps white-out: ' + reduced);
});

// ---------------------------------------------------------------- title card
test('stage title card shows the zone Korean name for 1.8 s on combat-zone entry, no dialogue', () => {
  const env = ready(); const api = env.api(); const s = world({ zone: 'restEp1b' });
  api.__test.tick(s, 1 / 60); assert.strictEqual(api.titleCard(s), null, 'rest zone: no card');
  s.zone = 'ep1b03'; s.time += .1; api.__test.tick(s, 1 / 60);
  const c = api.titleCard(s); assert.ok(c); assert.strictEqual(c.text, '금이 간 안경'); assert.ok(Math.abs(c.until - c.born - 1.8) < 1e-6);
  const log = ctxLog(); api.__test.render(stubCtx(log), s, {});
  assert.ok(log.texts.includes('금이 간 안경'), 'banner text drawn');
  assert.ok(log.texts.every(t => t.length <= 24), 'only a short title, no subtitles');
  s.time += 1.9; api.__test.tick(s, 1 / 60); assert.strictEqual(api.titleCard(s), null);
  s.zone = 'last302'; s.time += .1; api.__test.tick(s, 1 / 60); assert.strictEqual(api.titleCard(s).text, '잠들지 못하는 마을');
  assert.strictEqual(api.__test.ZONE_NAMES.dist06, '지옥의 소환진');
});

// ---------------------------------------------------------------- story-mode scope
test('parts, transformation, title card and last302 fix are inert outside STORY mode', () => {
  for (const mode of ['DREAM', 'HELL']) {
    const env = ready(); const api = env.api(); const lp = { id: 'mb-last302-v31231', name: '검은 안개 심장 · 불면의 기억', midboss: true, hp: 45200, maxHp: 45200, x: 20, y: 10 };
    const s = world({ gameModeV31346: mode, enemies: [envy({ hp: 100 })] });
    api.__test.tick(s, 1 / 60);
    assert.strictEqual(api.parts(s, 'b03-boss').length, 0, mode + ': no parts');
    assert.ok(!api.form(s, 'b03-boss') || api.form(s, 'b03-boss').stage === 0, mode + ': no transform');
    assert.strictEqual(env.log.cancel.length, 0);
    s.zone = 'last302'; s.enemies = [lp]; s.time += .2; api.__test.tick(s, 1 / 60);
    assert.strictEqual(api.titleCard(s), null, mode + ': no title');
    assert.strictEqual(lp.name, '검은 안개 심장 · 불면의 기억', mode + ': last302 untouched');
    const ps = env.sb.__HAPIL_RC86_BRIDGE__.phaseSprite; const a = envy({ hp: 100 });
    assert.strictEqual(ps({}, a, 0), ENVY_SPRITES[0], mode + ': native sprite');
  }
  // Practice and disabled are also inert.
  const env = ready('?qa=1'); const s = world({ enemies: [envy({ hp: 100 })] }); env.api().__test.tick(s, 1 / 60);
  assert.strictEqual(env.api().parts(s, 'b03-boss').length, 0);
});

test('awakening / hero-switch paths are not touched', () => {
  const env = ready(); const api = env.api();
  const s = world({ enemies: [envy()], activeHeroId: 'michaela', awakeningUntil: 200, egoAwakenedRC91: true });
  const snapshot = JSON.stringify({ a: s.activeHeroId, u: s.awakeningUntil, e: s.egoAwakenedRC91 });
  api.__test.tick(s, 1 / 60);
  assert.strictEqual(JSON.stringify({ a: s.activeHeroId, u: s.awakeningUntil, e: s.egoAwakenedRC91 }), snapshot);
  assert.ok(!/awaken|switchHero|activeHeroId\s*=[^=]/.test(source.replace(/\/\/.*$/gm, '')), 'source never assigns hero/awakening state');
});

// ---------------------------------------------------------------- last302
test('last302 canon: midboss display name becomes 꼭두각시 실안개 (stats untouched); villager art listed as needed', () => {
  const env = ready(); const api = env.api();
  const mb = { id: 'mb-last302-v31231', name: '검은 안개 심장 · 불면의 기억', midboss: true, hp: 45200, maxHp: 45200, x: 20, y: 10, damage: 30 };
  const s = world({ zone: 'last302', enemies: [mb] });
  api.__test.tick(s, 1 / 60);
  assert.strictEqual(mb.name, '꼭두각시 실안개');
  assert.strictEqual(mb.hp, 45200); assert.strictEqual(mb.maxHp, 45200); assert.strictEqual(mb.damage, 30);
  assert.ok(api.__test.NEEDS_ART.some(r => /last302/.test(r.id) && /villager|주민/.test(r.what)), 'villager art listed as 새로 필요');
});

// ---------------------------------------------------------------- Michaela heart
test("Michaela's basic shot sprite resolves to a heart image (HOLD candidate), other heroes untouched", () => {
  const env = ready(); const api = env.api(); const s = world({ activeHeroId: 'michaela' });
  const cache = env.sb.__HAPIL_CONTROLS_V31329__.binding.cache.current; env.sb.__HAPIL_CONTROLS_V31329__.binding.state.current = s;
  api.__test.tick(s, 1 / 60); api.__test.seedImages(cache);
  const im = cache['./assets/vfx/heroes/michaela-a.webp'];
  assert.ok(im && im.rc240Heart === true, 'michaela-a resolves to the heart image');
  assert.ok(!cache['./assets/vfx/heroes/hunter-a.webp'], 'hunter shot untouched');
  assert.ok(!cache['./assets/vfx/heroes/michaela-q.webp'], 'michaela skills untouched');
  assert.strictEqual(api.__test.HEART.hold, true, 'flagged HOLD for review');
  assert.ok(/heart-fly8\.webp$/.test(api.__test.HEART.sheet));
  const art = path.join(__dirname, '..', 'assets', 'rc240', 'art', 'heart-fly8.webp');
  if (fs.existsSync(art)) assert.ok(fs.statSync(art).size <= 300 * 1024, 'copied sheet <= 300 KB');
});

// ---------------------------------------------------------------- hexagram
test('cross-shaped projectile/effect sprites are replaced by procedural hexagrams', () => {
  const env = ready(); const api = env.api(); const cache = {};
  api.__test.seedImages(cache);
  for (const p of ['./assets/generated-v3128/projectiles/pride_cross.webp', './assets/vfx/v31323/boss/mb-ep1b01/pride_cross.webp', './assets/vfx/v31323/boss/b08-boss/ep1b08_inverted_cross_telekinesis.webp', './assets/vfx/bosses/v3110/ep1b08_inverted_cross_telekinesis.webp', './assets/vfx/v31323/boss/mb-ep1b08/ep1b08_pride_cross_undead_cluster.webp', './assets/vfx/generated/v300/cross-seal.webp', './assets/vfx/generated/v315/rian-reverse-cross-barrage.webp', './assets/vfx/bosses/v393/dist04-fallen-cross.webp'])
    assert.ok(cache[p] && cache[p].rc240Hexagram === true, 'hexagram for ' + p);
  assert.ok(api.__test.CROSS_AUDIT.length >= 10, 'audit table present');
});

test("no visible hapil1 name/text in the ep1b08 cross paths contains '십자가'", () => {
  const env = ready(); const api = env.api();
  const names = env.zones.ep1b08.map(a => a.name);
  assert.ok(names.includes('육망성 시체경호체'), 'midboss template renamed: ' + names);
  assert.ok(names.includes('창처럼 날아오는 육망성'), 'mob template renamed');
  const s = world({ zone: 'ep1b08', enemies: [{ id: 'mb-ep1b08', name: '역십자가 시체경호체', midboss: true, phaseNames: ['교만 · 역십자가 명령'], eliteName: '역십자가 성당균열', x: 20, y: 10, hp: 1, maxHp: 1 }] });
  api.__test.tick(s, 1 / 60);
  const e = s.enemies[0];
  assert.ok(![e.name, e.eliteName, ...e.phaseNames].some(t => t.includes('십자가')), JSON.stringify(e));
  const row = env.sb.__HAPIL_NARRATION_DISPLAY_DATA_RC139__.rows[0].display;
  assert.ok(!row.includes('십자가'), 'narration display row rewritten: ' + row);
  assert.strictEqual(api.fixText('거꾸로 매달린 십자가'), '매달린 육망성');
  // Every short visible string in the bundle that mentions 십자가 is rewritten.
  const bundle = fs.readFileSync(bundleFile, 'utf8');
  const found = new Set(); for (const m of bundle.matchAll(/[`"']([^`"'\n]{0,60}십자가[^`"'\n]{0,60})[`"']/g)) found.add(m[1]);
  assert.ok(found.size >= 5, 'scan found strings');
  for (const t of found) assert.ok(!api.fixText(t).includes('십자가'), 'fixText leaves 십자가 in: ' + t);
  assert.ok(!api.fixText('십자 참격 · 성십자 방패').includes('십자'), 'short 십자 forms rewritten');
});

test('numbers drawn are clamped against NaN/Infinity; particle pool is bounded', () => {
  const env = ready(); const api = env.api(); const s = world({ enemies: [envy({ x: NaN, y: Infinity })] });
  api.__test.tick(s, NaN); api.__test.tick(s, Infinity);
  const log = ctxLog(); api.__test.render(stubCtx(log), s, { reducedFlash: false });
  for (const p of api.parts(s, 'b03-boss')) { assert.ok(Number.isFinite(p.sx) && Number.isFinite(p.sy)); }
  const s2 = world({ enemies: [envy()] }); api.__test.tick(s2, 1 / 60);
  for (let i = 0; i < 50; i++) api.__test.burst(s2, 600, 300, 64);
  assert.ok(api.__test.poolLive(s2) <= api.__test.POOL_CAP, 'pool bounded');
});

console.log(`rc240-boss-form-unit: ${passed} passed`);
