# Final round2 review and publication handoff

## Release candidate

The exact tested runtime is `091143090653efffc7e64ab8262db25f91c3d293`, on
`codex/rc133-both-first-lethal`. Its assets, audio, data, index, tests and tools
are byte-identical to corrected round1 revision
`ac1e642ff6e225658cd11a147d702c85d67559be`. The final commit records round1 and
starts independent complete round2 CI. Earlier debugging runs are not counted
as the two final comprehensive rounds.

The candidate includes the approved gameplay systems, hidden Dream persona,
all uploaded original art and the admitted39 combat-audio set, the either-first
player/boss/both lethal correction, and frozen TTS86. The first lethal callback
admits one dual awakening atomically; only lethal actors revive, while living
opponent HP and its healing ceiling stay intact. The second lethal event is
terminal. TTS86 adds exactly five MP3s and two routes, preserving all264 prior
assets,189 prior routes, decoder references and the untouched85 release guard.

## Complete second round

| Coverage | Exact091 result |
| --- | --- |
| Gameplay/native/preservation/legacy | [39/39 suites](https://github.com/kjb7876-lang/hapil1/actions/runs/37195960039): native24, preservation8, legacy7, including the nested complete laser gate |
| Canonical narration/campaign regressions | [All five active jobs pass](https://github.com/kjb7876-lang/hapil1/actions/runs/37195960044): narration, Dream, death/dialog, topology and complete legacy release |
| Strict narration decoder | Chromium140.0.7339.186;269 MP3s,1,076 observations,538 fixed-rate PCM outputs exactly matching references; original tolerances/configuration unchanged |
| Gameplay and save transactions | EGO7, bounded Dream upgrades/timers, eight heroes, Story2/Dream3 midbosses, charges/warp, humanoid/Stand/bitmap contacts, admitted feedback,9 hidden skills/8 traits, four moods, either-first clash, terminal/exit/death/reload cleanup, native save-slot navigation |
| Whole preservation | Current3199-file/504-directory inventory, explicit146-row runtime delta, unchanged historical85 chain; movement777, laser/body art, size and fallback policies guarded |
| Image/source ownership | Fresh285-image decode census;65 canonical actor rows and164 authored references;82 fixtures covering all41 active Story/Dream routes; six source-owned Story Cosmic finales and six Dream trials |
| Original art and crop pixels | Six originals,44 manifested outputs plus one external derivative,16 persona directional frames and25 exact VFX/chrono source reconstructions reviewed |
| Native scene admission | Eight staged PC scenes admitted only with positive live HP, no Story/death overlays and45–75 matching native frames; initially obscured screenshots rejected and recaptured |
| Native mood profiles | Four moods across desktop, emulated portrait and landscape; native draw/filter restoration checked, source art unchanged |
| Trusted UI and staged lethal boundaries | Local unchanged mirror: normal Story→777→Dream→777 entry, four lethal cases ×three profiles, native slot save/reload,68 exact file hashes;12/12 cases pass, noJS/HTTP errors |
| Genuine checkpoint continuation | Native Continue from the unchanged genuine pre-hidden assisted Dream checkpoint; full-auto plus ordinary D defense,224.637 seconds/46 skill cycles, first boss lethal→one clash, second kill→completion; player270/270, noJS/HTTP errors |
| Story save preservation | Slot1 remains SHA256 `b0013264d56835f3cf2bb7996479c6f18c98803f561a4887fcb34cb957f8fdd9` |
| Bounded native rendering | All12 mood/profile measurements pass with no sustained1second render stall or canvas filter/transform leaks; independent render-call p95 is3.0–27.7ms; concurrent QA measurement is4.2–46ms, both retained |

Round1's RC33 renderer-readiness race and hidden-body contrast issue were fixed
and the whole corrected first-round CI rerun before round2 admission. The test
readiness fix preserves every original warning/beam/expiry assertion; a forced
10second installer delay reproduced the old race and validated the correction.
The body fix is a balanced runtime brightness/contrast draw filter; source PNG
bytes, alpha, pivots, geometry and hitboxes remain unchanged.

Machine-readable results, original source hashes, actor/mode matrix, exact crop
provenance and admitted scene pixels are under `evidence/final-round2/`.
The source/image reviewer report documents the scope of visual conclusions.

The focused portrait opposition probe additionally checks the live game binding
equals the fixture/QA state and samples camera telemetry after native draws:
the boss camera focuses `inner-evil-rc133`, with six observed boss passes and
six hero passes. The224×400 source frame's transformed rectangle is inside
both recorded central camera crops. The earlier `dist00-boss` telemetry was
captured before staging and is rejected as final-frame evidence. The vertical
mood divider crosses the body/bar, and the red half remains low contrast; these
captures do not establish perfect legibility or framing at every position.
See `identity/portrait-opposition-bounds.json` and its verified native screenshot.

## Publication coordination

Main/Pages have not been changed by this final handoff. The latest fetched main
is `80adeec6e12d1e96973012e535ad1575ae12d1c8`, an ancestor of the tested091
candidate. Fetch main again immediately before publication. If it has advanced,
integrate and test the exact new combined revision before publishing; never
force-push or replace current main content.

After parent coordination, publish exact091 by normal fast-forward, then verify
main CI and Pages deployment. Canonical `published-audio` is main-only and was
correctly skipped in both branch rounds; it still must verify deployed bytes.
The prepared public audit lives in `qa/rc133/public-duel.cjs` and
`.github/workflows/rc133-public-duel.yml`. It pins091 and verifies68 actual
deployed runtime/art/audio files plus normal public777 navigation and12 staged
lethal/save cases across three profiles. Push its branch
`codex/rc133-public-both-first` only after091 is live on Pages. A local mirror
pass is not evidence of deployed public bytes.

## Limits

The genuine checkpoint test is assisted continuation, not a fresh unassisted
campaign. Staged HP/callback/render fixtures are explicitly separate. Mobile
profiles are Chromium emulation, not physical phones. Bounded render timing is
not sustained FPS or thermal/device performance. Source sprites remain dark;
visual inspection covers the recorded camera positions and moods. Local
Chromium151's previously reproduced fixed-PCM representation difference is
documented; unchanged strict assertions pass on hosted Chromium140. Additional13
audio and three held unauditioned short-male voices remain separate parent
work; they are not silently assigned. No zero-possible-bug guarantee is made.

This review supersedes older pending-CI/count fields in historical RC133 status
documents. The evidence/public-audit branch carries QA/workflow additions only;
091 remains the exact release/runtime revision.
