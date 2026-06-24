import os, sys
from PIL import Image
from rembg import remove, new_session

SRC = r"C:\Users\RAFI\Desktop\chello\incoming-photos\wetransfer_img_1274-png_2026-06-24_0123"
OUT = r"C:\Users\RAFI\Desktop\chello\incoming-photos\processed"
BOTTOM_CROP = 250  # px de la barre "Ajouter un commentaire"

session = new_session("u2net")

files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".png"))
print(f"{len(files)} fichiers a traiter", flush=True)

for i, fname in enumerate(files, 1):
    try:
        im = Image.open(os.path.join(SRC, fname)).convert("RGB")
        w, h = im.size
        cropped = im.crop((0, 0, w, h - BOTTOM_CROP))
        out_im = remove(cropped, session=session)
        max_w = 900
        if out_im.width > max_w:
            ratio = max_w / out_im.width
            out_im = out_im.resize((max_w, int(out_im.height * ratio)), Image.LANCZOS)
        out_im.save(os.path.join(OUT, fname), "PNG", optimize=True)
        print(f"[{i}/{len(files)}] OK {fname} -> {out_im.size}", flush=True)
    except Exception as e:
        print(f"[{i}/{len(files)}] ERREUR {fname}: {e}", flush=True)
