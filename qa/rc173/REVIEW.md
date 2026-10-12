# RC173 code-only candidate review

Runtime implementation commit: `f223ce6043c8cdd0f8220d5162001456e1953578`.
Preserved RC171 candidate: `51ccd2bdca707b6a1474431b8418db7739f7f109`.
Public main remains `2c9b8c9adbaefbe23873ef5064b1dca4a7eebbbc`; no merge or deployment.

## Reservation analysis

The already completed RC172 browser run 38270040039 used a native Continue of an EGO save originally obtained with QA777 and assisted victory, a staged exit position, and real F/D/A keys. It did not inject damage, projectiles, awakening, or game time. This is neither natural progression nor physical-device evidence.

| Existing observed interval | Unique reservations | Basic A cohort images | Other Q/W/E/R chain images | Internal lexical echo |
|---|---:|---:|---:|---:|
| D released, A held: 1.28 world seconds | 341 | 290 | 47 | 4 |
| Late A: 1.64 world seconds | 248 | 211 | 35 | 2 |

Every observed same-time basic-A cohort has 3/4 repeats per target before ordinary awakening and 5/6 repeats per target during it. This matches the native attack12 and awakening8 profiles, including Hwando's fourth-attack bonus. The existing 3.5 attack-speed multiplier and mastery7 give a nominal 0.081257-second basic cooldown. No reservation cap or hit/target/reward deletion was added.

These are reservations and effect creations, not accepted damage hits. The existing browser capture lacks a native cast ID/call path and a full accepted-hit journal. That prevents a complete proof excluding other duplicate paths. New observation-only hooks are prepared at native basic-cast planning/end, internal echo creation, immutable combat-journal publication, and actual decoded projectile drawImage. They are syntax checked but have not been executed in a browser.

The late interval was incorrectly named `A-after-native-expiry`: ordinary awakening was still ON. Samong remained OFF throughout that run. RC88 grantShot reported disabled in DREAM; its ordinary STORY/HELL extra-shot contract is unchanged. No newly created hostile projectile had its recorded origin within 0.5 world units of the player in this capture. Echoes were owned by Hwando, targeted enemies, and originated at the player or the previously hit enemy; their contact delays were 0.30/0.23 seconds. They have no physical vx/vy, so those delays are not reported as physical bullet speeds.

## Code changes and validation

- `assets/rc155/ego-art.js`: accept an explicitly tagged native hero projectile delivery as EGO-owned even when it lacks heroSkillVfx; exclude party and collaboration deliveries. No persistent source object mutation.
- `assets/index-v31526.js`: route projectile-shaped EGO deliveries through the same temporary owned-art selection as skill effects. This covers the projectile renderer used by A and internal echoes. Damage, power, target, timing and reservation generation are unchanged.
- `assets/rc133/inner-final.js`: shift the full focus/needle fan into the permitted lane before adding angular offsets; individual endpoint clamps no longer collapse fan members.
- `index.html`: fresh cache keys for changed runtime modules, including the earlier RC171 defense/feedback changes.
- Authorization extension70 pins the exact four runtime output files. Historical preservation chain remains enforced.

Local checks: original/derived pixel and projectile-routing unit passed (501427 assertions), 112 actual inner tick/scatter fixture volleys passed across two mirrored lanes and all four boss-red/player-Samong combinations. Final circular angular span is 0.96 rad for every tested volley. The extracted native bounce reducer accepts three wall contacts, preserves speed/damage/life, rejects a fourth, and the Persona terminal policy remains active at the third contact. Browser timing and collision outcomes are not established by these fixtures. Feedback, 2.38%-awakening, general scatter, handoff and preservation checks also passed.

## Image limits and remaining blockers

The original sheets and approved 1254x1254 PNG are byte-preserved. The approved walk3 PNG remains the only replaced body frame. The new Luna-generated horizontal stabbing image is a separate, unapproved pose candidate and is not installed.

Raw transparent PNG RGB was initially misread as an opaque gray rectangle. An explicit alpha-composited review corrected that: large exterior matte is mostly transparent. Walk2 and attack2/3 still have actual cloak-neighbor remnants, missing dark leg/boot pixels, and edge clipping. Ownership removal totals include matte and foreign pixels and must not be treated as counts of lost body pixels. No new crop reduction or guessed body mask was applied in RC173.

Old side-frame alpha>=2 bounds, in their cropped canvases: walk2 `[0,7,222,304]`, attack2 `[22,5,269,333]`, attack3 `[0,5,256,334]`. Approved walk3 `[24,24,764,977]` has complete margins and supporting-foot source pivot `[384,1120]`, with left-facing source mirrored for the screen-right direction. The optional body-pixel exporter remains in the unit test for reproduction.

Still required before deployment: exact side-body separation/restoration, original outer skill-detail review, actual decoded-render and per-cast accepted-hit verification, real hit versus evade/parry scenes, final camera/mobile/transition screenshots/video and natural progression/retention checks. Browser execution was not restarted after the connection-loss instruction. No 403 retry or alternate-environment workaround was used.
