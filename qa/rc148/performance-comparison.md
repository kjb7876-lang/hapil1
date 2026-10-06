# RC148 Persona and six-boss rendering check

## Change

- In the balanced quality preset, a compact viewport uses a smaller internal canvas during the Dream Persona fight. Six living Cosmic bosses with at least 24 hostile projectiles use a stricter temporary canvas budget. The normal backing size returns when that load clears. Full and battery presets keep their existing rules.
- Cosmic boss death-sprite metadata is written only when its resolved phase sprite changes. The phase resolver, sprite choice, attack schedule, hit detection, and world coordinates are unchanged.

## Paired browser observations

Baseline: `c3c18acdea64fc8255d265fd3c66bae28a94ddb4`. Candidate: the commit containing this report. Both used Chromium 151, the same 390 × 844 portrait viewport, DPR 2, CPU throttling ×4, and seed `132148`. These are staged native battle states, not a natural campaign clear or physical-device results.

| Workload | Baseline | Candidate | Preserved gameplay |
| --- | ---: | ---: | --- |
| Persona, all nine sequential patterns: RAF p95 | 250.0 ms | 233.4 ms | Nine distinct patterns; native shot counts `10,6,8,12,12,4,6,8,10` on both |
| Persona, time until ninth pattern begins | 70.49 s | 67.56 s | Native warnings, release sequence, and projectile simulation used |
| Six Cosmic bosses, five dispatched patterns, peak 70 hostile projectiles: RAF p95 | 866.7 ms | 733.2 ms | Six bosses remain; same peak projectile count |
| Six Cosmic bosses, same stress: RAF p50 | 700.0 ms | 450.1 ms | Phase-death art still matches the resolved phase |

The six-boss fixture's game time barely advances during its 12-second capture because a Story gate holds the staged state. It measures a dense render frame, not sustained natural combat throughput. This scene remains too slow for smooth mobile play under the emulated CPU. Browser timing is noisy and these few paired runs do not establish a universal performance gain. A short PC Persona capture returned to its baseline p95 of about 66.7 ms with the final compact-viewport gate.

## Memory and cleanup

Four repeated Persona entry and exit cycles under the same seed, with forced GC after each, retained about 27.7–29.8 MB on baseline and 27.6–29.4 MB on the candidate. Each candidate cycle removed the Persona HUD overlay and SVG color filter on exit. The samples show no monotonic growth in this bounded test; they do not prove the absence of a longer-lived leak.

The browser suites also check native six-boss creation, phase sprite selection, zero JavaScript and HTTP errors, and the nine-pattern shot sequence. Exact-commit CI runs PC, portrait, and landscape layouts, plus the denser portrait and memory checks.
