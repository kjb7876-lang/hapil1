# RC201 separate review candidate

Base/public main: `3e5c63018e9e83131971d2e8fa73583224b4356f`.
Branch: `codex/rc201-revival-slayer-orthogonal`. No main update or Pages deployment.

## Controlled normal/reentry camera

The RC200 camera retained its largest framing envelope during one map/viewport epoch. Before image decode, that included fallback body estimates. A later same-map entry reset the cache and could frame the already decoded smaller body differently. RC201 keeps the expanded legal floor and only measured native paint in the persistent union; pending paint probes are remeasured even when image metadata keys do not change. Newly decoded real bodies may widen the view; movement, blink and removal still cannot zoom it back in. Real viewport changes and actual map entry still reset it.

`tests/rc201-revival-camera-unit.cjs` runs the real camera and final native `ii` wrapper with controlled same map, viewport and hero coordinates, delaying paint availability. On the unchanged base the normal/reentry x transform differs (`BEFORE-CAMERA-FAILURE.txt`). With the candidate, x/y/scale match in PC 1180×757, landscape 844×390 and 568×260, portrait 390×844. These are CPU fixtures, not actual browser captures or natural revival. The original expanded floor and input code remain unchanged.

## Two-owner orthogonal barrage

Only eligible narrow existing batches from `b09-boss` and `u203-boss` can use this route, at most six existing packets and once per owner per six seconds. Other shots retain the prior authored spread. Routes alternate rectilinear D/R shapes, begin at distinct perimeter corners/inner lanes, rotate on screen axes and progressively approach the center. All route vertices are inside the actual radius-inset expanded arena. Warning is at least 1.2 seconds, staggered by .13 seconds, using the same owner bitmap and a thin dashed next-leg cue. The actual projectile pipeline reports the warning visible and noncollidable until release.

No projectile is added; damage, bitmap path, original speed, expiry and return allowance are retained. Routes that cannot fit their existing lifetime are skipped. Travel consumes arc length independently of 15/60/144 FPS; a frame spike is capped at .1 seconds. Global/temporal/encounter pause freezes travel. Reflection, parry, egress, boundary contact and map change release route ownership to native policy. The final native wrapper retains the surrounding admission/contact/expiry reducers and calls native temporal resume/egress helpers. Route completion resumes native travel rather than deleting the projectile in the center.

`tests/rc201-orthogonal-barrage-unit.cjs` exercises real layout/arena/projectile visibility/contact functions and the extracted final native step/draw wrapper. Packets, canvas and lifecycle helper dependencies are fixtures. Actual encounters, readability, collision pixels and natural play remain unverified.

## Slayer attack image: blocked, originals preserved

Exact hero is `slayer`, 악몽 사냥꾼 · 검사. Art-only Luna Max generated three candidates and one final imagegen edit using the original RC81 right-facing attack sheet as reference. Actual PNG inspection found the candidate swords crossing internal cell boundaries and apparent sword length varying by frame. The last edit still failed. Applying it would reintroduce weapon clipping; neither generated sheet was installed. Original attack art and attack/damage behavior are unchanged. No other image generation was attempted after the final failed edit.

Local rejected files (preserved outside runtime):
- `/workspace/rc201-slayer-art/slayer-side-right-candidate-v3.png`: RGBA 2172×724; SHA256 `86dda851fb1a8ea8140a32b57b1a28e0ece5defe7b598afcc5da5a9e0a59c4c1`.
- `/workspace/rc201-slayer-art/slayer-side-right-final-edit.png`: RGBA 2172×724; SHA256 `7d0a0a9a55faa0618b7925572f7c26655b74bcb3b5ee9726d46ff89a6f35e278`.

Four 543×724 cells in final edit have alpha≥2% local bbox x/y/w/h: (35,258,508,363), (0,143,517,480), (5,262,538,361), (0,129,493,494). First/third internal boundary pairs have 48/47 and 29/28 active rows. Feet remain within about two pixels, but the fixed sword requirement is not met. No whole-sheet crop or body-damaging cut was substituted for a valid frame.

## Validation and publication blockers

All 37 regression/new test files passed at runtime commit `047d8a108ea65f1cfb2925914c844c5792a050e3`. See `REGRESSION.json`, `CAMERA.json`, `BARRAGE.json` and preservation proof. CPU/native/DOM/RGBA checks do not prove browser animation or a natural campaign. This environment has no installed browser; the prior browser/cache/filesystem restrictions were not changed and no installation or alternate runtime was attempted. There are no new browser screenshots or video for RC201. Prior public startup captures belong to 3e5c6301, not this candidate.

The separate public-base RC137 run is **failure**, not still in progress: run 38494601112, job 115627390715, ended 2026-10-14 01:21:14 UTC. `tests/rc163-ego-victory-ui.cjs:45` timed out at 30 seconds after Persona complete and EGO transformed/active, zone cult04, flowReady.reason legacy-map. This is a staged transition failure; natural-play cause is unconfirmed. It is not a browser launch permission failure. No additional execution was requested for that diagnosis. Evidence: https://github.com/kjb7876-lang/hapil1/actions/runs/38494601112/job/115627390715

The attack-image requirement and new real-browser review remain open. This combined candidate is not ready for main/Pages approval or deployment. StoryWorld, original assets and prior review artifacts have not been overwritten.
