# RC146 global body ash

## Effect contract

- Applies to hostile living actors with positive `maxHp`, including ordinary mobs, midbosses, bosses, Lucifer, echo children, and the hidden Persona. Friendly, visual-only, protected narrative and objective actors are excluded. The native roster currently has 197 ordinary, 42 midboss, and 28 boss templates.
- HP below 70% starts body-bound dark red cracks; below 40% adds bright seams; below 15% adds char. Healing above each threshold clears that stage, and full healing draws the unmodified original body.
- A confirmed native death creates one 0.82 second body-ash row. It flashes briefly, then erodes the original silhouette from the outside inward with ember pixels. Persona uses pale edges and white ash, including while awakened. Death remains tied to the admitted death transaction; no HP, hitbox, damage, phase, awakening, or resurrection rules change.
- Lucifer keeps its rotated winged source body, echo children keep their native size, and Persona keeps its directional/awakening body and aura. The status bar and warning cues render outside the body treatment.
- Mask preprocessing uses eight 192×192 alpha levels per distinct source and an LRU of ten deaths (under 24 MiB for masks). Stable ordinary bodies use a complete body-stage cache capped at 12 MiB. Animated, moving, attacking, staggered, boss and Persona bodies draw from the current pose. Caches reset on zone/state change or time rollback. There are no per-frame pixel scans.
- Public loader revisions: `assets/rc145/body-ash.js?v=14601`, `assets/index-v31526.js?v=44303`. No original raster asset was edited.

## Verification

- `tests/rc145-body-ash-browser.cjs`: actual mob and Persona source pixels, normal/awakened, HP stages, healing, erosion, stable-body cache reuse, bounded mask memory and zone cleanup in PC, portrait and landscape Chromium.
- `tests/rc146-global-body-browser.cjs`: 267 native templates plus native render/death paths for ordinary, midboss, boss, Lucifer, echo child and Persona, 24-actor draw burst × 60 frames in three viewports. Its HP and encounter fixtures are staged, not a natural full campaign.
- `tests/rc144-death-burn-browser.cjs`: native death admission, simultaneous deaths and Persona resurrection/final completion in three viewports.
- `qa/rc133/authorized-runtime-extension-5.json` chains exact modified runtime bytes from the published RC144 tree. The previous four exact extensions and historical pins remain immutable.

## Limits

The bounded browser checks do not establish physical-device performance or a natural full-campaign hidden-boss victory. A single native draw burst is useful for catching major regressions, but its timing is not a frame-rate guarantee.
