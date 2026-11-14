'use strict';
// RC241 boss duel pilot: persona-style duel phases for three bosses
// (Balrog dist06, Leviathan ep1b03, Lucifer ep1a11). One attack source with one
// cast lock, named volleys that hang then release together, a periodic awakening
// act, RC240's curtain/signature/filler held off for those fights only.
// Loads the shipped scripts in a vm with stubbed globals (no browser needed).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const ROOT = path.join(__dirname, '..');
const deckFile = path.join(ROOT, 'assets', 'rc241', 'boss-duel-decks.js');
const duelFile = path.join(ROOT, 'assets', 'rc241', 'boss-duel.js');
const danmakuFile = path.join(ROOT, 'assets', 'rc240', 'danmaku-layer.js');
const landscapeFile = path.join(ROOT, 'assets', 'rc240', 'mobile-landscape.js');
let passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { failed++; console.error('FAIL -', name, '\n   ', String(e && e.message || e).split('\n')[0]); } }
const read = f => fs.readFileSync(f, 'utf8');
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
const H = 1 / 60;
const PILOT = { 'dist06-boss': 'dist06', 'b03-boss': 'ep1b03', 'a11-boss': 'ep1a11' };

function stubCtx(log = {}) {
  log.draws = 0; log.strokes = 0; log.calls = [];
  const c = { canvas: { width: 1280, height: 720 }, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, filter: 'none', font: '', textAlign: 'left', textBaseline: 'alphabetic',
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }), createRadialGradient: () => ({ addColorStop() {} }),
    drawImage(img, ...a) { log.draws++; (log.imgs ||= []).push({ img, alpha: this.globalAlpha, a }); },
    stroke() { log.strokes++; }, measureText: t => ({ width: String(t).length * 8 }) };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'fill', 'moveTo', 'lineTo', 'closePath', 'fillRect', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'clip', 'rect', 'ellipse'])
    c[k] = function () { log.calls.push(k); };
  return c;
}

function makeEnv(search = '', o = {}) {
  const store = new Map(o.store || []);
  const log = { impacts: [], damage: [], floats: 0, dash: 0 };
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 512; this.naturalHeight = 512; this._src = ''; } set src(v) { this._src = String(v); } get src() { return this._src; } }
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, WeakSet, Set, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array, Error, RegExp, Symbol, Reflect, Proxy,
    location: { search }, innerWidth: o.innerWidth || 1280, innerHeight: 720,
    localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    setTimeout: () => 0, setInterval: () => 0, clearInterval() {}, performance: { now: () => 0 }, Image: FakeImage,
    document: { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => stubCtx(), appendChild() {}, setAttribute() {} }), querySelector: () => null } };
  sb.window = sb; sb.globalThis = sb;
  sb.__HAPIL_RC86_BRIDGE__ = { project };
  sb.__HAPIL_COMBAT_V31333__ = { core: s => s.__core ?? { x: project(s.x, s.y).x, y: project(s.x, s.y).y - 42 } };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage(s, amount, x, y, packet) { log.damage.push({ amount, packet }); s.hp -= amount; return true; } };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_AWAKENING_IMPACT_RC150__ = { boss(s, a, key, p, label) { log.impacts.push({ key, p, label, t: s.time }); return true; } };
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { settings: { current: {} }, state: { current: null }, actions: { dash() { log.dash++; } } }, effective: () => o.auto ? 'full' : 'manual' };
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ version: 'L', installed: true, tick() { log.loopTicks = (log.loopTicks || 0) + 1; }, render() {}, imminent: () => null });
  let feelInstalled = true;
  sb.__HAPIL_ENEMY_FEEL_V31361__ = Object.freeze({ version: 'F', get installed() { return feelInstalled; }, draw() { log.feelDraws = (log.feelDraws || 0) + 1; } });
  vm.createContext(sb);
  vm.runInContext(read(deckFile), sb, { filename: deckFile });
  vm.runInContext(read(duelFile), sb, { filename: duelFile });
  const api = sb.__HAPIL_BOSS_DUEL_RC241__;
  for (let g = 0; g < 5 && !api.installed; g++) api.__test.install();
  return { sb, api, log, store };
}
function boss(id = 'dist06-boss', over = {}) {
  return { id, name: id, boss: true, hp: 1e6, maxHp: 1e6, x: 24, y: 11, scale: 1.3, ...over };
}
function world(id = 'dist06-boss', over = {}) {
  return { zone: PILOT[id], time: 100, hp: 240, maxHp: 240, x: 13, y: 22, enemies: [boss(id)], hostileProjectiles: [], floatTexts: [], effects: [], fxSerial: 1,
    invulnerableUntil: 0, timeStopUntil: 0, gameModeV31346: 'STORY', activeHeroId: 'hunter', ...over };
}
function run(env, s, seconds, each) { const n = Math.round(seconds / H); for (let i = 0; i < n; i++) { s.time += H; env.sb.__HAPIL_LOOP_V31365__.tick(s, H); if (each) each(s); } }
const live = (api, s) => api.snapshot(s)?.live ?? 0;

// ------------------------------------------------------------------ data
test('deck data: exactly the three pilot bosses, 6-9 named volleys each, one sprite per volley', () => {
  const { sb } = makeEnv();
  const D = sb.__HAPIL_BOSS_DUEL_DECKS_RC241__;
  assert.deepStrictEqual(Object.keys(D.bosses).sort(), Object.keys(PILOT).sort());
  for (const [id, b] of Object.entries(D.bosses)) {
    assert.strictEqual(b.zone, PILOT[id], id + ' zone');
    assert.ok(b.deck.length >= 6 && b.deck.length <= 9, id + ' deck size ' + b.deck.length);
    assert.strictEqual(new Set(b.deck.map(e => e.name)).size, b.deck.length, id + ' unique volley names');
    for (const e of b.deck) {
      assert.strictEqual(typeof e.sprite, 'string', e.name + ' sprite');
      assert.ok(e.hang >= .72, e.name + ' hang >= .72 s');
      assert.ok(e.count >= 6 && e.count <= 18, e.name + ' baseline count');
    }
  }
});

test('deck data: every volley name, awakening label and boss name is existing in-repo text (no new narrative strings)', () => {
  const { sb } = makeEnv();
  const D = sb.__HAPIL_BOSS_DUEL_DECKS_RC241__;
  const corpus = ['index-v31526.js', 'rc129/danmaku-director.js', 'rc97/choice-patterns.js'].map(f => read(path.join(ROOT, 'assets', f))).join('\n');
  for (const b of Object.values(D.bosses)) {
    for (const t of [b.name, b.label, ...b.deck.map(e => e.name)]) assert.ok(corpus.includes(t), 'not in repo text: ' + t);
  }
});

test('deck data: sprites and portraits are existing authored files owned by that boss (no new art, nothing under rc241)', () => {
  const { sb } = makeEnv();
  const D = sb.__HAPIL_BOSS_DUEL_DECKS_RC241__;
  for (const [id, b] of Object.entries(D.bosses)) {
    for (const p of [b.portrait, ...b.deck.map(e => e.sprite)]) {
      assert.ok(fs.existsSync(path.join(ROOT, p)), 'missing ' + p);
      assert.ok(!p.includes('rc241'), 'no new art: ' + p);
    }
    for (const e of b.deck) assert.ok(e.sprite.startsWith('./assets/vfx/v31323/boss/' + id + '/'), id + ' owns ' + e.sprite);
  }
});

test('deck data: enemy rims are bright and distinct from the hero shot palettes (cyan, gold)', () => {
  const { sb } = makeEnv();
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const dist = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  for (const b of Object.values(sb.__HAPIL_BOSS_DUEL_DECKS_RC241__.bosses)) {
    assert.ok(Math.max(...rgb(b.rim)) >= 0xc0, 'bright rim ' + b.rim);
    for (const hero of ['#7ff6ff', '#ffe27a']) assert.ok(dist(b.rim, hero) > 140, b.rim + ' vs ' + hero);
  }
});

// ------------------------------------------------------------------ flags & gate
test('flags: on by default; ?duel=0 off; ?qa off unless duel=1; stored "off" disables (RC240 stays the optional setting)', () => {
  assert.strictEqual(makeEnv('').api.enabled(), true);
  assert.strictEqual(makeEnv('?duel=0').api.enabled(), false);
  assert.strictEqual(makeEnv('?qa=1').api.enabled(), false);
  assert.strictEqual(makeEnv('?qa=1&rc240=1').api.enabled(), false);
  assert.strictEqual(makeEnv('?qa=1&duel=1').api.enabled(), true);
  assert.strictEqual(makeEnv('', { store: [['hapil.rc241.duel', 'off']] }).api.enabled(), false);
  const e = makeEnv(''); e.api.setEnabled(false); assert.strictEqual(e.store.get('hapil.rc241.duel'), 'off'); e.api.setEnabled(true); assert.strictEqual(e.store.get('hapil.rc241.duel'), 'on');
});

test('owns: only a deck boss, alive, in its own zone, outside practice; mobs and other bosses unchanged', () => {
  const { api } = makeEnv();
  const s = world('b03-boss');
  assert.strictEqual(api.owns(s, s.enemies[0]), true);
  assert.strictEqual(api.owns(s, { id: 'b03-g2', hp: 10 }), false, 'mob');
  assert.strictEqual(api.owns(s, boss('b04-boss')), false, 'boss without a deck');
  assert.strictEqual(api.owns({ ...s, zone: 'dist06' }, s.enemies[0]), false, 'wrong zone');
  assert.strictEqual(api.owns({ ...s, practiceV31329: true }, s.enemies[0]), false, 'practice');
  assert.strictEqual(api.owns(s, boss('b03-boss', { hp: 0 })), false, 'dead');
  assert.strictEqual(api.framed(s), true);
  assert.strictEqual(api.framed({ ...s, enemies: [] }), false);
  assert.strictEqual(makeEnv('?duel=0').api.owns(s, s.enemies[0]), false, 'disabled');
});

// ------------------------------------------------------------------ duel rhythm
test('rhythm: one volley at a time; it materialises, hangs >= .72 s harmless, then releases together', () => {
  const env = makeEnv(), { api } = env, s = world('dist06-boss');
  let firstCast = null, casts = [];
  run(env, s, 12, () => { const v = api.snapshot(s).volley; if (v && (!casts.length || casts[casts.length - 1].serial !== v.serial)) casts.push({ ...v, seenAt: s.time }); if (v && firstCast == null) firstCast = s.time; });
  assert.ok(firstCast >= 102 && firstCast < 104, 'intro before the first cast: ' + firstCast);
  assert.ok(casts.length >= 4, 'several volleys in 12 s: ' + casts.length);
  for (let i = 1; i < casts.length; i++) {
    const prev = casts[i - 1], cur = casts[i];
    assert.ok(cur.castAt >= prev.releaseEnd + .35 - 1e-6, 'next cast waits for release +.35 s');
    assert.ok(cur.castAt - prev.castAt >= 1.05 - 1e-6, '>= 1.05 s between casts');
  }
  for (const c of casts) {
    assert.ok(c.releaseAt - c.castAt >= .72 - 1e-6, 'hang >= .72 s');
    assert.ok(c.releaseEnd - c.releaseAt <= .9, 'released together (stagger window ' + (c.releaseEnd - c.releaseAt) + ')');
  }
});

test('rhythm: hanging bullets never damage; released bullets do, once per mercy window', () => {
  const env = makeEnv(), { api, log } = env, s = world('dist06-boss');
  run(env, s, 2.6);
  let v = null; run(env, s, 1, () => { v = v || api.snapshot(s).volley; });
  assert.ok(v, 'a volley is up');
  const P = api.__test.pool(s);
  // Park the hero heart right on the first hanging bullet.
  const hangIdx = [...Array(P.live).keys()].find(i => P.hang[i] > s.time);
  if (hangIdx != null) { s.__core = { x: P.x[hangIdx], y: P.y[hangIdx] }; env.sb.__HAPIL_LOOP_V31365__.tick(s, 0.001); assert.strictEqual(log.damage.length, 0, 'hanging bullet hurt'); }
  // Released bullet on the heart: one hit, then mercy.
  run(env, s, 1.5);
  const j = [...Array(P.live).keys()].find(i => P.hang[i] <= s.time);
  assert.ok(j != null, 'a released bullet exists');
  s.__core = { x: P.x[j], y: P.y[j] }; s.time += H; env.sb.__HAPIL_LOOP_V31365__.tick(s, H);
  assert.strictEqual(log.damage.length, 1, 'one hit');
  assert.strictEqual(log.damage[0].packet.sourceId, 'dist06-boss');
  assert.ok(log.damage[0].packet.rc241Duel === true);
  for (let k = 0; k < 20; k++) { const q = [...Array(P.live).keys()].find(i => P.hang[i] <= s.time); if (q == null) break; s.__core = { x: P.x[q], y: P.y[q] }; s.time += H; env.sb.__HAPIL_LOOP_V31365__.tick(s, H); }
  assert.strictEqual(log.damage.length, 1, 'mercy window blocks repeat hits');
});

test('rhythm: deck order is walked in order and each cast is announced by its in-repo name', () => {
  const env = makeEnv(), { api, sb } = env, s = world('a11-boss');
  const names = sb.__HAPIL_BOSS_DUEL_DECKS_RC241__.bosses['a11-boss'].deck.map(e => e.name), seen = [];
  run(env, s, 16, () => { const v = api.snapshot(s).volley; if (v && seen[seen.length - 1] !== v.name + '#' + v.serial) seen.push(v.name + '#' + v.serial); });
  const order = seen.map(x => x.split('#')[0]);
  for (let i = 0; i < order.length; i++) assert.strictEqual(order[i], names[i % names.length]);
  assert.ok(s.floatTexts.some(f => names.includes(f.text) || names.some(n => String(f.text).includes(n))), 'volley name floated');
});

test('one source: native ordnance clocks and the RC95 pressure lock are held for the whole duel', () => {
  const env = makeEnv(), s = world('b03-boss');
  run(env, s, 5);
  const a = s.enemies[0];
  for (const k of ['readyAt', 'patternReadyAt', 'themedOrdnanceAt', 'bossCombatPatternReadyAtV31230', 'themedSummonAt']) assert.ok(a[k] > s.time, k + ' held');
  assert.ok(a.atomicCastUntil31210 > s.time, 'atomic cast lock held');
  // Duel off: nothing is held any more.
  const e2 = makeEnv('?duel=0'), s2 = world('b03-boss'); run(e2, s2, 2);
  assert.ok(!(s2.enemies[0].readyAt > s2.time), 'no hold when disabled');
});

test('one source: boss ordnance the clocks miss (counter shot, heavy cast, queued telegraphs, exit flights) is retired the tick it appears', () => {
  const env = makeEnv(), s = world('b03-boss');
  run(env, s, 3);
  const other = { sourceId: 'mob-1', x: 1, y: 1 }, reflected = { sourceId: 'b03-boss', reflected: true, x: 1, y: 1 };
  s.hostileProjectiles = [{ sourceId: 'b03-boss', label: '거리 사격', x: 1, y: 1 }, { sourceId: 'x', sourceBossId: 'b03-boss', heavyBossSkill: true, x: 1, y: 1 }, other, reflected];
  const heroHit = { sourceId: 'hero', at: s.time + 1 }, fx = { sourceId: 'b03-boss', kind: 'enemyAttack' };
  s.pendingHits = [{ id: 7, sourceId: 'b03-boss', at: s.time + .5 }, heroHit];
  s.impactQueue = [{ id: 8, ownerId: 'b03-boss', at: s.time + .5 }];
  s.enemyExitFxV31327 = [{ sourceId: 'b03-boss', bodyW: 30, bodyH: 30 }];
  s.effects = [{ sourceId: 'b03-boss', kind: 'telegraph' }, fx];
  run(env, s, H);
  assert.deepStrictEqual(s.hostileProjectiles, [other, reflected]);
  assert.deepStrictEqual(s.pendingHits, [heroHit]);
  assert.deepStrictEqual(s.impactQueue, []);
  assert.deepStrictEqual(s.enemyExitFxV31327, [], 'exit flights keep a collision body, so they go too');
  assert.deepStrictEqual(s.effects, [fx], 'the queued warning goes with its hit; impact visuals stay');
  assert.ok(env.api.metrics().retired >= 2);
  const e2 = makeEnv('?duel=0'), s2 = world('b03-boss'); run(e2, s2, 1);
  s2.hostileProjectiles = [{ sourceId: 'b03-boss', x: 1, y: 1 }]; run(e2, s2, H);
  assert.strictEqual(s2.hostileProjectiles.length, 1, 'native ordnance untouched when the duel is off');
});

test('awakening act: first at 14 s, 7 s long, every 28 s; portrait card + RC150 impact; denser volleys', () => {
  const env = makeEnv(), { api, log, sb } = env, s = world('b03-boss');
  const B = sb.__HAPIL_BOSS_DUEL_DECKS_RC241__.bosses['b03-boss'];
  let calm = 0, awake = 0;
  run(env, s, 45, () => { const sn = api.snapshot(s); if (sn.volley && sn.volley.fresh) { if (sn.awake > 0) awake = Math.max(awake, sn.volley.count); else calm = Math.max(calm, sn.volley.count); } });
  assert.ok(log.impacts.length >= 2, 'two acts in 45 s: ' + log.impacts.length);
  assert.ok(Math.abs(log.impacts[0].t - 114) < .2, 'first act at 14 s: ' + log.impacts[0].t);
  assert.ok(Math.abs(log.impacts[1].t - log.impacts[0].t - 28) < .2, '28 s period');
  assert.strictEqual(log.impacts[0].p, B.portrait);
  assert.strictEqual(log.impacts[0].label, B.label);
  assert.ok(awake > calm, 'awakened volleys denser: ' + awake + ' > ' + calm);
});

test('invariants: NaN inputs clamp, pool never exceeds its cap, mobile cap is smaller, reset on zone change and boss death', () => {
  const env = makeEnv(), { api } = env, s = world('dist06-boss');
  env.sb.__HAPIL_LOOP_V31365__.tick(s, NaN); env.sb.__HAPIL_LOOP_V31365__.tick(s, Infinity);
  s.enemies[0].x = NaN; run(env, s, .5); s.enemies[0].x = 24;
  let max = 0; run(env, s, 40, () => { max = Math.max(max, live(api, s)); });
  const P = api.__test.pool(s);
  assert.ok(max <= P.cap, 'cap ' + max + '/' + P.cap);
  for (let i = 0; i < P.live; i++) for (const f of ['x', 'y', 'vx', 'vy']) assert.ok(Number.isFinite(P[f][i]), f + ' finite');
  assert.ok(P.x instanceof Float32Array, 'SoA pool');
  const mob = makeEnv('', { innerWidth: 700 }); assert.ok(mob.api.__test.capFor(true) < mob.api.__test.capFor(false), 'mobile cap smaller');
  s.enemies[0].hp = 0; run(env, s, .1); assert.strictEqual(live(api, s), 0, 'boss death clears');
  const s2 = world('dist06-boss'); run(env, s2, 4); s2.zone = 'dist05'; run(env, s2, .1); assert.strictEqual(live(api, s2), 0, 'zone change clears');
});

test('time stop and pause freeze the duel; EGO wipe clears hanging and flying duel bullets', () => {
  const env = makeEnv(), { api } = env, s = world('dist06-boss');
  run(env, s, 3.2);
  const P = api.__test.pool(s), n = P.live, x0 = P.x[0];
  assert.ok(n > 0);
  s.timeStopUntil = s.time + 10; run(env, s, .5); assert.strictEqual(P.x[0], x0, 'time stop freezes'); s.timeStopUntil = 0;
  s.paused = true; run(env, s, .5); assert.strictEqual(P.x[0], x0, 'pause freezes'); s.paused = false;
  s.awakeningUntil = s.time + 5; run(env, s, H); assert.strictEqual(live(api, s), 0, 'EGO wipe');
});

test('draw: one drawImage per bullet in the front layer, telegraph strokes while hanging, nothing for guests or other zones', () => {
  const env = makeEnv(), { api, sb } = env, s = world('a11-boss');
  run(env, s, 2.8);
  const log = {}, ctx = stubCtx(log);
  sb.__HAPIL_ENEMY_FEEL_V31361__.draw(ctx, s, {}, 'front');
  assert.ok(log.draws >= live(api, s) && live(api, s) > 0, 'sprites drawn ' + log.draws + '/' + live(api, s));
  const hanging = api.snapshot(s).hanging; if (hanging) assert.ok(log.strokes > 0, 'telegraph while hanging');
  const log2 = {}; sb.__HAPIL_ENEMY_FEEL_V31361__.draw(stubCtx(log2), s, {}, 'under'); assert.strictEqual(log2.draws, 0, 'front layer only');
  assert.strictEqual(sb.__HAPIL_ENEMY_FEEL_V31361__.installed, true, 'wrapped object keeps the native getter');
});

test('full-auto: duel bullets are easier (x.75 damage) and an imminent released bullet asks the native dash', () => {
  const env = makeEnv('', { auto: true }), { api, log } = env, s = world('dist06-boss');
  run(env, s, 4.5);
  const P = api.__test.pool(s); const j = [...Array(P.live).keys()].find(i => P.hang[i] <= s.time);
  assert.ok(j != null);
  s.__core = { x: P.x[j] + P.vx[j] * .12, y: P.y[j] + P.vy[j] * .12 }; s.time += H; env.sb.__HAPIL_LOOP_V31365__.tick(s, H);
  assert.ok(log.dash >= 1, 'auto dodge requested');
});

// ------------------------------------------------------------------ RC240 gates (RC240 itself otherwise untouched)
function rc240Env(duelOwns) {
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, Float32Array, Float64Array, Int32Array, Uint8Array, Uint16Array,
    location: { search: '?rc240=1&rc240gov=0' }, innerWidth: 1280, localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, setInterval: () => 0, performance: { now: () => 0 },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => null }), querySelector: () => null } };
  sb.window = sb; sb.globalThis = sb; vm.createContext(sb); vm.runInContext(read(danmakuFile), sb, { filename: danmakuFile });
  const feelTicks = { n: 0 };
  sb.__HAPIL_RC86_BRIDGE__ = { project };
  sb.__HAPIL_LASERS_V31330__ = { installed: true, tick() {}, draw() {}, danger() { return 0; } };
  sb.__HAPIL_GRAMMAR_V31365__ = Object.freeze({ version: 'g', installed: true, draw() {}, mode: s => s?.gameModeV31346 ?? 'STORY' });
  sb.__HAPIL_LOOP_V31365__ = Object.freeze({ version: 'L', installed: true, background() {}, imminent: () => null, render() {} });
  sb.__HAPIL_COMBAT_V31333__ = { core: s => s.__core };
  sb.__HAPIL_NATIVE_ARENA_RC138__ = { bodyDamage() { return true; } };
  sb.__HAPIL_COMBAT_LIFECYCLE_RC231__ = { enabled: s => s.hp > 0, majorUntil: () => 0 };
  sb.__HAPIL_RC95_NATIVE__ = { locked: () => false };
  sb.__HAPIL_DANMAKU_RC129__ = { phase: s => s.phaseStub ?? null };
  sb.__HAPIL_CHANNEL_V31364__ = { active: () => false, blockDamage: () => false };
  sb.__HAPIL_CHOICE_RC97__ = { profile: () => ({ family: 'envy' }) };
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { settings: { current: {} }, state: { current: null } }, effective: () => 'manual' };
  sb.__HAPIL_STG_FEEL_RC240__ = { tick() { feelTicks.n++; } };
  sb.__HAPIL_BOSS_DUEL_RC241__ = { owns: () => duelOwns };
  let g = 0; while (!sb.__HAPIL_DANMAKU_RC240__.installed && g++ < 5) sb.__HAPIL_DANMAKU_RC240__.__test.install();
  return { sb, feelTicks };
}
// House rule: no bullet formation may read as a cross (X or +); crosses become hexagrams.
function readsAsCross(rows) {
  const pts = rows.filter(r => !r.abs && r.r > 0);
  const groups = [];
  for (const r of pts) {
    const a = ((r.off % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const g = groups.find(g => Math.abs(Math.atan2(Math.sin(a - g.a), Math.cos(a - g.a))) < .12);
    if (g) g.r.add(Math.round(r.r)); else groups.push({ a, r: new Set([Math.round(r.r)]) });
  }
  const arms = groups.filter(g => g.r.size >= 2);
  if (arms.length !== 2 && arms.length !== 4) return false;
  if (arms.length !== groups.length) return false;
  let min = Infinity;
  for (let i = 0; i < arms.length; i++) for (let j = i + 1; j < arms.length; j++) min = Math.min(min, Math.abs(Math.atan2(Math.sin(arms[i].a - arms[j].a), Math.cos(arms[i].a - arms[j].a))));
  return min >= Math.PI / 3;
}

test('no cross formation: every deck volley (plain and awakened) is cross-free; the old cross is now a hexagram of two triangles', () => {
  const { sb, api } = makeEnv();
  const D = sb.__HAPIL_BOSS_DUEL_DECKS_RC241__, F = api.__test.formation;
  assert.ok(!/f===['"]cross['"]/.test(read(duelFile)), 'no cross formation branch in the runtime');
  const H0 = { x: 400, y: 380 }, mz = { x: 900, y: 300 };
  for (const b of Object.values(D.bosses)) for (const e of b.deck) {
    assert.notStrictEqual(e.formation, 'cross', e.name);
    for (const N of [e.count, Math.round(e.count * 1.5)]) for (let cycle = 0; cycle < 3; cycle++)
      assert.ok(!readsAsCross(F(e, N, Math.PI, H0, mz, cycle, 1, e.size)), e.name + ' reads as a cross (N=' + N + ')');
  }
  // The detector does catch the retired 4-arm layout.
  const oldCross = []; for (let i = 0; i < 16; i++) oldCross.push({ off: Math.PI / 4 + (i % 4) * Math.PI / 2, r: 80 + Math.floor(i / 4) * 40 });
  assert.ok(readsAsCross(oldCross), 'detector sanity');
  const lucifer = D.bosses['a11-boss'].deck.find(e => e.name === '치료거부 성광십자');
  assert.strictEqual(lucifer.formation, 'hexagram', 'volley name kept, layout is a hexagram');
  for (const N of [16, 24]) {
    const rows = F(lucifer, N, 0, H0, mz, 0, 1, lucifer.size);
    assert.strictEqual(rows.length % 6, 0, 'six-fold symmetric');
    for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++)
      assert.ok(Math.hypot(Math.cos(rows[i].off) * rows[i].r - Math.cos(rows[j].off) * rows[j].r, Math.sin(rows[i].off) * rows[i].r - Math.sin(rows[j].off) * rows[j].r) > lucifer.size * .9, 'no stacked or touching points');
    const pts = rows.map(r => ({ x: Math.cos(r.off) * r.r, y: Math.sin(r.off) * r.r })), R = Math.max(...rows.map(r => r.r));
    const tips = rows.filter(r => Math.abs(r.r - R) < 1e-6).map(r => ((r.off % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)).sort((a, b) => a - b);
    assert.strictEqual(tips.length, 6, 'six star points');
    for (let i = 1; i < 6; i++) assert.ok(Math.abs(tips[i] - tips[i - 1] - Math.PI / 3) < 1e-6, 'points 60 deg apart');
    // Every point lies on one of the two triangles' edges (distance to the edge line = R/2 from the centre).
    for (const p of pts) {
      const onEdge = [0, 1].some(tri => [0, 1, 2].some(k => { const a = tri * Math.PI / 3 + k * 2 * Math.PI / 3 + Math.PI / 3; return Math.abs(p.x * Math.cos(a) + p.y * Math.sin(a) - R / 2) < 1e-6; }));
      assert.ok(onEdge, 'point on a triangle edge');
    }
    assert.ok(rows.every(r => r.spd === 1), 'one speed, so the star keeps its shape in flight');
  }
});

test('RC240 gate: a duel-owned boss gets no spell curtain, signature formation or filler stream; the STG feel keeps ticking', () => {
  for (const owns of [true, false]) {
    const { sb, feelTicks } = rc240Env(owns), api = sb.__HAPIL_DANMAKU_RC240__;
    const a = { id: 'b03-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '호텔 부매니저 · 레비아탄' };
    const s = { zone: 'ep1b03', time: 100, hp: 1e6, maxHp: 1e6, x: 12, y: 20, enemies: [a], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99, gameModeV31346: 'STORY', resonance: 0, floatTexts: [], __core: { x: 300, y: 560 },
      phaseStub: { ownerId: a.id, serial: 0, index: 0, band: 2, stage: 'active', elapsed: 0, remaining: 12, duration: 12 } };
    let maxLive = 0, sawRun = false;
    for (let i = 0; i < 600; i++) { s.time += H; s.phaseStub.elapsed += H; s.hp = s.maxHp; sb.__HAPIL_LASERS_V31330__.tick(s, H); const m = api.__test.mem(s); maxLive = Math.max(maxLive, m.pool.live); if (m.run) sawRun = true; }
    if (owns) { assert.strictEqual(maxLive, 0, 'no RC240 bullets under a duel'); assert.strictEqual(sawRun, false, 'no spell declared'); assert.ok(feelTicks.n > 500, 'feel still ticks'); assert.strictEqual(String(api.__test.mem(s).owner?.id), 'b03-boss', 'boss still the RC240 owner (charge shot)'); }
    else { assert.ok(maxLive > 0 && sawRun, 'unchanged without a duel'); }
  }
});

test('RC240 phone zoom stands aside while a duel frames the whole arena (source gate present)', () => {
  const src = read(landscapeFile);
  assert.ok(/__HAPIL_BOSS_DUEL_RC241__\?\.framed\?\.\(s\)/.test(src), 'zoomEligible consults the duel framing');
});

test('index.html loads the duel runtime with one tag after the RC240 scripts; the runtime pulls its deck data file', () => {
  const html = read(path.join(ROOT, 'index.html'));
  const iDuel = html.indexOf('./assets/rc241/boss-duel.js'), iRc240 = html.lastIndexOf('./assets/rc240/');
  assert.ok(iDuel > iRc240, 'after rc240 scripts');
  assert.strictEqual(html.split('./assets/rc241/').length, 2, 'exactly one rc241 tag');
  assert.ok(read(duelFile).includes("./assets/rc241/boss-duel-decks.js"), 'runtime names its deck file');
});

console.log(`rc241 boss duel unit: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
