# RC133 gameplay and source-media handoff

Combined integration is on `codex/rc133-media-integration`; exact candidate CI is pending. The prior runtime **6778046f7d889b09962357e9f282a265d2b235ec** passed 18/18 CI suites. Main **4670211fcd1a2e5076a3f9c57fc67e55cd0486a9** is merged, preserving narration85. Main/Pages have not changed; publication remains coordinated by the parent. No zero-bug guarantee.

## Behavior delivered

- EGO7 atomic admission, 7-second/77-second defaults, pending count while occupied, same-run portal/save persistence, encounter-limited crisis revival. Five ordinary Dream-only bounded upgrade tracks preserve Story isolation.
- Eight existing hero awakening images/roles including gunner; actual native defensive/removal transaction feedback, source throttling only after output admission, duplicate suppression and output coalescing.
- Legacy and V31315 boss self-charge movement removed. Wrath keeps ignition/rage without its body charge; named signature decks retain their nonmoving projectile grammar. Nearby eligible bosses reserve terrain/hazard/player/ally-safe warp destinations with warning, cast deferral, cancellation and shared cooldown. Fixed cosmic/persona bodies stay stationary.
- All 41 current native midboss routes admit Story2/Dream3 at initial or delayed spawn. Living IDs and HP persist; defeated members do not respawn or double-scale on load. Authored alternative sprites prefer the same arc. Humanoid core size/target stays consistent through Stand phases; Stand remains auxiliary.
- Actual Dream cult-leader death admits the unconscious afterlife persona; native persona death closes through the ordinary route. Eight bounded borrowed hero traits, HP<=12600, growth1–2.1, <=72 hostile projectiles, <=20 packet damage, <=4.8 speed and visible collision delay. Native difficulty/defense reducers remain authoritative.
- Normal/player black-white/boss black-red/opposed half-screen compositions preserve HUD order and restore the canvas context. End/death/reload/mode checks stop filter leakage. All six source images were pixel-inspected and preserved. Forty-four deterministic source outputs include the concept reveal, playable arena, portrait, eight base/eight awakening directions, nine isolated skills and sixteen native Chrono crops. Bodies share a 224×400 canvas/feet pivot; native hit radius remains .72. Source art selects on the real timer and restores on native load. An optional generated transparent eclipse derivative is separately labeled in provenance.
- HELL deletion/save compatibility, RC127 movement/cast policy, RC130 cap, RC131 fallback, RC132 healing/mirror-removal/portal behavior, approved laser pixels and current narration preserved. HapilMongse adds only a bounded save foundation for visited regions/rest waypoints/memory; no full open-world quests/maps/story.

## Natural Dream reset diagnosis and fixes

The original 29.47-minute attempt's five-second sampling missed real player deaths. Forwarding-only hooks on the preserved natural save captured three native deaths in 39.4s: RC59 resets Episode1-A to dist00 and creates a new boss. These were not spontaneous boss HP restoration.

Two verified defects were fixed in `20ce104`:

1. Weak exiting projectile bodies (8% base damage bounded 1–12) acquired a fresh 10%-max-HP heart bonus and major-owner raid modifiers/leech. Two distinct weak packets each requested 1 and applied 50. The active `assets/rc25/raid.js` now excludes only these weak derived packets from major modifiers, and the native heart packet does not award a new full bonus. Normal boss body/laser/ultimate damage policy is preserved.
2. Same-zone death restarts retained old boss laser/ultimate casts and RC95/RC129 clocks. Old laser ID56 damaged both the old encounter and the new same-ID boss attempt. Native zone entry/respawn now clears old casts/admission clocks while preserving EGO progress and native death/healing policy.

The twelve-case native restart/weak-contact suite is explicitly staged. It checks bounded weak contacts, same-group duplicates, independent groups, unchanged major attack floors/leech, new rosters, discarded casts/clocks and retained EGO count. See [diagnosis](qa/rc133/dream-reset-diagnosis.md).

## Source media and Story boss identity

- All39 original audio bytes are preserved;31 unique sources yield23 nonvoice SFX and5 BGM derivatives. Processing uses measured static attenuation, DC filtering, conservative onset trim/preroll and fades. FFmpeg and browser decoding pass; decoded maximum sample/true peak is −1.8dBFS/−1.8dBTP. This is headroom measurement, not a clipping-repair or acoustic audition claim.
- Twenty-nine event assignments use admitted native hit/parry/dodge/removal and actual cast/phase events through the existing bounded mixer. Generic guard/hurt and player awakening retain native fallbacks. Three unauditioned Short_male_combat_hi sources stay unassigned.
- The six Story episode finales now awaken their actual source boss, source artwork and native signature deck, with a bounded rooftop native-bullet fallback. Legacy Kair IDs migrate on load; real Dream Kair encounters stay separate. The b09 connection hook now excludes the source Cosmic actor in death, tick and restore; all six native death closures are regression-covered. Hospital generic projectiles now resolve to the authored syringe. Kair ordinary shots and nonbeam boss projectiles use varied native Chrono crops; approved laser/beam art is excluded from that replacement.
- Provenance: [art](qa/rc133/art-processing.json), [audio](qa/rc133/audio-processing.json), [event mapping](qa/rc133/audio-runtime-mapping.json). Processing scripts preserve originals.

## Validation

Exact 6007eea CI: 18/18 suites passed, [run37151933176](https://github.com/kjb7876-lang/hapil1/actions/runs/37151933176). This includes 642 native checks per PC/portrait/landscape, native contacts 8, restart/weak contacts 12, hero render 72 per viewport, RC132 browser/wrath, RC130 bitmap/pixel limits, approved laser pixels, narration82 manifest and natural Story first-boss→dist01. Units: policy 131, feedback 68, RC132 32, RC127 174, hero 344, RC130 799, isolation 28. Local initial Acorn/Chromium path failures were corrected; original failed logs remain retained.

At 6778046 the extended native suite has 646 checks per viewport, adding registered awakening entry/expiry/save reconstruction. Local three-viewport run passed with 0 JS/HTTP errors. Exact remote CI passed 18/18: [run37154208939](https://github.com/kjb7876-lang/hapil1/actions/runs/37154208939), see [CI evidence](qa/rc133/evidence/ci-6778046.json).

Earlier full-auto natural Story at 1d17a7b completed 61 zones, actual cult04 ending and normal title Dream unlock. Ending save is protected in native slot1. This is distinct from the latest code-SHA first-boss regression.

After the reset fixes, a separate unassisted full-auto Dream trial at 6007eea still had 14 actual deaths in 5 minutes, 0 completed zones and 0 JS/HTTP errors. These are legitimate combat deaths; no difficulty nerf was made. Normal D-key assistance then reached dist04 before one death. Further native-input continuation is bounded and its exact result will be recorded. No HP/enemy/unlock/route edits are used. The full natural Dream hidden-final victory is not established.

Additional check **failed**: `story-narration-decoder-edges.cjs` on Chromium 151.0.7922.173 decoded all 1020 rows / 255 files; native-rate 510 rows passed, fixed-rate 510 rows failed strict PCM/fingerprint checks (sample-count delta 0). Narration files, fixtures and test bytes match main 0d0017b. Reference/tolerances/audio were not changed. This does not establish missing phonemes or device output. See the committed compact failure summary and the retained full log outside the repo.

The combined dirty-tree precommit run passes723 native checks per desktop/portrait/landscape, actual uploaded drawImage frames, all four outer compositor states, six actual native source signatures, and legacy save restore. Audio units pass95 checks; actual browser playback covers native parry, committed infernal effects, all28 decodes, mute/unmute and max2 voices. These are staged fixtures and precommit checks, not an exact-SHA release or natural hidden victory.

Natural assisted Dream continues on prior runtime6778046f, with normal D-key guard input and no HP/enemy/progress edits. The retained 36-zone native kair01 checkpoint has HP240, zero native deaths/JS/HTTP errors. Story slot1 stays protected. Latest live status progresses beyond that checkpoint; a completed natural hidden final is still pending.

## New narrative text / TTS handoff

[Text surfaces](qa/rc133/new-text-surfaces.json) contains exact strings, logical surface IDs, source functions, trigger and position. Three new narrative strings:

- `rc133.inner-final.reveal.floatText`: 교주의 죽음 뒤, 사후에 숨겨 둔 나의 악이 깨어난다 — native Dream cult04 leader death; player position, 1.8s.
- `rc133.inner-final.boss.name`: 사후의 나 · 악한 무의식 — persona actor/target/boss name, including native restore.
- `rc133.inner-final.awakening.floatText`: 惡夢覺醒 · 나의 힘을 기억한다 — boss awakening countdown; boss position, 0.9s.

These are **not voiced**. Existing119 canonical TTS units /85 published units exclude them. Trait telegraphs and other new UI text are listed separately; no new ending dialogue was added.

## Remaining blockers

Thirteen additional exact Library audio files were resolved, but the official unchanged-search download helper failed with `hosted apps tools/list request failed: network`. [Pending source IDs/filenames](qa/rc133/pending-media.json) records each exact item. Full unchanged API search JSON remains at `/workspace/rc133-tools/missing-library-audio-search`; the parent can transfer selected sources through that consumer contract. No guessed URLs or alternate searched-ID materialization was attempted.

Three unknown voice clips await audition. The earlier strict fixed-rate PCM decoder comparison failed on Chromium151; its failure evidence remains preserved, and this work does not change narration85 bytes, comparison reference or tolerances. Physical phones and natural Dream hidden-final victory remain unverified.

Before publication, confirm fresh main, pass combined exact-SHA CI, coordinate with the parent, then verify Pages/deployed SHA, public runtime hashes and desktop/portrait/landscape smoke. The integration branch is reviewable; it is not a deployed release.
