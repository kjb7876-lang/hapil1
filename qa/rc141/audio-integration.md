# RC141 supplied audio integration

This follow-up integrates seven processed, nonvoice SFX candidates into existing audio events. Originals remain unchanged. Each derivative has a source and output SHA-256 entry in `delivery/additional-audio13-20261005/processing-report.json`; runtime gain is 1 because the candidate files already carry their measured attenuation.

| Candidate | Runtime event |
| --- | --- |
| Short game menu navigation | Enabled title/menu button clicks; single voice, 380 ms gate, 45% of the user's SFX volume; stopped when gameplay begins, the page is hidden, or it unloads |
| Time manipulation awakening | Seoha's existing awakening feedback |
| Time tick-tack 1, 2, 3 | Kairo enemy attack sound for phases 1, 2, and 3 |
| Tree weapon attack | Replaces only Hwando's basic A attack sound |
| Resonance energy gain | Accepted defensive contact that raises resonance through 100 |

Menu audio follows `mongse_settings_v1` mute and SFX-volume settings. Combat playback remains under the existing combat audio manager's mute, cooldown, and two-effect cap. The resonance sound is keyed to the native combat transaction's `resonanceAwarded` crossing the threshold; it does not play merely because a HUD value is full.

## Verification and limits

`tests/rc141-additional-audio-browser.cjs` exercises a real title-menu click, the mode and phase route selectors, native awakening feedback, a staged parry transaction that crosses resonance 100, manager voice limits, mute settings, and browser decoding of all seven files. The combat transactions in this test are staged fixtures, not evidence of a natural campaign clear.

The uploaded sounds were not semantically auditioned. The runtime assignments use their supplied filenames and requested event descriptions. Three voice-like originals remain unprocessed and unassigned; the `ups` candidate and both long music candidates also remain unassigned. The music candidates have no verified loop points. `processing-report.json` records the original-file preservation and loudness/headroom measurements.
