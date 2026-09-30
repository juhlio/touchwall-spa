#!/usr/bin/env python3
"""Gera o ícone do executável (Windows .ico + Linux .png) e o favicon da
versão web, a partir do logo quadrado oficial da Essencial Energia. Usa
só o símbolo (estrela), sem o texto "ESSENCIAL ENERGIA" — em 16-32px
(tamanho real de barra de tarefas/aba do navegador) o texto fica
ilegível e só reduz o símbolo. Roda uma vez, offline — não faz parte do
build. electron-builder lê build/icon.ico e build/icon.png
automaticamente (convenção de diretório de build resources).
"""

import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public/assets/images/logo-essencial-energia-square.jpg")
BUILD_DIR = os.path.join(ROOT, "build")
PUBLIC_DIR = os.path.join(ROOT, "public")

ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]
PNG_SIZE = 512
FAVICON_SIZE = 256
WHITE_THRESHOLD = 235
MARGIN_RATIO = 0.12


def is_content_row(im, y, width):
    px = im.load()
    for x in range(width):
        r, g, b = px[x, y][:3]
        if not (r > WHITE_THRESHOLD and g > WHITE_THRESHOLD and b > WHITE_THRESHOLD):
            return True
    return False


def symbol_bbox(im):
    """Isola só o símbolo (primeiro bloco de conteúdo de cima pra baixo,
    parando no primeiro espaço em branco — a faixa antes do texto).
    Retorna a caixa do símbolo e o fim da faixa em branco que o separa do
    texto (limite seguro até onde dá pra abrir a margem inferior)."""
    width, height = im.size
    start = next(y for y in range(height) if is_content_row(im, y, width))
    gap_start = next((y for y in range(start + 5, height) if not is_content_row(im, y, width)), height)
    gap_end = next((y for y in range(gap_start + 1, height) if is_content_row(im, y, width)), height)

    px = im.load()
    xs = [
        x
        for y in range(start, gap_start)
        for x in range(width)
        if not all(c > WHITE_THRESHOLD for c in px[x, y][:3])
    ]
    return min(xs), start, max(xs), gap_start, gap_end


def main():
    os.makedirs(BUILD_DIR, exist_ok=True)
    im = Image.open(SRC).convert("RGB")

    x0, y0, x1, y1, gap_end = symbol_bbox(im)
    box_w, box_h = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2

    desired_half = max(box_w, box_h) * (0.5 + MARGIN_RATIO)
    # Nunca deixa a margem inferior invadir o texto — trava no meio da
    # faixa em branco entre o símbolo e "ESSENCIAL ENERGIA".
    safe_half_bottom = (y1 + gap_end) / 2 - cy
    half = min(desired_half, safe_half_bottom)

    # Canvas branco maior que a imagem original — o crop pode extrapolar
    # os limites (o símbolo fica perto da borda de cima), e crop() do PIL
    # preenche área fora da imagem com preto, não branco.
    pad = int(half * 2)
    canvas = Image.new("RGB", (im.width + pad * 2, im.height + pad * 2), "white")
    canvas.paste(im, (pad, pad))

    symbol = canvas.crop((int(pad + cx - half), int(pad + cy - half), int(pad + cx + half), int(pad + cy + half)))
    symbol = symbol.resize((PNG_SIZE, PNG_SIZE), Image.LANCZOS)

    ico_path = os.path.join(BUILD_DIR, "icon.ico")
    symbol.save(ico_path, format="ICO", sizes=[(s, s) for s in ICO_SIZES])
    print(f"{os.path.relpath(ico_path, ROOT)}: {ICO_SIZES}")

    png_path = os.path.join(BUILD_DIR, "icon.png")
    symbol.save(png_path, "PNG")
    print(f"{os.path.relpath(png_path, ROOT)}: {PNG_SIZE}x{PNG_SIZE}")

    favicon = symbol.resize((FAVICON_SIZE, FAVICON_SIZE), Image.LANCZOS)
    favicon_path = os.path.join(PUBLIC_DIR, "favicon.png")
    favicon.save(favicon_path, "PNG")
    print(f"{os.path.relpath(favicon_path, ROOT)}: {FAVICON_SIZE}x{FAVICON_SIZE}")


if __name__ == "__main__":
    main()
