#!/usr/bin/env python3
"""Rebuild RC133 derived art from the preserved source images.

Requires Pillow. Run from any directory with:
    python3 /workspace/hapil1-media/tools/rc133-extract-art.py

The script only writes assets/rc133/art/* and qa/rc133/art-processing.json.
The six staged source PNGs in assets/rc133/source-art/ remain untouched.
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, __version__ as pillow_version


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets/rc133/source-art"
ART_DIR = ROOT / "assets/rc133/art"
QA_PATH = ROOT / "qa/rc133/art-processing.json"

SOURCE_META = {
    "libfile_a0e71293286481918c55e03101fbcc90.png": {
        "originalFilename": "4eb905f3-e3e8-432a-bf7c-df7b9d4648e1(2).png",
        "visualDescription": "Floating ruins landscape reference",
    },
    "libfile_2cc2c525f0bc81918ac00e11fb72ba3d.png": {
        "originalFilename": "7bd1d479-13bf-4738-83a9-468da699bd61.png",
        "visualDescription": "Eight-view hooded boss sprite sheet",
    },
    "libfile_fd6b302c3e6481918851054ea82e72c9.png": {
        "originalFilename": "37ced3de-d8b2-4049-8607-e1bf307b963e.png",
        "visualDescription": "Circular battle arena background",
    },
    "libfile_7b12e0c0188481918329b8dcdbaac089.png": {
        "originalFilename": "53d54f80-c361-49d5-abf0-3a00559627d2.png",
        "visualDescription": "Transparent red and black effects sheet",
    },
    "libfile_5cb215e0010c819184a9934248eb7f61.png": {
        "originalFilename": "86549152-71de-4dcc-a85e-33e5db5db3c8(2).png",
        "visualDescription": "Labeled normal and awakened eight-direction boss sheet",
    },
    "libfile_77701ac3d1e08191bf1f9f03b29ac967.png": {
        "originalFilename": "e1c62624-2442-450a-b9c1-18e021e8562b(1).png",
        "visualDescription": "Labeled projectile and effect reference sheet",
    },
}

DIRECTIONS = (
    "down",
    "down-left",
    "left",
    "up-left",
    "up",
    "up-right",
    "right",
    "down-right",
)

# Rectangles are x0, y0, x1, y1; x1/y1 are exclusive. They were manually
# checked against the RGBA sheet. Each selected source crop is placed on an
# output with five transparent pixels of padding so adjacent atlas art cannot
# bleed into a runtime frame.
VFX_CROPS = (
    ("small-orb.png", "small-orb", (89, 20, 137, 68)),
    ("eye.png", "eye", (139, 91, 195, 135)),
    ("diamond.png", "diamond", (354, 98, 398, 198)),
    ("clock.png", "clock", (788, 107, 882, 208)),
    ("star.png", "star", (488, 15, 534, 77)),
    ("eclipse.png", "ring/eclipsed orb", (170, 798, 333, 936)),
    ("lance.png", "lance", (625, 472, 839, 555)),
    ("shield.png", "shield", (17, 684, 145, 794)),
    ("vortex.png", "vortex", (952, 685, 1113, 797)),
)

CHRONO_SOURCE = ROOT / "assets/kair/skills/chrono-skill-vfx-atlas-v2.png"
CHRONO_NAMES = (
    "gold-shard",
    "blue-clock",
    "turquoise-crescent",
    "gold-wheel",
    "fiery-impact",
    "violet-clock",
    "blue-arrow",
    "green-burst",
    "gold-cross",
    "red-ring",
    "white-ice-impact",
    "gold-crescent",
    "blue-hourglass",
    "violet-vortex",
    "white-gold-lance",
    "dark-red-cross",
)

# Output-local, half-open rectangles to clear after a visual component review.
# These remove neighboring sprites that physically touch the hand-selected atlas crops.
VFX_MASKS = {
    "eclipse.png": (
        (5, 35, 8, 47),
        (160, 90, 170, 110),
        (136, 136, 173, 148),
        (137, 111, 161, 137),  # isolated stone fragment at lower-right
        (143, 97, 161, 108),  # separate neighboring red fleck
        (164, 132, 169, 137),
    ),
    "lance.png": ((90, 5, 110, 12), (85, 68, 101, 88), (208, 71, 219, 88), (5, 75, 9, 88)),
    "vortex.png": (
        (0, 15, 15, 82),  # neighboring fragment cut by the left crop boundary
        (0, 87, 12, 109),
        (18, 106, 32, 118),
        (82, 112, 112, 122),
        (156, 108, 167, 122),  # neighboring gold tower tip at lower-right
    ),
}

CHRONO_TOP_CLIP = {
    12: 13,  # cyan shard at the top cell boundary, separate from the hourglass frame
    13: 13,  # green flecks from the row above at the top edge of the vortex frame
}
CHRONO_POLYGON_MASKS = {
    12: (((146, 0), (171, 0), (170, 21), (167, 28), (160, 35), (153, 28), (146, 21)),),
}
CHRONO_RECT_MASKS = {
    8: ((146, 286, 172, 314),),  # top spike of the blue hourglass crosses this cell's bottom edge
    9: (
        (68, 296, 112, 314),
        (145, 294, 151, 299),
        (155, 285, 177, 295),
        (155, 308, 170, 314),
    ),  # green and violet fragments from the vortex below
    10: (
        (37, 291, 49, 314),
        (243, 289, 260, 314),
        (19, 304, 27, 314),
    ),  # the lance's upper feathers cross this cell's bottom edge
    13: ((248, 14, 252, 17),),  # isolated three-pixel green fleck from the row above
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def image_info(path: Path) -> dict[str, Any]:
    with Image.open(path) as im:
        return {
            "dimensions": [im.width, im.height],
            "mode": im.mode,
            "format": im.format,
        }


def save_png(im: Image.Image, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    im.save(out_path, format="PNG", optimize=False, compress_level=9)


def add_record(
    records: list[dict[str, Any]],
    *,
    source: Path,
    out: Path,
    rect: list[int],
    operation: str,
    semantic_name: str,
    direction: str | None = None,
    pivot: dict[str, Any] | None = None,
    notes: list[str] | None = None,
) -> None:
    records.append(
        {
            "file": rel(out),
            "semanticName": semantic_name,
            "sourceFile": rel(source),
            "sourceSha256": sha256(source),
            "sourceRect": rect,
            "operation": operation,
            "outputSha256": sha256(out),
            "outputBytes": out.stat().st_size,
            "outputDimensions": list(Image.open(out).size),
            "status": "complete",
            **({"direction": direction} if direction is not None else {}),
            **({"pivot": pivot} if pivot is not None else {}),
            **({"notes": notes} if notes else {}),
        }
    )


def assert_rgb_webp_roundtrip(source: Image.Image, out: Path) -> None:
    with Image.open(out) as decoded:
        decoded.load()
        if decoded.mode != source.mode or decoded.size != source.size:
            raise RuntimeError(f"WebP mode/dimensions changed for {out}")
        if decoded.tobytes() != source.tobytes():
            raise RuntimeError(f"WebP did not round-trip losslessly for {out}")


def process_background(
    records: list[dict[str, Any]], source_name: str, output_name: str, semantic: str
) -> None:
    source = SOURCE_DIR / source_name
    out = ART_DIR / output_name
    with Image.open(source) as im:
        im.load()
        src = im.convert("RGB")
        out.parent.mkdir(parents=True, exist_ok=True)
        src.save(out, format="WEBP", lossless=True, quality=100, method=6)
        assert_rgb_webp_roundtrip(src, out)
        rect = [0, 0, im.width, im.height]
    add_record(
        records,
        source=source,
        out=out,
        rect=rect,
        operation="lossless-webp-encode",
        semantic_name=semantic,
        notes=["Full source image; decoded RGB pixels verified exact after WebP encode."],
    )


def foot_baseline(
    frame: Image.Image, x0: int, x1: int, source_y0: int, source_y1: int
) -> int:
    """Find the lowest opaque foot/ground pixel within the lower frame strip."""
    alpha = frame.getchannel("A")
    lower_start = max(source_y0, source_y1 - 70)
    strip = alpha.crop((x0, lower_start, x1, source_y1))
    # Strongly opaque pixels separate the boots/body from faint aura and dust.
    mask = strip.point(lambda value: 255 if value >= 220 else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise RuntimeError(f"No opaque foot pixels in source rows {source_y0}:{source_y1}")
    return lower_start + bbox[3] - 1


def process_persona(records: list[dict[str, Any]]) -> None:
    source = SOURCE_DIR / "libfile_5cb215e0010c819184a9934248eb7f61.png"
    with Image.open(source) as sheet:
        sheet.load()
        if sheet.size != (1774, 887) or sheet.mode != "RGBA":
            raise RuntimeError("Unexpected persona sheet dimensions or mode")
        rows = (("base", 62, 438), ("awake", 497, 884))
        for form, y0, y1 in rows:
            for index, direction in enumerate(DIRECTIONS):
                x0 = round(index * sheet.width / 8)
                x1 = round((index + 1) * sheet.width / 8)
                source_cell = sheet.crop((x0, y0, x1, y1))
                alpha_bbox = source_cell.getchannel("A").getbbox()
                if alpha_bbox is None:
                    raise RuntimeError(f"Empty persona cell {form}-{index}")
                # Drop only fully transparent trailing rows. This keeps the
                # sprite intact while leaving enough canvas below the aligned feet.
                crop_y1 = y0 + alpha_bbox[3]
                rect = (x0, y0, x1, crop_y1)
                raw = sheet.crop(rect)
                foot_y = foot_baseline(sheet, x0, x1, y0, crop_y1)
                scale = 224 / raw.width
                new_height = round(raw.height * scale)
                resized = raw.resize((224, new_height), Image.Resampling.LANCZOS)
                mapped_foot_row = round((foot_y - y0 + 0.5) * scale - 0.5)
                paste_y = 384 - mapped_foot_row
                if paste_y < 0 or paste_y + new_height > 400:
                    raise RuntimeError(f"{form}-{index} does not fit 224x400 canvas")
                canvas = Image.new("RGBA", (224, 400), (0, 0, 0, 0))
                canvas.alpha_composite(resized, (0, paste_y))
                # Lanczos resampling of transparent sheet-edge pixels can leave
                # nearly invisible, full-width residue above the hood. Clear only
                # sub-5-alpha interpolation noise in the first 28 canvas rows.
                top_pixels = canvas.load()
                for yy in range(28):
                    for xx in range(224):
                        r, g, b, a = top_pixels[xx, yy]
                        if a <= 4:
                            top_pixels[xx, yy] = (0, 0, 0, 0)
                out = ART_DIR / f"{form}-{index}.png"
                save_png(canvas, out)
                add_record(
                    records,
                    source=source,
                    out=out,
                    rect=list(rect),
                    operation="cell-crop-uniform-resize-foot-anchor",
                    semantic_name=f"{form} {direction}",
                    direction=direction,
                    pivot={
                        "normalized": [0.5, 0.96],
                        "canvasPx": [112, 384],
                        "sourcePx": [(x0 + x1) / 2, foot_y],
                        "sourceFootDetection": "last alpha >= 220 pixel in the bottom 70 source rows",
                    },
                    notes=[
                        "Labeled title bands excluded by the source row bounds.",
                        "Only fully transparent trailing source rows were removed to fit the requested 400 px canvas.",
                        "Uniform scale fits source cell width to 224 px; the original cell geometry is retained.",
                        "Cleared alpha values 0–4 only within the first 28 canvas rows to remove full-width resampling residue above the hood.",
                    ],
                )


def process_portrait(records: list[dict[str, Any]]) -> None:
    source = SOURCE_DIR / "libfile_2cc2c525f0bc81918ac00e11fb72ba3d.png"
    with Image.open(source) as sheet:
        sheet.load()
        if sheet.size != (1774, 887) or sheet.mode != "RGBA":
            raise RuntimeError("Unexpected directional portrait sheet dimensions or mode")
        # The supplied sheet is four columns by two rows; rounded grid edges
        # avoid including any pixel from the next cell. This is its first/front view.
        cell_rect = (0, 0, round(sheet.width / 4), round(sheet.height / 2))
        raw = sheet.crop(cell_rect)
        alpha_bbox = raw.getchannel("A").getbbox()
        if alpha_bbox is None:
            raise RuntimeError("The first directional portrait cell is empty")
        crop_y1 = cell_rect[1] + alpha_bbox[3]
        rect = (cell_rect[0], cell_rect[1], cell_rect[2], crop_y1)
        raw = sheet.crop(rect)
        foot_y = foot_baseline(sheet, rect[0], rect[2], rect[1], rect[3])
        scale = 224 / raw.width
        new_height = round(raw.height * scale)
        resized = raw.resize((224, new_height), Image.Resampling.LANCZOS)
        mapped_foot_row = round((foot_y - rect[1] + 0.5) * scale - 0.5)
        paste_y = 384 - mapped_foot_row
        if paste_y < 0 or paste_y + new_height > 400:
            raise RuntimeError("Normalized portrait does not fit 224x400 canvas")
        canvas = Image.new("RGBA", (224, 400), (0, 0, 0, 0))
        canvas.alpha_composite(resized, (0, paste_y))
        out = ART_DIR / "portrait.png"
        save_png(canvas, out)
    add_record(
        records,
        source=source,
        out=out,
        rect=list(rect),
        operation="first-cell-png-crop",
        semantic_name="front-facing portrait",
        direction="down",
        pivot={
            "normalized": [0.5, 0.96],
            "canvasPx": [112, 384],
            "sourcePx": [(rect[0] + rect[2]) / 2, foot_y],
            "sourceFootDetection": "last alpha >= 220 pixel in the bottom 70 source rows",
        },
        notes=[
            "First/front-facing cell of the inspected 4x2 sheet; transparency retained.",
            "Uniform scale fits source cell width to 224 px; only fully transparent trailing rows were removed.",
        ],
    )


def process_vfx(records: list[dict[str, Any]]) -> None:
    source = SOURCE_DIR / "libfile_7b12e0c0188481918329b8dcdbaac089.png"
    with Image.open(source) as sheet:
        sheet.load()
        if sheet.size != (1254, 1254) or sheet.mode != "RGBA":
            raise RuntimeError("Unexpected transparent effects atlas dimensions or mode")
        for filename, semantic, rect in VFX_CROPS:
            crop = sheet.crop(rect)
            padded = Image.new("RGBA", (crop.width + 10, crop.height + 10), (0, 0, 0, 0))
            padded.alpha_composite(crop, (5, 5))
            alpha_bbox = padded.getchannel("A").getbbox()
            if alpha_bbox is None:
                raise RuntimeError(f"Empty VFX crop {filename}")
            margins = [
                alpha_bbox[0],
                alpha_bbox[1],
                padded.width - alpha_bbox[2],
                padded.height - alpha_bbox[3],
            ]
            if min(margins) < 5:
                raise RuntimeError(f"VFX crop lacks 5 px margin: {filename}: {margins}")
            masks = VFX_MASKS.get(filename, ())
            if masks:
                alpha = padded.getchannel("A")
                draw = ImageDraw.Draw(alpha)
                for x0, y0, x1, y1 in masks:
                    draw.rectangle((x0, y0, x1 - 1, y1 - 1), fill=0)
                padded.putalpha(alpha)
            out = ART_DIR / filename
            save_png(padded, out)
            add_record(
                records,
                source=source,
                out=out,
                rect=list(rect),
                operation="isolated-alpha-crop",
                semantic_name=semantic,
                notes=[
                    "Transparent RGBA pixels retained.",
                    "Five transparent pixels added around the manually bounded source crop.",
                    *([f"Cleared isolated neighboring atlas flecks with output-local masks: {list(masks)}."] if masks else []),
                    f"Measured output transparent margins around alpha bounds (left,top,right,bottom): {margins} px.",
                ],
            )


def process_chrono(records: list[dict[str, Any]]) -> None:
    with Image.open(CHRONO_SOURCE) as atlas:
        atlas.load()
        if atlas.size != (1254, 1254) or atlas.mode != "RGBA":
            raise RuntimeError("Unexpected Kair chrono atlas dimensions or mode")
        for index, name in enumerate(CHRONO_NAMES):
            row, col = divmod(index, 4)
            x0 = round(col * atlas.width / 4)
            x1 = round((col + 1) * atlas.width / 4)
            y0 = round(row * atlas.height / 4)
            y1 = round((row + 1) * atlas.height / 4)
            y0 += CHRONO_TOP_CLIP.get(index, 0)
            rect = (x0, y0, x1, y1)
            out = ART_DIR / f"chrono-{index}.png"
            crop = atlas.crop(rect)
            polygons = CHRONO_POLYGON_MASKS.get(index, ())
            rectangles = CHRONO_RECT_MASKS.get(index, ())
            if polygons or rectangles:
                alpha = crop.getchannel("A")
                draw = ImageDraw.Draw(alpha)
                for polygon in polygons:
                    draw.polygon(polygon, fill=0)
                for x0, y0, x1, y1 in rectangles:
                    draw.rectangle((x0, y0, x1 - 1, y1 - 1), fill=0)
                crop.putalpha(alpha)
            save_png(crop, out)
            add_record(
                records,
                source=CHRONO_SOURCE,
                out=out,
                rect=list(rect),
                operation="4x4-cell-alpha-crop",
                semantic_name=name,
                notes=[
                    "4x4 tile crop from the existing transparent atlas; no scaling or recoloring.",
                    "Pixel boundaries use nearest-integer partitions of the 1254x1254 source.",
                    *([f"Trimmed {CHRONO_TOP_CLIP[index]} top-edge rows to remove adjacent-row artifact."] if index in CHRONO_TOP_CLIP else []),
                    *([f"Cleared small adjacent-row fragment with output-local polygon masks: {[[list(point) for point in polygon] for polygon in polygons]}."] if polygons else []),
                    *([f"Cleared isolated top-edge flecks with output-local rectangles: {list(rectangles)}."] if rectangles else []),
                ],
            )


def write_manifest(outputs: list[dict[str, Any]]) -> None:
    sources = []
    for filename, meta in SOURCE_META.items():
        path = SOURCE_DIR / filename
        if not path.is_file():
            raise FileNotFoundError(path)
        sources.append(
            {
                "file": rel(path),
                "originalFilename": meta["originalFilename"],
                "visualDescription": meta["visualDescription"],
                "sha256": sha256(path),
                "bytes": path.stat().st_size,
                **image_info(path),
                "preservationStatus": "original bytes preserved",
            }
        )
    sources.sort(key=lambda item: item["file"])
    references = [
        {
            "sourceFile": rel(SOURCE_DIR / "libfile_77701ac3d1e08191bf1f9f03b29ac967.png"),
            "sourceSha256": sha256(SOURCE_DIR / "libfile_77701ac3d1e08191bf1f9f03b29ac967.png"),
            "status": "preserved-reference-only-not-a-runtime-vfx-atlas",
            "reason": "The labeled design sheet is retained as reference; isolated effects come from the transparent effects atlas.",
        }
    ]
    external_derivatives: list[dict[str, Any]] = []
    optional = ART_DIR / "awakening-eclipse.png"
    if optional.is_file():
        external_derivatives.append(
            {
                "file": rel(optional),
                "semanticName": "awakening eclipse",
                "sourceFile": rel(SOURCE_DIR / "libfile_77701ac3d1e08191bf1f9f03b29ac967.png"),
                "sourceSha256": sha256(SOURCE_DIR / "libfile_77701ac3d1e08191bf1f9f03b29ac967.png"),
                "sourceRect": None,
                "operation": "external-imagegen-clean-isolation-derivative",
                "outputSha256": sha256(optional),
                "outputBytes": optional.stat().st_size,
                "outputDimensions": list(Image.open(optional).size),
                "status": "complete-external-derivative",
                "notes": ["Generated and copied by the parent agent; this extraction script records but does not recreate it."],
            }
        )
    document = {
        "schema": "rc133-art-processing-v1",
        "toolchain": {
            "python": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "pillow": pillow_version,
        },
        "directionOrder": list(DIRECTIONS),
        "sources": sources,
        "referenceSources": references,
        "outputs": outputs,
        "externalDerivatives": external_derivatives,
        "notes": [
            "All six staged user PNGs are retained byte-for-byte in source-art/.",
            "The labeled projectile/effect design sheet remains reference-only; it is not published as a runtime texture atlas.",
            "Background WebPs are encoded losslessly and checked by exact decoded RGB pixel comparison.",
            "The script does not register or wire these files into runtime code.",
        ],
    }
    QA_PATH.parent.mkdir(parents=True, exist_ok=True)
    QA_PATH.write_text(json.dumps(document, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    ART_DIR.mkdir(parents=True, exist_ok=True)
    outputs: list[dict[str, Any]] = []
    process_background(
        outputs,
        "libfile_fd6b302c3e6481918851054ea82e72c9.png",
        "arena.webp",
        "circular arena background",
    )
    process_background(
        outputs,
        "libfile_a0e71293286481918c55e03101fbcc90.png",
        "reveal.webp",
        "floating ruins reveal background",
    )
    process_portrait(outputs)
    process_persona(outputs)
    process_vfx(outputs)
    process_chrono(outputs)
    write_manifest(outputs)
    print(f"Wrote {len(outputs)} derived images and {QA_PATH}")


if __name__ == "__main__":
    main()
