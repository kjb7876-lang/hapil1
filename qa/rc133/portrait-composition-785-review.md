# Exact portrait composition review

Tested runtime: `785a2158983412384909cf701a6d8198581ed5f3`.
Base and current published runtime: `091143090653efffc7e64ab8262db25f91c3d293`.
This QA branch adds evidence only above the tested candidate. The correction
has not been published to main or Pages.

## Finding and correction

RC108 renders cached hero/boss camera images before assembling portrait. The
old RC91 wrapper applied the hidden battle mood to both cached images and the
assembled image. The red arena was tinted twice in portrait. The new strict
test fails on unchanged091 at the portrait player mood: 72 recursive tint
admissions where zero are required. The original desktop/landscape assertions
remain unchanged and pass.

The candidate skips mood composition while RC108 reports an internal camera
render and applies the existing four-state effect once to the assembled frame.
Only `assets/rc133/inner-final.js` and its index cache query change in runtime.
The exact authorized delta remains146 rows and is repinned to
`465d7989ce3ba1cf04b054256ed417dd57f10f3a50241324b375fd4360b240aa`.

## Exact local evidence

- All12 native render fixtures pass: normal/player/boss/opposition across PC,
  portrait and landscape. Recursive tint admissions are zero; each active
  final frame receives one tint. Canvas filter and transform restore normally.
- The full preservation command passes on785:3,199 runtime files and504
  directories match both committed and working trees. Historical guards and
  frozen TTS86 pass. Sprite, map, audio and main bundle bytes match091.
- All12 native mood/profile captures are included under
  `evidence/portrait-composition/exact-785/`. These are staged, invulnerable
  render fixtures; they are not natural campaign victories.
- The separate post-wait portrait proof requires the live game binding to
  equal both the QA binding and the retained fixture, the boss camera to focus
  `inner-evil-rc133`, and actual awake-2 body draws in both native camera passes.
  It captures6 boss and6 hero body draws,24 compositor frames, player HP240,
  no story/death overlay and zeroJS/HTTP errors. Both body rectangles lie
  inside RC108's central-half source crop. Original source, alpha and body
  brightness remain unchanged.

Native pixels were reviewed directly. The red arena and cloak gain brightness
after the duplicate pass is removed. The dark source cloak and health bars
near the split divider still reduce local contrast. This focused correction
does not establish visibility in every possible position or lighting state.
Bounded Chromium timings are not physical-phone or sustained-FPS measurements.

## Exact hosted checks

Both workflows completed successfully on the exact785 commit: RC13339/39
regressions and all five active canonical jobs. The strict narration decoder
passed1,076 rows with538 exact reference PCM matches across269 active assets.

See `evidence/portrait-composition/exact-785/ci-proof.json` for job metadata and
all exact regression rows. Gameplay/preservation/legacy run:
https://github.com/kjb7876-lang/hapil1/actions/runs/37199489054

Canonical narration/topology/Dream/death/release run:
https://github.com/kjb7876-lang/hapil1/actions/runs/37199489067

The main-only published-audio job is expected to be skipped for this candidate.
Actual public-file and hidden-duel verification remains091:68 exact deployed
files and12 boundary/save cases passed in run37198766339. All nine091 main
workflows passed. Git-readable publication evidence is on
`codex/rc133-final-rounds-evidence` at
`50aa2de736664e3daeec255260bd3597d59c90e4`.

## Native checkpoint continuation

The unchanged genuine prior assisted Dream checkpoint was loaded through
native Continue before cult-leader death. Full-auto plus17 ordinary D-defense
inputs completed the hidden fight in214.627 seconds /198 observations /42
attack cycles. The first revival was boss-first; the next terminal defeat
completed the battle. Final player HP270/270, hidden mood normal, zeroJS/HTTP
errors. Story slot1 SHA256 remained
`b0013264d56835f3cf2bb7996479c6f18c98803f561a4887fcb34cb957f8fdd9`.
No HP/progress/boss edits were used. This is an assisted checkpoint continuation,
not a new full campaign or an unassisted victory. Source save, exact runner,
timeline, summary and unedited final native PNG are included in the evidence.
Normal hidden mood after completion concerns arena composition; it does not
claim that every independent EGO timer or HUD countdown is zero.

## Remaining coordination

Parent coordination and a fresh main check are required before publishing the
contrast candidate. Additional13 audio transfers remain approval-tool blocked
in the parent task; three held combat voices remain unassigned. A further
audit after the remaining audio integration is required. The two historical
comprehensive rounds cover the implemented091 core; this focused review does
not close the entire user project or its automation.

Fresh origin/main was091 when fetched after these checks. A later publication
still needs another fresh check. After publication, repin the existing public
68-file/12-case audit from50aa2de to the deployed candidate and run it against
the real Pages site;091 public verification is not785 public verification.
