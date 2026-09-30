#!/usr/bin/env python3
"""Converte os assets pesados do app para WebP (e gera a @2x do logo),
como parte da auditoria de performance. Roda uma vez, offline — não faz
parte do build.
"""

import glob
import os

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "public/assets/images")
PROJETOS = os.path.join(ROOT, "public/assets/projetos")
SOURCES = os.path.join(ROOT, "scripts/sources")

THUMB_WIDTH = 400


def to_webp(src_path, dest_path, quality, keep_alpha=None):
    im = Image.open(src_path)
    if keep_alpha is None:
        keep_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if keep_alpha else "RGB")
    im.save(dest_path, "WEBP", quality=quality, method=6)
    size_kb = os.path.getsize(dest_path) / 1024
    print(f"{os.path.relpath(dest_path, ROOT)}: {size_kb:.0f} KB")
    return dest_path


def make_thumb(src_path, dest_path, width=THUMB_WIDTH, quality=78):
    im = Image.open(src_path).convert("RGB")
    ratio = width / im.width
    height = round(im.height * ratio)
    im = im.resize((width, height), Image.LANCZOS)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    im.save(dest_path, "WEBP", quality=quality, method=6)


def main():
    print("== Imagens principais ==")
    print("(brazil-satellite-clipped.webp é gerado por clip-satellite-image.py)")
    to_webp(os.path.join(SOURCES, "logo-iso.png"), os.path.join(IMAGES, "logo-iso.webp"), quality=85)
    to_webp(os.path.join(SOURCES, "coe-operacao.jpg"), os.path.join(IMAGES, "coe-operacao.webp"), quality=80)

    print("== Logo @2x ==")
    logo_src = os.path.join(IMAGES, "logo-essencial-energia.png")
    im = Image.open(logo_src).convert("RGBA")
    logo_2x = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    logo_2x_path = os.path.join(IMAGES, "logo-essencial-energia@2x.png")
    logo_2x.save(logo_2x_path, "PNG", optimize=True)
    print(f"{os.path.relpath(logo_2x_path, ROOT)}: {im.width * 2}x{im.height * 2}")

    print("== Miniaturas de Projetos ==")
    for folder in ("data-center", "outros"):
        src_dir = os.path.join(PROJETOS, folder)
        for src in sorted(glob.glob(os.path.join(src_dir, "*.jpg"))):
            name = os.path.splitext(os.path.basename(src))[0]
            dest = os.path.join(src_dir, "thumbs", f"{name}.webp")
            make_thumb(src, dest)
        print(f"{folder}: thumbs gerados")


if __name__ == "__main__":
    main()
