# RC142 gameplay and performance audit

The original main-versus-candidate comparison below uses runtime `969b57748ca29cfbd827fa65bfd09e698158f376`. A follow-up at runtime `a5a8aa4e9672e282b07470b11520c2d9bcd193db` specializes boss-projectile drawing to avoid allocating a Canvas proxy on every draw. The exact measurement harness is `c2df2cc04a9b780d47df549a22a27507e76768dd`.

## Art and StoryWorld handoff

`gameplay-art-map.json` records the four cult leader forms, hidden Persona identity, nine normal/awakened skill paths, movement bounds, and exact hashes for the final projectile renderer, collision cache, and HUD-isolated compositor. Its `runtimeSourceSha256` object is the StoryWorld synchronization contract. `runtimeRevision` points to the last runtime-changing commit (`a5a8aa4`); later candidate commits contain tests and reports. The checked-in art paths and source hashes were verified by the browser tests.

## Attack and render coverage

`persona-volley-audit.json` covers all nine attack patterns in normal and awakened modes. The exact candidate run passed 18 pattern/mode pairs: every shot reached a native terminal reason, and every pattern/mode pair had an evasion route with fewer measured contacts than standing. This is a staged fixture, not a natural hidden-finale victory.

`persona-render-audit.json` records 1,632 image/effect checks on PC, portrait, and landscape. The 86-check compositor equivalence test passed the exact detached-canvas path. A live-canvas probe also verified boss red, player grayscale, isolated HUD drawing, and filter/overlay cleanup after mode exit, player-lethal handling, and terminal boss defeat.

## Matched nine-pattern performance

`performance-comparison.json` compares exact candidate runtime sources `969b5774` with fresh public main `076c347b`, using the same nine sequential volleys, 390×844 viewport, DPR 2, Chromium 151, and CPU throttle 1×. A QA-only fixture keeps the boss awakened for all nine volleys on both revisions. The baseline p95 RAF intervals were 66.6–66.7ms in three repeats; the candidate was 50.0ms, 50.1ms, and 66.7ms. The candidate median was lower, with one tie. The small sample and coarse browser intervals do not establish a general mobile-performance pass; 50ms is still far above the 16.7ms 60fps budget.

The native projectile emitter recorded 26 baseline and 76 candidate projectile admissions across the same nine patterns. This is a measured 2.92× increase, with all nine attacks retained. In a wrapper-instrumented run, whole-stage self-blits fell from 464 to zero, including 178 grayscale self-blits on baseline. The candidate shifts boss-only grading to the browser compositor. Sprite-image `drawImage` calls increased from 3,177 to 27,729 as the workload emitted more projectiles; this is not evidence that all rendering work fell. Wrapper timing adds overhead, so call durations are directional same-browser evidence. Bitmap silhouette plans reused 4,330–17,355 times across candidate repeats, with 61–84 shape-cache misses; every image decoded and no contact plan was missing.

At CPU throttle 4×, two matched nine-pattern repeats measured baseline p95 intervals of 250/250ms and candidate intervals of 266.6/283.3ms. The candidate had lower median frame intervals, but worse p95 tails in both repeats; both versions had intervals up to 467–667ms. Together with the CPU×1 results, this shows the compositor reduced whole-canvas work but did not make this projectile-heavy workload mobile-smooth. It is a browser emulator check, not a phone result.

## Follow-up projectile renderer comparison

`performance-comparison.json` includes an ablation of the direct `drawImage` wrapper against the previous proxy route, both on the same follow-up runtime and with identical 76-shot sequences. Three CPU 1× repeats show rounded median p50 and p95 intervals unchanged at 33.4/50.1ms. Two CPU 4× repeats show median p50 183.3→174.9ms and p95 258.35→241.75ms; median maximum interval is effectively unchanged at 516.7→516.6ms. Individual rows, frame counts, and exact shot arrays are in the JSON report. The draw-path probe recorded two `drawImage` calls in both implementations with identical destination arguments and visual bounds.

The direct wrapper result is modest and limited to CPU 4× emulation. A fresh CPU 1× DevTools profile still ranks native `drawImage` highest (3.26s of 12.89s sampled, 25.3%); it does not distinguish map/background raster work from projectile sprites. CPU 4× p95 remains about 14.5 times the 16.7ms 60fps budget. This is not a 60fps pass or physical-device result.

This report does not use the older `9463d5` result to attribute barrage cost. Movement is covered separately by `tests/rc142-movement-space-browser.cjs` across 55 maps, two modes, four arena edges, and three browser layouts. No physical phone was tested.

## Remaining validation limits

The hidden finale has not been naturally completed in the campaign; the feature tests use staged encounter fixtures. The six uploaded Library images could not be downloaded in this environment, so their pixels were not inspected. These checks do not prove the absence of every bug.
