"""Generate transparent card-photo assets for a prepared bird snapshot."""

import io
import json
import os
import re
import sys
from pathlib import Path

import requests
from PIL import Image
from rembg import new_session, remove


PHOTO_ID = re.compile(r"/photos/(\d+)/")
OUTPUT_DIR = Path("public/bird-cutouts")


def photo_id(url):
    match = PHOTO_ID.search(url)
    if not match:
        raise ValueError(f"Unknown iNaturalist photo URL: {url}")
    return match.group(1)


def crop_to_subject(image):
    alpha = image.getchannel("A")
    visible = alpha.point(lambda value: 255 if value > 32 else 0)
    bounds = visible.getbbox()
    if not bounds:
        raise ValueError("No visible bird in cutout")
    margin = round(max(bounds[2] - bounds[0], bounds[3] - bounds[1]) * 0.05)
    return image.crop(
        (
            max(0, bounds[0] - margin),
            max(0, bounds[1] - margin),
            min(image.width, bounds[2] + margin),
            min(image.height, bounds[3] + margin),
        )
    )


def main(path):
    snapshot = json.loads(path.read_text())
    pending = []
    active = set()
    for bird in snapshot["birds"]:
        photo = bird.get("media", {}).get("cardPhoto")
        if not photo:
            continue
        destination = OUTPUT_DIR / f"{photo_id(photo['url'])}.webp"
        active.add(destination)
        photo["cutoutUrl"] = f"/bird-cutouts/{destination.name}"
        if not destination.is_file():
            pending.append((photo["url"], destination))

    if pending:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        os.environ.setdefault("U2NET_HOME", str(Path(".cache/u2net").resolve()))
        session = new_session("isnet-general-use")
        http = requests.Session()
        failures = []
        for index, (url, destination) in enumerate(pending, 1):
            try:
                response = http.get(url, timeout=45)
                response.raise_for_status()
                source = Image.open(io.BytesIO(response.content)).convert("RGB")
                cutout = remove(source, session=session)
                if cutout.getchannel("A").getextrema() != (0, 255):
                    raise ValueError("Cutout has no full transparency")
                cutout = crop_to_subject(cutout)
                temporary = destination.with_suffix(".tmp")
                cutout.save(temporary, format="WEBP", quality=85, method=4)
                temporary.replace(destination)
            except Exception as error:
                failures.append(f"{url}: {error}")
            if index % 25 == 0 or index == len(pending):
                print(f"Cutouts {index}/{len(pending)}", flush=True)
        if failures:
            raise RuntimeError(
                f"Could not prepare {len(failures)} cutouts:\n" + "\n".join(failures)
            )

    for old_cutout in OUTPUT_DIR.glob("*.webp"):
        if old_cutout not in active:
            old_cutout.unlink()
    path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n")
    print(f"Saved cutout paths for {len(snapshot['birds'])} birds", flush=True)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
