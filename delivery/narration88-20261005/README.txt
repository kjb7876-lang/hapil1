HAPIL frozen88 minimal integration delta

This ZIP contains exactly 13 repository paths: 12 new MP3s and assets/story-narration/v1/manifest.json. Everything else is validation/instructions and must stay outside the repository overlay. No runtime JS, CSS, HTML or workflow is included.

MANDATORY BEFORE INTEGRATION
Extract to a separate directory, inspect latest main, and run:
  python3 -B validate_delta.py --repo-root /absolute/path/to/repo --decode

The validator refuses any narration baseline except exact public86 manifest SHA-256:
2204f5c49e77ceda2cfb6411a2c0a8bd4238d52cfe44133928a642594afa4006
It also verifies all 283 existing active/retired MP3 files and both original WAV recordings. If any baseline hash is wrong or a required original file is missing, STOP. Reconcile latest main or obtain the full self-contained integration package; never bypass these checks.

AFTER PARENT-AUTHORIZED LOCAL INTEGRATION
Copy only delta-contract.json.repositoryDeltaPaths. Add the 12 content-addressed MP3s first, preserving every existing file. Replace the manifest last. Keep the two old dist03 MP3s as retired assets; do not delete or replace their bytes. Preserve original audio1/2, original ep1b06b.pre, and all unrelated latest-main changes. Then run:
  python3 -B validate_delta.py --repo-root /absolute/path/to/repo --verify-applied --decode
Both validator modes are read-only. They do not apply files, publish, run a model or access the network. Latest-main player/decoder-edge/manifest tests and any authorized publication remain the repository owner's separate steps.

RESULT
88 accepted canonical scenes, 279 active MP3 mappings, 16 retained retired MP3s, 199 runtime routes. Public86's protected 85 scene/binding entries remain byte-identical. Only dist03 scene/paragraph0 change; paragraph1 remains unchanged. Hando/Kair06 add 10 selected mappings. All 19 historical audibility findings remain preserved. No new acoustic/listening acceptance is claimed.

DURABLE SOURCE
Exact checkpoint 794 receipt: proof/checkpoint 794-receipt.json
Checkpoint ID: 850910b72c8542b69cd940bb5878f24e
Library ID: libfile_01c2962ed12c81919a22ca77b4fc9c4c
Archive SHA-256: 8d2d5feec196302ea6d68497ba08a114ab238a31ef42be30022c06e4eb024e06
The receipt backs the included frozen verification/seal and their exact manifest/bindings/copy-plan identities. Historical QA dependencies are recoverable through that backup and its preserved source-union aliases. The full package has independently passed decoding of all 295 MP3s and both original WAVs; its report is included.

The existing 86 packager was reused locally with only its output directory changed. Use this prebuilt delta in the consumer environment; the old deep packager needs omitted producer QA dependencies.
