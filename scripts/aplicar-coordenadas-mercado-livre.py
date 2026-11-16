#!/usr/bin/env python3
"""Aplica coordenadas conferidas manualmente (scripts/coordenadas-mercado-livre.csv)
sobre public/data/mercado-livre-unidades.json.

Preencha as colunas lat e lng (separador ';', ponto como decimal) com a
latitude e a longitude de cada unidade, por exemplo copiadas do Google Maps
(clique com o botão direito no local). Linhas com lat e lng vazios são ignoradas
e continuam com a posição automática. Unidades aplicadas recebem precisao = "manual".
"""

import csv
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CSV_PATH = RAIZ / "scripts/coordenadas-mercado-livre.csv"
JSON_PATH = RAIZ / "public/data/mercado-livre-unidades.json"


def main():
    unidades = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    por_codigo = {u["codigo"]: u for u in unidades}
    aplicadas = []
    with CSV_PATH.open(encoding="utf-8", newline="") as f:
        for linha in csv.DictReader(f, delimiter=";"):
            lat = (linha.get("lat") or "").strip().replace(",", ".")
            lng = (linha.get("lng") or "").strip().replace(",", ".")
            if not lat or not lng:
                continue
            unidade = por_codigo.get(linha["codigo"].strip())
            if unidade is None:
                raise SystemExit(f"Código não encontrado: {linha['codigo']}")
            unidade["lat"] = round(float(lat), 6)
            unidade["lng"] = round(float(lng), 6)
            unidade["precisao"] = "manual"
            aplicadas.append(unidade["codigo"])
    JSON_PATH.write_text(json.dumps(unidades, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(aplicadas)} unidade(s) com coordenadas manuais: {', '.join(aplicadas) or '-'}")


if __name__ == "__main__":
    main()
