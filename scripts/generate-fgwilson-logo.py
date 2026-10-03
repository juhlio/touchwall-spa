#!/usr/bin/env python3
"""Gera public/assets/images/logo-fgwilson.webp a partir da fonte bruta
em scripts/sources/logo-fgwilson-raw.png (já recortada, só o símbolo,
sem a área azul vazia do arquivo original). Aplica unsharp mask antes de
exportar — o logo é exibido bem pequeno na Home (~36px de altura) e o
texto fino ("F G WILSON") fica mole sem esse reforço de nitidez.
"""

import os

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/sources/logo-fgwilson-raw.png")
DEST = os.path.join(ROOT, "public/assets/images/logo-fgwilson.webp")


def main():
    im = Image.open(SRC).convert("RGB")
    sharpened = im.filter(ImageFilter.UnsharpMask(radius=2, percent=180, threshold=2))
    sharpened.save(DEST, "WEBP", quality=95, method=6)
    print(f"{os.path.relpath(DEST, ROOT)}: {sharpened.size}")


if __name__ == "__main__":
    main()
