# RC140 story-cycle art integration

This integration consumes the verified art from `assets-only/story10-cycle-20261005` (`360705f0`) and `assets-only/remaining-media-20261005` (`7c9030ca`). The 33 active midboss identities use 99 measured poses. The historical `mb-ep1a10-atlas.png` from the second handoff is excluded; its slot uses the newer ep1a10 atlas from the first handoff.

- `story-cycle-midboss-index.json` records the selected source rectangles, pivots, file hashes, identity routes, and aliases. Episode pivots stay source-rectangle local. Core pivots are converted from full-atlas to cell-local coordinates. The core source labels those pivots provisional; the browser draw checks verify anchoring and cropping, not anatomical author certification.
- `story-cycle-motions/` contains the 32 active atlases from the second handoff; the newer ep1a10 atlas remains in `assets/generated-story10-cycle-20261005/`.
- `story-cycle-mob-data.js` wires the ep1a10 white-mask orderly's exact unequal source rectangles into the existing native attack/recovery clock. It also resolves wave-two IDs to the same source identity.
- `story-cycle-runtime.js` wires the blue-executor's three standalone poses and the four murder-story portraits. Boss hitbox and torso targeting use the existing bounded humanoid profile.
- The hospital-denial map is assigned to ep1a10. The prior rain-road map is retained at murder01, where its road/crosswalk scene fits the route.

The narration88 handoff applies only its 12 accepted MP3s and proposed manifest under `assets/story-narration/v1/`; its read-only validator confirmed the exact public86 baseline before copying and the 88-scene result after copying. No old audio was removed or overwritten.
