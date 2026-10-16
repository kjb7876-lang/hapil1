# RC223 transformation artwork correction

The PC and landscape-mobile film layout already uses `object-fit: contain` with an 8% horizontal and 5% top inset. Its source artwork nevertheless has cropped content: the old masked archangel has visible alpha at the top image edge, and the old Lucifer has visible alpha at the bottom edge. The original Lucifer also has visibly truncated left feathers. A layout-only test cannot establish that the source image contains the complete character.

Two new transparent cutscene variants complete the wing tips and retain the recognizable mask/unmasked identities, six wings, halo and ivory/crimson costume. They are generated edits of the existing originals. Existing original files and all combat atlas images remain byte-identical; only the masked/unmasked transformation scene uses the new variants. The earlier guardian-power scene continues to use the original archangel plus sword-and-shield guardian silhouettes.

| Variant | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/rc223/archangel-transform-contained.webp` | 640044 | `a642c29e883072f343854d474416503f32c41c0c853ec1f484170932e8a83fd5` |
| `assets/rc223/lucifer-transform-contained.webp` | 750704 | `534242f9d7145c53b64b47389febde5123b18dd3e2da6239063497594102cb6f` |

Both decode to 1254×1254 with transparency. The image-generation PNG originals are retained in the working evidence directory `/workspace/generated_images`; shipping WebP is an encoded derivative. No runtime image generation or paid provider is introduced.

`tests/rc223-transform-art-unit.cjs` decodes actual RGBA pixels through ffmpeg, checks a minimum 1% transparent margin around the alpha≥16 silhouette, verifies original/new file hashes and actual scene/cache wiring, and confirms that the old clipped files fail the same margin requirement. Alpha values below 16 are excluded solely as barely visible edge noise; both old negative comparisons fail at this same threshold. The browser film fixture separately checks the decoded new artwork, native image source, and full layout on PC and an emulated landscape phone. New exact-SHA Chrome results are required before reporting those browser checks as passed. Physical phones and human natural-story progression remain unverified.
