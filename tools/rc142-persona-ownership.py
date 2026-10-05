#!/usr/bin/env python3
"""Create the reviewed per-pixel ownership map for the RC133 Persona atlas.

The alpha threshold is used only to find the eight opaque identity cores in
each row. It is never used to remove pixels: every nontransparent source pixel
inside either authored row is assigned to the nearest core using a Euclidean
distance transform. The resulting grayscale map is consumed by
rc133-extract-art.py, which copies the original RGBA pixels without resizing.

Requires Pillow, NumPy, and SciPy. Run from any directory with:
    python3 tools/rc142-persona-ownership.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, __version__ as pillow_version
from scipy import ndimage, __version__ as scipy_version


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/rc133/source-art/libfile_5cb215e0010c819184a9934248eb7f61.png"
MASK = ROOT / "qa/rc142/persona-direction-ownership.png"
REPORT = ROOT / "qa/rc142/persona-ownership.json"
SOURCE_SHA256 = "66c1c110ccc7f3f82168e7835080b59b3eebd83028d7e040034b188da009864f"
ROWS = (("base", 62, 438, 0), ("awake", 497, 884, 8))
ALPHA_SEED_THRESHOLD = 20
MINIMUM_CORE_PIXELS = 10_000


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    if sha256(SOURCE) != SOURCE_SHA256:
        raise RuntimeError("The preserved Persona atlas source hash changed")
    with Image.open(SOURCE) as image:
        image.load()
        if image.mode != "RGBA" or image.size != (1774, 887):
            raise RuntimeError("Unexpected Persona atlas dimensions or mode")
        rgba = np.asarray(image)

    ownership = np.zeros((887, 1774), dtype=np.uint8)
    audit_rows = []
    for form, y0, y1, owner_offset in ROWS:
        alpha = rgba[y0:y1, :, 3]
        labels, _ = ndimage.label(alpha >= ALPHA_SEED_THRESHOLD)
        cores = []
        for label, bounds in enumerate(ndimage.find_objects(labels), start=1):
            if bounds is None:
                continue
            component = labels[bounds] == label
            area = int(component.sum())
            if area < MINIMUM_CORE_PIXELS:
                continue
            ys, xs = np.where(component)
            cores.append(
                {
                    "label": label,
                    "area": area,
                    "centroid": [
                        round(float(xs.mean() + bounds[1].start), 4),
                        round(float(ys.mean() + bounds[0].start + y0), 4),
                    ],
                    "sourceRect": [
                        int(bounds[1].start),
                        int(bounds[0].start + y0),
                        int(bounds[1].stop),
                        int(bounds[0].stop + y0),
                    ],
                }
            )
        cores.sort(key=lambda core: core["centroid"][0])
        if len(cores) != 8 or any(
            cores[index]["centroid"][0] >= cores[index + 1]["centroid"][0]
            for index in range(7)
        ):
            raise RuntimeError(f"Expected eight ordered pose cores in {form}: {cores}")

        core_owner = np.zeros(alpha.shape, dtype=np.uint8)
        seed_mask = np.zeros(alpha.shape, dtype=bool)
        for index, core in enumerate(cores, start=1):
            component = labels == core["label"]
            core_owner[component] = index
            seed_mask |= component

        # Distance-transform indices point to the nearest zero of ~seed_mask,
        # hence the nearest original core pixel. Keep every pixel in each core
        # pinned to its own direction before assigning the transparent fringes.
        nearest = ndimage.distance_transform_edt(
            ~seed_mask, return_distances=False, return_indices=True
        )
        assigned = core_owner[tuple(nearest)]
        assigned[core_owner > 0] = core_owner[core_owner > 0]
        assigned[alpha == 0] = 0
        ownership[y0:y1, :] = np.where(assigned > 0, assigned + owner_offset, 0)

        for index, core in enumerate(cores, start=1):
            owner_id = index + owner_offset
            owner_pixels = ownership[y0:y1, :] == owner_id
            ys, xs = np.where(owner_pixels & (alpha > 0))
            core["directionIndex"] = index - 1
            core["ownerId"] = owner_id
            core["assignedNontransparentPixels"] = int(len(xs))
            core["assignedSourceRect"] = [
                int(xs.min()),
                int(ys.min() + y0),
                int(xs.max() + 1),
                int(ys.max() + 1 + y0),
            ]
        active = alpha > 0
        unassigned = int(np.count_nonzero(active & (ownership[y0:y1, :] == 0)))
        if unassigned:
            raise RuntimeError(f"{unassigned} nontransparent {form} pixels were not assigned")
        audit_rows.append(
            {
                "form": form,
                "sourceRowRect": [0, y0, 1774, y1],
                "seedRule": f"4-connected components of source alpha >= {ALPHA_SEED_THRESHOLD}; retain eight ordered cores with at least {MINIMUM_CORE_PIXELS} pixels",
                "ownershipRule": "Every nontransparent source pixel is assigned to the nearest core pixel by Euclidean distance; seed pixels remain fixed to their own core.",
                "nontransparentSourcePixels": int(np.count_nonzero(active)),
                "unassignedNontransparentPixels": unassigned,
                "cores": cores,
            }
        )

    MASK.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(ownership, mode="L").save(MASK, format="PNG", optimize=False, compress_level=9)
    report = {
        "schema": "rc142-persona-ownership/v1",
        "sourceFile": SOURCE.relative_to(ROOT).as_posix(),
        "sourceSha256": SOURCE_SHA256,
        "sourceDimensions": [1774, 887],
        "maskFile": MASK.relative_to(ROOT).as_posix(),
        "maskSha256": sha256(MASK),
        "maskMode": "L",
        "maskDimensions": [1774, 887],
        "pixelEncoding": {
            "0": "unassigned or fully transparent source pixel",
            "1-8": "base directions in directionOrder",
            "9-16": "awake directions in directionOrder",
        },
        "toolchain": {
            "python": f"{__import__('sys').version_info.major}.{__import__('sys').version_info.minor}.{__import__('sys').version_info.micro}",
            "pillow": pillow_version,
            "numpy": np.__version__,
            "scipy": scipy_version,
        },
        "thresholdUse": "Seed discovery only; no source alpha level is thresholded away.",
        "rows": audit_rows,
    }
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "status": "passed",
                "mask": report["maskFile"],
                "maskSha256": report["maskSha256"],
                "assignedCores": sum(len(row["cores"]) for row in audit_rows),
                "unassignedNontransparentPixels": sum(row["unassignedNontransparentPixels"] for row in audit_rows),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
