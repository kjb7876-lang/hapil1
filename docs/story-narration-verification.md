# Canonical Korean narration verification

## Preserved contracts

- Original voice 1 and voice 2 retain their existing audio paths, bytes, transcripts and RC49 playback route. Read-only transport observations let their host honor actual completion, pause and OS interruption.
- The game bundle adds only a transient narration/BGM bridge; save format and combat progression remain unchanged. Canonical text edits are limited to the requested ellipsis replacements and conservative proofreading.
- Death narration never delays full-auto rebirth. The existing three-second timer retains priority and cancels narration when it closes.
- Manual Skip remains immediate. Audio failures leave the text and Continue action usable.
- New narration waits for the actual final audio-ended event, followed by a 750 ms tail, before normal automatic continuation. Loading and stalled transport have bounded recovery.
- Audio is fetched for the current card or journal paragraph only. Decoded PCM is released on close, navigation or preemption. Paused and backgrounded playback keeps an accurate resume offset.
- Exact displayed-text SHA-256 must match the manifest before any narration asset is requested.

## Verified staging revision

Commit `6b418aeaac143803a1844f5ed0b447aeeb719e9b` passed [Actions 36994878495](https://github.com/kjb7876-lang/hapil1/actions/runs/36994878495).

The audit covered:

- Existing canonical source and original voice contracts.
- All 112 active cards, including 110 new narration routes.
- All 184 nonempty journal tabs across 62 records.
- Explicit prologue playback, skip, hidden slow loading and real final-ended timing.
- Journal selection, unchanged redraw, search and close behavior.
- Death overlap, replacement, external removal, keyboard handling and unchanged three-second auto-restart.
- Ending-overlay lifecycle and keyboard controls.
- Nineteen deterministic media/lifecycle regressions, including stale events, delayed promises, pause/resume, preemption, history-cache return and stalled playback.
- Desktop, portrait-mobile and landscape-mobile layouts.
- Fourteen approved ellipsis replacements across ten cards, with original uploaded source and voice transcripts preserved.
- Twenty-five conservative text corrections across twenty-two cards; eight cards change spoken spelling or grammar.

These playback checks use controlled waveform fixtures. They do not certify that the complete generated spoken corpus is finished or reviewed.

## Incremental publication

The user requested publication of the quality-passed subset first on 2026-10-03. The runtime manifest declares included and pending canonical units and routes. Every included asset must pass the same quality and integrity requirements below. A journal or supplemental playlist is published only when all its clips are available.

Pending routes display the complete canonical text and keep normal continuation. They do not request missing audio or show unusable narration controls. Explicit missing-route tests cover muted readers, canceled loading, independent manual pauses and full-auto continuation.

## Required final audio checks

Each incremental release enforces the following checks for its included audio; full coverage remains required for final project completion:

- 119 new spoken units: 110 cards, eight unique supplemental units and one exact ending excerpt.
- Complete source-matched mapping for 297 runtime routes. Journal playlists reuse exact paragraph audio and original recordings where applicable.
- Final MP3 encoding: 128 kbps, 24 kHz, mono. Every published asset is content-addressed and hash-verified.
- Every generated scene and reused journal paragraph must pass the `ending-context-v1` profile. Non-literal chunks require an independently confirmed final word, unchanged canonical speech, excluded disposable trailing context, no fades or rewritten speech, and at least 350 ms of final quiet. Natural articulation uses tempo 1.0.
- All fourteen `그러하였다.` replacements retain the approved reference-conditioned phrase and 1–2 seconds of preceding quiet. No sighs or canonical speech removal are allowed.
- Exact manifest/source equality, playlist content/order, file presence, byte counts, durations, original-recording immutability and actual browser MP3 decode/playback.

Automated ASR and waveform evidence are verification aids, not a claim of perfect pronunciation. Flagged or uncertain outputs require review or regeneration before publication.

## Publication gate

Reconcile the narration-only changes with the latest main branch, preserving concurrent viewport, HUD, pointer, laser and other gameplay changes. Run the full release and Dream/death regressions, narration tests and actual-audio checks on the exact integrated commit. Publish without a force push, then verify the remote main commit and successful GitHub Pages deployment for that same SHA. A staging pass alone is not a production-completion claim.

## Playback edge protection

Visible AudioContext interruption is a resumable hold, not a completed sentence or expired download. New and original recordings preserve position, block automatic continuation through interruption, and retain immediate manual Skip and bounded genuine-failure fallback. Resume-button intent is captured before global audio unlock so the same gesture cannot immediately pause recovered speech.

Audible narration transiently reduces background music to 20% of its current target. This leaves voice gain and saved settings unchanged, preserves other stronger ducking, and restores the latest music setting after narration stops. Original WAV and all currently published MP3 bytes remain unchanged by these runtime changes.

Decoder diagnostics compare independent FFmpeg and Chromium edge signals for all 130 published MP3s at 24 kHz and native sample rates. These checks establish signal preservation, not subjective phoneme completeness or physical-device playback. Source articulation and encoding gain reviews remain separate.
