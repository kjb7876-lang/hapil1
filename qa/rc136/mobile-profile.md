# RC136 native portrait paint profile

The focused fix clips the native portrait draw to the exact retained central crop plus its one-row sampling gutters. It avoids painting invisible rows. It keeps the existing backing resolution, camera, alternating one-pass cadence, cache/compositor, source art, HUD, and post-frame awakening mood filters. Native smoothing enabled/quality are retained across clip restoration. Simulation, damage, projectile generation and bitmap contact are byte-unchanged from `28f2d96176054c0e0a20b8157591acaf28520be8`.

## Diagnosis

The first Chromium CPU recording had 54,665 ms sampled duration. `portrait-split.store -> drawImage(mainCanvas, crop...)` had 13,128 ms inclusive (~24%). Canvas-copy timing includes deferred source raster/flush work; this is not an isolated memory-transfer or GPU-upload measurement. All canvas-source draws totaled 15,495 ms; GC was 395 ms (~0.7%), and measured layout reads were 755 ms (~1.4%). Native bitmap geometry replay is a secondary cost, not the dominant measured one; it remains unchanged.

Replacing clear + source-over with `copy` passed initial pixels but did not improve timing and was reverted. That diagnostic also overlapped a short pixel-test browser; it is excluded from the paired evidence. The retained clip trial reduced sampled `store` time to 9,956 ms, with the same native renderer and crop. Profiles are diagnostic, not the final statistical comparison.

## Repeated comparison

Four runs per build, serial, counterbalanced order B1/A1/A2/B2/B3/A3/A4/B4. A is exact clean 28f2d96; B was the final smoothing-preserving working-tree clip on checkpoint516a304. Runtime fingerprints were checked after all runs; the final checkpoint contains exactly the tested portrait JS (`41c9c2a4f1ef9d95dea8db16d35843eaf081b3c0e18e7c63a1e632b0aa8e0359`). B's loader already used the final cache query. The committed benchmark helper removes unused lifecycle scaffolding from the measured external helper; both keep identical combat setup and measurements. Measured helper SHA-256: `f58a463c2104600e4b1edf64de8fddf5fe7c3493def25f31cffb1aaeafe53daf`. An earlier four-pair clip trial was superseded when review found that the outer save/restore also needed to retain native smoothing; those earlier timing values are excluded here.

Each fresh Chromium151 context used 390×844, DPR2, CPU×4, random seed0x134. Dream unlock/native dist04 route entry are a controlled fixture, not natural campaign progress. Health, protection, attack readiness, projectile arrays/producers, damage, game clocks, and resolution are never edited. Initial native time was0.32, HP240, and the three actor IDs/HP/readiness values matched. Every run peaked at35 real projectiles, retained3 living bosses, and ended with HP98.8 and no JS/HTTP errors. Native ending times differ by at most one0.04-s simulation frame.

| Pair | RAF p95 A/B (ms) | Render p95 A/B (ms) | Longtask p95 A/B (ms) | Max RAF A/B (ms) |
|---|---:|---:|---:|---:|
|1|316.7 /283.2|230.7 /195.3|311 /256|583.2 /583.3|
|2|366.6 /300.0|248.1 /195.3|327 /270|583.3 /616.6|
|3|349.9 /333.3|251.6 /217.6|330 /306|583.3 /583.4|
|4|350.0 /300.0|258.5 /198.7|345 /279|583.3 /599.9|

Median of four per-run quantiles: RAF p50 241.65→224.95 ms (6.9% lower); RAF p95 349.95→300.00 ms (14.3% lower); render p95 249.85→197.00 ms (21.1% lower); longtask p95 328.5→274.5 ms (16.4% lower). Simulation p95 79.10→77.45 ms; no simulation improvement is claimed. Individual maximum stalls did not improve consistently. All per-run quantiles/counts, native starting/ending snapshots, errors and fingerprints are in `mobile-paired-summary.json`; raw local reports/screenshots are `/workspace/rc133-tools/rc136-paired-quality/`.

This supports a specific portrait render improvement. It does not establish broadly smooth mobile performance: RAF is still slow under CPU×4, and there is no physical-phone or hidden-mutual performance comparison.

## Pixel and compatibility checks

Real Chromium exact RGBA suite passes86 component cases against deployed main785a215: low/medium/high native smoothing settings, opaque/transparent changing cache content, off-crop shadows/blur reaching the retained band, odd/even backing dimensions, native backing resize, portrait/landscape reset, one native draw per frame, cropped allocation, all awakening mood combinations and caller state. Source inspection confirms no native self-canvas reads in the clipped pass; full-frame mood filters run after clip restoration and split composition. Native bitmap replay uses a separate scratch context.

Reproduce one native fixture with `CODEX_PRIMARY_RUNTIME_NODE_MODULES=<Playwright modules> HAPIL_SOURCE_ROOT=<checkout> HAPIL_QA_OUTPUT=<outside checkout> node tools/rc136-native-mobile-benchmark.cjs`; serialize browsers when making comparisons. Exact checkpoint CI is required after this local evidence. The superseded first clip checkpoint516a304 passed all six audit suites; final smoothing-preserving checkpoint needs its own exact run. Main/Pages publication is held for parent coordination; no assets are generated or staged here.
