'use strict';
// RC240 drive art (round 2): Michaela heart fly8 / hit6 sheets and the last302
// 소복 처녀 float8 villager mob. Asserts asset identity (sha256, size, layout),
// heart pivot/heading, lazy load-once (no load before the feature is in play,
// one request per sheet for the whole session, no reload per stage), code
// fallbacks when a sheet fails, story/zone/ordinary-mob scope for the villager,
// sprite metadata and facing, hit6 pool cap and 14 fps frame timing with a
// fading last frame, and draw order (world layer under the bullets).
// Loads danmaku-layer.js, stg-feel.js and boss-form.js into one vm with stubbed
// globals (no browser needed).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const files = ['danmaku-layer.js', 'stg-feel.js', 'boss-form.js'].map(f => path.join(ROOT, 'assets', 'rc240', f));
const sources = files.map(f => fs.readFileSync(f, 'utf8'));
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); throw e; } }

const HEART_PATH = './assets/vfx/heroes/michaela-a.webp';
const FLY8 = './assets/rc240/art/heart-fly8.webp', HIT6 = './assets/rc240/art/heart-hit6.webp', SOBOK = './assets/rc240/art/last302-sobok-float8.webp';
const SIZES = { [FLY8]: [2048, 256], [HIT6]: [1536, 256], [SOBOK]: [608, 624] };

// ---------------------------------------------------------------- webp header
function webpSize(buf) {
  assert.strictEqual(buf.toString('ascii', 0, 4), 'RIFF'); assert.strictEqual(buf.toString('ascii', 8, 12), 'WEBP');
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)]; }
  if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  throw new Error('unknown webp chunk ' + kind);
}

// ---------------------------------------------------------------- stubs
function stubCtx(log) {
  const c = {
    canvas: { width: 1280, height: 720, getBoundingClientRect: () => ({ width: 1280, height: 720 }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineCap: 'butt', lineJoin: 'miter', shadowBlur: 0,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }),
    drawImage(im, ...a) { log.draws.push({ im, a, alpha: this.globalAlpha, op: this.globalCompositeOperation }); },
    rotate(r) { log.rotate.push(r); }, translate(x, y) { log.translate.push([x, y]); }, scale(x, y) { log.scale.push([x, y]); },
  };
  for (const k of ['save', 'restore', 'beginPath', 'arc', 'ellipse', 'fill', 'stroke', 'moveTo', 'lineTo', 'closePath', 'fillRect', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'rect', 'clip', 'quadraticCurveTo', 'bezierCurveTo', 'strokeRect', 'clearRect'])
    c[k] = function () { log[k] = (log[k] || 0) + 1; };
  return c;
}
const newLog = () => ({ draws: [], rotate: [], translate: [], scale: [] });
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });

function makeEnv(search = '?rc240=1', opts = {}) {
  const timers = [], images = [], canvases = [], meta = {};
  class FakeImage {
    constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; this._src = ''; this.onload = null; this.onerror = null; images.push(this); }
    set src(v) { this._src = String(v); if (this._src.startsWith('data:')) { this.complete = true; this.naturalWidth = this.naturalHeight = 1; } }
    get src() { return this._src; }
    fire(kind) { this.complete = true; if (kind === 'load') { const sz = SIZES[this._src]; this.naturalWidth = sz ? sz[0] : 64; this.naturalHeight = sz ? sz[1] : 64; this.onload?.(); } else { this.naturalWidth = 0; this.onerror?.(); } }
  }
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Int32Array, Uint8Array, Uint16Array, Proxy, Reflect, Symbol, Error, RegExp, Promise,
    location: { search }, innerWidth: opts.innerWidth ?? 1280,
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: fn => { timers.push(fn); return timers.length; }, setInterval: () => 0, clearInterval() {},
    performance: { now: () => 0 }, Image: FakeImage,
    document: { createElement: () => { const log = newLog(); const cv = { width: 0, height: 0, log, getContext: () => stubCtx(log), toDataURL: () => 'data:image/png;base64,AAAA' }; canvases.push(cv); return cv; }, querySelector: () => null, body: {} },
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb);
  let phaseSpriteFn = (cache, a) => a.sprite;
  sb.__HAPIL_RC86_BRIDGE__ = Object.freeze({
    project, zoneActors: () => [], actor: () => null, runtimeSprite: (cache, pose, fallback) => pose ?? fallback,
    setSpriteMetadata(p, m) { meta[p] = [...m]; }, spriteMetadata: p => meta[p] ?? null,
    get phaseSprite() { return phaseSpriteFn; }, set phaseSprite(v) { phaseSpriteFn = v; },
  });
  const loop = { version: 'L', installed: true, afterHit() {}, render() {}, background() {}, imminent: () => null, decorateAttack() {} };
  sb.__HAPIL_LOOP_V31365__ = Object.freeze(loop);
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() {}, draw() {}, danger() { return 0; } };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ installed: true, mode: s => s?.gameModeV31346 ?? 'STORY', draw() {} });
  sb.__HAPIL_COMBAT_V31333__ = { core: s => { const p = project(s.x, s.y); return { x: p.x, y: p.y - 42 }; } };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount) { s.hp -= amount; return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0 && !s.paused, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: () => null };
  const binding = { settings: { current: { sound: false } }, state: { current: null }, cache: { current: {} }, input: { current: new Set() }, actions: { sound() {} } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding, effective: () => 'manual', hasHeldLogical: () => false };
  sources.forEach((src, i) => { vm.runInContext(src, sb, { filename: files[i] }); for (let k = 0; k < 60 && timers.length; k++) timers.shift()(); });
  const sheetImages = p => images.filter(im => im._src === p);
  return { sb, images, canvases, meta, binding, sheetImages, cache: () => binding.cache.current, form: sb.__HAPIL_BOSS_FORM_RC240__, feel: sb.__HAPIL_STG_FEEL_RC240__, loop: () => sb.__HAPIL_LOOP_V31365__, phase: (...a) => sb.__HAPIL_RC86_BRIDGE__.phaseSprite(...a) };
}
function world(over = {}) {
  return { x: 8, y: 12, hp: 200, maxHp: 240, time: 100, zone: 'ep1b03', gameModeV31346: 'STORY', activeHeroId: 'hunter', enemies: [], effects: [], hostileProjectiles: [], pendingStrikes: [], floatTexts: [], fxSerial: 1, ...over };
}
function run(env, s, ticks = 40, dt = 1 / 60) { env.binding.state.current = s; for (let i = 0; i < ticks; i++) { s.time += dt; env.form.__test.tick(s, dt); } }
const mob = (over = {}) => ({ id: 'l302-e2', name: '잠들지 못한 검은 영혼', kind: 'wolf', x: 20, y: 12, hp: 900, maxHp: 900, facing: -1, sprite: './assets/last3/Monster_Wolf.png', ...over });

// ---------------------------------------------------------------- assets
test('sheets are the reviewed drive files: sha256, pixel size and cell layout', () => {
  const want = {
    'heart-fly8.webp': ['abd775e7c7b327627c7aa2d4fceb2bb851da5bb6903ac65e9df304d026f2c3c5', 2048, 256],
    'heart-hit6.webp': ['6c6a1e9e0b2e49d3d0f1fb5c4585d432edbb0c8facb2592ca6ff74b868fe4585', 1536, 256],
    'last302-sobok-float8.webp': ['16678eb22d9990e9a1efd22c6744cc317da13b3b12767d545c15df2e4dde144b', 608, 624],
  };
  for (const [f, [sha, w, h]] of Object.entries(want)) {
    const buf = fs.readFileSync(path.join(ROOT, 'assets', 'rc240', 'art', f));
    assert.strictEqual(crypto.createHash('sha256').update(buf).digest('hex'), sha, f + ' sha256');
    assert.deepStrictEqual(webpSize(buf), [w, h], f + ' size');
    assert.ok(buf.length <= 300 * 1024, f + ' <= 300 KB');
  }
  const env = makeEnv(); const H = env.form.__test.HEART, S = env.form.__test.SOBOK, X = env.feel.__test.HIT6;
  assert.strictEqual(H.cell * H.frames, 2048); assert.strictEqual(H.frames, 8);
  assert.strictEqual(X.sheet, HIT6); assert.strictEqual(X.cell * X.frames, 1536); assert.strictEqual(X.frames, 6); assert.strictEqual(X.fps, 14);
  assert.strictEqual(S.sheet, SOBOK); assert.strictEqual(S.cols * S.cellW, 608); assert.strictEqual(S.rows * S.cellH, 624); assert.strictEqual(S.frames, 8); assert.strictEqual(S.fps, 8);
  assert.deepStrictEqual([S.piv.x, S.piv.y], [104, 324], 'feet pivot');
});

// ---------------------------------------------------------------- heart fly8
test('heart: pivot (152,128), heading along the shot (.76 pi = native michaela-a spriteHeading), frame 0 baked about the pivot', () => {
  const env = makeEnv(); const H = env.form.__test.HEART;
  assert.deepStrictEqual([H.piv.x, H.piv.y], [152, 128]);
  assert.strictEqual(H.sheet, FLY8); assert.strictEqual(H.path, HEART_PATH);
  assert.ok(Math.abs(H.heading - 2.3876104167282426) < 1e-9, 'matches the native A-shot spriteHeading');
  run(env, world({ activeHeroId: 'michaela' }), 2);
  const [sheet] = env.sheetImages(FLY8); assert.ok(sheet, 'sheet requested once Michaela is in play');
  const before = env.canvases.length; sheet.fire('load');
  const baked = env.canvases.slice(before).find(c => c.log.draws.some(d => d.im === sheet)); assert.ok(baked, 'sheet baked onto a canvas');
  const d = baked.log.draws.find(q => q.im === sheet);
  assert.deepStrictEqual(d.a.slice(0, 4), [0, 0, 256, 256], 'frame 0 source rect');
  assert.deepStrictEqual(d.a.slice(4, 6), [-152, -128], 'drawn about the pivot');
  assert.ok(baked.log.rotate.some(r => Math.abs(r - H.heading) < 1e-9), 'rotated by the heading');
  const im = env.cache()[HEART_PATH]; assert.ok(im.rc240Heart && im.rc240HeartSheet, 'cache entry now shows the sheet heart');
});

test('heart: sheet is lazy (no request until Michaela is in play) and loaded once for the session', () => {
  const env = makeEnv();
  run(env, world({ activeHeroId: 'hunter' }), 120);
  assert.strictEqual(env.sheetImages(FLY8).length, 0, 'no fly8 request without Michaela');
  assert.ok(env.cache()[HEART_PATH]?.rc240Heart, 'procedural heart seeded without any network request');
  // A party Michaela firing counts as in play.
  const s = world({ activeHeroId: 'hunter', effects: [{ kind: 'projectile', sprite: HEART_PATH, heroId31213: 'michaela' }] });
  run(env, s, 40);
  assert.strictEqual(env.sheetImages(FLY8).length, 1, 'requested on first sight of a Michaela shot');
  env.sheetImages(FLY8)[0].fire('load');
  for (const z of ['ep1b04', 'last302', 'dist06']) run(env, world({ zone: z, activeHeroId: 'michaela' }), 90);
  assert.strictEqual(env.sheetImages(FLY8).length, 1, 'no reload per stage or per new world');
});

test('heart: a failed sheet keeps the procedural heart and is not retried', () => {
  const env = makeEnv();
  run(env, world({ activeHeroId: 'michaela' }), 4);
  env.sheetImages(FLY8)[0].fire('error');
  run(env, world({ zone: 'ep1b04', activeHeroId: 'michaela' }), 120);
  assert.strictEqual(env.sheetImages(FLY8).length, 1, 'no retry');
  const im = env.cache()[HEART_PATH]; assert.ok(im.rc240Heart && !im.rc240HeartSheet, 'procedural heart stays');
  assert.strictEqual(env.form.assets().heart.state, 'failed');
});

test('heart: ?qa without rc240=1 requests nothing', () => {
  const env = makeEnv('?qa=1');
  run(env, world({ activeHeroId: 'michaela' }), 90);
  assert.strictEqual(env.sheetImages(FLY8).length, 0); assert.strictEqual(env.sheetImages(HIT6).length, 0);
});

// ---------------------------------------------------------------- hit6 impact
function michaelaHit(env, s, target, key = 'A', hero = 'michaela') { env.loop().afterHit(s, target, 10, 10, { heroId: hero, heroId31213: hero, actionKey: key }); }
test('hit6: a resolved Michaela A strike starts one pooled impact at the target; other heroes/keys do not', () => {
  const env = makeEnv(); const s = world({ activeHeroId: 'michaela' }); env.binding.state.current = s;
  const boss = { id: 'b1', boss: true, hp: 1e5, maxHp: 1e5, x: 24, y: 12 };
  michaelaHit(env, s, boss, 'A', 'hunter'); michaelaHit(env, s, boss, 'Q');
  assert.strictEqual(env.feel.impacts(s), 0, 'only Michaela basic shots');
  assert.strictEqual(env.sheetImages(HIT6).length, 0, 'still lazy');
  michaelaHit(env, s, boss); assert.strictEqual(env.feel.impacts(s), 1);
  michaelaHit(env, s, mob()); assert.strictEqual(env.feel.impacts(s), 2, 'mobs too (impact is not boss-scoped)');
  assert.strictEqual(env.sheetImages(HIT6).length, 1, 'sheet requested on the first impact');
  const p = project(24, 12), [im] = env.feel.__test.impactRows(s);
  assert.ok(Math.abs(im.x - p.x) < 1e-6 && im.y < p.y && im.y > p.y - 120, 'placed on the target, lifted to the shot lane');
  const nan = { id: 'x', hp: 1, x: NaN, y: 3 }; michaelaHit(env, s, nan); assert.strictEqual(env.feel.impacts(s), 2, 'NaN target ignored');
});

test('hit6: pool is capped (PC 16, phone 8), oldest replaced, rows expire after 6/14 s', () => {
  const env = makeEnv(); const s = world({ activeHeroId: 'michaela' }); env.binding.state.current = s;
  const boss = { id: 'b1', boss: true, hp: 1e5, maxHp: 1e5, x: 24, y: 12 };
  for (let i = 0; i < 50; i++) michaelaHit(env, s, boss);
  assert.strictEqual(env.feel.impacts(s), env.feel.__test.HIT6.cap.pc);
  assert.strictEqual(env.feel.__test.HIT6.cap.pc, 16); assert.strictEqual(env.feel.__test.HIT6.cap.mobile, 8);
  const ph = makeEnv('?rc240=1', { innerWidth: 700 }); const s2 = world({ activeHeroId: 'michaela' }); ph.binding.state.current = s2;
  for (let i = 0; i < 50; i++) michaelaHit(ph, s2, boss);
  assert.strictEqual(ph.feel.impacts(s2), 8, 'phone cap');
  s.time += 6 / 14 + .01; env.feel.draw(stubCtx(newLog()), s, { hx: 0, hy: 0 }, {});
  assert.strictEqual(env.feel.impacts(s), 0, 'expired rows released');
});

test('hit6: 14 fps one-shot, frame i from cell i, alpha 1 until the last frame which fades to 0; drawn by feel.draw (world layer under bullets)', () => {
  const env = makeEnv(); const s = world({ activeHeroId: 'michaela' }); env.binding.state.current = s;
  const boss = { id: 'b1', boss: true, hp: 1e5, maxHp: 1e5, x: 24, y: 12 };
  michaelaHit(env, s, boss); const sheet = env.sheetImages(HIT6)[0]; sheet.fire('load');
  const t0 = s.time, seen = [];
  for (const age of [0, .05, .1, .15, .2, .25, .3, .36, .38, .4, .42]) {
    s.time = t0 + age; const log = newLog(); env.feel.draw(stubCtx(log), s, { hx: 0, hy: 0 }, {});
    const d = log.draws.find(q => q.im === sheet); assert.ok(d, 'drawn at age ' + age);
    const frame = Math.min(5, Math.floor(age * 14 + 1e-9)); assert.deepStrictEqual(d.a.slice(0, 4), [frame * 256, 0, 256, 256], 'frame at age ' + age);
    if (frame < 5) assert.strictEqual(d.alpha, 1, 'opaque before the last frame'); seen.push([frame, d.alpha]);
  }
  const last = seen.filter(([f]) => f === 5).map(([, a]) => a); assert.ok(last.length >= 2 && last[0] > last[last.length - 1] && last[last.length - 1] < .35, 'last frame fades: ' + last);
  const scr = newLog(); env.feel.drawScreen(stubCtx(scr), s, { hx: 0, hy: 0 }, {}); assert.ok(!scr.draws.some(q => q.im === sheet), 'never in the screen HUD pass');
});

test('hit6: before load and after a failed load a procedural burst is drawn; no retry', () => {
  const env = makeEnv(); const s = world({ activeHeroId: 'michaela' }); env.binding.state.current = s;
  const boss = { id: 'b1', boss: true, hp: 1e5, maxHp: 1e5, x: 24, y: 12 };
  michaelaHit(env, s, boss);
  let log = newLog(); env.feel.draw(stubCtx(log), s, { hx: 0, hy: 0 }, {});
  assert.ok(!log.draws.some(q => q.im?._src === HIT6), 'sheet not drawn before it loads'); assert.ok((log.bezierCurveTo || 0) > 0 || (log.arc || 0) > 0, 'procedural fallback drawn');
  env.sheetImages(HIT6)[0].fire('error');
  for (let i = 0; i < 20; i++) michaelaHit(env, s, boss);
  log = newLog(); env.feel.draw(stubCtx(log), s, { hx: 0, hy: 0 }, {});
  assert.strictEqual(env.sheetImages(HIT6).length, 1, 'no retry'); assert.ok((log.bezierCurveTo || 0) > 0, 'fallback after error');
  assert.ok(log.draws.every(q => Number.isFinite(q.a[q.a.length - 1])), 'finite draws');
});

// ---------------------------------------------------------------- last302 villager
function sobokSetup(env, over = {}) { const a = mob(over.mob); const s = world({ zone: 'last302', enemies: [a], ...over.world }); env.binding.state.current = s; return { s, a }; }
test('sobok: nothing is requested until a story last302 ordinary mob is drawn; one request for the session', () => {
  const env = makeEnv();
  run(env, world({ zone: 'ep1b03', enemies: [mob({ id: 'l08-e1' })] }), 60);
  assert.strictEqual(env.phase(env.cache(), mob({ id: 'l08-e1' }), 100), './assets/last3/Monster_Wolf.png', 'other zone: native');
  assert.strictEqual(env.sheetImages(SOBOK).length, 0, 'no request outside last302');
  const { s, a } = sobokSetup(env); run(env, s, 2);
  assert.strictEqual(env.phase(env.cache(), a, s.time), a.sprite, 'native until the sheet is ready');
  assert.strictEqual(env.sheetImages(SOBOK).length, 1, 'requested on first draw');
  env.phase(env.cache(), a, s.time); assert.strictEqual(env.sheetImages(SOBOK).length, 1, 'still one');
  env.sheetImages(SOBOK)[0].fire('load');
  const again = sobokSetup(env, { mob: { id: 'l302-e3', kind: 'slime' } }); run(env, again.s, 30);
  assert.ok(/-f\d\.webp$/.test(env.phase(env.cache(), again.a, again.s.time)), 'new world reuses the baked frames');
  assert.strictEqual(env.sheetImages(SOBOK).length, 1, 'no reload per stage');
});

test('sobok: 8 frames at 8 fps from the 4x2 sheet, feet-pivot metadata, right-facing intrinsic, game fields untouched', () => {
  const env = makeEnv(); const { s, a } = sobokSetup(env); run(env, s, 2);
  env.phase(env.cache(), a, s.time); const sheet = env.sheetImages(SOBOK)[0]; const c0 = env.canvases.length; sheet.fire('load');
  const bakes = env.canvases.slice(c0).filter(c => c.log.draws.some(d => d.im === sheet));
  assert.strictEqual(bakes.length, 8, 'eight frame canvases');
  bakes.forEach((c, i) => { const d = c.log.draws.find(q => q.im === sheet); assert.deepStrictEqual(d.a.slice(0, 4), [(i % 4) * 152, Math.floor(i / 4) * 312, 152, 312], 'cell ' + i); assert.deepStrictEqual([c.width, c.height], [152, 312]); });
  const snap = JSON.stringify(a);
  const keys = []; for (let k = 0; k < 16; k++) keys.push(env.phase(env.cache(), a, 100 + k / 8));
  const idx = keys.map(k => Number(/-f(\d)\.webp$/.exec(k)[1]));
  for (let k = 1; k < 16; k++) assert.strictEqual(idx[k], (idx[k - 1] + 1) % 8, 'advances one frame per 1/8 s');
  assert.strictEqual(new Set(idx).size, 8, 'loops all eight');
  const k0 = keys[0], im = env.cache()[k0]; assert.ok(im && im.rc240Sobok, 'frame image seeded into the drawing cache');
  assert.deepStrictEqual(env.meta[k0], [0, 0, 1, 1, 104 / 152, 324 / 312], 'feet pivot metadata');
  assert.ok(k0.startsWith(SOBOK.replace(/\.webp$/, '-')) && !/[?#]/.test(k0), 'synthetic key next to the sheet, no ?/# (native draw layers strip those)');
  assert.ok(!fs.existsSync(path.join(ROOT, k0)), 'synthetic key is not a file');
  assert.ok(im.__mongseLastUsed !== undefined, 'marked used so the native LRU prune keeps it');
  assert.ok(/\.(?:png|jpe?g|webp|avif|gif|svg)(?:\?|$)/i.test(k0), 'key passes the native image-path test (bundle IMAGE_PATH)');
  assert.strictEqual(JSON.stringify(a), snap, 'display only: actor unchanged');
  // Another cache object (e.g. probe cache) is seeded before the key is returned.
  const probe = {}; const k = env.phase(probe, a, 100); assert.ok(probe[k]?.rc240Sobok, 'seeded into whichever cache asked');
  // Two mobs are not in lockstep.
  const b = mob({ id: 'l302-e1', kind: 'specter' }); s.enemies.push(b);
  const ka = env.phase(env.cache(), a, 101), kb = env.phase(env.cache(), b, 101); assert.notStrictEqual(ka, kb, 'per-mob phase offset');
});

test('sobok: a source-facing-left actor gets mirrored frames so the native facing flip stays correct', () => {
  const env = makeEnv(); const { s, a } = sobokSetup(env, { mob: { sourceFacing31223: 'left' } }); run(env, s, 2);
  env.phase(env.cache(), a, s.time); env.sheetImages(SOBOK)[0].fire('load');
  const k = env.phase(env.cache(), a, 100); assert.ok(/-l\d\.webp$/.test(k), 'mirrored key: ' + k);
  assert.deepStrictEqual(env.meta[k], [0, 0, 1, 1, (152 - 104) / 152, 324 / 312], 'mirrored pivot');
  const right = env.phase(env.cache(), mob({ id: 'l302-e1' }), 100); assert.ok(/-f\d\.webp$/.test(right));
});

test('sobok: bosses, midbosses, friendlies, visual-only, other modes and other zones keep native art', () => {
  const env = makeEnv(); const { s, a } = sobokSetup(env); run(env, s, 2); env.phase(env.cache(), a, s.time); env.sheetImages(SOBOK)[0].fire('load');
  assert.ok(/-f\d\.webp$/.test(env.phase(env.cache(), a, 100)), 'control: ordinary story mob uses the villager');
  for (const over of [{ boss: true }, { midboss: true, id: 'mb-last302-v31231' }, { friendly: true }, { visualOnly: true }, { ally: true }, { neutral: true }, { canonAlly: true }])
    { const m = mob(over); assert.strictEqual(env.phase(env.cache(), m, 100), m.sprite, JSON.stringify(over)); }
  for (const mode of ['DREAM', 'HELL']) { env.binding.state.current = world({ zone: 'last302', gameModeV31346: mode }); assert.strictEqual(env.phase(env.cache(), a, 100), a.sprite, mode); }
  env.binding.state.current = world({ zone: 'last302', practiceV31329: true }); assert.strictEqual(env.phase(env.cache(), a, 100), a.sprite, 'practice');
  env.binding.state.current = world({ zone: 'last301' }); assert.strictEqual(env.phase(env.cache(), a, 100), a.sprite, 'last301');
  env.form.setEnabled(false); env.binding.state.current = s; assert.strictEqual(env.phase(env.cache(), a, 100), a.sprite, 'disabled');
});

test('sobok: a lethal hit points the native death row (actionSprites.death, read first by the RC145 ash dissolve) at a villager frame; non-lethal hits and bosses untouched', () => {
  const env = makeEnv(); const { s, a } = sobokSetup(env); run(env, s, 2);
  env.phase(env.cache(), a, s.time); env.sheetImages(SOBOK)[0].fire('load');
  const src = { heroId: 'hunter', actionKey: 'A' };
  const snap = JSON.stringify(a); env.loop().afterHit(s, a, 10, 10, src); assert.strictEqual(JSON.stringify(a), snap, 'non-lethal: unchanged');
  a.hp = 0; env.loop().afterHit(s, a, 10, 10, src);
  assert.ok(/-f\d\.webp$/.test(a.actionSprites?.death), 'death sprite is a villager frame: ' + a.actionSprites?.death);
  assert.ok(env.cache()[a.actionSprites.death]?.rc240Sobok, 'seeded into the drawing cache so the death row never fetches the key');
  const mb = mob({ id: 'mb-last302-v31231', midboss: true, hp: 0 }); env.loop().afterHit(s, mb, 10, 10, src); assert.ok(!mb.actionSprites, 'midboss untouched');
  const other = mob({ hp: 0 }); env.binding.state.current = world({ zone: 'last301' }); env.loop().afterHit(env.binding.state.current, other, 10, 10, src); assert.ok(!other.actionSprites, 'other zone untouched');
  const dream = mob({ hp: 0 }); const ds = world({ zone: 'last302', gameModeV31346: 'DREAM' }); env.binding.state.current = ds; env.loop().afterHit(ds, dream, 10, 10, src); assert.ok(!dream.actionSprites, 'non-story untouched');
});

test('sobok: a failed sheet keeps native mob art, no retry; NEEDS_ART still lists the missing villager hit/death sheets', () => {
  const env = makeEnv(); const { s, a } = sobokSetup(env); run(env, s, 2);
  env.phase(env.cache(), a, s.time); env.sheetImages(SOBOK)[0].fire('error');
  for (let i = 0; i < 50; i++) assert.strictEqual(env.phase(env.cache(), a, 100 + i), a.sprite);
  assert.strictEqual(env.sheetImages(SOBOK).length, 1, 'no retry'); assert.strictEqual(env.form.assets().sobok.state, 'failed');
  const row = env.form.__test.NEEDS_ART.find(r => r.id === 'last302-mobs'); assert.ok(row && /hit|death|피격|사망/.test(row.what), 'remaining villager art listed');
});

console.log(`rc240-drive-assets-unit: ${passed} tests OK`);
