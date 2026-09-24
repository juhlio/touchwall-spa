// generate-land-dots.mjs
// Pré-calcula os pontos (dots) dentro dos continentes (land-110m.json) e
// dentro do contorno do Brasil (brazil-boundary.json), salvando em
// land-dots.json / brazil-dots.json. Roda uma vez em build/manutenção —
// evita que o navegador tenha que fazer esse cálculo (point-in-polygon)
// toda vez que o globo carrega.
//
// Uso: node scripts/generate-land-dots.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { geoBounds } from 'd3-geo'

const DATA_DIR = new URL('../public/data/', import.meta.url)
const DOT_SPACING = 16

function pointInRing(point, ring) {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

function pointInFeature(point, feature) {
  const { geometry } = feature

  if (geometry.type === 'Polygon') {
    const [outer, ...holes] = geometry.coordinates
    if (!pointInRing(point, outer)) return false
    return !holes.some((hole) => pointInRing(point, hole))
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(([outer, ...holes]) => {
      if (!pointInRing(point, outer)) return false
      return !holes.some((hole) => pointInRing(point, hole))
    })
  }

  return false
}

function generateDotsInFeature(feature) {
  const dots = []
  const [[minLng, minLat], [maxLng, maxLat]] = geoBounds(feature)
  const stepSize = DOT_SPACING * 0.08

  for (let lng = minLng; lng <= maxLng; lng += stepSize) {
    for (let lat = minLat; lat <= maxLat; lat += stepSize) {
      if (pointInFeature([lng, lat], feature)) {
        dots.push([Number(lng.toFixed(3)), Number(lat.toFixed(3))])
      }
    }
  }

  return dots
}

function generate(sourceFile, outputFile) {
  const source = JSON.parse(readFileSync(new URL(sourceFile, DATA_DIR), 'utf-8'))
  const dots = source.features.flatMap((feature) => generateDotsInFeature(feature))
  writeFileSync(new URL(outputFile, DATA_DIR), JSON.stringify(dots))
  console.log(`Gerados ${dots.length} pontos em public/data/${outputFile}`)
}

generate('land-110m.json', 'land-dots.json')
generate('brazil-boundary.json', 'brazil-dots.json')
