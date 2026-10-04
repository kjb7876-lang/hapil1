# RC136 native portrait paint profile

The focused fix clips the native portrait draw to the exact retained central crop plus its one-row sampling gutters. It avoids painting invisible rows. It keeps the existing backing resolution, camera, alternating one-pass cadence, cache/compositor, source art, HUD, and post-frame awakening mood filters. Simulation, damage, projectile generation and bitmap contact are byte-unchanged from `28f2d96176054c0e0a20b8157591acaf28520be8`.

## Diagnosis

The first Chromium CPU recording had 54,665 ms sampled duration. `portrait-split.store -> drawImage(mainCanvas, crop...)` had 13,128 ms inclusive (~24%). Canvas-copy timing includes deferred source raster/flush work; this is not an isolated memory-transfer or GPU-upload measurement. All canvas-source draws totaled 15,495 ms; GC was 395 ms (~0.7%), and measured layout reads were 755 ms (~1.4%). Native bitmap geometry replay is a secondary cost, not the dominant measured one; it remains unchanged.

Replacing clear + source-over with `copy` passed initial pixels but did not improve timing and was reverted. That diagnostic also overlapped a short pixel-test browser; it is excluded from the paired evidence. The retained clip trial reduced sampled `store` time to 9,956 ms, with the same native renderer and crop. Profiles are diagnostic, not the final statistical comparison.

## Repeated comparison

Four runs per build, serial, counterbalanced order B1/A1/A2/B2/B3/A3/A4/B4. A is exact clean 28f2d96; B was the working-tree clip candidate on 28f2d96. Runtime fingerprints were checked after all runs; the final checkpoint contains exactly the tested portrait JS. B's HTML loader cache query is subsequently bumped; it does not change runtime JS. The committed benchmark helper removes unused lifecycle scaffolding from the measured external helper; both keep identical combat setup and measurements. Measured helper SHA-256: `f58a463c2104600e4b1edf64de8fddf5fe7c3493def25f31cffb1aaeafe53daf`.

Each fresh Chromium151 context used 390×844, DPR2, CPU×4, random seed0x134. Dream unlock/native dist04 route entry are a controlled fixture, not natural campaign progress. Health, protection, attack readiness, projectile arrays/producers, damage, game clocks, and resolution are never edited. Initial native time was0.32, HP240, and the three actor IDs/HP/readiness values matched. Every run peaked at35 real projectiles, retained3 living bosses, and ended with HP98.8 and no JS/HTTP errors. Native ending times differ by at most one0.04-s simulation frame.

| Pair | RAF p95 A/B (ms) | Render p95 A/B (ms) | Longtask p95 A/B (ms) | Max RAF A/B (ms) |
|---|---:|---:|---:|---:|
|1|366.7 /300.0|267.9 /196.8|339 /280|533.3 /550.0|
|2|366.6 /300.0|262.1 /209.4|340 /279|566.6 /616.7|
|3|366.8 /300.0|273.5 /207.0|349 /279|599.9 /599.9|
|4|350.1 /283.4|253.3 /181.7|331 /269|600.0 /516.7|

Median of four per-run quantiles: RAF p50 249.95→216.70 ms (13.3% lower); RAF p95 366.65→300.00 ms (18.2% lower); render p95 265.00→201.90 ms (23.8% lower); longtask p95 339.5→279.0 ms (17.8% lower). Simulation p95 76.35→79.40 ms; no simulation improvement is claimed. Individual maximum stalls did not improve consistently. Full per-run quantiles/counts and fingerprints are in `mobile-paired-summary.json`; raw local reports/screenshots are `/workspace/rc133-tools/rc136-paired/`.

This supports a specific portrait render improvement. It does not establish broadly smooth mobile performance: RAF is still slow under CPU×4, and there is no physical-phone or hidden-mutual performance comparison.

## Pixel and compatibility checks

Real Chromium exact RGBA suite passes50 component cases against deployed main785a215: opaque/transparent changing cache content, off-crop shadows/blur reaching the retained band, odd/even backing dimensions, native backing resize, portrait/landscape reset, one native draw per frame, cropped allocation, all awakening mood combinations and caller state. Source inspection confirms no native self-canvas reads in the clipped pass; full-frame mood filters run after clip restoration and split composition. Native bitmap replay uses a separate scratch context.

Reproduce one native fixture with `CODEX_PRIMARY_RUNTIME_NODE_MODULES=<Playwright modules> HAPIL_SOURCE_ROOT=<checkout> HAPIL_QA_OUTPUT=<outside checkout> node tools/rc136-native-mobile-benchmark.cjs`; serialize browsers when making comparisons. Exact checkpoint CI is required after this local evidence. Main/Pages publication is held for parent coordination; no assets are generated or staged here.
