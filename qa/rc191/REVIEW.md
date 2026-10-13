# RC191 restore 합일 ranged danmaku

User correction: 합일 stays a ranged bullet-pattern game. Melee motion/attack refinement belongs only to StoryWorld. No StoryWorld files edited here.

Preserved RC190 candidate e369825c19d2b7a3eddb54eeb39b6bf7900aa326 on its existing remote branch. Selective removal covers all RC190 changes: four skeleton and l301-boss close cone plans, their range/start gates and direct weapon damage/status callbacks, fixed-target rune alternation for three mages, plan lifecycle/render/epoch hooks and the new runtime module. Removed RC190-specific runnable tests because that behavior is no longer active; historical QA evidence remains on the preserved candidate/history. This candidate does not retain the mage fixed-circle variant: it departed from the requested original ranged flow.

Active native bundle and RC138 arena are byte-identical to corrected pre-RC190 b9967485d1a9564cd3a9aeffb86a858275dcb708. HTML matches that candidate except cache keys for restored files. Actual loaded outgoing adapter remains combat-v31412/outgoing-native.js, also byte-identical to RC189, retaining positive-applied-damage hit cue gating. Native release sound remains after projectile admission, suppressed on cap refusal/dead source/player; accepted-hit feedback remains separate.

Original ranged profile (range>=40, projectile enabled, lunge0, body-contact ban), pattern dispatch, damage/cooldown/recovery/start admission and committed projectile handling are restored exactly. No selective guess at a melee subbranch is left. Prior story/ending/storage/EGO/resonance/black-hole/straight laser/scatter-reflection and source imagery/audio are unchanged. Full protected-tree preservation verifies the exact delta; direct regressions verify active HTML paths, all8 formerly changed owner IDs across4 distances, budgets and body ban.

CPU/native/DOM/original-pixel tests only. Browser/device/audio playback evidence remains unavailable; no install/permission/alternate-environment retries. Public main/Pages deployment is not authorized for this candidate and is not performed.
