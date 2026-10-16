# RC223 voice and camera candidate

## Publication boundary

Public version: `199402a0ece0747d2d354e8881e4a77910fb2423`, Pages success at **2026-10-16 09:19:12 UTC**, [deployment evidence](https://github.com/kjb7876-lang/hapil1/actions/runs/38878946328), [game](https://kjb7876-lang.github.io/hapil1/). RC223 is based on that exact version in a separate branch, `codex/rc223-voice-coop`. Publishing RC223 requires a new approval after its actual results are available. Candidate CI has no deployment job.

## Voice changes

- Preserve existing canonical text, the 279 generated recording files, the two original WAV recordings, their manifests and the immutable RC49 implementation. No new TTS request is made.
- Correct the original media fallback's error retry position and provide an optional mutable-volume original player. The original host/solo reader uses it to apply actual live gain/media volume updates without restarting speech.
- Guests follow one current host cue using the existing V1 player. A first snapshot offers manual playback; it does not replay earlier dialog. Later fresh cues may play after a trusted gesture. Periodic snapshots do not restart a cue, user pause is respected, and epoch changes/leave cancel old work.
- Mirror canonical original opening/root speech, ordinary available narration, shared `death:verse` and `ending:title` surfaces. Individual journal pages and host progression callbacks are not transmitted. Existing pending recordings remain unavailable and are not counted as successful playback.
- Use native browser audio, the existing 500ms ready delay, cancellation generations, real ended events and original tail rules. Do not synthesize ended events, accelerate audio or weaken playback assertions.

## Camera request

The native **설정 → 전장 시야 → 전장 시야 범위** slider adjusts both visible world axes together from1× to2× in0.05 increments. PC defaults to1× and actual mobile devices to2×. `hapil.rc223.viewFactor` stores only this presentation preference, separate from game settings and co-op saves. Touchscreen PCs and forced mobile UI on a PC keep the PC default. UI text/buttons keep their CSS sizes; world character size, attack range, collision and movement values are unchanged by zoom. Rendered world pixels become smaller uniformly as the view widens.

The final RC104/RC108 camera output is transformed around the existing viewport center, and native pointer inverse projection uses that same camera. Lexical combat camera `w` is untouched. Native RC133 bitmap/contact/envelope probes use an exception-safe unmodified-camera scope, including nested Persona minimum-pixel rendering, so zoom does not change authoritative contact geometry. Mobile portrait remains the original rotation guide with combat/input paused and state preserved. The camera module adds no entity scan, extra canvas or render pass. Unit tests passed36 checks; actual browser ratios, input, contact and performance observations remain pending.

## Independent pending items

The HAPIL Render Free Blueprint and user steps are ready in [remote-coop.md](remote-coop.md). No public relay URL has been supplied, so actual public WSS and four-network co-op remain unverified.

The user clarified **left** as each map's world-coordinate left half. For the common combat floor, the center is `(19,19)` and the corresponding line is `x=19`. This differs from the prior screen-left audit based on `y-x>=1.45`. Intersecting the unchanged physical floor with `x<19` reveals about53.16 world units² of currently blocked interior floor, including `(15,14)`. The proposed admission is the union of the original allowed area with those existing-floor points; it must not close any original area or extend the outer floor. New exposure penalties apply only to the newly admitted set. Implementation and cleanup verification remain in progress; the older screen-left audit is preserved as historical evidence.

The implementation uses the unchanged0.8 player clearance and each native phase's original admitted polygon. Exposure has a1s grace plus1s interval before the first tick at2s; each subsequent simulated second requests raw damage equal to0.5% of current maximum HP through the native incoming reducer. Native mitigation/invulnerability still owns actual HP loss. Derived outgoing damage and movement factors are0.9. No permanent stats or serialized DOT queues are added. Exit/death/map/load/session cleanup removes the private actor clock, and pause preserves its elapsed time. Guests accept the host's replicated position in the new region but do not judge damage or move there independently. A localized floor tint/outline and small active warning identify the area. Actual RC138/Persona property guards, old-side preservation, NPC constraints, replica admission, pause, unique re-entry IDs and cleanup have focused unit coverage; browser HP/movement/co-op checks remain pending.

## Verification record

This document will be updated with the exact candidate SHA, CI runs, captures and failures. Local Chrome and Playwright are unavailable, so local syntax/unit checks do not establish actual browser playback. The candidate workflow uses the runner's official Chrome with its ordinary sandbox and unchanged autoplay policy.

### First browser candidate: failures retained

Candidate `8fdba6fc4cbea14d43cc672a84d5f6a4ced054ec` was checked in [run38886929889](https://github.com/kjb7876-lang/hapil1/actions/runs/38886929889). This run failed overall. Its four-context co-op suite passed all16 checks, including native simultaneous attacks, movement, boss death/reward consistency, map barriers, death/revival, wipe/checkpoint, reconnect, host exit and solo-save preservation. The separate public-byte job passed all13 files against published199402a. These are local relay/isolated-context results, not four-network play.

Seven actual voice cases passed before the native relay case failed. The failing fixture joined before host start and consumed its first snapshot with no cue; a later fresh cue was legitimately eligible to autoplay. The revised fixture late-joins an already active native cue and retains the manual-play requirement. Its explicit snapshot messages also use the relay's strict permitted fields; forced repeats must be received before deduplication is judged.

The camera fixture used an incomplete CSS inverse and differed from the unchanged native pointer inverse by about0.81 logical pixels. It now uses the adaptive renderer's actual world view and retains its0.02 tolerance. This correction has not yet established a browser pass.

The left-zone geometry check passed, but its actual movement ratio failed. The RC137 directional constraint searched the original full requested ray after RC138 had reduced the candidate displacement, undoing the0.9 factor. The requested ray now receives the same exposure factor. An extracted production-wrapper regression with actual RC138 movement and RC137 constraint passes; actual browser retest remains required.

Checkpoint revival failed on both published199402a and the candidate: HP stayed0, the enabled choice remained visible, restart calls were0, and no page error occurred. Additional call-through instrumentation now records accepted choice identity, consumption and the party respawn gate. A CPU extraction demonstrates a possible consumed-choice/living-ally gate failure; the exact browser cause remains under investigation. The CPU job also exited before printing its first failing narration-manifest log; the wrapper now prints failed logs, continues collecting the remaining checks, and preserves a failing final status. Audio metadata verification explicitly provides ffprobe. The same manifest test passed locally with all279 recordings and both original WAVs unchanged.

Pre-change checks retained in `/tmp/rc223-baseline-audio/summary.json` passed narration manifest/text/proofreads/mixing/media races/WebAudio races/overlap/original timing, RC139 (264 checks), RC74 and RC48. Decoder fixture validation passed separately; its browser mode was blocked locally by missing Playwright. The old RC49/slayer VM smoke failed with `TypeError: view.rotate is not a function`; this failure is retained, not treated as a narration pass.

An intermediate integrated CPU run passed14 suites and failed the loader's fixed `v=22009` expectation after the native bundle changed to`v=22301`. The loader now has an explicit148 branch for the new exact cache key; every prior branch/pin remains intact. Negative tests still reject tampered bytes and now explicitly reject the stale22009 key on extension148. Its rerun passed158 checks. The original failed log is retained under `/tmp/rc223-integrated-cpu/` and is not counted as a pass.

Manifest coverage remains 88 of119 authored units and199 of297 routes;31 units/98 routes have pending recordings. Tests cannot establish audible speaker output, pronunciation/tail quality by human listening, physical mobile Safari behavior, real GPU performance, four separate networks or a natural campaign playthrough.

Known published legacy CI failures are retained: fixed 380/388 asset inventory expectations, fixed older cache key assertions, and publication polling that expired before Pages finished. RC220 actual published combat completed successfully with32 captures. The separate RC158 native death test timed out after its real checkpoint click while jointly waiting for positive HP and exactly one calibration observation; its logs do not identify which condition failed. A focused RC223 test now records and asserts those stages separately on both the published baseline and candidate. That old timeout remains unresolved until actual evidence distinguishes runtime failure from fixture interaction.

The published199402a laser workflow also recorded an ordinary STORY/full-auto first-boss transition to `dist01` in85,488ms, with no progression cheat and no page/HTTP errors ([run38878948173](https://github.com/kjb7876-lang/hapil1/actions/runs/38878948173)); that workflow still failed an older fixed cache-key assertion. This is a first-boss auto-mode result, not a full campaign, manual play or physical-device certification. Whole-repository CI is not being reported as green.
