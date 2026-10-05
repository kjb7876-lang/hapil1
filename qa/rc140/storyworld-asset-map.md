# StoryWorld asset correspondence

The route-level inventory is [storyworld-asset-map.json](storyworld-asset-map.json). It is generated from the shipped runtime catalogs, then checks that every referenced local asset exists and records its SHA-256 and byte size.

## Coverage

- 55 region IDs, with the source map, selected map, runtime-installed map, display decision, and floor center.
- 259 route actors, including body sprite, action and phase sprite paths, phase labels/counts, attack patterns, and skill/projectile asset references when the runtime exposes them.
- 33 authored midboss identities across 35 routes, with motion atlas hashes, source rectangles, pivots, and expected fission counts.
- 26 boss projectile-art source cells with names, source rectangles, alpha cores, and pixel hashes.
- 61 canonical story records and 199 narration scenes with audio paths, durations, and hashes.
- 414 referenced files checked; the generator fails if any are missing or if the map installer selects a path other than the catalog's active map.

The 13 new audio originals are preserved in `delivery/additional-audio13-20261005/`. The mapping marks them unassigned and runtime-integrated false because their handoff metadata records no listening audition or event-suitability review. The original files were not altered.

The inventory is a source-to-runtime correspondence audit. It does not claim that every listed image has been visually re-reviewed or that audio semantics have been auditioned.

Regenerate with:

```sh
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/path/to/node_modules node tools/rc140-storyworld-asset-map.cjs
```
