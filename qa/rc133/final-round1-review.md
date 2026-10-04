# Final round1 review

Implementation was closed at `d0b40d904e7aa694f84f59ecc31e215b1f33d53f`.
The comprehensive review found two issues and validated their fixes on
`ac1e642ff6e225658cd11a147d702c85d67559be` before admitting round2.

| Finding | Classification | Correction and proof |
| --- | --- | --- |
| First warning raster count0 instead of2 | Test readiness race | RC33 changes owner beam addresses after installing. A controlled10second delay proves a cast created earlier retains the RC32 address and is rejected against the new owner address. The test now waits for actual renderer installation; every original warning/beam/expiry assertion remains. Delayed positive replay passes all12 rows. |
| Awakened cloak blends into dark arena | Reproducible readability issue | Hidden-body-only brightness/contrast inside balanced canvas save/restore, before whole-arena color composition. All original image bytes, alpha, geometry, pivots and hitboxes remain unchanged. Native draws record the intended filter in all4moods across3profiles; source/pixel and bitmap contact suites pass. |

## Full corrected revision

- [Gameplay39/39](https://github.com/kjb7876-lang/hapil1/actions/runs/37195264429): native24, preservation8, legacy7; nested laser release passes10/10.
- [Canonical narration and campaign regression](https://github.com/kjb7876-lang/hapil1/actions/runs/37195264433): all five active jobs pass, including Dream, death/dialog, topology and the complete legacy release. Public-audio job is intentionally main-only and is still pending publication.
- Chromium140 decodes all269 active MP3s (86scenes +183paragraphs):1,076 observations pass;538 fixed-rate PCM outputs match independent references exactly. Prior264 asset references, configuration, tolerances, files and189 routes remain unchanged; frozen TTS86 adds exactly5MP3s and2routes.
- Native full gameplay covers932 checks per desktop/portrait/landscape profile, all41 active midboss routes (Story2 / Dream3), six source-owned Story Cosmic finales, six Dream trials, hidden9skills,8hero traits, bitmap/camera/size contacts, Stand main-body targeting, physical charge removal, safe warp, EGO7/save/resurrection, first player/boss/both lethal admission, mode/death/terminal cleanup and transaction-bound feedback. Existing movement/laser/body/fallback policies remain guarded.
- Complete image census:285 decoded original/expanded references;82 Story/Dream partner fixtures; source/mode ownership reviewed. Original6 sheets,44 derivatives plus1external,16 directional persona frames and25 crop/VFX source reconstructions pass current hash/pixel checks.
- Normal local UI777 navigation and native slot save/reload:4staged lethal cases ×3profiles pass;68 exact runtime/art/new-audio file hashes pass. This is staged coverage, not a natural victory.
- Genuine unchanged pre-hidden Dream checkpoint through native Continue, full-auto plus ordinary keyboard defense:216.505seconds,38skill cycles, first boss lethal admits one opposed awakening, second death completes normally; noJS/HTTP errors. Player270/270; Story slot1 SHA256 stays `b0013264d56835f3cf2bb7996479c6f18c98803f561a4887fcb34cb957f8fdd9`.
- All4moods ×3profiles native render/performance checks pass. Bounded local render p95 ranges3.0–27.5ms in this run; these are render-call measurements, not sustained device FPS.

Machine-readable CI, controlled race, checkpoint and performance evidence is
in `evidence/final-round1/`. Detailed image/UI evidence is retained in the
executor's `final-round1-fixed-identity` report and captures.

## Round2 admission and limits

Round1 is closed. Repeat the entire gameplay, preservation, legacy, canonical
audio, identity/pixel/UI, save/modes/clash, performance and genuine-checkpoint
coverage on the final exact code before publication. A documentation/workflow
comment commit will identify that final checkout without changing runtime.

Mobile profiles are Chromium emulation, not physical phones. Genuine checkpoint
replays are assisted continuations, not fresh unassisted full campaigns. Prior
local Chromium151 fixed-PCM representation differences remain documented;
no tolerance was weakened. Additional13 audio remains a separate parent task.
The two issues above are resolved; no zero-possible-bug claim is made.
