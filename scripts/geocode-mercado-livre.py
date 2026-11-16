#!/usr/bin/env python3
"""Geocodifica as unidades do Mercado Livre (lista da planilha) e gera
public/data/mercado-livre-unidades.json.

Para cada unidade tenta, nesta ordem:
  1. rua estruturada (logradouro + cidade + UF)
  2. bairro + cidade + UF
  3. CEP + cidade
Um resultado só é aceito se o nome da cidade e o estado aparecerem no endereço
devolvido pelo Nominatim (OpenStreetMap). Sem isso, a consulta pode cair numa
rua de mesmo nome em outro estado. Se nada passar, usa o centro da cidade.
Respeita 1 requisição por segundo. Não grava CNPJ.
"""

import json
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

NOMINATIM = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "touchwall-map-setup/1.0"
OUT = Path(__file__).resolve().parent.parent / "public/data/mercado-livre-unidades.json"

# codigo, regiao, logradouro, bairro, cep, cidade, uf, destaque (marcação amarela na planilha)
UNIDADES = [
    ("CAD BA02", "Nordeste", "Rodovia BA093, 7310 - KM 7 3 Galpão G50", "Palmares", "43700-000", "Simões Filho", "BA", False),
    ("SMN1", "Nordeste", "Rodovia BR 135 (Avn. Eng. Emiliano Macieira), km 8", "Maracanã", "65095-602", "São Luís", "MA", False),
    ("SPI1", "Nordeste", "Rua B Distrito Industrial 725", "Distrito Industrial", "64027-464", "Teresina", "PI", False),
    ("SPA1", "Norte", "Rodovia BR 316 s/n", "Canutama", "68795-000", "Benevides", "PA", True),
    ("SPA3", "Norte", "Rodovia BR 316 km 26 s/n", "Trevo de Mosqueiro", "68795-000", "Belém", "PA", False),
    ("SRD1", "Norte", "Avenida Jatuarana 6529", "Floresta", "76806-111", "Porto Velho", "RO", False),
    ("SRJ17", "Sudeste", "Avenida Arthur Antonio Sendas 999", "Venda Velha", "25581-325", "São João de Meriti", "RJ", False),
    ("SMS1", "Centro-Oeste", "Avenida Zila Correa Machado 9132", "Rita Vieira", "79062-002", "Campo Grande", "MS", False),
    ("SRD3", "Norte", "Rodovia BR-364 7551", "Lagoa", "76812-401", "Porto Velho", "RO", False),
    ("SMS2", "Centro-Oeste", "Rua Buale Mustafa Rateib 10155", "Chácara Castelo II", "79835-000", "Dourados", "MS", True),
    ("STO1", "Centro-Oeste", "Quadra ASR SE 25, Rua SR 11, conj. 05, 06-A s/n", "Plano Diretor Sul", "77023-640", "Palmas", "TO", True),
    ("SMG13", "Sudeste", "Área rural s/n", "Área Rural de Teófilo Otoni", "39805-899", "Teófilo Otoni", "MG", False),
    ("SMG21", "Sudeste", "Rua Julio Dionisio Cardoso 750", "Distrito Industrial", "36092-020", "Juiz de Fora", "MG", False),
    ("SCE4", "Nordeste", "Rodovia Quarto Anel Viário 900", "Pedras", "60874-401", "Fortaleza", "CE", False),
    ("SMG20", "Sudeste", "Rod BR 050, nº 3555, Galpão Mod 02-11", "Novo Mundo", "38438-899", "Uberlândia", "MG", False),
    ("SRJ16", "Sudeste", "Rod Presidente Dutra, Polo Ind. nº 0", "Polo Industrial I", "27537-000", "Resende", "RJ", False),
    ("SRN1", "Nordeste", "Rodovia Av Piloto Pereira Tim (BR 101) s/nº", "Cajupiranga", "59156-660", "Natal", "RN", False),
    ("SPE2", "Nordeste", "Rodovia BR 101 Sul 9415", "Distrito Industrial Santo Estevão", "54503-010", "Recife", "PE", False),
    ("PE01", "Nordeste", "Rodovia BR 101 Sul, km 96,4, 5205", "Distrito Industrial Diper", "54503-900", "Recife", "PE", False),
    ("SJP1", "Nordeste", "Rua Professora Nevemar Carvalho e Silva 224", "Gramame", "58069-710", "João Pessoa", "PB", False),
    ("SCE5", "Nordeste", "Rua Francisco Martins de Souza, 955", "Jardim Gonzaga", "63046-510", "Juazeiro do Norte", "CE", True),
    ("SBA10", "Nordeste", "Av. Deputado Luis Eduardo Magalhães, s/n, Cond. Celog", "Limoeiro", "44097-324", "Feira de Santana", "BA", False),
    ("SDF5", "Centro-Oeste", "Setor Santa Maria Norte, BR-040 km 2,5, AC 119", "Santa Maria", "72549-650", "Distrito Federal", "DF", False),
    ("SP50", "Sudeste", "Avenida Card Santiago Luiz Copello 597", "Vila Ribeiro de Barros", "05308-000", "São Paulo", "SP", False),
]

ESTADOS = {
    "BA": "bahia", "MA": "maranhão", "PI": "piauí", "PA": "pará", "RO": "rondônia", "RJ": "rio de janeiro",
    "MS": "mato grosso do sul", "TO": "tocantins", "MG": "minas gerais", "CE": "ceará", "RN": "rio grande do norte",
    "PE": "pernambuco", "PB": "paraíba", "DF": "distrito federal", "SP": "são paulo",
}
# tipos que indicam o centro de uma cidade, não um endereço
TIPOS_CIDADE = {"city", "town", "municipality", "village", "county", "state", "administrative", "country"}
TIPOS_BAIRRO = {"suburb", "neighbourhood", "quarter", "residential", "industrial", "hamlet", "locality"}


def normaliza(texto):
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    return sem_acento.lower()


def consulta(params):
    url = NOMINATIM + "?" + urllib.parse.urlencode({**params, "format": "json", "limit": 1, "countrycodes": "br", "addressdetails": 1})
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        dados = json.load(resp)
    time.sleep(1.1)
    return dados[0] if dados else None


def valido(resultado, cidade, uf):
    """Aceita só se o endereço devolvido é da cidade e do estado certos."""
    if resultado is None or resultado.get("addresstype") in TIPOS_CIDADE:
        return False
    endereco = normaliza(resultado.get("display_name", ""))
    return normaliza(cidade) in endereco and ESTADOS[uf] in endereco


def consulta_viacep(cep):
    """Dados oficiais dos Correios para o CEP (logradouro, bairro, município)."""
    url = f"https://viacep.com.br/ws/{cep.replace('-', '')}/json/"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            dados = json.load(resp)
    except OSError:
        return {}
    time.sleep(0.3)
    return {} if dados.get("erro") else dados


def localizar(logradouro, bairro, cep, cidade, uf):
    oficial = consulta_viacep(cep)
    municipio = oficial.get("localidade") or cidade
    rua = oficial.get("logradouro") or logradouro
    bairro_oficial = oficial.get("bairro") or bairro
    tentativas = [
        ("endereco", {"street": rua, "city": municipio, "state": ESTADOS[uf], "country": "Brasil"}),
        ("bairro", {"q": f"{bairro_oficial}, {municipio}, {uf}, Brasil"}),
        ("endereco", {"q": f"{cep}, {municipio}, {uf}, Brasil"}),
    ]
    for precisao, params in tentativas:
        r = consulta(params)
        if valido(r, municipio, uf):
            if precisao == "endereco" and r.get("addresstype") in TIPOS_BAIRRO:
                precisao = "bairro"
            return float(r["lat"]), float(r["lon"]), precisao, municipio
    r = consulta({"q": f"{municipio}, {uf}, Brasil"})
    if r is None:
        raise SystemExit(f"Sem coordenadas para {municipio}-{uf}")
    return float(r["lat"]), float(r["lon"]), "cidade", municipio


def main():
    saida = []
    for codigo, regiao, logradouro, bairro, cep, cidade, uf, destaque in UNIDADES:
        lat, lng, precisao, municipio_cep = localizar(logradouro, bairro, cep, cidade, uf)
        saida.append({
            "codigo": codigo,
            "regiao": regiao,
            "logradouro": logradouro,
            "bairro": bairro,
            "cep": cep,
            "cidade": cidade,
            "uf": uf,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "precisao": precisao,
            "municipio_cep": municipio_cep,
            "destaque": destaque,
        })
        print(f"{codigo:9} {cidade}-{uf} (CEP: {municipio_cep}): {lat:.4f}, {lng:.4f} ({precisao})")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(saida, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"gravado em {OUT} ({len(saida)} unidades)")


if __name__ == "__main__":
    main()
