#!/usr/bin/env python3
"""Geocodifica a planilha consolidada de clientes (Base_Clientes_Unificada.xlsx,
aba "Base completa") e gera public/data/clients-locations.json.

Estratégia por linha:
1. Se o endereço tem CEP, consulta o ViaCEP (API dos Correios) pra pegar
   cidade/UF/bairro/logradouro oficiais — muito mais confiável que tentar
   extrair a cidade do texto livre da planilha (que vem com formatação
   inconsistente e às vezes sem cidade nenhuma, só CEP).
2. Monta uma query (número + bairro + cidade + UF, dados do ViaCEP) e
   geocodifica via Nominatim (OpenStreetMap).
3. Sem CEP, tenta extrair a cidade do próprio texto do endereço; sem
   isso também, geocodifica só com UF (aproximado, como fallback final).

Respeita o limite de 1 req/s do Nominatim — roda em alguns minutos.
Roda uma vez, offline do app (não faz parte do build).

Uso: python3 scripts/geocode-clients.py
"""

import json
import math
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX_PATH = os.path.join(ROOT, "Base_Clientes_Unificada.xlsx")
OUT_PATH = os.path.join(ROOT, "public/data/clients-locations.json")
GEOCODE_CACHE_PATH = os.path.join(ROOT, "scripts/geocode-cache.json")
VIACEP_CACHE_PATH = os.path.join(ROOT, "scripts/viacep-cache.json")

USER_AGENT = "touchwall-spa-geocoder/1.0 (uso interno Essencial Energia)"
NOMINATIM_DELAY_S = 1.1

BR_BOUNDS = {"latMin": -34.5, "latMax": 6.0, "lngMin": -74.5, "lngMax": -28.0}


# ---------- leitor de xlsx (stdlib puro, sem openpyxl disponível) ----------


def read_xlsx_sheet(path, sheet_name):
    import xml.etree.ElementTree as ET
    import zipfile

    NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

    def col_to_index(col_letters):
        idx = 0
        for c in col_letters:
            idx = idx * 26 + (ord(c) - ord("A") + 1)
        return idx - 1

    def split_ref(ref):
        i = 0
        while ref[i].isalpha():
            i += 1
        return ref[:i], int(ref[i:])

    with zipfile.ZipFile(path) as z:
        wb_xml = ET.fromstring(z.read("xl/workbook.xml"))
        rels_xml = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rels = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels_xml}

        shared_strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            ss_xml = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in ss_xml.findall("main:si", NS):
                texts = si.findall(".//main:t", NS)
                shared_strings.append("".join(t.text or "" for t in texts))

        target = None
        for sheet in wb_xml.find("main:sheets", NS):
            if sheet.attrib["name"] == sheet_name:
                rid = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
                target = rels[rid].lstrip("/")
                if not target.startswith("xl/"):
                    target = "xl/" + target
                break
        if target is None:
            raise ValueError(f"aba {sheet_name!r} não encontrada")

        sheet_xml = ET.fromstring(z.read(target))
        rows_data = {}
        max_col = 0
        for row in sheet_xml.findall(".//main:sheetData/main:row", NS):
            r_idx = int(row.attrib["r"])
            row_cells = {}
            for c in row.findall("main:c", NS):
                ref = c.attrib["r"]
                col_letters, _ = split_ref(ref)
                col_idx = col_to_index(col_letters)
                max_col = max(max_col, col_idx)
                cell_type = c.attrib.get("t")
                v_el = c.find("main:v", NS)
                is_el = c.find("main:is", NS)
                value = None
                if cell_type == "s" and v_el is not None:
                    value = shared_strings[int(v_el.text)]
                elif cell_type == "inlineStr" and is_el is not None:
                    texts = is_el.findall(".//main:t", NS)
                    value = "".join(t.text or "" for t in texts)
                elif v_el is not None:
                    value = v_el.text
                row_cells[col_idx] = value
            rows_data[r_idx] = row_cells

        max_row = max(rows_data.keys()) if rows_data else 0
        grid = []
        for r in range(1, max_row + 1):
            row_cells = rows_data.get(r, {})
            grid.append([row_cells.get(c) for c in range(max_col + 1)])
        return grid


# ---------- helpers ----------


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text


def extract_cep(address):
    m = re.search(r"(\d{2}\.?\d{3})\s*-?\s*(\d{3})", address or "")
    if not m:
        return None
    return m.group(1).replace(".", "") + m.group(2)


def extract_city_from_address(address, state):
    if not address:
        return None
    m = re.search(r",\s*([^,]+?)\s*-\s*" + re.escape(state) + r"\b", address)
    if m:
        return m.group(1).strip()
    m = re.search(r"^([^,-]+?)\s*-\s*" + re.escape(state) + r"\b", address)
    if m:
        return m.group(1).strip()
    return None


def street_part(address):
    """Pega só a parte de logradouro+número, antes do primeiro ' - '
    (separador padrão pro bairro: "Rua X, 59 - Bairro, Cidade - UF") —
    usado junto com os dados do ViaCEP pra montar uma query melhor
    (ViaCEP não retorna número). Importante: NÃO splitar na vírgula
    também, senão corta o número da casa fora ("Rua X, 59" vira só
    "Rua X"), o que faz o Nominatim falhar a busca e cair no fallback
    genérico de cidade/UF — o número costuma ser essencial pro match."""
    if not address:
        return ""
    part = re.split(r"\s+-\s+", address, maxsplit=1)[0]
    return part.strip()


def load_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def lookup_cep(cep, cache):
    if cep in cache:
        return cache[cep]
    url = f"https://viacep.com.br/ws/{cep}/json/"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"    (viacep falhou pra {cep}: {e})", file=sys.stderr)
        data = {}
    if data.get("erro"):
        data = {}
    cache[cep] = data
    save_json(VIACEP_CACHE_PATH, cache)
    return data


def geocode(query, cache):
    if query in cache:
        return cache[query]
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": query, "format": "json", "limit": 1, "countrycodes": "br"}
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"    (nominatim falhou pra {query!r}: {e})", file=sys.stderr)
        data = []
    time.sleep(NOMINATIM_DELAY_S)

    result = None
    if data:
        lat, lng = float(data[0]["lat"]), float(data[0]["lon"])
        if BR_BOUNDS["latMin"] <= lat <= BR_BOUNDS["latMax"] and BR_BOUNDS["lngMin"] <= lng <= BR_BOUNDS["lngMax"]:
            result = {"lat": lat, "lng": lng}
    cache[query] = result
    save_json(GEOCODE_CACHE_PATH, cache)
    return result


def dist_km(lat1, lng1, lat2, lng2):
    R = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def main():
    rows = read_xlsx_sheet(XLSX_PATH, "Base completa")[1:]
    rows = [r for r in rows if r and r[0]]

    excluded_fechada = [r for r in rows if "fechad" in (r[0] or "").lower()]
    rows = [r for r in rows if "fechad" not in (r[0] or "").lower()]

    print(f"Total de linhas: {len(rows) + len(excluded_fechada)}")
    print(f"Excluídas (fechadas): {len(excluded_fechada)}")
    print(f"A geocodificar: {len(rows)}")
    print()

    geo_cache = load_json(GEOCODE_CACHE_PATH)
    cep_cache = load_json(VIACEP_CACHE_PATH)
    clients = []
    failed = []
    seen_ids = {}
    cep_hits = 0

    for i, row in enumerate(rows, start=1):
        name = (row[0] or "").strip()
        address = (row[1] or "").strip() if len(row) > 1 else ""
        state = (row[2] or "").strip() if len(row) > 2 else ""

        print(f"[{i}/{len(rows)}] {name[:60]}", flush=True)

        city = None
        query = None

        street_query = None

        cep = extract_cep(address)
        if cep:
            via = lookup_cep(cep, cep_cache)
            if via.get("localidade"):
                cep_hits += 1
                city = via["localidade"]
                state = via.get("uf") or state
                street = street_part(address) or via.get("logradouro", "")
                bairro = via.get("bairro", "")
                query_parts = [p for p in [street, bairro, city, state, "Brasil"] if p]
                query = ", ".join(query_parts)
                # o bairro oficial do ViaCEP às vezes não bate com o nome
                # que o Nominatim/OSM usa pro mesmo lugar (ex: "Centro" vs
                # "Glicério"/"Sé") e isso faz a busca não achar nada mesmo
                # com número certo — guarda uma query sem bairro como
                # segundo tiro antes de cair pro fallback de cidade/UF.
                if street and bairro:
                    street_query = ", ".join(p for p in [street, city, state, "Brasil"] if p)

        if query is None:
            city = extract_city_from_address(address, state)
            if address:
                query = f"{address}, Brasil" if "brasil" not in address.lower() else address

        coords = geocode(query, geo_cache) if query else None

        if coords is None and street_query:
            coords = geocode(street_query, geo_cache)

        # ruas com nome genérico (ex: "Av. Pres. Juscelino Kubitschek")
        # existem em várias cidades do Brasil — o Nominatim às vezes acerta
        # a rua errada, numa cidade errada, e ainda assim retorna um ponto
        # válido (não None). Valida contra o centroide da cidade: se o
        # resultado está muito longe dela, descarta e cai pro fallback.
        if coords is not None and city and state:
            city_coords = geocode(f"{city}, {state}, Brasil", geo_cache)
            if city_coords and dist_km(coords["lat"], coords["lng"], city_coords["lat"], city_coords["lng"]) > 80:
                coords = None

        if coords is None and city and state:
            coords = geocode(f"{city}, {state}, Brasil", geo_cache)

        if coords is None and state:
            coords = geocode(f"{state}, Brasil", geo_cache)

        if coords is None:
            failed.append({"name": name, "address": address, "state": state})
            continue

        base_id = slugify(name) or f"cliente-{i}"
        suffix = seen_ids.get(base_id, 0)
        seen_ids[base_id] = suffix + 1
        client_id = base_id if suffix == 0 else f"{base_id}-{suffix + 1}"

        client = {
            "id": client_id,
            "name": name,
            "lat": round(coords["lat"], 7),
            "lng": round(coords["lng"], 7),
        }
        if city:
            client["city"] = city
        if state:
            client["state"] = state
        clients.append(client)

    save_json(OUT_PATH, clients)

    print()
    print(f"OK: {len(clients)} clientes geocodificados e salvos em {OUT_PATH}")
    print(f"Resolvidos via ViaCEP: {cep_hits}")
    print(f"Falharam: {len(failed)}")
    if failed:
        fail_path = os.path.join(ROOT, "scripts/geocode-failures.json")
        save_json(fail_path, failed)
        print(f"Lista de falhas salva em {fail_path}")
        for f_ in failed:
            print(f"  - {f_['name']} ({f_['address']})")


if __name__ == "__main__":
    main()
