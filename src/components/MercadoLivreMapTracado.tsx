// MercadoLivreMapTracado.tsx
// Variação de teste do mapa do Mercado Livre, com a linguagem visual da intro
// do globo: o contorno do Brasil é traçado de oeste a leste, o território
// aparece em pontos que acompanham o traço, e a região da unidade selecionada
// fica laranja, como o Brasil destacado no globo. Os pinos, o pulso e o painel
// são os mesmos do MercadoLivreMap.

import { AnimatePresence } from 'framer-motion'
import { geoContains } from 'd3-geo'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { useEffect, useMemo, useState } from 'react'
import {
  CLIENTE_COR,
  type GeoFeature,
  geometryToPath,
  PainelUnidade,
  posicionarPinos,
  PulsoAnel,
  type UnidadeMercadoLivre,
} from '@/components/MercadoLivreMap'
import { SATELLITE_RECT, VIEWBOX_HEIGHT, VIEWBOX_WIDTH, project } from '@/lib/brazil-projection'

// Mesma cor laranja do Brasil no globo (RotatingGlobe).
const COR_TERRITORIO = '#e05a1c'
const COR_PONTOS = '#9aa9b8'

// Duração do traçado do contorno. Os pontos acompanham essa mesma duração.
const DURACAO_TRACADO_S = 2.4

type Ponto = [number, number]

interface EstadoGeo {
  id: string
  path: string
  feature: Feature<Polygon | MultiPolygon>
}

export function MercadoLivreMapTracado({ unidades }: { unidades: UnidadeMercadoLivre[] }) {
  const [contorno, setContorno] = useState<string | null>(null)
  const [pontos, setPontos] = useState<Ponto[] | null>(null)
  const [estados, setEstados] = useState<EstadoGeo[]>([])
  const [selecionadoCodigo, setSelecionadoCodigo] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/data/brazil-boundary.json').then((r) => r.json()) as Promise<FeatureCollection>,
      fetch('/data/brazil-dots.json').then((r) => r.json()) as Promise<Ponto[]>,
      fetch('/data/brazil-states.json').then((r) => r.json()) as Promise<{ features: GeoFeature[] }>,
    ])
      .then(([boundary, dots, states]) => {
        const feature = boundary.features[0] as Feature<Polygon | MultiPolygon>
        setContorno(geometryToPath(feature.geometry as GeoFeature['geometry']))
        // ordena de oeste para leste: o traço e os pontos "varrem" o mapa na mesma ordem
        setPontos([...dots].sort((a, b) => a[0] - b[0]))
        setEstados(
          states.features.map((f) => ({
            id: f.properties.id,
            path: geometryToPath(f.geometry as GeoFeature['geometry']),
            feature: f as unknown as Feature<Polygon | MultiPolygon>,
          })),
        )
      })
      .catch(() => {
        setContorno(null)
        setPontos([])
      })
  }, [])

  // dispara a transição depois do primeiro quadro, para o navegador animar
  useEffect(() => {
    if (contorno === null || pontos === null) return
    // setTimeout em vez de requestAnimationFrame: rAF pode ficar pausado em janela sem foco
    const id = window.setTimeout(() => setPronto(true), 60)
    return () => window.clearTimeout(id)
  }, [contorno, pontos])

  const pinos = useMemo(() => posicionarPinos(unidades), [unidades])
  const selecionado = unidades.find((u) => u.codigo === selecionadoCodigo) ?? null
  const ufSelecionada = selecionado?.uf.toLowerCase() ?? null

  // pontos que caem dentro do estado da unidade selecionada (recalculado só ao trocar de UF)
  const pontosDoEstado = useMemo(() => {
    if (!pontos || !ufSelecionada) return new Set<number>()
    const estado = estados.find((e) => e.id === ufSelecionada)
    if (!estado) return new Set<number>()
    const indices = new Set<number>()
    pontos.forEach((ponto, i) => {
      if (geoContains(estado.feature, ponto)) indices.add(i)
    })
    return indices
  }, [pontos, estados, ufSelecionada])

  const estadoDestacado = estados.find((e) => e.id === ufSelecionada) ?? null
  const passoPontos = pontos ? (DURACAO_TRACADO_S * 1000) / Math.max(pontos.length, 1) : 0

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 pt-24 pb-6 sm:px-8 sm:pt-28 sm:pb-8"
      style={{ background: 'radial-gradient(ellipse at center, #1c4f73 0%, #123a56 55%, #0a2540 100%)' }}
      onClick={() => setSelecionadoCodigo(null)}
    >
      <div className="absolute top-24 left-4 z-10 flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-black/40 py-2 pr-4 pl-3 backdrop-blur-md sm:top-28 sm:left-8">
        <span className="h-3 w-3 rounded-full" style={{ background: CLIENTE_COR }} />
        <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
          Mercado Livre · {unidades.length} unidades
        </span>
      </div>

      <div
        className="flex h-full w-full transition-[padding] duration-500 ease-out"
        style={{ paddingRight: selecionado ? 'min(360px, 40%)' : 0 }}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Mapa do Brasil com as unidades do Mercado Livre"
          className="h-full w-full"
        >
          {/* textura de satélite, com entrada suave */}
          <image
            href="/assets/images/brazil-satellite-clipped.webp"
            x={SATELLITE_RECT.x}
            y={SATELLITE_RECT.y}
            width={SATELLITE_RECT.width}
            height={SATELLITE_RECT.height}
            preserveAspectRatio="none"
            style={{ opacity: pronto ? 0.55 : 0, transition: 'opacity 1.6s ease-out' }}
          />

          {/* região destacada: preenchimento leve + contorno laranja, como o Brasil no globo */}
          {estadoDestacado && (
            <path
              d={estadoDestacado.path}
              fill={COR_TERRITORIO}
              fillOpacity={0.14}
              stroke={COR_TERRITORIO}
              strokeWidth={1.4}
              style={{ transition: 'fill-opacity 0.5s ease, stroke 0.5s ease' }}
            />
          )}

          {/* contorno do Brasil traçado, de oeste a leste */}
          {contorno && (
            <path
              d={contorno}
              fill="none"
              stroke="#f4f1e8"
              strokeOpacity={0.75}
              strokeWidth={1.2}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={pronto ? 0 : 1}
              style={{ transition: `stroke-dashoffset ${DURACAO_TRACADO_S}s ease-in-out` }}
            />
          )}

          {/* bordas dos estados, bem discretas */}
          {estados.map((estado) => (
            <path
              key={`${estado.id}-borda`}
              d={estado.path}
              fill="none"
              stroke="#f4f1e8"
              strokeOpacity={0.18}
              strokeWidth={0.6}
            />
          ))}

          {/* território em pontos, revelado no mesmo ritmo do traço */}
          {pontos?.map((ponto, i) => {
            const { x, y } = project(ponto[1], ponto[0])
            const ativo = pontosDoEstado.has(i)
            const rank = i
            return (
              <circle
                key={`p-${i}`}
                cx={x}
                cy={y}
                r={ativo ? 2.8 : 1.6}
                fill={ativo ? COR_TERRITORIO : COR_PONTOS}
                style={{
                  opacity: pronto ? (ativo ? 1 : selecionado ? 0.22 : 0.7) : 0,
                  transition: `opacity 0.6s ease ${rank * passoPontos}ms, fill 0.5s ease, r 0.5s ease`,
                }}
              />
            )
          })}

          {/* pinos das unidades, aparecem depois do território */}
          {pinos.map(({ unidade, x, y }) => {
            const ativo = unidade.codigo === selecionadoCodigo
            const apagado = selecionadoCodigo !== null && !ativo
            return (
              <g
                key={unidade.codigo}
                transform={`translate(${x}, ${y})`}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelecionadoCodigo(unidade.codigo)
                }}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`${unidade.codigo}: ${unidade.cidade}, ${unidade.uf}`}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setSelecionadoCodigo(unidade.codigo)
                }}
                style={{ opacity: pronto ? 1 : 0, transition: 'opacity 0.6s ease 2.2s' }}
              >
                {ativo && (
                  <>
                    <PulsoAnel atraso={0} />
                    <PulsoAnel atraso={0.8} />
                  </>
                )}
                <circle
                  r={ativo ? 8 : 6}
                  fill={CLIENTE_COR}
                  stroke="#0a2540"
                  strokeWidth={1.8}
                  opacity={apagado ? 0.35 : 1}
                  style={{ transition: 'opacity 0.35s ease, r 0.35s ease' }}
                />
                <circle r={22} fill="transparent" />
              </g>
            )
          })}
        </svg>
      </div>

      <AnimatePresence>
        {selecionado && (
          <PainelUnidade key={selecionado.codigo} unidade={selecionado} onFechar={() => setSelecionadoCodigo(null)} />
        )}
      </AnimatePresence>

      <p className="absolute bottom-4 left-4 text-xs text-white/25">
        Mapa: Natural Earth (domínio público) · Satélite: NASA Blue Marble
      </p>
    </div>
  )
}
