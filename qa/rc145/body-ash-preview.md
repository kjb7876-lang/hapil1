# RC145 body ash preview (historical scope)

RC146 extends this preview to every hostile rank. See `qa/rc146/global-body-ash.md` for the current effect contract and verification.

Local preview branch based on public `51bcd427017e88350b1c5c02e4dd7dce6bad1f8f`. This branch is not published to main or Pages.

## Scope

- `dist01-sp1` and `inner-evil-rc133` only. Every other enemy keeps RC144 visuals.
- HP below 70% adds body-contained dark red cracks; below 40% adds bright seams and short flames; below 15% adds char. Healing to full clears the treatment.
- On admitted death, the original body flashes for 0.1 seconds, then a cached alpha mask erodes it over 0.82 seconds. Persona uses pale rim and white ash. Source sprites, combat hitboxes, HP and death transactions are unchanged.
- Persona draws its existing eight-way source art through the media registry so the scoped body mask follows the same original sprite. Existing awakening aura remains behind the body.

## Verification

- `tests/rc145-body-ash-browser.cjs`: PC, portrait and landscape Chromium pass. For the mob, Persona normal and Persona awakened frame, 100% and healed bodies match, wound pixels stay inside the original alpha silhouette, the death silhouette shrinks, and each source builds its mask once. No JavaScript or HTTP errors.
- `tests/rc144-death-burn-browser.cjs`: PC, portrait and landscape pass. Native mob/midboss/boss death admission, simultaneous deaths, Persona one-use revival and final completion remain valid.
- Native renderer staged screenshots are in `/tmp/rc145-preview-captures/`. Isolated actual-source browser previews are in `/tmp/rc145-body-ash/`. These set HP and the encounter for visual inspection; they are not a natural Dream campaign completion.
- Six-target synthetic draw on Chromium with CPU throttle ×4: 60 frames, median 4.4 ms and p95 14.5 ms for the six effects alone. This is a bounded module measurement, not a whole-game frame-rate claim. No per-frame pixel readback occurs; at most four source masks are cached.

## Review limits

The native final-boss death transaction immediately releases the Dream arena, so its dissolution appears briefly over the next scene. The isolated art capture makes the ash edge easier to inspect. Physical-device timing and a natural full-campaign hidden-boss victory are not part of this preview.
