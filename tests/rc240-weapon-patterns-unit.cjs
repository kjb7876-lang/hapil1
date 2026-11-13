'use strict';
// RC240 weapon signatures: every boss's weapon drawn with bullets inside its spells.
// Covers: (1) every boss id the bundle ships resolves to a weapon generator, main
// bosses with weapon evidence never fall back; (2) each generator draws a dense,
// complete, stationary formation that holds >= .3 s before release, then releases
// it below 200 px/s, scaled by the mobile / full-auto factors; (3) solvability with
// the same greedy hero-speed bot as rc240-pattern-solvable-unit, now with the
// signatures woven into the spells (zero contacts, <= 1.5% tight frames, peak <=
// band cap, no spawn inside the heart exclusion); (4) runtime wiring through the
// real tick seam (boss id -> weapon, two phrases per spell, none during rest,
// gating); (5) draw discipline (trail behind bullets, strokes only, no shadowBlur,
// bounded drawImage and save/restore).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = path.join(__dirname, '..', 'assets', 'rc240', 'danmaku-layer.js');
const source = fs.readFileSync(file, 'utf8');
let passed = 0;
function test(name, fn) { try { fn(); passed++; console.log('ok -', name); } catch (e) { console.error('FAIL -', name); console.error(e && e.stack || e); process.exitCode = 1; } }

function load(search = '?qa=1&rc240=1', innerWidth = 1280) {
  const sb = { console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, Float32Array, Int32Array, Uint8Array, Uint16Array,
    location: { search }, innerWidth, localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, setInterval: () => 0, performance: { now: () => 0 },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => null }), querySelector: () => null } };
  sb.window = sb; sb.globalThis = sb; vm.createContext(sb); vm.runInContext(source, sb, { filename: file });
  return sb;
}
const sb0 = load(), X = sb0.__HAPIL_DANMAKU_RC240__.__test;
const { FIELD, HIT, HERO_V, HEART_R } = X;
const F_SIG = 32, H = 1 / 60;

// ------------------------------------------------------------------ 1. data coverage
const bundle = fs.readFileSync(path.join(__dirname, '..', 'assets', 'index-v31526.js'), 'utf8');
const idsLine = /HAPIL_RC13_BOSS_IDS=(\[[^\]]*\])/.exec(bundle);
const BOSS_IDS = JSON.parse(idsLine[1]);
// Main bosses whose weapon (or weapon-like signature object) is named in the bundle.
const MAIN_WITH_WEAPON = ['dist06-boss', 'a11-boss', 'b03-boss', 'b04-boss', 'b05-boss', 'b06-boss', 'b06b-boss', 'b07-boss', 'u203-boss',
  'l301-boss', 'l305-boss', 'k103-boss', 'h103-boss', 'c102-boss', 'c104-boss', 'kair-great-01', 'kair-great-02', 'kair-great-03',
  'kair-great-04', 'kair-great-05', 'kair-great-06'];

test('weapon table: 8-14 generators, every shipped boss id resolves, evidence-backed bosses never fall back', () => {
  assert.ok(X.WEAPON_GENS && X.weaponFor && X.BOSS_WEAPONS, 'weapon API exposed under __test');
  const gens = Object.keys(X.WEAPON_GENS);
  assert.ok(gens.length >= 8 && gens.length <= 14, 'generator count ' + gens.length);
  for (const g of gens) assert.ok(!/cross/i.test(g), 'no cross generator: ' + g);
  assert.ok(BOSS_IDS.length >= 60, 'bundle boss list parsed: ' + BOSS_IDS.length);
  const used = new Set();
  for (const id of BOSS_IDS) {
    const w = X.weaponFor({ id, boss: !/^mb-|-mid$/.test(id), name: '' });
    assert.ok(w && w.list.length >= 1, 'weapon for ' + id);
    for (const e of w.list) { assert.ok(X.WEAPON_GENS[e.g], id + ' unknown generator ' + e.g); used.add(e.g); }
    assert.ok(typeof w.evidence === 'string' && w.evidence.length > 3, 'evidence string for ' + id);
  }
  for (const id of MAIN_WITH_WEAPON) assert.strictEqual(X.weaponFor({ id, boss: true }).fallback, false, id + ' must not fall back');
  for (const g of gens) assert.ok(used.has(g), 'generator used by some boss: ' + g);
  // Unknown boss: family default, flagged as fallback.
  const u = X.weaponFor({ id: 'qa-boss', boss: true, name: '테스트 보스' }, 'greed');
  assert.ok(u.fallback === true && u.list.length >= 1);
});

// ------------------------------------------------------------------ 2. formation per generator
// Representative boss per generator variant (first entry of its weapon list is used via sigOrder).
function repBosses() {
  const out = new Map();
  for (const [id, w] of Object.entries(X.BOSS_WEAPONS)) for (let k = 0; k < w.list.length; k++) { const key = w.list[k].g + ':' + (w.list[k].p.v || ''); if (!out.has(key)) out.set(key, { id, k }); }
  return [...out.entries()].map(([key, v]) => ({ key, ...v }));
}
const REPS = repBosses();
function phraseProbe(o) {
  const sim = X.headless({ spell: o.spell || 'S6', band: o.band, mode: o.mode, seed: o.seed || 0, mobile: !!o.mobile, auto: !!o.auto, weapon: o.id, sigOrder: o.k, sigBeats: [1.4, 6.2] });
  const P = sim.pool; let hx = 300, hy = 560; const r = { maxLive: 0, preRelease: null, built: 0, maxSpd: 0, bad: 0, phrases: 0, holdMin: 9 };
  let firstRelAt = null, sigSpawnAt = null;
  while (sim.time < 5) {
    sim.step(H, hx, hy, hx, hy);
    let live = 0, moving = 0, xs = [1e9, -1e9], ys = [1e9, -1e9];
    for (let i = 0; i < P.live; i++) {
      if (!(P.flags[i] & F_SIG)) continue; live++;
      const v = Math.hypot(P.vx[i], P.vy[i]); if (!Number.isFinite(v) || !Number.isFinite(P.x[i])) r.bad++;
      if (v > 1) moving++; if (v > r.maxSpd) r.maxSpd = v;
      xs[0] = Math.min(xs[0], P.x[i]); xs[1] = Math.max(xs[1], P.x[i]); ys[0] = Math.min(ys[0], P.y[i]); ys[1] = Math.max(ys[1], P.y[i]);
    }
    if (live && sigSpawnAt == null) sigSpawnAt = sim.time;
    if (live > r.maxLive && moving === 0) { r.maxLive = live; r.preRelease = { live, w: xs[1] - xs[0], h: ys[1] - ys[0] }; }
    if (moving && firstRelAt == null) firstRelAt = sim.time;
  }
  const S = sim.run.sig; r.phrases = S ? S.phrases : 0; r.last = S && S.last; r.firstRelAt = firstRelAt; r.sigSpawnAt = sigSpawnAt;
  return r;
}

test('each generator draws a dense stationary formation, holds it, then releases below 200 px/s (PC counts 40-90 b1-2, <=120 b3)', () => {
  assert.ok(REPS.length >= 8, 'variants ' + REPS.length);
  const rows = [];
  for (const rep of REPS) for (const mode of ['STORY', 'DREAM']) for (let band = 1; band <= 3; band++) {
    const r = phraseProbe({ id: rep.id, k: rep.k, band, mode });
    const tag = `${rep.key} (${rep.id}) ${mode} b${band}`;
    assert.ok(r.phrases >= 1, tag + ': no phrase');
    assert.strictEqual(r.bad, 0, tag + ': NaN bullets');
    const lo = band === 3 ? 60 : 40, hi = band === 3 ? 120 : 90;
    assert.ok(r.maxLive >= lo && r.maxLive <= hi, `${tag}: formation ${r.maxLive} not in [${lo},${hi}]`);
    assert.ok(Math.max(r.preRelease.w, r.preRelease.h) >= 110, `${tag}: formation too small ${r.preRelease.w.toFixed(0)}x${r.preRelease.h.toFixed(0)}`);
    assert.ok(r.maxSpd < 200, `${tag}: released at ${r.maxSpd.toFixed(0)} px/s`);
    assert.ok(r.firstRelAt - r.sigSpawnAt >= .5, `${tag}: drawn ${(r.firstRelAt - r.sigSpawnAt).toFixed(2)} s before first release`);
    rows.push(`${tag.padEnd(46)} n ${String(r.maxLive).padStart(3)} box ${r.preRelease.w.toFixed(0)}x${r.preRelease.h.toFixed(0)}`);
  }
  if (process.env.VERBOSE) console.log(rows.join('\n'));
});

// On-screen extent. The game draws the layer in G-space through the native camera transform,
// which scales G by 0.82 at 1280x720 (canvas matrix; confirmed on captures: a 158x246 G mirror
// frame spans ~130x200 screen px), so screen px = G px * 0.82. Targets (screen px): every
// formation >= 130 tall (~56% of the 284 G band), long weapons >= 300 along their longest span;
// the shape sits in front of the boss, not on it; it is complete and still for >= .5 s, and nothing
// moves before 1.3 s. Mobile keeps the same G-size silhouette (the same share of the band) with
// fewer bullets.
const K_SCREEN = 0.82, MIN_H = 130 / K_SCREEN, MIN_LONG = 300 / K_SCREEN;
const LONG = new Set(['blade', 'whip', 'strings', 'crescent', 'wings', 'syringe']);
const DIR16 = []; for (let i = 0; i < 16; i++) DIR16.push([Math.cos(i * Math.PI / 16), Math.sin(i * Math.PI / 16)]);
function extentProbe(o) {
  const sim = X.headless({ spell: 'S6', band: o.band, mode: o.mode, seed: 0, mobile: !!o.mobile, weapon: o.id, sigOrder: o.k, sigBeats: [1.4, 7.2] });
  const P = sim.pool, r = { first: null, last: null, move: null, still: null, live: 0, travel: 0 }; let start = null;
  while (sim.time < 6 && r.move == null) {
    sim.step(H, o.hx, o.hy, o.hx, o.hy);
    let live = 0, moving = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const cal = DIR16.map(() => [1e9, -1e9]);
    for (let i = 0; i < P.live; i++) {
      if (!(P.flags[i] & F_SIG)) continue; live++; if (Math.hypot(P.vx[i], P.vy[i]) > 1) moving++;
      x0 = Math.min(x0, P.x[i]); x1 = Math.max(x1, P.x[i]); y0 = Math.min(y0, P.y[i]); y1 = Math.max(y1, P.y[i]);
      DIR16.forEach(([c, s], k) => { const d = P.x[i] * c + P.y[i] * s; if (d < cal[k][0]) cal[k][0] = d; if (d > cal[k][1]) cal[k][1] = d; });
    }
    if (live && r.first == null) r.first = sim.time;
    if (moving) { r.move = sim.time; break; }
    if (live > r.live) { r.live = live; r.last = sim.time; }
    if (live) r.still = { w: x1 - x0, h: y1 - y0, long: Math.max(...cal.map(([a, b]) => b - a)), cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }
  r.bx = sim.ctx.bx; r.last_g = sim.run.sig && sim.run.sig.last;
  return r;
}
test('on-screen extent: >= 130 px tall, long weapons >= 300 px, in front of the boss, still >= .5 s, armed >= 1.3 s (PC and mobile)', () => {
  const fails = [], rows = [];
  for (const rep of REPS) for (const mode of ['STORY', 'DREAM']) for (let band = 1; band <= 3; band++) for (const mobile of [false, true]) for (const [hx, hy] of [[300, 560], [640, 390]]) {
    if (mode === 'DREAM' && band === 2) continue;
    const r = extentProbe({ id: rep.id, k: rep.k, band, mode, mobile, hx, hy }), g = rep.key.split(':')[0];
    const tag = `${rep.key} ${mode} b${band} ${mobile ? 'mob' : 'pc'} hero(${hx},${hy})`;
    if (!r.still || r.move == null) { fails.push(tag + ': no still formation then motion'); continue; }
    const s = r.still;
    rows.push(`${tag.padEnd(44)} n ${String(r.live).padStart(3)} G ${s.w.toFixed(0)}x${s.h.toFixed(0)} long ${s.long.toFixed(0)} -> screen ${(s.w * K_SCREEN).toFixed(0)}x${(s.h * K_SCREEN).toFixed(0)} long ${(s.long * K_SCREEN).toFixed(0)}; still ${(r.move - r.last).toFixed(2)} s, armed ${(r.move - r.first).toFixed(2)} s`);
    // One allowance: on mobile with the hero 430 px from the boss, the 30 px larger heart exclusion
    // may trim a formation to 90% (wing tips, whip crests, a yoyo rim).
    const near = mobile && hx === 640, minLong = near ? MIN_LONG * .9 : MIN_LONG, minH = near ? MIN_H * .9 : MIN_H;
    if (s.h < minH) fails.push(`${tag}: height ${s.h.toFixed(0)} G < ${minH.toFixed(0)}`);
    if (LONG.has(g) && s.long < minLong) fails.push(`${tag}: long axis ${s.long.toFixed(0)} G < ${minLong.toFixed(0)}`);
    if (Math.abs(r.bx - s.cx) < 110) fails.push(`${tag}: centred ${Math.abs(r.bx - s.cx).toFixed(0)} G from the boss (on top of it)`);
    if ((hx - s.cx) * (r.bx - s.cx) > 0 && Math.abs(hx - s.cx) > 60) fails.push(`${tag}: centre not between boss and hero`);
    if (r.move - r.last < .5 - 1e-6) fails.push(`${tag}: still only ${(r.move - r.last).toFixed(2)} s`);
    if (r.move - r.first < 1.3 - 1e-6) fails.push(`${tag}: moves ${(r.move - r.first).toFixed(2)} s after it appears`);
  }
  if (process.env.VERBOSE) console.log(rows.join('\n'));
  if (fails.length) { console.error(fails.slice(0, 30).join('\n')); assert.fail(fails.length + ' extent failure(s)'); }
});

test('mobile and full-auto scale the formation like the curtain (~.55 / ~.75), midboss halves it', () => {
  for (const rep of REPS) {
    const pc = phraseProbe({ id: rep.id, k: rep.k, band: 2, mode: 'STORY' }).maxLive;
    const mob = phraseProbe({ id: rep.id, k: rep.k, band: 2, mode: 'STORY', mobile: true }).maxLive;
    const auto = phraseProbe({ id: rep.id, k: rep.k, band: 2, mode: 'STORY', auto: true }).maxLive;
    assert.ok(mob >= pc * .4 && mob <= pc * .72, `${rep.key}: mobile ${mob} vs pc ${pc}`);
    assert.ok(auto >= pc * .6 && auto <= pc * .9, `${rep.key}: auto ${auto} vs pc ${pc}`);
  }
});

// ------------------------------------------------------------------ 3. solvability with signatures
const CLEAR = 8, TOL = .015;
const REGION = { x0: 200, x1: 760, y0: FIELD.y0 + 40, y1: FIELD.y1 - 3 };
const DIRS = [];
for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; DIRS.push([Math.cos(a), Math.sin(a), 1]); if (i % 2 === 0) DIRS.push([Math.cos(a), Math.sin(a), .45]); }
DIRS.push([0, 0, 0]);
const TAUS = [.05, .12, .22, .36, .55];
function clearance(pool, hx, hy) {
  let best = 1e9;
  for (let i = 0; i < pool.live; i++) { if (pool.age[i] < .12) continue; const dx = pool.x[i] - hx, dy = pool.y[i] - hy; if (dx * dx + dy * dy > 90000) continue;
    const d = Math.sqrt(dx * dx + dy * dy) - HEART_R - HIT[pool.type[i] | 0]; if (d < best) best = d; }
  return best;
}
const NB = 1024, BX = new Float64Array(NB), BY = new Float64Array(NB), BVX = new Float64Array(NB), BVY = new Float64Array(NB), BR = new Float64Array(NB);
function botMove(sim, hx, hy) {
  const P = sim.pool; let k = 0;
  for (let i = 0; i < P.live; i++) { const dx = P.x[i] - hx, dy = P.y[i] - hy; if (dx * dx + dy * dy < 220 * 220) { BX[k] = P.x[i]; BY[k] = P.y[i]; BVX[k] = P.vx[i]; BVY[k] = P.vy[i]; BR[k] = HEART_R + HIT[P.type[i] | 0]; k++; } }
  const ys = X.safeY(sim.run.t, sim.ctx.seed); let best = null;
  for (const [cx, cy, sp] of DIRS) {
    const vx = cx * HERO_V.h * sp, vy = cy * HERO_V.v * sp; let score = 1e9;
    for (const tau of TAUS) {
      const px = Math.min(REGION.x1, Math.max(REGION.x0, hx + vx * tau)), py = Math.min(REGION.y1, Math.max(REGION.y0, hy + vy * tau)); let m = 140;
      for (let j = 0; j < k; j++) { const ex = BX[j] + BVX[j] * tau - px, ey = BY[j] + BVY[j] * tau - py, lim = m + BR[j]; if (ex > lim || ex < -lim || ey > lim || ey < -lim) continue; const d = Math.sqrt(ex * ex + ey * ey) - BR[j]; if (d < m) m = d; }
      const v = Math.min(m, 60) + tau * 14; if (v < score) score = v;
    }
    const nx = hx + vx * H, ny = hy + vy * H, edge = Math.min(nx - REGION.x0, REGION.x1 - nx, ny - REGION.y0, REGION.y1 - ny);
    score -= .12 * Math.max(0, 36 - edge); score -= .012 * Math.abs(nx - 470) + .01 * Math.abs(ny - ys) + (sp === 0 ? 0 : .02);
    if (!best || score > best.score) best = { score, vx, vy };
  }
  return best;
}
function runOne(o) {
  const sim = X.headless({ spell: o.spell, band: o.band, mode: o.mode, seed: o.seed, mobile: false, setting: 1, weapon: o.id, sigOrder: o.k });
  let hx = 470, hy = X.safeY(0, sim.ctx.seed), tight = 0, hits = 0, frames = 0, minClear = 1e9, sigMax = 0; const hist = [];
  while (sim.time < sim.duration) {
    hist.push([hx, hy]); if (hist.length > 30) hist.shift(); const aim = hist[0];
    sim.step(H, hx, hy, aim[0], aim[1]);
    const mv = botMove(sim, hx, hy);
    hx = Math.min(REGION.x1, Math.max(REGION.x0, hx + mv.vx * H)); hy = Math.min(REGION.y1, Math.max(REGION.y0, hy + mv.vy * H));
    const c = clearance(sim.pool, hx, hy); if (c < 1e8) { frames++; if (c < CLEAR) tight++; if (c < 0) hits++; if (c < minClear) minClear = c; }
    let s = 0; for (let i = 0; i < sim.pool.live; i++) if (sim.pool.flags[i] & F_SIG) s++; if (s > sigMax) sigMax = s;
  }
  return { peak: sim.pool.peak, minSpawn: sim.ctx.spawnLog.minDist, excl: sim.ctx.excl, tight, frames, hits, minClear, phrases: sim.run.sig ? sim.run.sig.phrases : 0, sigMax };
}

test('solvable with signatures: hero-speed bot, zero contacts, <=1.5% tight frames, peak <= cap, no spawn in exclusion', () => {
  const t0 = Date.now(), failures = [], rows = [];
  REPS.forEach((rep, gi) => {
    for (const mode of ['STORY', 'DREAM']) for (let band = 1; band <= 3; band++) {
      let worst = { tight: 0, minClear: 1e9, sig: 0, phrases: 9 };
      for (let seed = 0; seed < 4; seed++) {
        const spell = X.SPELLS[(gi + seed + band) % X.SPELLS.length].id;
        const r = runOne({ id: rep.id, k: rep.k, spell, band, mode, seed });
        const tag = `${rep.key} ${spell} ${mode} b${band} s${seed}`, cap = X.peakFor(mode, band, false);
        if (r.phrases < 2) failures.push(`${tag}: ${r.phrases} phrases (want 2 per spell)`);
        if (r.peak > cap) failures.push(`${tag}: peak ${r.peak} > ${cap}`);
        if (r.minSpawn < r.excl - 1e-6) failures.push(`${tag}: spawn ${r.minSpawn.toFixed(1)} < excl ${r.excl}`);
        if (r.hits > 0) failures.push(`${tag}: bot contact ${r.hits} frames (min ${r.minClear.toFixed(1)})`);
        if (r.frames && r.tight / r.frames > TOL) failures.push(`${tag}: ${(100 * r.tight / r.frames).toFixed(2)}% tight`);
        worst = { tight: Math.max(worst.tight, r.frames ? r.tight / r.frames : 0), minClear: Math.min(worst.minClear, r.minClear), sig: Math.max(worst.sig, r.sigMax), phrases: Math.min(worst.phrases, r.phrases) };
      }
      rows.push(`${rep.key.padEnd(16)} ${mode.padEnd(5)} b${band} sigMax ${String(worst.sig).padStart(3)} minClear ${worst.minClear.toFixed(1).padStart(5)} tight ${(100 * worst.tight).toFixed(2)}%`);
    }
  });
  console.log(rows.join('\n'));
  console.log(`solvable-with-signatures: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (failures.length) { console.error(failures.slice(0, 40).join('\n')); assert.fail(failures.length + ' solvability failure(s)'); }
});

// ------------------------------------------------------------------ 4. runtime wiring
const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
function makeEnv(search = '?rc240=1&rc240gov=0', o = {}) {
  const counter = { drawImage: 0, shadowBlurNonZero: 0, calls: [] };
  const sb = load(search, o.innerWidth || 1280);
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
  let g = 0; while (!sb.__HAPIL_DANMAKU_RC240__.installed && g++ < 5) sb.__HAPIL_DANMAKU_RC240__.__test.install();
  return { sb, counter };
}
function fight(env, boss, secs, stage = 'active') {
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = { zone: 'z1', time: 100, hp: 1e6, maxHp: 1e6, x: 12, y: 20, enemies: [boss], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], __core: { x: 300, y: 560 } };
  const ph = { ownerId: boss.id, serial: 0, index: 0, band: 2, stage, elapsed: 0, remaining: 12, duration: 12 };
  const seen = new Set(); let sigMax = 0;
  for (let k = 0; k < Math.round(secs / H); k++) {
    if (stage === 'active') { ph.elapsed += H; ph.remaining = Math.max(0, 12 - ph.elapsed); if (ph.elapsed >= 12) { ph.serial++; ph.index = (ph.index + 1) % 3; ph.elapsed = 0; } }
    s.phaseStub = { ...ph }; s.time += H; s.hp = s.maxHp; env.sb.__HAPIL_LASERS_V31330__.tick(s, H);
    const m = api.__test.mem(s); if (m && m.run && m.run.sig && m.run.sig.last) seen.add(m.run.sig.last.g);
    if (m) { let c = 0; const P = m.pool; for (let i = 0; i < P.live; i++) if (P.flags[i] & F_SIG) c++; if (c > sigMax) sigMax = c; }
  }
  return { s, api, seen, sigMax, m: api.__test.mem(s) };
}

test('runtime: boss id picks its weapon (발록 alternates sword and chain whip), two phrases per spell, none during rest, ?qa gating', () => {
  const env = makeEnv();
  const balrog = { id: 'dist06-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '발록 · 지옥의 문지기', fam: 'rage' };
  const r = fight(env, balrog, 24.5);
  assert.ok(r.seen.has('blade') && r.seen.has('whip'), 'balrog weapons seen: ' + [...r.seen]);
  assert.ok(r.api.metrics().sigPhrases >= 4, 'phrases over two spells: ' + r.api.metrics().sigPhrases);
  assert.ok(r.sigMax >= 30, 'runtime formation size ' + r.sigMax);
  assert.strictEqual(r.m.weapon.fallback, false);
  const env2 = makeEnv();
  const rest = fight(env2, { ...balrog }, 6, 'rest');
  assert.strictEqual(rest.sigMax, 0, 'no signature during rest (volley-only stretch)');
  const off = makeEnv('?qa=1');
  const q = fight(off, { ...balrog }, 6);
  assert.strictEqual(q.api.metrics().sigPhrases, 0, 'qa without rc240=1: inert');
  // Unknown boss (density harness boss) uses its family default, flagged fallback.
  const env3 = makeEnv();
  const u = fight(env3, { id: 'boss-x', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '테스트 보스', fam: 'greed' }, 8);
  assert.ok(u.m.weapon.fallback === true && u.api.metrics().sigPhrases >= 1);
});

// ------------------------------------------------------------------ 5. draw discipline
function stubCtx(counter) {
  const c = { canvas: { width: 1280, height: 720, getBoundingClientRect: () => ({ width: 1280, height: 720 }) },
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', direction: 'ltr', lineDashOffset: 0, lineCap: 'butt', lineJoin: 'miter',
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }), createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: t => ({ width: String(t).length * 8 }), drawImage() { counter.drawImage++; counter.calls.push('drawImage'); } };
  for (const k of ['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'closePath', 'fillRect', 'setTransform', 'setLineDash', 'fillText', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo'])
    c[k] = function () { counter[k] = (counter[k] || 0) + 1; counter.calls.push(k); };
  let blur = 0; Object.defineProperty(c, 'shadowBlur', { get: () => blur, set: v => { blur = v; if (v) counter.shadowBlurNonZero++; } });
  return c;
}
test('draw: swing trail stroked behind the bullets, finite, no shadowBlur, bounded drawImage and save/restore', () => {
  const env = makeEnv();
  const env2Doc = env.sb.document; env2Doc.createElement = () => ({ width: 0, height: 0, getContext: () => stubCtx({ drawImage: 0, shadowBlurNonZero: 0, calls: [] }) });
  const boss = { id: 'l301-boss', boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '타락천사 기사', fam: 'rage' };
  const api = env.sb.__HAPIL_DANMAKU_RC240__;
  const s = { zone: 'z1', time: 100, hp: 1e6, maxHp: 1e6, x: 12, y: 20, enemies: [boss], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: 'STORY', resonance: 0, floatTexts: [], __core: { x: 300, y: 560 } };
  const ph = { ownerId: boss.id, serial: 0, index: 0, band: 3, stage: 'active', elapsed: 0, remaining: 12, duration: 12 };
  let drawnTrail = 0;
  for (let k = 0; k < 12 * 60; k++) {
    ph.elapsed += H; ph.remaining = 12 - ph.elapsed; s.phaseStub = { ...ph }; s.time += H; env.sb.__HAPIL_LASERS_V31330__.tick(s, H);
    const m = api.__test.mem(s); if (!(m.run && m.run.sig && m.run.sig.active)) continue;
    const counter = { drawImage: 0, shadowBlurNonZero: 0, calls: [] }, ctx = stubCtx(counter), N = m.pool.live;
    api.__test.drawLayer(ctx, s, {});
    const firstImg = counter.calls.indexOf('drawImage'), strokes = counter.calls.slice(0, firstImg < 0 ? undefined : firstImg).filter(c => c === 'stroke').length;
    if (strokes > 0) drawnTrail++;
    assert.ok(counter.drawImage <= N * 1.45 + 8 + 2 * m.sparks.length, `drawImage ${counter.drawImage} for ${N} bullets, ${m.sparks.length} sparks`);
    assert.strictEqual(counter.shadowBlurNonZero, 0);
    assert.strictEqual(counter.save, counter.restore); assert.ok(counter.save < 40, 'save ' + counter.save);
  }
  assert.ok(drawnTrail > 20, 'trail stroked before bullets on phrase frames: ' + drawnTrail);
});

console.log(`rc240-weapon-patterns-unit: ${passed} tests OK`);
if (process.exitCode) console.error('rc240-weapon-patterns-unit: FAILED');
