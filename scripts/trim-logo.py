"""Logo: beyaz arka planı şeffaf yap, boş alanları kırp."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "focuspro-logo.png"
BACKUP = ROOT / "public" / "focuspro-logo-original.png"
OUT = ROOT / "public" / "focuspro-logo.png"
PAD = 8
TOLERANCE = 28


def is_background(r: int, g: int, b: int, a: int) -> bool:
    if a < 10:
        return True
    # Beyaz ve açık gri kenarlar
    return r >= 255 - TOLERANCE and g >= 255 - TOLERANCE and b >= 255 - TOLERANCE


def main() -> None:
    if not BACKUP.exists():
        Image.open(SRC).save(BACKUP)

    img = Image.open(SRC).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_background(r, g, b, a):
                pixels[x, y] = (r, g, b, 0)

    bbox = img.getbbox()
    if not bbox:
        raise SystemExit("Logo içeriği bulunamadı.")

    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - PAD)
    y0 = max(0, y0 - PAD)
    x1 = min(w, x1 + PAD)
    y1 = min(h, y1 + PAD)
    cropped = img.crop((x0, y0, x1, y1))
    cropped.save(OUT, optimize=True)
    print(f"Kaydedildi: {OUT} ({cropped.size[0]}x{cropped.size[1]})")


if __name__ == "__main__":
    main()
