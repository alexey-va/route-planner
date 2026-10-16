#!/usr/bin/env python3
"""Rebuild the classic UI from its source snapshot and maintained source patch."""

import io
from pathlib import Path
import re
import shutil
import subprocess
import tarfile
import tempfile


ROOT = Path(__file__).resolve().parents[1]
BASE = "route-before-modern-ui-2026-07-25"
SHARED_SOURCES = (
    "src/script.jsx",
    "src/utils/routePricing.js",
    "src/utils/routeZones.js",
    "src/utils/routeZoneAdapter.js",
    "src/utils/mapHelpers.js",
    "src/utils/pricingRules.js",
    "src/components/RouteZoneBreakdown.jsx",
    "src/hooks/useCalculationHistory.js",
)


def replace_asset_reference(text, prefix, suffix, name):
    pattern = rf"{re.escape(prefix)}[^\"\s]+\.{suffix}"
    updated, count = re.subn(pattern, prefix + name, text)
    if count != 1:
        raise RuntimeError(f"Expected one {prefix}*.{suffix} reference, found {count}")
    return updated


def main():
    if not (ROOT / "node_modules").is_dir():
        raise RuntimeError("Install the project dependencies with npm ci first")

    archive = subprocess.check_output(["git", "archive", BASE], cwd=ROOT)
    with tempfile.TemporaryDirectory(prefix="route-legacy-") as directory:
        stage = Path(directory)
        with tarfile.open(fileobj=io.BytesIO(archive)) as source:
            source.extractall(stage, filter="data")
        subprocess.run(
            ["git", "apply", "--unidiff-zero", str(ROOT / "legacy/source.patch")],
            cwd=stage,
            check=True,
        )
        for relative in SHARED_SOURCES:
            shutil.copy2(ROOT / relative, stage / relative)
        (stage / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)
        subprocess.run(["npm", "run", "build"], cwd=stage, check=True)

        app_path = ROOT / "src/App.jsx"
        index_path = ROOT / "public/legacy/index.html"
        app = app_path.read_text()
        index = index_path.read_text()
        old_assets = set(re.findall(r'/legacy/assets/([^"\s]+\.(?:js|css))', app))
        generated = []
        for suffix in ("js", "css"):
            candidates = list((stage / "dist/assets").glob(f"*.{suffix}"))
            if len(candidates) != 1:
                raise RuntimeError(f"Expected one generated {suffix} asset")
            asset = candidates[0]
            app = replace_asset_reference(app, "/legacy/assets/", suffix, asset.name)
            index = replace_asset_reference(index, "./assets/", suffix, asset.name)
            generated.append(asset)

        destination = ROOT / "public/legacy/assets"
        for asset in generated:
            shutil.copy2(asset, destination / asset.name)
        app_path.write_text(app)
        index_path.write_text(index)
        for name in old_assets - {asset.name for asset in generated}:
            (destination / name).unlink()
        print("Classic assets updated:", ", ".join(asset.name for asset in generated))


if __name__ == "__main__":
    main()
