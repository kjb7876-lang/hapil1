# HAPIL additional original audio: 13 files

Asset-only handoff of the distinct additional 13 user-uploaded originals, separate from narration88 and the earlier 39-original collection. Original filenames and bytes are preserved. No runtime cue mappings, audio conversion, editing, main-branch changes, merge or deployment are part of this staging handoff.

## Identity and integrity

- 13 originals, 13,914,248 bytes. Filenames, Library IDs and sizes match the pinned source list.
- SHA256SUMS.txt contains local-byte SHA256 baselines. Verify from this directory with sha256sum -c SHA256SUMS.txt.
- GIT_BLOBS.tsv contains Git blob SHA1 and byte sizes, crosschecked with git hash-object.
- No independent upstream source checksums were supplied. These hashes verify reproducible byte transfers, not an independent source checksum match.
- manifest.json preserves original identity, purpose, measured audio information and cautions, without private producer paths or transfer credentials.
- No exact-byte duplicates were found within these 13 or against the prior 39 manifest hash records; the prior 39 bytes were not re-read for that comparison.

## Review before playback

All 13 prior full audio decodes passed. All streams are 48 kHz stereo; 10 WAVs are PCM s16le and 3 files are MP3. Eight clips have measured true peaks above 0 dBTP, highest +1.58 dBTP. Review headroom and verified derivatives before mixing. The menu-navigation filename has 1.63 seconds of measured leading quiet, so review before using the untrimmed original for immediate feedback.

No listening audition, voice-gender verification, transcription, language identification, game-event suitability or looping verification was performed. Filename labels are not semantic evidence. Measured rail samples and intersample overs indicate headroom concerns, not perceived clipping or distortion. The three held male-voice files in the earlier 39-file set are separate files; this handoff does not change their status.

Source list: https://github.com/kjb7876-lang/hapil1/blob/9a80f8aaf4a0dba1c90270f665e1535294e3822a/qa/rc133/pending-media.json
