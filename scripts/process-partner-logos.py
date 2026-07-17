#!/usr/bin/env python3
"""Convert partner JPEG logos to transparent PNGs for the landing strip."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = ROOT / "public" / "partners"
PUBLIC = ROOT / "public"


def flood_remove_bg(
    img: Image.Image,
    *,
    tolerance: int = 28,
    seed_lightness: int = 220,
) -> Image.Image:
    """Flood-fill from image edges to remove light backgrounds."""
    rgba = img.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    assert pixels is not None

    def is_bg_seed(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        if a == 0:
            return True
        avg = (r + g + b) / 3
        return avg >= seed_lightness and abs(r - g) < 25 and abs(g - b) < 25

    visited = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        for y in (0, height - 1):
            if is_bg_seed(x, y):
                queue.append((x, y))
                visited[y][x] = True
    for y in range(height):
        for x in (0, width - 1):
            if not visited[y][x] and is_bg_seed(x, y):
                queue.append((x, y))
                visited[y][x] = True

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            if visited[ny][nx]:
                continue
            nr, ng, nb, na = pixels[nx, ny]
            if na == 0:
                visited[ny][nx] = True
                continue
            avg = (nr + ng + nb) / 3
            if avg < seed_lightness - tolerance:
                continue
            if abs(nr - ng) >= 35 or abs(ng - nb) >= 35:
                continue
            visited[ny][nx] = True
            queue.append((nx, ny))

    return rgba


def crop_transparent(img: Image.Image, pad: int = 4) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(img.width, right + pad)
    bottom = min(img.height, bottom + pad)
    return img.crop((left, top, right, bottom))


def resize_max(img: Image.Image, max_side: int) -> Image.Image:
    width, height = img.size
    scale = max_side / max(width, height)
    if scale >= 1:
        return img
    return img.resize(
        (max(1, round(width * scale)), max(1, round(height * scale))),
        Image.Resampling.LANCZOS,
    )


def process_kementrian() -> None:
    img = Image.open(DOCS / "Kementrian.jpeg")
    out = flood_remove_bg(img, tolerance=50, seed_lightness=230)
    out = crop_transparent(out, pad=2)
    out.save(OUT / "kementrian.png", optimize=True)
    print(f"kementrian.png {out.size} {out.mode}")


def process_unipda() -> None:
    """
    Source JPEG is already an upright horizontal lockup (crest + wordmark).
    Preserve that orientation and export transparent light/dark variants.
    """
    img = Image.open(DOCS / "LogoUnipda.jpeg")
    out = flood_remove_bg(img, tolerance=40, seed_lightness=205)
    out = crop_transparent(out, pad=8)
    out = resize_max(out, 960)
    out.save(OUT / "unipda.png", optimize=True)
    print(f"unipda.png (horizontal lockup) {out.size} {out.mode}")

    # Dark mode: turn only the black wordmark (right of the crest) white.
    dark = out.copy()
    pixels = dark.load()
    assert pixels is not None
    crest_boundary = int(dark.height * 1.05)
    for y in range(dark.height):
        for x in range(crest_boundary, dark.width):
            r, g, b, a = pixels[x, y]
            if a > 0 and max(r, g, b) < 80:
                pixels[x, y] = (255, 255, 255, a)
    dark.save(OUT / "unipda-dark.png", optimize=True)
    print(f"unipda-dark.png {dark.size} {dark.mode}")

    # Keep the general partner mark in sync with the light lockup.
    out.save(PUBLIC / "logoUnipda.png", optimize=True)
    print(f"logoUnipda.png {out.size} {out.mode}")


def process_dikti() -> None:
    img = Image.open(DOCS / "Dikti.jpeg")
    out = flood_remove_bg(img, tolerance=40, seed_lightness=240)
    out = crop_transparent(out, pad=4)
    if out.width > 800:
        scale = 800 / out.width
        out = out.resize(
            (800, max(1, round(out.height * scale))),
            Image.Resampling.LANCZOS,
        )
    out.save(OUT / "dikti.png", optimize=True)
    print(f"dikti.png {out.size} {out.mode}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    process_kementrian()
    process_unipda()
    process_dikti()
    print(f"Wrote PNGs to {OUT}")


if __name__ == "__main__":
    main()
