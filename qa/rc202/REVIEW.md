# RC202 Slayer attack art follow-up — not accepted

Base candidate: `25c0e5c625b265205662cd115a4a43522cab60e9` (RC201 camera and barrage preserved). Branch: `codex/rc202-slayer-attack-art`. This follow-up adds QA evidence only. No generated image is loaded by the game. No main or Pages update.

## Exact character and original references

The native declaration at `assets/index-v31526.js:25955` identifies `id: slayer`, name `악몽 사냥꾼 · 검사`, weapon 대검. The RC81 `sidePose` path at approximately line126390 requires that exact ID, an attack motion, and the existing hero-consistency left/right direction. `drawSide` samples four 640×640 cells at a fixed foot pivot (320,616), art height390. The exact original runtime assets are:

- `assets/hero-authored-v314rc81/slayer-side-right/sprite-sheet-alpha.png`, 2560×640 RGBA; SHA256 `f98f4fceadb1d4cf91e243302335694f453ee840db651e9c90ea35ac5fb091f2`.
- `assets/hero-authored-v314rc81/slayer-side-left/sprite-sheet-alpha.png`; size/hash and alpha measurements in `source-analysis.json`.

Root viewed the actual original right sheet, both prior generated RC201 candidates, and both new RC202 PNGs. The art agent also inspected the reference/candidates. Original right-sheet alpha ends at y615 in all four cells. Hair/body height still varies visually. The original prompt explicitly permits body height/torso lean/head bob variation; the new prompts prohibit it. The separate `base-source.webp` reaches the right image boundary with its sword and was not used as a complete sword-tip reference.

## New generation/edit scope

The official `image_gen.imagegen` tool was called exactly twice, with transparent_background=true. No dedicated image generation SKILL.md is present in the current catalog; no such skill was claimed as read. Full exact prompts and reference paths are saved in `imagegen-prompts.txt` and `imagegen-provenance.json`.

1. Generate only **two** poses: preparation and downward swing, using the original right sheet. Request1280×640, two equal square cells, ≥80px transparent margins, same camera/feet/head/torso, rigid unchanged sword length and thickness. Move arms/sword; prohibit crouch/rise, body pumping, blur and effects.
2. Edit that pair using the original right sheet plus first generated pair. Reiterate identical grounded body, head and camera, same rigid sword and larger margin. Do not generate recovery until the pair is accepted.

The tool returned **1774×887** (two887×887 cells) for both calls. Neither original output nor copied QA image was resized, retouched, enlarged, cropped or overwritten. Recovery was not generated because the pair failed acceptance.

| Candidate | Bytes | SHA256 | Result |
|---|---:|---|---|
| `rejected-two-frame.png` |925971|`eaf1f6399b7db5d39cd2b09c3b558fe171ec9a9bbfe54f3862c65006ab180c3a`|No clipping, but body/sword geometry and margins differ|
| `rejected-two-frame-final.png` |920755|`53c471fc59ced7ec68dcc1fa322e81dd558e87a088984a72a410c0ff71f60b81`|Still fails fixed body/sword and80px margins|

Generated working copies remain at `/workspace/rc202-slayer-art/slayer-attack-2frame.png` and `/workspace/rc202-slayer-art/slayer-attack-2frame-edited.png`. Prior RC201 candidates and original assets remain intact.

## Actual pixel checks versus visual estimates

`2frame-pixel-analysis.json` and `final-2frame-pixel-analysis.json` are independent read-only RGBA analysis. BBox maxima are **exclusive**; thresholds are byte alpha≥2 and alpha≥6 (~2%). No output image edits were performed.

Final alpha≥6 bounding boxes in local887px cells:

| Frame | BBox x1,y1,x2,y2 | Left/right margin | Lowest active Y |
|---|---|---|---:|
|Preparation|132,130,784,793|132/103px|792|
|Swing|32,286,837,793|32/50px|792|

Neither cell touches the seam or canvas border; sword clipping improved. The swing cell still fails the requested80px margin. Shared silhouette-bottom Y establishes aligned bottom pixels, not identical joint/body geometry.

Root and art-agent independent **visual estimates** place the preparation/swing foot midpoints at local x≈495–498 versus320–322, y≈791–792. Hair top moves down about10–18px. The torso leans and body height changes. A translation could align foot X, but would not repair body height or sword shape, so none was applied.

Sword landmarks are compared in `landmark-comparison.json`: tip, guard, hand grip, both boots and head. These are approximate manual landmarks (roughly±20px), not exact segmented anatomy. Independent estimates put tip→guard length at≈313px for preparation versus≈349–363px for swing, about12–16% longer. Root's alpha cross-section along the manually estimated blade-midpoint normal samples61px versus67px; this is an indicative local pixel width, not a calibrated thickness measurement. The art reviewer also found different thickness visually. Thus neither the rigid sword nor the fixed-body requirement is established. No per-frame scaling was used to conceal it.

## Outcome and validation limits

**Attack art remains incomplete.** The two-frame pair was improved enough to remove clipping but still changes relative geometry despite the reference/edit constraints. This is an observed quality failure in these two tool outputs, not a generation refusal, permission failure or proof that all future image generation is impossible. No further uncontrolled retries were made. Preparation→swing→recovery is not delivered as an accepted animation.

All protected runtime files (`assets`, `audio`, `data`, `index.html`) remain byte-identical to25c0; `git diff --exit-code 25c0e5c625b265205662cd115a4a43522cab60e9 -- assets audio data index.html` passed. RC201's37 CPU test files and3349-file preservation proof remain inherited; they were not rerun or represented as new RC202 animation verification. No browser, natural battle, FPS animation, GPU or device test was performed for the rejected art. No image or renderer integration was made, and main/Pages stay at their prior version.
