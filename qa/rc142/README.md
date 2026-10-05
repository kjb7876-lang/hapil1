# RC142 gameplay and performance audit

The candidate runtime tested here is `969b57748ca29cfbd827fa65bfd09e698158f376`. It retains the nine hidden-Persona attack patterns and adds stable bitmap-contact shape reuse plus browser-compositor color grading for the live boss-only and player-only views.

## Art and StoryWorld handoff

`gameplay-art-map.json` records the four cult leader forms, hidden Persona identity, nine normal/awakened skill paths, movement bounds, and exact hashes for the collision cache and HUD-isolated compositor. Its `runtimeSourceSha256` object is the StoryWorld synchronization contract. The uploaded Library concept images remained inaccessible and were not substituted; checked-in game art was decoded by the browser tests.

## Attack and render coverage

`persona-volley-audit.json` covers all nine attack patterns in normal and awakened modes. The exact candidate run passed 18 pattern/mode pairs: every shot reached a native terminal reason, and every pattern/mode pair had an evasion route with fewer measured contacts than standing. This is a staged fixture, not a natural hidden-finale victory.

`persona-render-audit.json` records 1,632 image/effect checks on PC, portrait, and landscape. The 86-check compositor equivalence test passed the exact detached-canvas path. A live-canvas probe also verified boss red, player grayscale, isolated HUD drawing, and filter/overlay cleanup after mode exit, player-lethal handling, and terminal boss defeat.

## Matched nine-pattern performance

`performance-comparison.json` compares exact candidate runtime sources `969b5774` with fresh public main `076c347b`, using the same nine sequential volleys, 390×844 viewport, DPR 2, Chromium 151, and CPU throttle 1×. A QA-only fixture keeps the boss awakened for all nine volleys on both revisions. The baseline p95 RAF intervals were 66.6–66.7ms in three repeats; the candidate was 50.0ms, 50.1ms, and 66.7ms. The candidate median was lower, with one tie. The small sample and coarse browser intervals do not establish a general mobile-performance pass; 50ms is still far above the 16.7ms 60fps budget.

The native projectile emitter recorded 26 baseline and 76 candidate projectile admissions across the same nine patterns. This is a measured 2.92× increase, with all nine attacks retained. In a wrapper-instrumented run, whole-stage self-blits fell from 464 to zero, including 178 grayscale self-blits on baseline. The candidate shifts boss-only grading to the browser compositor. Sprite-image `drawImage` calls increased from 3,177 to 27,729 as the workload emitted more projectiles; this is not evidence that all rendering work fell. Wrapper timing adds overhead, so call durations are directional same-browser evidence. Bitmap silhouette plans reused 4,330–17,355 times across candidate repeats, with 61–84 shape-cache misses; every image decoded and no contact plan was missing.

One matched nine-pattern check at CPU throttle 4× measured p95 intervals of 250ms on baseline and 216.7ms on candidate, with maxima around 467ms. The candidate remains directionally faster in this single pair, but both are far from smooth mobile frame pacing: every baseline sample and 411 of 451 candidate samples exceeded 100ms. This is a browser emulator check, not a phone result.

This report does not use the older `9463d5` result to attribute barrage cost. Movement is covered separately by `tests/rc142-movement-space-browser.cjs` across 55 maps, two modes, four arena edges, and three browser layouts. No physical phone was tested.

## Remaining validation limits

The hidden finale has not been naturally completed in the campaign; the feature tests use staged encounter fixtures. The six uploaded Library images could not be downloaded in this environment, so their pixels were not inspected. These checks do not prove the absence of every bug.
