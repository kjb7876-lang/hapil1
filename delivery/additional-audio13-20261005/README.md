# HAPIL additional original audio: 13 files

The 13 distinct user-uploaded originals remain byte-identical under `originals/`, separate from narration88 and the earlier 39-original collection. Ten static-gain candidate derivatives are in `processed/`; three sources that may contain speech remain without derivatives. Runtime cue mapping remains off pending semantic listening review.

## Identity and integrity

- 13 originals, 13,914,248 bytes. Filenames, Library IDs and sizes match the pinned source list.
- SHA256SUMS.txt contains local-byte SHA256 baselines. Verify from this directory with sha256sum -c SHA256SUMS.txt.
- GIT_BLOBS.tsv contains Git blob SHA1 and byte sizes, crosschecked with git hash-object.
- No independent upstream source checksums were supplied. These hashes verify reproducible byte transfers, not an independent source checksum match.
- manifest.json preserves original identity, purpose, measured audio information and cautions, without private producer paths or transfer credentials.
- processing-report.json verifies the 13 originals against their SHA256/size records, verifies every candidate decode, and records output sample/true peaks, gains, and menu-candidate leading-silence trim. All ten derivatives pass at <= -1.5 dBFS sample peak and <= -1.0 dBTP true peak. No limiter, declipping, source-repair, or runtime event mapping is claimed.
- No exact-byte duplicates were found within these 13 or against the prior 39 manifest hash records; the prior 39 bytes were not re-read for that comparison.

## Review before playback

All 13 original streams are 48 kHz stereo; 10 WAVs are PCM s16le and 3 files are MP3. Eight clips have measured true peaks above 0 dBTP, highest +1.58 dBTP. The ten candidate derivatives all decode and pass the stated headroom targets. The menu-navigation source has 1.63 seconds of measured leading quiet; its candidate trims 1.595 seconds and retains 35 ms preroll. That verifies candidate onset preparation only; runtime click-to-audio latency remains untested because no menu cue is mapped.

No listening audition, voice-gender verification, transcription, language identification, game-event suitability or looping verification was performed. The two female-labeled combat files and ambiguous demonic-declaration file remain held without derivatives. Filename labels and spectrogram shape are not semantic evidence. Static attenuation provides output headroom but does not repair source-clipped samples. The three held male-voice files in the earlier 39-file set are separate files; this handoff does not change their status.

Source list: https://github.com/kjb7876-lang/hapil1/blob/9a80f8aaf4a0dba1c90270f665e1535294e3822a/qa/rc133/pending-media.json
