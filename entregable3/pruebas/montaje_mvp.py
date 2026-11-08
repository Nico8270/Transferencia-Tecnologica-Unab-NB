"""Une las capturas de test_mvp.js en la Figura 4 del informe (figuras/fig_mvp.png)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
F = Path(__file__).resolve().parent.parent / "figuras"
ims = [Image.open(F / f"s_{n}.png") for n in ("resultado", "feedback", "docente")]
H = 1250
crops = [im.crop((0, 0, im.width, min(H, im.height))) for im in ims]
out = Image.new("RGB", (sum(c.width for c in crops) + 40, H + 60), "white")
try:
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 30)
except OSError:
    font = ImageFont.load_default()
d = ImageDraw.Draw(out); x = 0
for lab, c in zip(["A. Resultado y ruta (estudiante)", "B. Retroalimentación por error", "C. Panel de alerta temprana (docente)"], crops):
    out.paste(c, (x, 60)); d.text((x + 20, 12), lab, fill=(24, 35, 46), font=font); x += c.width + 20
out.save(F / "fig_mvp.png")
