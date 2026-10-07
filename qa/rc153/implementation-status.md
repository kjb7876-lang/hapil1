# RC153 remaining main-game combat work

RC152 image correction commit 3e45b69e3e30b6363f0c8cc53d18bdae76491ced remains an ancestor. Its frozen extension14 is preserved. Extension15 records only the new exact runtime changes.

## Implemented behavior

Native hostile boss birth batches with two or more travelling shots in an angular span at most .34 radians, from origins within 1.25 world units, become a .96-radian fan. One shot retains the aimed center while the others scatter; count, source identity, sprites, damage, speed, warning/admission/release clocks and collision ownership remain native. Persona finalizes its entire admitted volley before returning from its native tick, so warning-stage conversion is also exercised without requiring a render pass. Converted batches disable return/orbit/retarget/homing and retain their individual angle before native movement. Complete native emitter returns, alternative queue ingress, signature movement and render preflight share this policy. One state/queue/time revision is inspected once, avoiding a full queue reconstruction for every shot step. Single shots, broad formations/lanes, laser and persistent hazards, bombs/pollution, friendly/reflected/removed packets keep their native paths.

All living hostile registered bosses, midbosses and ranked special owners in native combat maps use world across x−y=6..12 and depth x+y=35..41, inside the radius-aware native floor. First enrollment assigns separate depth rows for two/three simultaneous bosses. Atomic movement, direct guard setters, stationary anchors and checked far-warp candidates use the same physical destination. Persona retains its point-inversion ownership and explicit faction swap.

The camera fits conservative whole body/weapon extents (3 nominal sizes wide, 2.4 above and .6 below the foot), using the actual native actor/phase/clone nominal size, uniform scale and viewport/HUD clearance. Portrait's two existing views each fit their full subject. Render fitting does not alter source sprites, hitboxes or nominal sizes. Wound compositing first paints the native body, then applies its bounded colour overlay with source-atop so its original alpha silhouette survives fractional-position resampling; death onset has the same protection, while later dissolve phases retain their masks.

Red Persona awakening impact remains an exact 2.38% maximum-HP packet through the existing guaranteed native damage path. Ordinary attacks retain their separate seeded 66% time-defense roll; awakening packets bypass that roll. No percentage or RNG logic was changed.

## Verification scope

Native owner inventory covers all 71 registered rows: 70 hostile combat owners and the native ep1a07 rest row; the additional kair-great-03 narrative ally is separately excluded with its native protection flags. Per-owner native narrow constructor, projectile flight/retarget, physical position and viewport calculations are exercised. Available authored danmaku plans are recorded per owner. Persona's nine native skills have separate warning/release/flight/measured-contact/damage/evasion scenarios. Trusted browser key/Space inputs cover the centerline in manual/semi/full modes and Persona normal/swapped ownership. The existing input matrix covers trusted keyboard, touch and rotation. These are staged fixtures, not natural campaign completion or physical-phone evidence.

Required final gates: clean exact-commit unit/browser matrices, full RC128 candidate preservation/regression, canonical narration CI and RC137 matrix CI, fresh-main ancestry, non-forced publication, public exact file hashes and browser tests, and 3–5 final public-build captures saved to Library. Until those gates complete this document does not declare the task deployed or entirely complete.
