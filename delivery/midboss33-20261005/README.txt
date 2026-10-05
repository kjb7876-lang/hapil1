HAPIL remaining media: staging-only delivery, 2026-10-05

This branch adds only new delivery directories. It does not modify main, live narration, runtime code, workflows, Pages, or existing files. Integration and publication belong to the authorized main-code owner.

NARRATION
The sibling ../narration88-20261005 directory preserves every file from the verified minimal frozen88 delta ZIP, with only the outer HAPIL-frozen88-delta wrapper removed. It contains 12 MP3s, the proposed manifest, exact public86 baseline, read-only baseline/post-integration validator, instructions, contract, inventory, and all checkpoint794 proof files. Read its README.txt and run validate_delta.py against freshly fetched main with --decode before any overlay. Only copy the 13 repositoryDeltaPaths after baseline success. Preserve existing audio/original WAVs and retired files; replace the live manifest last, then run --verify-applied --decode. Frozen88 has 88 qualified scenes versus 86 on the pinned public baseline. Held/speculative scenes are not promoted. This staging branch does not itself apply the delta or claim new listening acceptance.

MIDBOSS ART
33 original identity atlases, 99 genuinely articulated poses: 11 episode atlases and 22 core atlases. identity-map.json selects their exact original filenames, SHA-256, route IDs, Korean names and manifest locations. The episode manifest is the exact source manifest. The core manifest keeps the essential original mapping, source hashes, dimensions, rects, original pivots, QA caveats, aliases, and same-identity fission rules unchanged; generation prompts, local producer paths, rejected generations and reference-image extras are excluded. No PNG pixels are edited or resampled.

Use the measured sourceRect (episode) or cellBounds (core); never assume equal thirds. Episode pivots use sourceRect-local coordinates. Core provisionalPivot uses full-atlas coordinates. Subtract the cell origin when converting core pivots to local coordinates. Common anatomical scale/pivot and playback alignment still require owner verification; source manifests explicitly mark these anchors as suggested/provisional, not certified runtime alignment. Story uses two same-identity fission copies and Dream uses three, according to the current mode and canonical map. Preserve aliases u205-mid -> u201-mid and u204-mid -> u202-mid. Do not introduce a heterogeneous partner.

MANDATORY EP1A10 PRECEDENCE
The older episode/mb-ep1a10-atlas.png is retained solely as exact historical source coverage. For integration, the newer ep1a10 art on assets-only/story10-cycle-20261005, commit 360705f0, takes precedence. Consume that branch's verified ep1a10 selection/mapping; do not silently replace it with the older atlas included here. Resolve the selection in the owner branch, without changing either staging branch.

SOURCE ARCHIVES
tts88-consumer-transfer-20261005/HAPIL-frozen88-delta-20261005.zip | 5154619 bytes | SHA-256 53a7bd293420ec667cc15d4dac9396d0f3029165bf26d0218322bc20721ccdea
output/episode_midboss/HAPIL_episode_midboss_11x3_imagegen.zip | 22104532 bytes | SHA-256 1c8e55b8f77489328d77a005525ddee5263b810816646eb6e6076682385a0eec
core_midboss_all22.zip | 33425675 bytes | SHA-256 da20b92342d34c79c699aa95a4e461bc780d8188a1a63023c34c4627cc3d6112
