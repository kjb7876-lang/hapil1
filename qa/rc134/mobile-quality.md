# RC134 mobile rendering candidate

This branch reduces the work and storage used by existing presentation while retaining the deployed resolution, source art, camera zoom, telegraphs, collision and simulation. It is not yet a completed deployment or a physical-phone performance result.

The hidden mutual-awakening compositor now filters the assembled frame once and multiplies the right half red. The prior code filtered a self-canvas snapshot twice. Each operation preserves the caller's canvas state, including an inherited filter. Portrait camera caches store only the displayed central rectangle and one sampling row on each side. These rows preserve the stretched lower-half edge pixels at odd backing heights; omitting them caused measurable pixel differences and was rejected.

`rc134-render-equivalence-browser.cjs` compares actual Chromium output with the immutable deployed 785 baseline. All 40 component fixtures passed: all four moods, clash text, odd/even sizes, caller state restoration, camera alternation, resize and orientation reset. Every RGBA channel matched. The native camera draw count remains one per frame. These are isolated rendering fixtures, not natural combat tests.

An initial CPU-throttle-4 component experiment measured mutual composition p95 at 1140×641 as 43 ms before and 30.5 ms after. The exact candidate will be remeasured with the final canvas-state correction and full native scenarios. Cache storage at that size drops from 5,845,920 to 2,936,640 RGBA pixel-area bytes. This is an allocation estimate for the pair of cached images, not total browser memory. Copy timing did not show a consistent CPU benefit.

Pending: repeatable native dense-projectile, multiple-midboss and mutual-awakening comparisons; lifecycle/touch/audio/save checks; exact-commit CI; fresh main coordination and public verification. Mobile profiles use Chromium emulation, not physical hardware. TTS86, all assets/audio/data and bitmap-contact code remain unchanged. The separate latest Persona movement and new-two-PNG instruction will be implemented independently; its Library transfer has not yet produced readable bytes.
