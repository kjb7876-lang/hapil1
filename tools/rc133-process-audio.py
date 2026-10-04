#!/usr/bin/env python3
"""Create conservative playback derivatives and provenance QA for RC133 audio.

The original files remain byte-for-byte copies in audio/rc133/originals. This
script does not assign runtime events, audition audio, or infer voice gender.
It uses FFmpeg/ffprobe and the staging manifest's filename/signal metadata.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_STAGING_SOURCE = Path("/tmp/hapil-audio39-extracted/originals")
DEFAULT_STAGING_MANIFEST = Path("/workspace/hapil1/.incoming/rc133-library/manifest.json")
DEFAULT_AUDIO_ROOT = ROOT / "audio/rc133"
DEFAULT_QA_PATH = ROOT / "qa/rc133/audio-processing.json"

VOICE_CATEGORY = "candidate_combat_vocal_unassigned"
CATEGORY_DIRS = {
    "candidate_magical_blink": "blink",
    "candidate_melee_impact": "melee-impact",
    "candidate_parry_feedback": "parry",
    "candidate_dodge_bass_effect": "dodge",
    "candidate_enemy_laser_charge": "enemy-charge",
    "candidate_enemy_energy_attack": "enemy-energy",
    "candidate_enemy_heavy_attack": "enemy-heavy",
    "candidate_enemy_rage_activation": "enemy-rage",
    "candidate_enemy_roar": "enemy-roar",
    "candidate_void_absorption": "enemy-void",
    "candidate_illusion_creation": "illusion",
    "candidate_awakening_or_enemy_phase": "awakening-phase",
    "combat_bgm": "bgm",
}

SFX_BITRATE = "96k"
BGM_BITRATE = "160k"
SFX_SAMPLE_CAP_DBFS = -1.5
SFX_TRUE_PEAK_CAP_DBTP = -1.0
# Keep a little extra room beyond the requested maxima for lossy decode paths.
PEAK_RENDER_TARGET_DBFS = -1.8
TRUE_PEAK_RENDER_TARGET_DBTP = -1.3
PREROLL_SECONDS = 0.035
SFX_FADE_IN_SECONDS = 0.008
SFX_FADE_OUT_SECONDS = 0.120
BGM_FADE_IN_SECONDS = 4.0
BGM_FADE_OUT_SECONDS = 4.0
DC_HIGH_PASS_HZ = 20


def run(cmd: list[str], *, capture: bool = False) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            cmd,
            check=True,
            text=True,
            stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
            stderr=subprocess.PIPE if capture else subprocess.PIPE,
        )
    except FileNotFoundError as exc:
        raise RuntimeError(f"Required command not found: {cmd[0]}") from exc
    except subprocess.CalledProcessError as exc:
        tail = (exc.stderr or "")[-6000:]
        raise RuntimeError(f"Command failed ({exc.returncode}): {' '.join(cmd)}\n{tail}") from exc


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_source_records(manifest_path: Path, existing_qa_path: Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if manifest_path.is_file():
        raw = manifest_path.read_bytes()
        manifest = json.loads(raw)
        audio = [record for record in manifest.get("files", []) if record.get("kind") == "audio"]
        if not audio:
            raise RuntimeError(f"No audio records found in manifest: {manifest_path}")
        return audio, {
            "source": str(manifest_path),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "baseCommit": manifest.get("baseCommit"),
            "purpose": manifest.get("purpose"),
            "runtimeIntegrated": manifest.get("runtimeIntegrated"),
        }

    # The generated QA record carries the manifest's source measurements so a
    # rerun can still be reproduced after transient staging files are removed.
    if existing_qa_path.is_file():
        qa = json.loads(existing_qa_path.read_text(encoding="utf-8"))
        records = []
        for old in qa.get("originalRecords", []):
            records.append({
                "originalFilename": old["originalFilename"],
                "path": f"originals/{old['originalFilename']}",
                "kind": "audio",
                "bytes": old["originalBytes"],
                "sha256": old["originalSha256"],
                "measurements": old["sourceMeasurements"],
                "archivePath": old.get("archivePath"),
            })
        if records:
            return records, {
                "source": "audio-processing.json embedded source measurements",
                "sha256": qa.get("sourceManifest", {}).get("sha256"),
                "baseCommit": qa.get("sourceManifest", {}).get("baseCommit"),
                "purpose": qa.get("sourceManifest", {}).get("purpose"),
                "runtimeIntegrated": qa.get("sourceManifest", {}).get("runtimeIntegrated"),
                "reusedEmbeddedMeasurements": True,
            }

    raise RuntimeError(
        f"No source manifest found at {manifest_path}, and no prior QA record at {existing_qa_path}. "
        "Pass --manifest or restore audio-processing.json."
    )


def copy_and_verify_originals(records: list[dict[str, Any]], source_root: Path, originals_root: Path) -> None:
    originals_root.mkdir(parents=True, exist_ok=True)
    expected_names = set()
    for record in records:
        name = record["originalFilename"]
        expected_names.add(name)
        source = source_root / name
        if not source.is_file():
            raise RuntimeError(f"Missing source original: {source}")
        actual_hash = sha256_file(source)
        actual_bytes = source.stat().st_size
        if actual_hash != record["sha256"] or actual_bytes != record["bytes"]:
            raise RuntimeError(f"Source does not match manifest for {name}: {actual_bytes} bytes, {actual_hash}")
        target = originals_root / name
        if target.exists():
            if target.stat().st_size != actual_bytes or sha256_file(target) != actual_hash:
                raise RuntimeError(f"Refusing to overwrite different preserved original: {target}")
        else:
            shutil.copy2(source, target)
        if target.stat().st_size != actual_bytes or sha256_file(target) != actual_hash:
            raise RuntimeError(f"Byte-preservation verification failed for {target}")
    existing = {path.name for path in originals_root.iterdir() if path.is_file()}
    extra = sorted(existing - expected_names)
    if extra:
        raise RuntimeError(f"Unexpected files in originals directory: {extra}")


def safe_stem(name: str, digest: str) -> str:
    stem = Path(name).stem
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._-") or "audio"
    return f"{stem}-{digest[:8]}"


def probe_audio(path: Path) -> dict[str, Any]:
    result = run([
        "ffprobe", "-v", "error", "-select_streams", "a:0",
        "-show_entries", "stream=codec_name,sample_rate,channels,bit_rate",
        "-show_entries", "format=duration,size,bit_rate", "-of", "json", str(path),
    ], capture=True)
    data = json.loads(result.stdout)
    streams = data.get("streams", [])
    if not streams:
        raise RuntimeError(f"No decodable audio stream: {path}")
    stream = streams[0]
    fmt = data.get("format", {})
    return {
        "codec_name": stream.get("codec_name"),
        "sample_rate_hz": int(stream["sample_rate"]) if stream.get("sample_rate") else None,
        "channels": int(stream["channels"]) if stream.get("channels") else None,
        "stream_bitrate_bps": int(stream["bit_rate"]) if stream.get("bit_rate", "N/A") not in (None, "N/A") else None,
        "duration_seconds": float(fmt["duration"]) if fmt.get("duration") else None,
        "file_bytes": int(fmt["size"]) if fmt.get("size") else path.stat().st_size,
        "container_bitrate_bps": int(fmt["bit_rate"]) if fmt.get("bit_rate", "N/A") not in (None, "N/A") else None,
    }


def measure_decoded_peaks(path: Path) -> dict[str, float]:
    # volumedetect reports the decoded sample peak; ebur128's true-peak mode
    # measures inter-sample peaks. Both inspect the final lossy-decoded output.
    result = run([
        "ffmpeg", "-hide_banner", "-v", "info", "-nostats", "-i", str(path),
        "-map", "0:a:0", "-af", "volumedetect,ebur128=peak=true:framelog=quiet",
        "-f", "null", "-",
    ], capture=True)
    log = result.stderr
    sample_match = re.search(r"max_volume:\s*(-?\d+(?:\.\d+)?)\s*dB", log)
    true_match = re.search(r"True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS", log, re.S)
    lufs_match = re.search(r"Integrated loudness:\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", log, re.S)
    if not sample_match or not true_match:
        raise RuntimeError(f"Could not parse decoded peak measurements for {path}:\n{log[-4000:]}")
    return {
        "decoded_sample_peak_dbfs": float(sample_match.group(1)),
        "decoded_true_peak_dbtp": float(true_match.group(1)),
        "decoded_integrated_lufs": float(lufs_match.group(1)) if lufs_match else math.nan,
    }


def filter_for(gain_db: float, trim_seconds: float, duration_seconds: float, fade_in: float, fade_out: float) -> str:
    filters = [f"highpass=f={DC_HIGH_PASS_HZ}:p=2"]
    if trim_seconds > 0.0005:
        filters.append(f"atrim=start={trim_seconds:.6f}")
        filters.append("asetpts=PTS-STARTPTS")
    filters.append(f"volume={gain_db:.5f}dB")
    if fade_in > 0:
        filters.append(f"afade=t=in:st=0:d={fade_in:.3f}:curve=tri")
    if fade_out > 0:
        end_start = max(0.0, duration_seconds - fade_out)
        filters.append(f"afade=t=out:st={end_start:.6f}:d={fade_out:.3f}:curve=tri")
    return ",".join(filters)


def render_one(
    source: Path,
    target: Path,
    *,
    category: str,
    sample_rate: int,
    channels: int,
    gain_db: float,
    trim_seconds: float,
    duration_seconds: float,
    fade_in: float,
    fade_out: float,
) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    audio_filter = filter_for(gain_db, trim_seconds, duration_seconds, fade_in, fade_out)
    common = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
        "-map", "0:a:0", "-vn", "-map_metadata", "-1", "-af", audio_filter,
        "-ar", str(sample_rate), "-ac", str(channels),
    ]
    if category == "combat_bgm":
        command = common + ["-c:a", "libmp3lame", "-b:a", BGM_BITRATE, "-write_xing", "1", str(target)]
    else:
        command = common + [
            "-c:a", "libopus", "-b:a", SFX_BITRATE, "-vbr", "on",
            "-compression_level", "10", "-application", "audio", str(target),
        ]
    run(command)


def process_unique_record(
    source: Path,
    target: Path,
    record: dict[str, Any],
    output_group: list[dict[str, Any]],
) -> dict[str, Any]:
    measurements = record["measurements"]
    category = measurements.get("category")
    if category not in CATEGORY_DIRS:
        raise RuntimeError(f"No processing category configured for {category!r} ({record['originalFilename']})")
    is_bgm = category == "combat_bgm"
    source_duration = float(measurements["duration_seconds"])
    leading_quiet = float(measurements.get("leading_quiet_below_minus50dbfs_seconds", 0.0) or 0.0)
    preroll = min(PREROLL_SECONDS, max(0.025, PREROLL_SECONDS))
    trim_seconds = max(0.0, leading_quiet - preroll)
    trim_seconds = min(trim_seconds, max(0.0, source_duration - 0.5))
    processed_duration = max(0.1, source_duration - trim_seconds)
    fade_in = BGM_FADE_IN_SECONDS if is_bgm else SFX_FADE_IN_SECONDS
    fade_out = BGM_FADE_OUT_SECONDS if is_bgm else SFX_FADE_OUT_SECONDS
    fade_in = min(fade_in, processed_duration / 3.0)
    fade_out = min(fade_out, processed_duration / 3.0)
    stream = probe_audio(source)
    sample_rate = int(stream["sample_rate_hz"] or 48000)
    channels = int(stream["channels"] or 2)
    recommended_gain = float(measurements["recommended_source_static_gain_db"])
    extra_peak_attenuation = 0.0
    peak_result: dict[str, float] | None = None

    for attempt in range(1, 7):
        applied_gain = recommended_gain + extra_peak_attenuation
        render_one(
            source, target, category=category, sample_rate=sample_rate, channels=channels,
            gain_db=applied_gain, trim_seconds=trim_seconds, duration_seconds=processed_duration,
            fade_in=fade_in, fade_out=fade_out,
        )
        peak_result = measure_decoded_peaks(target)
        sample_peak = peak_result["decoded_sample_peak_dbfs"]
        true_peak = peak_result["decoded_true_peak_dbtp"]
        if sample_peak <= PEAK_RENDER_TARGET_DBFS and true_peak <= TRUE_PEAK_RENDER_TARGET_DBTP:
            break
        extra_peak_attenuation += min(
            PEAK_RENDER_TARGET_DBFS - sample_peak,
            TRUE_PEAK_RENDER_TARGET_DBTP - true_peak,
        ) - 0.10
    else:
        raise RuntimeError(f"Could not render under peak limits after 6 static-gain passes: {target}")

    assert peak_result is not None
    sample_peak = peak_result["decoded_sample_peak_dbfs"]
    true_peak = peak_result["decoded_true_peak_dbtp"]
    passed = sample_peak <= SFX_SAMPLE_CAP_DBFS and true_peak <= SFX_TRUE_PEAK_CAP_DBTP
    if not passed:
        raise RuntimeError(f"Peak QA failed for {target}: sample={sample_peak}, true={true_peak}")

    probe = probe_audio(target)
    digest = sha256_file(target)
    return {
        "derivedPath": target.relative_to(ROOT).as_posix(),
        "derivedSha256": digest,
        "derivedBytes": target.stat().st_size,
        "derivedFormat": "MP3" if is_bgm else "OGG Opus",
        "derivedProbe": probe,
        "decodedOutputMeasurements": peak_result,
        "peakLimits": {
            "requiredSamplePeakMaximumDbfs": SFX_SAMPLE_CAP_DBFS,
            "requiredTruePeakMaximumDbtp": SFX_TRUE_PEAK_CAP_DBTP,
            "renderSafetyTargetSamplePeakDbfs": PEAK_RENDER_TARGET_DBFS,
            "renderSafetyTargetTruePeakDbtp": TRUE_PEAK_RENDER_TARGET_DBTP,
            "passed": passed,
        },
        "processingParameters": {
            "codec": "libmp3lame CBR" if is_bgm else "libopus VBR",
            "targetBitrate": BGM_BITRATE if is_bgm else SFX_BITRATE,
            "outputSampleRateHz": sample_rate,
            "outputChannels": channels,
            "highpassHz": DC_HIGH_PASS_HZ,
            "highpassOrder": 2,
            "highpassApplied": True,
            "measuredLeadingQuietBelowMinus50DbfsSeconds": leading_quiet,
            "trimmedLeadingQuietSeconds": round(trim_seconds, 6),
            "preservedPrerollSeconds": round(max(0.0, leading_quiet - trim_seconds), 6),
            "fadeInSeconds": round(fade_in, 3),
            "fadeOutSeconds": round(fade_out, 3),
            "fadePolicy": "long transition fades for BGM" if is_bgm else "short attack-preserving one-shot fade",
            "recommendedSourceStaticGainDb": recommended_gain,
            "additionalStaticPeakAttenuationDb": round(extra_peak_attenuation, 5),
            "totalAppliedStaticGainDb": round(recommended_gain + extra_peak_attenuation, 5),
            "dynamicLimiterUsed": False,
            "normalizationUsed": False,
            "sourceClippingRepairClaimed": False,
            "filterChain": filter_for(recommended_gain + extra_peak_attenuation, trim_seconds, processed_duration, fade_in, fade_out),
            "peakMeasurementMethod": "FFmpeg volumedetect and ebur128 true-peak scan of decoded final file",
            "peakRenderPasses": attempt,
        },
        "candidateEventAndLimits": {
            "candidateCategory": category,
            "categoryConfidence": measurements.get("category_confidence"),
            "playbackPolicy": measurements.get("playback_policy"),
            "integrationCautions": measurements.get("integration_cautions", []),
            "runtimeAssignment": "none; candidate label only",
        },
        "sourceSha256": record["sha256"],
        "sourceOriginalFilename": record["originalFilename"],
        "sourceMeasurements": measurements,
        "sameSha256OriginalFilenames": [r["originalFilename"] for r in output_group],
        "status": "processed candidate; not runtime-bound; semantic role supported by filename and signal metadata only",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, help="Directory containing the exact 39 input originals")
    parser.add_argument("--manifest", type=Path, help="Staging manifest JSON")
    parser.add_argument("--audio-root", type=Path, default=DEFAULT_AUDIO_ROOT)
    parser.add_argument("--qa", type=Path, default=DEFAULT_QA_PATH)
    args = parser.parse_args()

    source_root = args.source or (DEFAULT_AUDIO_ROOT / "originals" if (DEFAULT_AUDIO_ROOT / "originals").is_dir() else DEFAULT_STAGING_SOURCE)
    manifest_path = args.manifest or DEFAULT_STAGING_MANIFEST
    records, source_manifest_info = load_source_records(manifest_path, args.qa)
    if len(records) != 39:
        raise RuntimeError(f"Expected 39 original audio records, got {len(records)}")
    names = [r["originalFilename"] for r in records]
    if len(set(names)) != len(names):
        raise RuntimeError("Manifest includes duplicate original filenames")

    run(["ffmpeg", "-version"], capture=True)
    run(["ffprobe", "-version"], capture=True)
    originals_root = args.audio_root / "originals"
    processed_root = args.audio_root / "processed"
    copy_and_verify_originals(records, source_root, originals_root)

    by_sha: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        by_sha[record["sha256"]].append(record)

    derived_by_sha: dict[str, dict[str, Any]] = {}
    for digest, group in by_sha.items():
        representative = group[0]
        category = representative["measurements"].get("category")
        for member in group:
            if member["measurements"].get("category") != category:
                raise RuntimeError(f"Identical original bytes have conflicting categories: {digest}")
        if category == VOICE_CATEGORY:
            continue
        output_ext = ".mp3" if category == "combat_bgm" else ".ogg"
        category_dir = CATEGORY_DIRS.get(category)
        if not category_dir:
            raise RuntimeError(f"Unconfigured category {category!r}")
        output_path = processed_root / category_dir / f"{safe_stem(representative['originalFilename'], digest)}{output_ext}"
        derived_by_sha[digest] = process_unique_record(
            originals_root / representative["originalFilename"], output_path, representative, group,
        )

    original_records: list[dict[str, Any]] = []
    for record in records:
        digest = record["sha256"]
        group = by_sha[digest]
        m = record["measurements"]
        is_voice = m.get("category") == VOICE_CATEGORY
        output = derived_by_sha.get(digest)
        if is_voice:
            derivative = {
                "status": "unassigned; no derivative created",
                "derivedPath": None,
                "reason": "Short_male_combat_hi filename suggests a voice sample, but no audition or voice/gender verification was performed; user instructed these three clips remain unassigned.",
            }
        elif len(group) > 1 and group[0]["originalFilename"] != record["originalFilename"]:
            derivative = {
                "status": "exact-SHA playback derivative deduplicated",
                "derivedPath": output["derivedPath"] if output else None,
                "representativeOriginalFilename": group[0]["originalFilename"],
                "sourceSha256": digest,
            }
        else:
            derivative = {
                "status": "candidate derivative created once for this unique source SHA",
                "derivedPath": output["derivedPath"] if output else None,
                "sourceSha256": digest,
            }
        original_records.append({
            "originalFilename": record["originalFilename"],
            "originalPath": (originals_root / record["originalFilename"]).relative_to(ROOT).as_posix(),
            "originalBytes": record["bytes"],
            "originalSha256": digest,
            "sourceMeasurements": m,
            "sourceArchivePath": record.get("archivePath"),
            "candidateCategory": m.get("category"),
            "candidateCategoryConfidence": m.get("category_confidence"),
            "candidateEventAndLimits": {
                "playbackPolicy": m.get("playback_policy"),
                "integrationCautions": m.get("integration_cautions", []),
                "runtimeAssignment": "none; candidate label only",
            },
            "playbackDerivative": derivative,
            "auditioned": False,
            "perceivedVoiceGender": None,
            "wordsOrTranscript": None,
            "semanticEvidence": "filename and original signal measurements only; no auditory input or audition available",
            "status": "voice sample held unassigned" if is_voice else "source preserved byte-for-byte; playback derivative candidate only",
        })

    derived_outputs = sorted(derived_by_sha.values(), key=lambda item: item["derivedPath"])
    all_peaks_pass = all(item["peakLimits"]["passed"] for item in derived_outputs)
    summary = {
        "originalFileCount": len(records),
        "originalUniqueSha256Count": len(by_sha),
        "duplicateOriginalSha256GroupCount": sum(1 for group in by_sha.values() if len(group) > 1),
        "playbackDerivativeCount": len(derived_outputs),
        "sfxDerivativeCount": sum(1 for item in derived_outputs if item["derivedFormat"] == "OGG Opus"),
        "bgmDerivativeCount": sum(1 for item in derived_outputs if item["derivedFormat"] == "MP3"),
        "voiceOriginalsHeldUnassigned": sum(1 for r in records if r["measurements"].get("category") == VOICE_CATEGORY),
        "allDerivativeDecodedPeaksPassed": all_peaks_pass,
        "allOriginalBytesAndSha256Preserved": True,
        "runtimeAudioMappingsChanged": False,
    }
    if not all_peaks_pass:
        raise RuntimeError("At least one derivative failed decoded peak QA")

    qa = {
        "schema": "hapil-rc133-audio-processing-qa-v1",
        "generatedUtc": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "sourceManifest": source_manifest_info,
        "processingScript": {
            "path": Path(__file__).resolve().relative_to(ROOT).as_posix(),
            "sha256": sha256_file(Path(__file__).resolve()),
        },
        "toolVersions": {
            "ffmpeg": run(["ffmpeg", "-version"], capture=True).stdout.splitlines()[0],
            "ffprobe": run(["ffprobe", "-version"], capture=True).stdout.splitlines()[0],
        },
        "policy": {
            "semanticClaims": "filename and manifest signal classification only; no auditioning, voice identification or words/transcript claim",
            "originals": "All 39 source files copied byte-for-byte with original filenames into audio/rc133/originals",
            "playbackDeduplication": "exact original SHA-256 only; every original remains preserved and each unique nonvoice SHA has at most one playback derivative",
            "formats": "small OGG Opus one-shots for nonvoice SFX; MP3 for BGM",
            "staticGain": "Apply manifest recommended_source_static_gain_db, then only additional static attenuation if final decoded peak safety targets require it",
            "dcRemoval": "2nd-order high-pass at 20 Hz on every derivative",
            "trimming": "Trim only the manifest-measured leading interval below -50 dBFS, retaining 35 ms preroll; do not trim trailing source content",
            "fades": "SFX 8 ms fade-in and 120 ms fade-out; BGM 4 s fade-in and 4 s fade-out for transition use",
            "peakVerification": "FFmpeg volumedetect sample peak and ebur128 true peak measured on decoded final outputs; requested limits are -1.5 dBFS sample and -1.0 dBTP true peak",
            "clipping": "Static attenuation lowers playback level; no limiter or source-clipping repair claim",
            "runtime": "No runtime event/file mapping changes are included",
        },
        "summary": summary,
        "derivedOutputs": derived_outputs,
        "originalRecords": original_records,
    }
    args.qa.parent.mkdir(parents=True, exist_ok=True)
    args.qa.write_text(json.dumps(qa, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))
    print(f"QA: {args.qa}")
    print(f"Originals: {originals_root}")
    print(f"Processed: {processed_root}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
