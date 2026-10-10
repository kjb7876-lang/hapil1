# Resume: orientation test pin diagnosis

Baseline: `f58480d5c86b5224964f678b48f0bf299e49f6ec` on
`codex/rc152-image-combat`. The consumer checkout began at public `73a410d`
and was switched to the preserved candidate before these checks.

The separate RC152 portrait unit failed before its input/lifecycle assertions
completed: it required `combat-layout.js?v=15510`, while the actual index loads
`combat-layout.js?v=15603`. Commit `e971ee5` deliberately advanced this cache
key from15602 to15603 for the strict landscape map-coverage correction;
The CSS pin also remained at45403 after `f818ce8` deliberately advanced
`adaptive-battlefield.css` to15524 for the Korean-font/cut-in presentation
correction. Subsequent runtime extension manifests preserve this index. The exact loader
test passes37 checks including tampered-index/manifest rejection. This is a stale
test expectation, not evidence of a stale served file or a rotation regression.

Only those two exact test pins are updated. All22 existing orientation assertions,
including pause/resume/input/lifecycle, safe-area CSS and render/simulation guard
ordering, remain intact. The RC137 mandatory runtime step now runs this unit
on each of its six profiles/rounds; workflow edits trigger all three existing
exact-SHA gates. Production index, game code, original assets, preservation
manifests, browser sandbox policy and all browser assertions remain unchanged.

Consumer-local normal Chrome Stable smoke is blocked because the required
Chrome distribution is absent. Local units are VM/fixture evidence, not browser
captures, a natural Persona victory, or physical-device verification. Official
Drive fetch returned the EGO PNG reference, but local materialization returned
HTTP403; that download path is stopped, without retries or bypass. The new EGO
frame is not locally inspected or integrated. Major cloak overlap and visual
review therefore remain open, and main/Pages publication is held.
