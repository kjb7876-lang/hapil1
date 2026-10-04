# RC134 mobile rendering candidate

This branch reduces the work and storage used by existing presentation while retaining the deployed resolution, source art, camera zoom, telegraphs, collision and simulation. It is not yet a completed deployment or a physical-phone performance result.

The hidden mutual-awakening compositor now filters the assembled frame once and multiplies the right half red. The prior code filtered a self-canvas snapshot twice. Each operation preserves the caller's canvas state, including an inherited filter. Portrait camera caches store only the displayed central rectangle and one sampling row on each side. These rows preserve the stretched lower-half edge pixels at odd backing heights; omitting them caused measurable pixel differences and was rejected.

`rc134-render-equivalence-browser.cjs` compares actual Chromium output with the immutable deployed 785 baseline. All 40 component fixtures passed: all four moods, clash text, odd/even sizes, caller state restoration, camera alternation, resize and orientation reset. Every RGBA channel matched. The native camera draw count remains one per frame. These are isolated rendering fixtures, not natural combat tests.

An initial CPU-throttle-4 component experiment measured mutual composition p95 at 1140×641 as 43 ms before and 30.5 ms after. The exact candidate will be remeasured with the final canvas-state correction and full native scenarios. Cache storage at that size drops from 5,845,920 to 2,936,640 RGBA pixel-area bytes. This is an allocation estimate for the pair of cached images, not total browser memory. Copy timing did not show a consistent CPU benefit.

## Bounded native profile: exact 785 versus 59f5381

`tools/rc134-mobile-profile.cjs` records a read-only exact-785 and candidate comparison. The browser served the local worktree through localhost, used Chromium 151.0.7922.173, DevTools CPU throttling 4, DPR 2 and seed `0x785133`. The 785 source was clean at `785a2158983412384909cf701a6d8198581ed5f3`; candidate runtime was tested at `59f5381c046cb4b2416a97c704f34770e887602d` (same measured runtime edits as bbdc1a6; the later commit only fixed test literals).

The portrait sample used three paired 390×844 runs. The existing QA route staged the Dream hidden boss; manual controls kept player auto-attacks from killing it before its volley, the hidden boss produced its own native projectiles, both awakening timers were staged active, and player-only invulnerability held the bounded render sample. Every paired sample had one live boss and 4–6 live hostile projectiles (peak 6). This is a hidden-mutual render fixture, not a dense-fight, multi-boss or full-campaign test.

| Portrait metric | 785 median | 59f median | Scope |
|---|---:|---:|---|
| Top-level assembled render p95 | 130.0 ms | 105.2 ms | Three paired runs; 19.1% lower in this fixture |
| Applied opposition compose p95 | 39.6 ms | 12.1 ms | Exact applied-call timing in repeats 2–3; repeat 1 timing includes no-op recursive calls |
| RAF interval p95 | 200 ms | 200 ms | No sustained-FPS improvement claim |
| Long-task p95 | 194 ms | 181 ms | Three paired runs |
| Full main-canvas to cache copy | 51.5 ms/call | 52.1 ms/call | Median synchronous wrapper time; no CPU-copy win measured |
| Two-cache RGBA allocation | 7,003,152 bytes | 3,521,528 bytes | Backing-pixel area estimate at 1247×702; 49.7% lower |

The candidate makes one self-canvas filter snapshot per assembled frame, while 785 made two. The candidate halves the portrait cache-copy destination area and backing-pixel estimate, while synchronous full-canvas copy time remains effectively unchanged. Control-stage time stayed below 1 ms p95; simulation before render was about 27–33 ms p95. The main cost in these CPU4 runs remains rendering and composition.

One landscape pair at 844×390 CSS showed top-level render p95 of 69.3→53.7 ms, applied compose p95 of 43.8→31.0 ms, RAF interval p95 of 116.7→100.1 ms and long-task p95 of 107→92 ms. Landscape did not use the portrait recursive camera pass. Landscape repeats 2–3 are still pending.

An initial default-mode warm attempt reached timeout because full-auto play removed the staged hidden boss before its first native volley. The saved end state showed no story, reading, modal, encounter or party lock; the page and player remained active. The screenshot and timeout JSON are in the companion mobile-quality evidence directory. Setting controls to manual fixed the fixture; subsequent paired runs reached cycle 2 and observed live projectiles without editing boss HP or fabricating projectiles.

These are local headless Chromium emulation results with CPU throttling and instrumentation, not physical-phone, sustained-FPS, thermal or production-network claims. Image resource and decode-promise counters are reported in the JSON; summed overlapping `HTMLImageElement.decode()` promise time is latency, not CPU decode cost.

Pending: two more landscape pairs, native dense hostile-projectile and multiple-live-boss profiles, and focused lifecycle/touch/audio/save/hidden-filter checks. TTS86, source art, audio/data bytes and bitmap-contact code remain unchanged. Persona’s separate movement/finale work is outside this profile.
