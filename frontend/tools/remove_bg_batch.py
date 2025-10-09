from pathlib import Path
from rembg import remove

# Base = dossier frontend (parent de /tools)
BASE = Path(__file__).resolve().parent.parent
INP = BASE / "src" / "assets" / "images" / "produits" / "originaux"
OUT = BASE / "src" / "assets" / "images" / "produits" / "sans-fond"
OUT.mkdir(parents=True, exist_ok=True)

exts = {".jpg", ".jpeg", ".jfif", ".png", ".webp"}
count = 0

for p in INP.rglob("*"):
    if p.suffix.lower() not in exts:
        continue
    data = p.read_bytes()
    out = remove(data)  # PNG RGBA (fond transparent)
    out_path = OUT / p.relative_to(INP)
    out_path = out_path.with_suffix(".png")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(out)
    count += 1

print(f"OK : {count} image(s) traitée(s) -> {OUT}")
