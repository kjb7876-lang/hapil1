# RC203 rigid-sword investigation and actual-emitter barrage correction

Preserved bases: RC201 `25c0e5c625b265205662cd115a4a43522cab60e9`, RC202 `5aabc0b6b125005fa4b827c844a8eda1874466dc`. New branch `codex/rc203-rigid-sword-barrage`. No main/Pages update. Original character images, prior generated candidates and prior reviews are untouched.

## Actual native emitter exposed a real omission

RC201 used only synthetic ~9.9-unit/s, 28-second packets to validate its new routes. That did not establish that production packets could arm. The new CPU test invokes the **actual native boss rows and native fallback tick→family selection→spawnBossCombatPattern→spawnSnipeSwordWave→pushThemeProjectile**, the actual director/phase/cadence/hardening/persistence/expiry functions, and the extracted actual RC153 post-emission wrapper. The original producer emits **three packets**, damage18, radius .64 times the real director size factor, nominal life **6.5 seconds**. Across staged b09 phases0–3 and u203 phases1–2, resulting speeds are **5.1205–5.8016**, not9.9. The native persistence metadata is also retained (nominal16.5, hard13=18.5, hard14=22.5 in the time10 fixture).

`BEFORE-NATIVE-BARRAGE.json` runs this test fixture with the unchanged RC201 route module: **0/3 packets armed in each of the six boss/phase fixtures**. The eight-leg route cannot fit the original nominal lifetime. Thus RC201's earlier synthetic pass was insufficient and did not prove this production path worked.

RC203 keeps the long route when its existing budget fits. Otherwise it selects a shorter four/five-leg D/R center approach. The initial perimeter point and radius-inset floor checks are unchanged. Speeds, original nominal/hard deadlines, packet count, damage, bitmap, reflection policy and return allowance are not extended or boosted. The at-least1.2s warning and .13s stagger remain. If even the compact route cannot fit the existing budget with .5s reserve, it still skips the route. Other bosses remain excluded.

All18 actual emitted packets in the staged six-phase fixtures now arm and reach within1.8world units of arena center **3.2–3.6 seconds after creation**, before nominal expiry at6.5 seconds. Their initial distance from center exceeds6world units; every simulated route point remains inside the actual radius-inset arena. The actual native expiry helper returns false during that approach. The unchanged native expiry policy is terminal-based, so nominal expiry itself does not normally kill a travelling boss packet; RC203 nevertheless fits within it rather than depending on an extension. This does not simulate host collisions, which can legitimately remove a packet sooner.

Both owners also exercise the alternate R route on a second actual generated volley, and actual emitted packets give the same positions after equal travel time at15/60/144FPS. No synthetic speed or lifetime replaces these producer values.

## Actual reflection handoff defect fixed

The test extracts and invokes the **actual native Dream terrain reflect function**, then releases orthogonal ownership and calls the real RC153 direction lock. With the previous handoff, an unset scatter stamp allowed the old pre-route angle to overwrite the reflected direction. `BEFORE-REFLECTION-FAILURE.txt` captures that failure. RC203 records the current velocity angle/stamp when relinquishing ownership so the subsequent native lock retains the reflection vector and its existing first-reflection1.12speed boost. No reflection allowance/policy or damage is changed. Reflection intersection is forced using fixture coordinates and a fixture terrain polygon; this is an integration CPU test, not a naturally encountered reflection.

## CPU validation scope

All38 test files passed at runtime commit `11783d04abd2d9a1eab239a8ac62984f0e048ef3`. `NATIVE-BARRAGE.json`, `RC201-BARRAGE.json`, `RC201-CAMERA.json` and `REGRESSION.json` record results. The new test uses actual native source functions and constants for movement-relevant producer parameters and persistence. Bitmap/torso lookup, telemetry, atomic-cast/laser-warning service, cap and HP/protection admission dependencies are fixtures. Optional grammar/adaptive/scheduler controllers are absent to exercise the native fallback branch; this does **not** establish that every production scheduling priority selects it in natural play. Boss phases are staged via currentPhase, not earned progression. No browser, collision-pixel, GPU, real-device or natural-campaign claim is made. The RC201 camera runtime is unchanged.

## Fixed sword layer investigation — remains blocked

Exact hero is `slayer`, 악몽 사냥꾼 · 검사. Existing side attack source:
`assets/hero-authored-v314rc81/slayer-side-right/sprite-sheet-alpha.png` (2560×640 RGBA), SHA256 `f98f4fceadb1d4cf91e243302335694f453ee840db651e9c90ea35ac5fb091f2`; the paired left asset is in `slayer-side-left/`. The native RC81 renderer selects those paths only for the exact slayer ID/attack/side, four640px cells, pivot(320,616). Root viewed the actual right sheet, prior generated frames, new isolated weapon, older `assets/hero-authored-v314rc49/slayer-down-cleave.png` and `assets/vfx/heroes/slayer-q.webp`. The older cleave is also a flattened character+weapon sheet; Q is a slash effect, not an isolated matching sword. Filename/RC81 directory investigation found no usable separate RC81 Slayer sword/body layers.

A fixed draw transform `translate(hand) → rotate(angle) → fixedScale → translate(-grip)` would preserve a single weapon bitmap's length/thickness through preparation, swing and recovery. It would avoid per-frame sword scaling. **No renderer was integrated or visually validated**, because valid layer separation remains unresolved. The existing sprite already contains a weapon: drawing another weapon over it leaves a duplicate, while masking away the old grip/guard risks altering the overlapping gauntlet/contact. The hidden pixels beneath an occluding weapon cannot be recovered as original pixels from that flattened frame alone. A carefully authored sword-free body/hand foreground and matching attachment masks are needed; this is not established by a rectangular crop or a rotation matrix.

One official image_gen edit was attempted solely to obtain **one transparent weapon layer**, not another animation strip. Original RC81 right sheet was the only reference; the clipped base-source was not used. The result resembles the black/red greatsword but is a resynthesized approximation with different guard/pommel/blade details and faint alpha specks. It does not preserve original sword pixels, so it is **rejected**. No additional frame generation was attempted.

- Local candidate: `/workspace/rc203-slayer-rig/slayer-sword-isolated-candidate.png`.
- Preserved QA copy: `rejected-isolated-sword.png`, RGBA2172×724,704927bytes.
- SHA256 `94f2063f8952423fb6e4ed090f1011b1cd589a85295f36a757bfb6a24e0c6909`.
- Alpha byte≥6 (~2%) bbox [137,202,2036,539], maxima exclusive. Estimated reconstructed grip pivot≈(410,365); this is a visual estimate, not an accepted source attachment point.
- Exact prompt and art assessment: `sword-layer-prompt.txt`, `sword-asset-assessment.json`.

No body/hand reconstruction or new melee/dash damage was added. The requested accepted sword animation remains **incomplete**. The rejection is an asset/attachment quality limitation, not a generation permission refusal. The barrage correction can be reviewed independently; this combined candidate is not ready for publication while image and real-browser review remain open.
