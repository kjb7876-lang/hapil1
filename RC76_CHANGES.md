# RC76 changes

- Restored the developer-code form in Settings and wired it to the existing `777` progression handler.
- Made blink vectors cancel opposite keys, preserve diagonal input, and ignore automatic evade vectors outside an explicit full-auto dodge dispatch.
- Disabled the awakening-only autonomous blink while retaining the separate full-auto dodge controller.
- Preserved boss beam source crops, added short overlaps between connected laser segments, and replaced repeated panorama layers with a rounded owner-colored backbone.
- Fixed boss damage protection so rapid multi-hit skills share an 0.2-second burst budget; phase selection now follows current health between hits.
- Kept jellybean projectile tinting tied to each boss palette, including low-effects rendering.

## Verification

- 34 Node smoke and audit tests passed, including settings submission, direction-key blink, boss burst/phase gates, laser rendering, and boss-colored projectile tint.
- Browser tests were not run because this environment has no Playwright Chromium executable.
