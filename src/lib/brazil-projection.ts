// brazil-projection.ts
// Projeção equiretangular do mapa do Brasil (viewBox 800x796), compartilhada
// pelos mapas do app. É a mesma projeção usada para recortar a textura de
// satélite (scripts/clip-satellite-image.py), então pinos e imagem ficam
// alinhados.

export const VIEWBOX_WIDTH = 800
export const VIEWBOX_HEIGHT = 796

// Extensão do Brasil continental: do Monte Caburaí (RR) ao Arroio Chuí (RS)
// e da Serra da Contamana (AC) à Ponta do Seixas (PB).
export const GEO_BOUNDS = {
  latMax: 5.27,
  latMin: -33.75,
  lngMin: -73.99,
  lngMax: -34.79,
}

export function project(lat: number, lng: number) {
  const x = ((lng - GEO_BOUNDS.lngMin) / (GEO_BOUNDS.lngMax - GEO_BOUNDS.lngMin)) * VIEWBOX_WIDTH
  const y = ((GEO_BOUNDS.latMax - lat) / (GEO_BOUNDS.latMax - GEO_BOUNDS.latMin)) * VIEWBOX_HEIGHT
  return { x, y }
}

// Retângulo da textura de satélite: recorte com margem de 4° ao redor do Brasil.
const SATELLITE_PAD_DEG = 4
const satelliteTopLeft = project(GEO_BOUNDS.latMax + SATELLITE_PAD_DEG, GEO_BOUNDS.lngMin - SATELLITE_PAD_DEG)
const satelliteBottomRight = project(GEO_BOUNDS.latMin - SATELLITE_PAD_DEG, GEO_BOUNDS.lngMax + SATELLITE_PAD_DEG)

export const SATELLITE_RECT = {
  x: satelliteTopLeft.x,
  y: satelliteTopLeft.y,
  width: satelliteBottomRight.x - satelliteTopLeft.x,
  height: satelliteBottomRight.y - satelliteTopLeft.y,
}
