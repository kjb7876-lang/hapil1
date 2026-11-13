'use strict';
// RC240: every original spell x HP band 1..3 x STORY/DREAM x seeds 0..7 is
// simulated headlessly with the layer's own emitters, pool and stage code.
// Asserts: live peak <= master-plan cap, no spawn inside the heart exclusion
// radius, and a greedy grid bot moving at hero speed keeps >= 8 px clearance
// (tolerance: <= 1.5% of collidable frames under 8 px per run, zero contacts).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const file = path.join(__dirname, '..', 'assets', 'rc240', 'danmaku-layer.js');
const sandbox = { console, Math, Date, setTimeout: () => 0, location: { search: '?qa=1&rc240=1' }, innerWidth: 1280 };
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox); vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
const X = sandbox.__HAPIL_DANMAKU_RC240__.__test;
const { FIELD, HIT, HERO_V, HEART_R } = X;

const H = 1 / 60, CLEAR = 8, TOL = .015;
const REGION = { x0: 200, x1: 760, y0: FIELD.y0 + 40, y1: FIELD.y1 - 3 };
const DIRS = [];
for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; DIRS.push([Math.cos(a), Math.sin(a), 1]); if (i % 2 === 0) DIRS.push([Math.cos(a), Math.sin(a), .45]); }
DIRS.push([0, 0, 0]);
const TAUS = [.05, .12, .22, .36, .55];

function clearance(pool, hx, hy, collidableOnly) {
  let best = 1e9;
  for (let i = 0; i < pool.live; i++) {
    if (collidableOnly && pool.age[i] < .12) continue;
    const dx = pool.x[i] - hx, dy = pool.y[i] - hy;
    if (dx * dx + dy * dy > 90000) continue;
    const d = Math.sqrt(dx * dx + dy * dy) - HEART_R - HIT[pool.type[i] | 0];
    if (d < best) best = d;
  }
  return best;
}
const NB = 1024, BX = new Float64Array(NB), BY = new Float64Array(NB), BVX = new Float64Array(NB), BVY = new Float64Array(NB), BR = new Float64Array(NB);
function botMove(sim, hx, hy) {
  const P = sim.pool; let k = 0;
  for (let i = 0; i < P.live; i++) { const dx = P.x[i] - hx, dy = P.y[i] - hy; if (dx * dx + dy * dy < 220 * 220) { BX[k] = P.x[i]; BY[k] = P.y[i]; BVX[k] = P.vx[i]; BVY[k] = P.vy[i]; BR[k] = HEART_R + HIT[P.type[i] | 0]; k++; } }
  const ys = X.safeY(sim.run.t, sim.ctx.seed);
  let best = null;
  for (const [cx, cy, sp] of DIRS) {
    const vx = cx * HERO_V.h * sp, vy = cy * HERO_V.v * sp;
    let score = 1e9;
    for (const tau of TAUS) {
      const px = Math.min(REGION.x1, Math.max(REGION.x0, hx + vx * tau)), py = Math.min(REGION.y1, Math.max(REGION.y0, hy + vy * tau));
      let m = 140;
      for (let j = 0; j < k; j++) {
        const ex = BX[j] + BVX[j] * tau - px, ey = BY[j] + BVY[j] * tau - py, lim = m + BR[j];
        if (ex > lim || ex < -lim || ey > lim || ey < -lim) continue;
        const d = Math.sqrt(ex * ex + ey * ey) - BR[j];
        if (d < m) m = d;
      }
      const v = Math.min(m, 60) + tau * 14;
      if (v < score) score = v;
    }
    const nx = hx + vx * H, ny = hy + vy * H;
    const edge = Math.min(nx - REGION.x0, REGION.x1 - nx, ny - REGION.y0, REGION.y1 - ny);
    score -= .12 * Math.max(0, 36 - edge);
    score -= .012 * Math.abs(nx - 470) + .01 * Math.abs(ny - ys) + (sp === 0 ? 0 : .02);
    if (!best || score > best.score) best = { score, vx, vy };
  }
  return best;
}
function runOne(spell, band, mode, seed) {
  const sim = X.headless({ spell, band, mode, seed, mobile: false, setting: 1 });
  let hx = 470, hy = X.safeY(0, sim.ctx.seed), tight = 0, hits = 0, frames = 0, minClear = 1e9, sumLive = 0, samples = 0;
  const hist = [];
  let frame = 0, mv = { vx: 0, vy: 0 };
  const end = sim.duration;
  while (sim.time < end) {
    hist.push([hx, hy]); if (hist.length > 30) hist.shift();
    const aim = hist[0];
    sim.step(H, hx, hy, aim[0], aim[1]);
    mv = botMove(sim, hx, hy, sim.time, seed); frame++;
    hx = Math.min(REGION.x1, Math.max(REGION.x0, hx + mv.vx * H));
    hy = Math.min(REGION.y1, Math.max(REGION.y0, hy + mv.vy * H));
    const c = clearance(sim.pool, hx, hy, true);
    if (c < 1e8) { frames++; if (c < CLEAR) tight++; if (c < 0) hits++; if (c < minClear) minClear = c; }
    sumLive += sim.pool.live; samples++;
  }
  return { spell, band, mode, seed, peak: sim.pool.peak, cap: sim.ctx.peak, avg: sumLive / samples, minSpawn: sim.ctx.spawnLog.minDist, excl: sim.ctx.excl, tight, frames, hits, minClear };
}

const t0 = Date.now();
const rows = [], failures = [];
for (const s of X.SPELLS) for (const mode of ['STORY', 'DREAM']) for (let band = 1; band <= 3; band++) {
  const agg = { spell: s.id, mode, band, peak: 0, avg: 0, hits: 0, tightMax: 0, minClear: 1e9 };
  for (let seed = 0; seed < 8; seed++) {
    const r = runOne(s.id, band, mode, seed);
    const masterCap = X.peakFor(mode, band, false);
    if (r.peak > masterCap) failures.push(`${s.id} ${mode} b${band} seed${seed}: peak ${r.peak} > cap ${masterCap}`);
    if (r.minSpawn < r.excl - 1e-6) failures.push(`${s.id} ${mode} b${band} seed${seed}: spawn ${r.minSpawn.toFixed(1)}px < exclusion ${r.excl}`);
    if (r.hits > 0) failures.push(`${s.id} ${mode} b${band} seed${seed}: bot contact (${r.hits} frames, min clearance ${r.minClear.toFixed(1)})`);
    if (r.frames && r.tight / r.frames > TOL) failures.push(`${s.id} ${mode} b${band} seed${seed}: ${(100 * r.tight / r.frames).toFixed(2)}% frames < ${CLEAR}px`);
    agg.peak = Math.max(agg.peak, r.peak); agg.avg += r.avg / 8; agg.hits += r.hits; agg.tightMax = Math.max(agg.tightMax, r.frames ? r.tight / r.frames : 0); agg.minClear = Math.min(agg.minClear, r.minClear);
  }
  rows.push(agg);
}
for (const r of rows) console.log(`${r.spell} ${r.mode.padEnd(5)} b${r.band} peak ${String(r.peak).padStart(3)}/${X.peakFor(r.mode, r.band, false)} avg ${r.avg.toFixed(0).padStart(3)} minClear ${r.minClear.toFixed(1).padStart(5)} tight ${(100 * r.tightMax).toFixed(2)}%`);
// Density sanity: the curtain must actually be dense (not trivially solvable by emptiness).
const story1 = rows.filter(r => r.mode === 'STORY' && r.band === 1), dream3 = rows.filter(r => r.mode === 'DREAM' && r.band === 3);
const mean = a => a.reduce((x, r) => x + r.avg, 0) / a.length;
console.log(`mean live: STORY b1 ${mean(story1).toFixed(0)}, DREAM b3 ${mean(dream3).toFixed(0)}; ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (mean(story1) < 60) failures.push(`STORY band 1 mean live ${mean(story1).toFixed(0)} < 60 (not dense)`);
if (mean(dream3) < 130) failures.push(`DREAM band 3 mean live ${mean(dream3).toFixed(0)} < 130 (not dense)`);
if (failures.length) { console.error(failures.slice(0, 40).join('\n')); console.error(`${failures.length} failure(s)`); process.exit(1); }
console.log('rc240-pattern-solvable-unit: OK');
