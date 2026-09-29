#!/usr/bin/env python3
# clip-satellite-image.py
# Pré-recorta public/assets/images/brazil-satellite.jpg no contorno real
# dos estados (public/data/brazil-states.json), gerando um PNG com
# transparência (brazil-satellite-clipped.png). Isso substitui o
# clip-path aplicado em tempo de execução no <image> do SVG — usado como
# mitigação pra um artefato de renderização (corte reto em alguns pins)
# visto em certas GPUs, que parece estar ligado a clipPath + <image>
# dentro do mesmo SVG.
#
# Uso: python3 scripts/clip-satellite-image.py

import json
from pathlib import Path
from PIL import Image, ImageDraw

Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent.parent
SRC_IMAGE = ROOT / "public/assets/images/brazil-satellite.jpg"
STATES_JSON = ROOT / "public/data/brazil-states.json"
OUT_IMAGE = ROOT / "public/assets/images/brazil-satellite-clipped.png"

# Mesmos valores de src/components/BrazilMap.tsx (GEO_BOUNDS + SATELLITE_PAD_DEG)
GEO_BOUNDS = {
    "latMax": 5.27,
    "latMin": -33.75,
    "lngMin": -73.99,
    "lngMax": -34.79,
}
SATELLITE_PAD_DEG = 4

lat_top = GEO_BOUNDS["latMax"] + SATELLITE_PAD_DEG
lat_bottom = GEO_BOUNDS["latMin"] - SATELLITE_PAD_DEG
lng_left = GEO_BOUNDS["lngMin"] - SATELLITE_PAD_DEG
lng_right = GEO_BOUNDS["lngMax"] + SATELLITE_PAD_DEG

image = Image.open(SRC_IMAGE).convert("RGB")
width, height = image.size


def to_px(lng, lat):
    x = (lng - lng_left) / (lng_right - lng_left) * width
    y = (lat_top - lat) / (lat_top - lat_bottom) * height
    return (x, y)


mask = Image.new("L", (width, height), 0)
draw = ImageDraw.Draw(mask)

states = json.loads(STATES_JSON.read_text(encoding="utf-8"))
ring_count = 0
for feature in states["features"]:
    geometry = feature["geometry"]
    polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
    for polygon in polygons:
        for ring in polygon:
            points = [to_px(lng, lat) for lng, lat in ring]
            draw.polygon(points, fill=255)
            ring_count += 1

print(f"Desenhados {ring_count} anéis de polígono")

image.putalpha(mask)
image.save(OUT_IMAGE)
print(f"Salvo {OUT_IMAGE} ({width}x{height})")
