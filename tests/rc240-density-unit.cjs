'use strict';
// RC240 density / difficulty contract over the WHOLE boss cycle, not one spell.
// Drives the shipped layer through its real tick seam with an RC129-shaped
// phase clock (active 12 s Story / 10 s Dream -> draining -> rest .65 s -> next
// spell), periodic hard 'cast' holds, and a hero that never moves.
//
// Asserts, per mode x band x platform, aggregated over seeds:
//  1. empty screen (< 12 live RC240 bullets on PC, scaled by the same reduction
//     multiplier as the curtain on mobile / full-auto) <= 10% of boss-alive time;
//  2. mean live bullets clears a floor set 40% (bands 1-2) / 20% (band 3) above
//     the pre-change layer measured with this same harness (numbers below), and
//     stays under a +80% / +50% ceiling;
//  3. a hero that stands still is hit regularly (floor justified below), while
//     the solvability suite (rc240-pattern-solvable-unit) keeps proving a path;
//  4. fairness: every bullet spawns outside the heart exclusion radius, every
//     fast (>= 200 px/s at spawn) bullet that is aimed was telegraphed >= .3 s,
//     live counts stay within the band budget, mobile / full-auto stay
//     proportionate to PC.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = process.env.RC240_LAYER || path.join(__dirname, '..', 'assets', 'rc240', 'danmaku-layer.js');
const source = fs.readFileSync(file, 'utf8');
const H = 1 / 60;

const project = (x, y) => ({ x: 640 + 27 * (x - y), y: 13.5 * (x + y) });
function makeEnv(o) {
  const sb = {
    console, Math, Date, JSON, Object, Array, Number, String, Map, WeakMap, Set, Float32Array, Int32Array,
    location: { search: '?rc240=1&rc240gov=0' }, innerWidth: o.mobile ? 700 : 1280,
    localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, setInterval: () => 0, performance: { now: () => 0 },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => null }), querySelector: () => null },
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb); vm.runInContext(source, sb, { filename: file });
  const loop = { version: 'L', installed: true, background() {}, imminent: () => null, render() {}, graze() {}, heal() {}, afterHit() {}, queueEcho() {}, blocked: () => false };
  Object.defineProperty(loop, 'rc225Wrapped', { value: true }); Object.defineProperty(loop, 'rc226Wrapped', { value: true });
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
  sb.__HAPIL_CONTROLS_V31329__ = { binding: { settings: { current: {} }, state: { current: null } }, effective: () => (o.auto ? 'full' : 'manual') };
  let guard = 0; while (!sb.__HAPIL_DANMAKU_RC240__.installed && guard++ < 5) sb.__HAPIL_DANMAKU_RC240__.__test.install();
  return sb;
}

// One boss fight segment. RC129 clock: active -> draining (seeded .4..3.5 s: the native
// boss finishes its cast; Balrog drains measured ~3-4 s in the browser) -> rest .65 s.
function simulate(o) {
  const sb = makeEnv(o), api = sb.__HAPIL_DANMAKU_RC240__, X = api.__test;
  const dur = o.mode === 'DREAM' ? 10 : 12, rng = X.mulberry32(X.hash('density', o.seed, o.mode, o.band));
  const bossId = 'boss-' + o.seed;
  const a = { id: bossId, boss: true, hp: 100, maxHp: 100, x: 27.4, y: 11.5, name: '테스트 보스', fam: o.family };
  const s = { zone: 'z' + o.seed, time: 100, hp: 1000, maxHp: 1000, x: 12, y: 20, enemies: [a], hostileProjectiles: [], fxSerial: 1, invulnerableUntil: 0, timeStopUntil: 0, lastDodgeAt: -99,
    gameModeV31346: o.mode, resonance: 0, floatTexts: [], __core: { x: o.hero[0], y: o.hero[1] } };
  const ph = { ownerId: bossId, serial: 0, index: 0, band: o.band, stage: 'active', elapsed: 0, remaining: dur, duration: dur };
  let stageLeft = dur, nextCast = 4 + rng() * 6;
  const thr = Math.max(1, Math.round(12 * Math.max(.45, (o.mobile ? .55 : 1) * (o.auto ? .75 : 1))));
  const r = { samples: 0, empty: 0, sum: 0, peak: 0, hits: 0, minSpawn: 1e9, excl: 0, fastUntele: 0, overBudget: 0, budget: 0 };
  const h0 = api.metrics().hits, seen = new Set();
  const steps = Math.round(o.secs / H);
  for (let k = 0; k < steps; k++) {
    // Phase clock.
    stageLeft -= H;
    if (ph.stage === 'active') { ph.elapsed += H; ph.remaining = Math.max(0, dur - ph.elapsed); if (stageLeft <= 0) { ph.stage = 'draining'; stageLeft = .4 + 3.1 * rng(); } }
    else if (ph.stage === 'draining') { if (stageLeft <= 0) { ph.stage = 'rest'; stageLeft = .65; } }
    else if (stageLeft <= 0) { ph.stage = 'active'; ph.serial++; ph.index = (ph.index + 1) % 3; ph.elapsed = 0; ph.remaining = dur; stageLeft = dur; }
    s.phaseStub = { ...ph };
    // Periodic telegraphed native cast (hard hold) of ~1 s.
    if (s.time - 100 >= nextCast) { a.atomicCastUntil31210 = s.time + .8 + .4 * rng(); nextCast += 9 + 6 * rng(); }
    s.time += H; s.hp = s.maxHp;
    sb.__HAPIL_LASERS_V31330__.tick(s, H);
    const m = X.mem(s), P = m.pool, ctx = m.ctx;
    // Fairness probes on bullets born this frame.
    for (let i = 0; i < P.live; i++) {
      if (P.age[i] > H + 1e-6) continue; const key = P.ox[i] + ':' + P.oy[i] + ':' + P.ang[i] + ':' + s.time; if (seen.has(key)) continue;
      const d = Math.hypot(P.ox[i] - o.hero[0], P.oy[i] - o.hero[1]); if (d < r.minSpawn) r.minSpawn = d;
      const fast = Math.hypot(P.vx[i], P.vy[i]) >= 200, aimed = (P.flags[i] & 2) !== 0;
      if (fast && aimed && !((P.flags[i] & 16) !== 0)) r.fastUntele++;
    }
    if (ctx) { r.excl = Math.max(r.excl, ctx.excl); r.budget = Math.max(r.budget, ctx.peak); if (P.live > Math.max(ctx.peak, m.fctx ? m.fctx.peak : 0)) r.overBudget++; }
    r.samples++; r.sum += P.live; if (P.live < thr) r.empty++; if (P.live > r.peak) r.peak = P.live;
  }
  r.hits = api.metrics().hits - h0; r.teleMin = api.metrics().teleMin; r.mean = r.sum / r.samples; r.emptyFrac = r.empty / r.samples; r.hitsPer60 = r.hits * 60 / o.secs; r.thr = thr;
  return r;
}

const SECS = 45, SECS_ALT = 30;
// Every boss family (each maps to two of the eight spells) is covered on PC; the
// reduced platforms rotate through half of them.
const FAMILIES = ['envy', 'greed', 'rage', 'obsession', 'order', 'petal', 'lucifer', 'gluttony'];
// Stationary hero spots inside the combat band (left half, where the heart lives).
const SPOTS = [[470, 513], [380, 450], [560, 600]];
const agg = (rows, f) => rows.reduce((a, r) => a + f(r), 0) / rows.length;
let passed = 0; const failures = [];
function check(cond, msg) { if (cond) passed++; else failures.push(msg); }

// Pre-change baseline of this harness (PC manual, mean live over the whole cycle,
// averaged over the 8 families), measured on the layer before this change
// (RC240_LAYER=<old file> node tests/rc240-density-unit.cjs):
//   mean live  STORY 65 / 90 / 151 | HELL 76 / 103 / 170 | DREAM 91 / 117 / 194
//   empty      17-26% everywhere
//   statue hits/min  STORY 5.3 / 5.7 / 8.2 | HELL 6.7 / 6.7 / 10.5 | DREAM 7.7 / 9.5 / 14.7
// Mean floors are +40% (b1, b2) and +20% (b3) on those numbers; ceilings (+80% /
// +50%) keep the change "one step", not a different game.
const BASE = { STORY: [65, 90, 151], HELL: [76, 103, 170], DREAM: [91, 117, 194] };
const LIFT = [1.4, 1.4, 1.2], CEIL = [1.8, 1.8, 1.5];
// Stationary-hero floor (PC manual, hits / 60 s averaged over families).
// The heart is 4.5 px; mercy after a hit is 1.5 / 1.1 / .9 s and clears a
// 140 / 100 / 80 px radius, so a statue can at most be hit ~25-40 times a minute.
// "Hit regularly" is defined as: at least once every 10 s in every band and mode
// (>= 6/min), and at least 20% more often than the pre-change layer, rising with
// band and mode. Standing still is therefore a losing plan, while per-hit damage
// (4/6/8% max HP), the rolling 4 s caps (18/24/30%), mercy and the solvability
// suite (zero contacts for a dodging bot) keep a path for a competent dodger.
const HIT_FLOOR = { STORY: [6.4, 6.8, 9.8], HELL: [8, 8, 12.6], DREAM: [9.2, 11.4, 17.6] };

const t0 = Date.now();
const table = [];
for (const mode of ['STORY', 'HELL', 'DREAM']) for (let band = 1; band <= 3; band++) {
  const pc = [], mob = [], auto = [], both = [];
  FAMILIES.forEach((family, seed) => {
    pc.push(simulate({ mode, band, seed, family, hero: SPOTS[seed % 3], secs: SECS, mobile: false, auto: false }));
    if (seed % 2) return;
    const alt = FAMILIES[(seed + band) % 8];
    mob.push(simulate({ mode, band, seed, family: alt, hero: SPOTS[0], secs: SECS_ALT, mobile: true, auto: false }));
    auto.push(simulate({ mode, band, seed, family: alt, hero: SPOTS[0], secs: SECS_ALT, mobile: false, auto: true }));
    both.push(simulate({ mode, band, seed, family: alt, hero: SPOTS[0], secs: SECS_ALT, mobile: true, auto: true }));
  });
  const row = { mode, band };
  for (const [name, rows] of [['pc', pc], ['mob', mob], ['auto', auto], ['both', both]]) {
    row[name] = { mean: agg(rows, r => r.mean), empty: agg(rows, r => r.emptyFrac), peak: Math.max(...rows.map(r => r.peak)), hits: agg(rows, r => r.hitsPer60), thr: rows[0].thr };
    const tag = `${mode} b${band} ${name}`;
    check(row[name].empty <= .10, `${tag}: empty ${(100 * row[name].empty).toFixed(1)}% > 10% (thr ${rows[0].thr})`);
    for (const r of rows) {
      check(r.minSpawn >= r.excl - 1e-6, `${tag}: spawn ${r.minSpawn.toFixed(1)} px inside exclusion ${r.excl}`);
      check(r.fastUntele === 0, `${tag}: ${r.fastUntele} fast aimed bullets without a telegraph`);
      check(!(r.teleMin < .3 - 1e-9), `${tag}: telegraph lead ${r.teleMin} < .3 s`);
      check(r.overBudget === 0, `${tag}: live above budget on ${r.overBudget} frames`);
    }
  }
  const floor = BASE[mode][band - 1] * LIFT[band - 1];
  check(row.pc.mean >= floor, `${mode} b${band} pc: mean live ${row.pc.mean.toFixed(1)} < floor ${floor.toFixed(1)}`);
  check(row.pc.mean <= BASE[mode][band - 1] * CEIL[band - 1], `${mode} b${band} pc: mean live ${row.pc.mean.toFixed(1)} above one-step ceiling ${(BASE[mode][band - 1] * CEIL[band - 1]).toFixed(1)}`);
  check(row.pc.hits >= HIT_FLOOR[mode][band - 1], `${mode} b${band} pc: stationary hero ${row.pc.hits.toFixed(1)} hits/min < ${HIT_FLOOR[mode][band - 1]}`);
  // Proportionate: mobile ~.55, full-auto ~.75, both >= .45 of PC (allow pacing slack).
  check(row.mob.mean <= row.pc.mean * .75 && row.mob.mean >= row.pc.mean * .35, `${mode} b${band}: mobile/pc ${(row.mob.mean / row.pc.mean).toFixed(2)} not ~.55`);
  check(row.auto.mean <= row.pc.mean * .95 && row.auto.mean >= row.pc.mean * .5, `${mode} b${band}: auto/pc ${(row.auto.mean / row.pc.mean).toFixed(2)} not ~.75`);
  check(row.both.mean <= row.mob.mean * 1.05 && row.both.mean >= row.pc.mean * .28, `${mode} b${band}: mobile+auto/pc ${(row.both.mean / row.pc.mean).toFixed(2)}`);
  table.push(row);
}
for (const r of table) console.log(`${r.mode.padEnd(5)} b${r.band} ` + ['pc', 'mob', 'auto', 'both'].map(k =>
  `${k} mean ${r[k].mean.toFixed(0).padStart(3)} peak ${String(r[k].peak).padStart(3)} empty ${(100 * r[k].empty).toFixed(1).padStart(4)}%` + (k === 'pc' ? ` hits/min ${r[k].hits.toFixed(1).padStart(4)}` : '')).join(' | '));
console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (failures.length) { console.error(failures.slice(0, 60).join('\n')); console.error(`${failures.length} failure(s), ${passed} checks ok`); process.exit(1); }
console.log(`rc240-density-unit: ${passed} checks OK`);
