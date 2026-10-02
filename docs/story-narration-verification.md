# Canonical Korean narration verification

## Preserved contracts

- Both original uploaded recordings keep their existing file paths and bytes.
- The legacy RC49 player and original opening transcript remain unchanged.
- Canonical story data, game bundle, combat progression and save format remain unchanged.
- Narration never owns death auto-restart. Full-auto rebirth still closes after the existing three seconds; narration is canceled with it.
- Audio errors leave the original text and Continue action usable. A download/playback attempt has a bounded timeout.
- Audio is fetched for the current card/paragraph only. Decoded PCM is released on scene close or change.
- Scene text must match its manifest SHA-256 before any narration asset is requested.

## Staging evidence

Commit `6dcbdf867d7b2407198a607c82aeb840b0181e07` passed source and original voice regression gates plus 112-card synthetic audio lifecycle checks in [Actions 36978801909](https://github.com/kjb7876-lang/hapil1/actions/runs/36978801909).

Commit `667fb6d5a5c57eadf9bdcd00d8c958efac7a06b8` passed the same primary checks plus all 184 nonempty tabs across 62 journal records, explicit prologue playback/skip, journal redraw/selection/close, unchanged three-second death auto-restart, death failure fallback, and ending keyboard/close behavior in [Actions 36980041745](https://github.com/kjb7876-lang/hapil1/actions/runs/36980041745).

These runs use controlled waveform fixtures to exercise playback mechanics, rather than claiming every generated spoken recording is finished or reviewed.

## Final release checks (pending corpus completion)

- Complete source-to-audio mapping: 110 new combat cards, 8 supplemental unique narratives, 1 exact ending excerpt, plus existing recordings reused in the journal.
- Every generated scene passes synthesis QA and pronunciation review; flagged output is regenerated before publication.
- Manifest/source equality, paragraph playlist order, SHA-256, byte count, file presence and original recording immutability.
- Actual MP3 decode/playback and mobile/desktop layout checks.
- Existing full release and Dream/death regressions on the final integrated revision.
- Fresh main-branch reconciliation, non-force publication and successful Pages deployment for the exact tested commit.

Independent review added15deterministic regressions for stale media events/promises, retained-player preemption, and overlapping/replaced/externally removed death dialogs. All15passed locally. The expanded fixture suite passed [Actions36983574813](https://github.com/kjb7876-lang/hapil1/actions/runs/36983574813) on e555adb6b7286ea19114b59788f3827ac767ea53. Mobile/desktop story and prologue screenshots were also inspected. Final audio encoding is128kbps MP3; the requested spoken/displayed phrase“그러하였다.” and1–2second preceding pauses remain subject to final corpus generation/QA.

Latest user change(2026-10-02): canceled nonverbal sighs; every remaining canonical ellipsis is to be replaced by the exact spoken/displayed phrase“그러하였다.”, preserving existingvoice1/2. Canonical source/export/audio hash migration is pending on fresh main.
