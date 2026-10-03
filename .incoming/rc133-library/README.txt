HAPIL RC133 media transfer

This branch only stages user-supplied source media. It does not register assets in the game, modify game source, or publish GitHub Pages.

Contents: 39 original audio files in a media-only ZIP split into five ordered parts, six original PNG images, and manifest.json with original filenames, sizes, SHA-256 hashes and measured metadata. Original audio and image bytes were not edited. The archive differs from the private analysis bundle because local paths, private Library references and analysis scripts were excluded.

Read manifest.json. Concatenate audioArchive.parts in the listed order into audio39-originals.zip. Verify each part SHA-256 and the complete archive SHA-256 before extracting. The full archive is 35,778,012 bytes with SHA-256 0f581c68485b8020e1dae9966f917ccc822ff9342d4f77d8b19fe2d4d32c625d. Extracted audio paths are under originals/. Validate every extracted file against its manifest row. PNG image paths are relative to the repository root and retain the requested transfer IDs; original PNG filenames are recorded separately.

Audio metadata describes decoded measurements and filename-supported recommendations, not a listening certification or verified speaker gender. Inspect the six images and determine suitable crops, event mapping, gains and loops before game integration. The image bytes include both background references and sprite/effect sheets; do not assume each is directly usable as a single runtime sprite.
