# RC133 gameplay handoff — parent coordination required

The complex gameplay changes are implemented on `codex/rc133-samong-inner-self`. Exact clean runtime SHA: **5b53fe38489c01d746bf7fb84f61659795276e3e**. Starting and freshly fetched main: **473f5fe6ab717bb975c35f198938f43dd55f9358**. Main and Pages were not changed. Parent is preparing narration82 (73 unchanged +9); combine that work with fresh main before publication. There is no zero-bug guarantee.

## Implemented behavior

- Boss self-charge movement: legacy gap charge bypass and owned pending-charge withdrawal; V31315 dash profiles explicitly use stationary cross coverage and its old impact/tick movement is removed. Wrath keeps its committed ignition line/rage sequence while its body stays still. Named signature decks (`dash-trail-converge`, `six-image-charge`) generate projectile grammar, not actor coordinate movement; their nonmoving attacks remain.
- Nearby-player escape: terrain/hazard/player/ally-safe endpoint, 0.55s warning, >=8 world units from living players, cast/phase/stagger/time-stop/authority gates and 3s shared cooldown. One reservation remains owned while a committed cast defers it. Invalid endpoint, distance, zone or dead owner cancels/releases it. Existing fixed towers and cosmic/persona bodies stay stationary.
- All 41 current native midboss zones: Story2 / Dream3 at real initial or delayed admission. Persist the admitted IDs and living members; restore does not resurrect defeated companions or apply Dream HP twice. Existing distinct art uses same-arc preference with nearest authored fallback. Removed `ep1a07` migrates to `ep1a08` and is tested separately. Cult03's special boss pair remains outside the ordinary midboss roster.
- Humanoid Stand core retains the same body anchor and 122 render size; auxiliary Stand remains visual-only. Native target and hit radius use the human core (.72), independent of Stand phase. Representative c104 phases0–3 checked; this is not an all-art pixel dimension audit.
- Dream persona: native c104 cult death opens the player's evil unconscious afterlife persona; native persona death permits the ordinary clear route. Health <=12600, growth scale1–2.1, eight bounded hero projectile profiles, <=72 total hostile projectiles, <=20 packet damage, <=4.8 speed, warning/collision delay, pause/time-stop/guest gates, no ordinary self movement. Difficulty/defense reducers still own applied damage.
- Four screen compositions: normal, full black/white player awakening, full black/red boss awakening, or opposed left/right halves. HUD feedback draws afterward; canvas context is restored. End/death/reload eligibility is cleared, including the ordinary awakening grayscale fallback after persona completion while its buff timer remains active.
- EGO seven-entry counter: normal transition only, persistent in the same run/portal/save, pending while cooldown/awakening is occupied, shared synchronous admission with encounter-limited revival. Default7s/77s; successful admission consumes the seven count. Unknown origins/nonfinite entry timestamps rejected.
- Normal React growth UI offers five `samongUpgrade` tracks only in Dream. One shard/rank; caps: resonance3 (+30% gain and parry/graze bonus, +6% defense efficiency), cooldown3 (>=65.45s), duration2 (<=9s), power3 (<=8.05 total multiplier), protection2 (<=1s grace), no extra unlimited revivals.
- Feedback uses committed native transactions. Defensive source throttle commits only after output admission; removal publishes once. Existing HELL deletion/save mapping, RC127 movement/cast policy, RC130 cap, RC131 fallback, RC132 healing/portal/mirror policy, laser art and narration files preserved.
- HapilMongse foundation only: visited regions, rest waypoints and bounded memory resource save container. No complete open-world quests/maps/story claimed.

## Exact runtime validation

[Machine status](qa/rc133/release-status.json) and [committed evidence](qa/rc133/evidence/5b53fe3/) distinguish staged fixtures, unit tests and natural play. Local full screenshots/logs: `/workspace/rc133-tools/exact-5b53fe3`.

- RC133 staged native browser: 642 checks per PC/portrait/landscape, plus actual React purchase/Story isolation and native cult/persona death-to-clear closures. Ending grayscale self-composition0 in actual frames.
- Native incoming reducer probe:8 cases (ordinary invulnerability, blink, automatic dodge, Samong grace, D parry, shield, skill removal, repeated laser). HP/outcome/label agreement; duplicate removal suppressed; 80 laser contacts produce one output effect. See `tests/rc133-contact-browser.cjs`.
- Existing eight hero awakening images decode and native render:72 staged cases across3 emulated viewports. No physical-phone claim.
- RC132 native post-defeat progression and visual-actor consistency pass; removed mirror create/hit/draw0 and 777 speed retained. RC130 native bitmap ratios <=20% at .75/2/6 zoom pass.
- Units: RC133 policy131, feedback68, RC13232, RC127174, RC131344, RC130799, isolation28; RC59 and RC87 smoke pass.
- Approved laser pixels match `19a4c1f92df16559e43ba822ae0f7b8e74a5c47a` on GPU/Canvas/mobile-lowFx; extra pixels0.
- Natural desktop Story `dist00` first boss to `dist01`:80871ms, finalHP230.05, JS/HTTP errors0. Script never edits HP/enemies/clues/waves/progress. Full Story/Dream campaigns and natural hidden-final battle remain untested.
- Current narration manifest:73 included /46 pending canonical units; source narration/audio files unchanged from starting main.

Initial expanded staged tests exposed Story trio admission, excessive save rejection, and repeated art; these were fixed. Retired-zone migration and assumed wrath phase required fixture corrections. UI harness selectors/dialogue handling were corrected. The final clean-SHA runs pass; preliminary failing evidence is retained under `/workspace/rc133-tools/hardening*`.

## Remaining conditions

Asset staging remains user-cancelled and parent-paused. No alternate upload/materialization was attempted. The six uploaded persona image sources and recovered audio39 ZIP/manifest are absent here. Uploaded map/body/skills/awakening art, original cosmic identity art conversion and new audio placement/decode/playback/gender manifest are **not complete**. Existing verified hero/zone sprites are temporary fallbacks; stationary cosmic mechanics are complete, original-source art is not.

Remote read-only CI **passed** at exact feature SHA `d4a796c01cc0789c064e33d9a7dc2046a5f4e094`: [run37142621371](https://github.com/kjb7876-lang/hapil1/actions/runs/37142621371), native-gameplay9 / preservation8 suites. Runtime hashes match local5b53fe3. Remote natural first-boss/portal reached dist01 in95312ms with HP210.856 and JS/HTTP errors0. See `qa/rc133/evidence/ci-d4a796c.json`; artifacts retain screenshots/logs for14days. The workflow performs no repository mutations/main/Pages writes. CLI authentication remains invalid; GitHub connector read access succeeded. Parent must still run combined exact-SHA CI after narration82 integration, then coordinate main/Pages publication, deployment SHA/public hashes and desktop/portrait/landscape public smoke. No main or Pages publication happened in this task.
