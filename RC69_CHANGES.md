# RC69 — Combat asset, encounter and narration fixes

Base: `5038992d5e1752144b0ef58e600625a9f7932ef8` (GitHub RC68).

## Changes

- Slayer's basic attack has a forward travelling circular core in the hero effect renderer, including downward attacks. The side pose remains stable.
- Corrected RC64 sprite crop metadata from pixel dimensions to normalized coordinates.
- Desktop danmaku admission no longer uses the old 48-shot limit. Scatter now uses 90 shots and several other patterns use 72. Mobile patterns remain at or below 48 shots. Existing attacker colors and jellybean bitmap are retained.
- All registered boss and midboss laser profiles receive the 14 existing blood-beam patterns, including the three moving beam patterns. Warning, render and collision continue to share geometry.
- Both initial rosters and the actual wave-3 spawn path complete midboss groups to three. Clones keep owner aliases for danmaku. Added surviving-trio save/restore support.
- Episode 1-A dist04 explicitly includes the revived-comrade encounter with existing zombie guardian, fallen comrade and corrupted guardian artwork. Rendering uses the assigned art rather than the previous phase-body replacement. Wave accounting prevents a second duplicate companion encounter.
- Dist06 actors are held at their map positions, including the tower midboss triad and Balrog. Movement and counter movement use the same anchors.
- The active/completed cosmic Lucifer arena takes priority over the generic story map override. Existing cosmic actor artwork is retained.
- Voice 1/2 are connected to the first map's pre/post monologue cards. Start gesture primes audio, playback begins with each card, retry/pause is available, close stops narration, and automatic advance allows the tracks to finish.
- Updated browser cache keys.

## Verification

Passed syntax checks and `git diff --check`.
Passed focused tests: RC59 death/checkpoint, RC60 story/map route (including cosmic map priority), RC61 bootstrap, RC48 narration, RC64 pattern/assets/mobile budget, RC68 moving-laser collision geometry.

`tests/rc69-targeted-browser.cjs` passed in headless Chromium:

- Selected Slayer and reached the first monologue without page errors.
- Voice 1 and Voice 2 both reached the playing state.
- Actual dist04 roster contains three distinct companion IDs/artworks; screenshot reviewed.
- Actual wave-3 tower spawn contains three actors whose positions remain unchanged during simulation; screenshot reviewed.
- Save/normalize/restore retains two surviving custom midboss IDs without resurrecting the defeated member.
- Slayer effect is routed through the forward-core renderer; sprite metadata is normalized.
- Native mask defeat creates cosmic Lucifer and resolves the cosmic arena.

This is focused regression coverage, not a guarantee of zero bugs on every device. Existing saves already inside a completed encounter do not replay that encounter; revisit/restart the zone to see its new initial roster.
