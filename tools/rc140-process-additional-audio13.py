#!/usr/bin/env python3
"""Build conservative, unassigned playback candidates for the extra 13 originals.

Originals stay byte-identical. This prepares candidate derivatives only; it
does not assign sound events, identify speech, verify voice gender, or validate
music loop points.
"""
from __future__ import annotations

import hashlib
import json
import math
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DELIVERY = ROOT / "delivery/additional-audio13-20261005"
SOURCE_DIR = DELIVERY / "originals"
OUTPUT_DIR = DELIVERY / "processed"
INPUT_MANIFEST = DELIVERY / "manifest.json"
OUTPUT_REPORT = DELIVERY / "processing-report.json"
SFX_TARGET_LUFS = -21.0
BGM_TARGET_LUFS = -24.0
SAMPLE_TARGET_DBFS = -1.8
TRUE_PEAK_TARGET_DBTP = -1.3
SAMPLE_LIMIT_DBFS = -1.5
TRUE_PEAK_LIMIT_DBTP = -1.0
SFX_FADE_IN = 0.008
SFX_FADE_OUT = 0.120
BGM_FADE = 4.0
PREROLL = 0.035


def run(args: list[str], *, capture: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
                          stderr=subprocess.PIPE, encoding="utf-8")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def probe(path: Path) -> dict:
    raw = run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
               "stream=codec_name,sample_rate,channels:format=duration,size", "-of", "json", str(path)]).stdout
    data = json.loads(raw)
    if len(data.get("streams", [])) != 1:
        raise RuntimeError(f"expected one decodable audio stream: {path}")
    stream = data["streams"][0]
    return {"codec": stream.get("codec_name"), "sampleRateHz": int(stream["sample_rate"]),
            "channels": int(stream["channels"]), "durationSeconds": float(data["format"]["duration"]),
            "bytes": int(data["format"]["size"])}


def measure(path: Path) -> dict[str, float]:
    text = run(["ffmpeg", "-hide_banner", "-v", "info", "-nostats", "-i", str(path), "-map", "0:a:0",
                "-af", "astats=metadata=0:reset=0,ebur128=peak=true:framelog=quiet", "-f", "null", "-"]).stderr
    def value(pattern: str) -> float:
        match = re.search(pattern, text, re.S)
        if not match:
            raise RuntimeError(f"measurement not reported for {path}: {pattern}")
        return float(match.group(1))
    sample_peaks = re.findall(r"Peak level dB:\s*(-?\d+(?:\.\d+)?)", text)
    if not sample_peaks:
        raise RuntimeError(f"sample peak not reported for {path}")
    return {"samplePeakDbfs": float(sample_peaks[-1]),
            "truePeakDbtp": value(r"True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS"),
            "integratedLufs": value(r"Integrated loudness:\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS")}


def slug(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", Path(name).stem).strip("._-") or "audio"


def render(source: Path, target: Path, *, music: bool, gain_db: float, trim: float,
           duration: float) -> None:
    fade_in = min(BGM_FADE if music else SFX_FADE_IN, duration / 3)
    fade_out = min(BGM_FADE if music else SFX_FADE_OUT, duration / 3)
    start_out = max(0, duration - fade_out)
    filters = []
    if trim:
        filters.extend([f"atrim=start={trim:.6f}", "asetpts=PTS-STARTPTS"])
    filters.extend(["highpass=f=20:p=2", f"volume={gain_db:.5f}dB",
                    f"afade=t=in:st=0:d={fade_in:.5f}:curve=tri",
                    f"afade=t=out:st={start_out:.5f}:d={fade_out:.5f}:curve=tri"])
    common = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source), "-map", "0:a:0",
              "-vn", "-map_metadata", "-1", "-af", ",".join(filters), "-ar", "48000", "-ac", "2"]
    if music:
        cmd = common + ["-c:a", "libmp3lame", "-b:a", "160k", "-write_xing", "1", str(target)]
    else:
        cmd = common + ["-c:a", "libopus", "-b:a", "96k", "-vbr", "on", "-compression_level", "10",
                        "-application", "audio", str(target)]
    run(cmd, capture=False)


def main() -> None:
    manifest_bytes = INPUT_MANIFEST.read_bytes()
    manifest = json.loads(manifest_bytes)
    rows = manifest["files"]
    if len(rows) != 13:
        raise RuntimeError(f"expected 13 source rows, found {len(rows)}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    derivatives = []
    held = []
    for row in rows:
        name = row["originalFilename"]
        source = SOURCE_DIR / name
        source_hash = sha256(source)
        if source.stat().st_size != row["size_bytes"] or source_hash != row["sha256"]:
            raise RuntimeError(f"original mismatch: {name}")
        m = row["measurements"]
        source_probe = probe(source)
        source_measure = measure(source)
        for key, field in [("samplePeakDbfs", "sample_peak_dbfs"), ("truePeakDbtp", "true_peak_dbtp"),
                           ("integratedLufs", "integrated_loudness_lufs")]:
            if abs(source_measure[key] - float(m[field])) > .11:
                raise RuntimeError(f"source measurement drift for {name}: {key}={source_measure[key]} != {m[field]}")

        music = source_probe["durationSeconds"] > 30
        # Female-labelled vocal files and the ambiguous demon-declaration clip
        # are retained without a derivative until semantic and voice checks.
        suspect_voice = name.startswith("Short_female_combat") or name.startswith("Sinister_demonic_dec")
        if suspect_voice:
            held.append({"originalFilename": name, "sourceSha256": source_hash,
                         "reason": "voice/content cannot be ruled out by signal measurements; no derivative or runtime assignment"})
            continue

        target_lufs = BGM_TARGET_LUFS if music else SFX_TARGET_LUFS
        recommended_gain = target_lufs - source_measure["integratedLufs"]
        lead = float(m.get("leading_quiet_below_minus50dbfs_seconds", 0) or 0)
        trim = max(0, lead - PREROLL) if not music and lead > .1 else 0
        duration = max(.1, source_probe["durationSeconds"] - trim)
        suffix = ".mp3" if music else ".ogg"
        group = "music-candidate" if music else "sfx-candidate"
        target = OUTPUT_DIR / group / f"{slug(name)}-{source_hash[:8]}{suffix}"
        target.parent.mkdir(parents=True, exist_ok=True)
        extra_attenuation = 0.0
        for attempt in range(1, 7):
            render(source, target, music=music, gain_db=recommended_gain + extra_attenuation,
                   trim=trim, duration=duration)
            output_measure = measure(target)
            if (output_measure["samplePeakDbfs"] <= SAMPLE_TARGET_DBFS and
                    output_measure["truePeakDbtp"] <= TRUE_PEAK_TARGET_DBTP):
                break
            extra_attenuation += min(SAMPLE_TARGET_DBFS - output_measure["samplePeakDbfs"],
                                     TRUE_PEAK_TARGET_DBTP - output_measure["truePeakDbtp"]) - .1
        else:
            raise RuntimeError(f"could not reach decoded headroom after six static renders: {name}")
        if (output_measure["samplePeakDbfs"] > SAMPLE_LIMIT_DBFS or
                output_measure["truePeakDbtp"] > TRUE_PEAK_LIMIT_DBTP):
            raise RuntimeError(f"final derivative headroom failed: {name}: {output_measure}")
        run(["ffmpeg", "-hide_banner", "-v", "error", "-i", str(target), "-map", "0:a:0", "-f", "null", "-"], capture=False)
        out_probe = probe(target)
        derivatives.append({
            "originalFilename": name, "originalSha256": source_hash, "originalBytes": source.stat().st_size,
            "candidatePath": target.relative_to(ROOT).as_posix(), "candidateSha256": sha256(target),
            "candidateBytes": target.stat().st_size, "candidateProbe": out_probe,
            "sourceProbe": source_probe, "sourceMeasurements": source_measure,
            "outputMeasurements": output_measure,
            "gain": {"targetLufs": target_lufs, "recommendedStaticGainDb": round(recommended_gain, 5),
                     "additionalStaticAttenuationDb": round(extra_attenuation, 5),
                     "effectiveGainDb": round(recommended_gain + extra_attenuation, 5)},
            "processing": {"codec": "MP3 160k candidate" if music else "Opus 96k candidate",
                           "highpassHz": 20, "fadeInSeconds": min(BGM_FADE if music else SFX_FADE_IN, duration / 3),
                           "fadeOutSeconds": min(BGM_FADE if music else SFX_FADE_OUT, duration / 3),
                           "trimmedLeadingQuietSeconds": round(trim, 6),
                           "preservedPrerollSeconds": round(max(0, lead - trim), 6),
                           "dynamicLimiter": False, "normalization": False,
                           "declippingOrSourceRepair": False, "loopPointsVerified": False if music else None},
            "runtimeAssigned": False, "semanticAuditioned": False,
        })
    out = {
        "schema": "hapil-additional-audio13-processing-review-v1",
        "generatedUtc": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "sourceManifest": {"path": "delivery/additional-audio13-20261005/manifest.json",
                           "sha256": hashlib.sha256(manifest_bytes).hexdigest(), "rowCount": len(rows)},
        "toolVersions": {"ffmpeg": run(["ffmpeg", "-version"]).stdout.splitlines()[0],
                         "ffprobe": run(["ffprobe", "-version"]).stdout.splitlines()[0]},
        "policy": {"originalsUnchanged": True, "runtimeIntegrated": False,
                   "voiceGenderVerified": False, "contentAuditioned": False,
                   "semanticAssignments": "none; these are unassigned playback candidates",
                   "sourceClippingRepairClaimed": False,
                   "peakTargets": {"renderSamplePeakDbfs": SAMPLE_TARGET_DBFS,
                                   "renderTruePeakDbtp": TRUE_PEAK_TARGET_DBTP,
                                   "maximumSamplePeakDbfs": SAMPLE_LIMIT_DBFS,
                                   "maximumTruePeakDbtp": TRUE_PEAK_LIMIT_DBTP}},
        "summary": {"originalCount": len(rows), "derivativeCount": len(derivatives),
                    "heldUnprocessed": len(held), "allDerivativeHeadroomPassed": True,
                    "allOriginalHashesReverified": True,
                    "menuNavigation": {"sourceLeadingQuietSeconds": 1.63,
                                       "candidateTrimmedSeconds": next((x["processing"]["trimmedLeadingQuietSeconds"] for x in derivatives if x["originalFilename"].startswith("Short_game_menu_navi")), None),
                                       "runtimeClickLatencyVerified": False}},
        "heldOriginals": held, "derivatives": derivatives,
    }
    OUTPUT_REPORT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], indent=2, ensure_ascii=False))
    print(f"QA: {OUTPUT_REPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
