// MercadoLivreMapTracado.tsx
// Variação do mapa do Mercado Livre com a linguagem visual da intro do globo:
// o contorno do Brasil é traçado de oeste a leste e a região da unidade
// selecionada fica laranja, como o Brasil destacado no globo. Tem controles de
// zoom e, ao selecionar uma unidade, o mapa aproxima até ela com transição.
// Os pinos, o pulso e o painel são os mesmos do MercadoLivreMap.

import { AnimatePresence } from 'framer-motion'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import {
  CLIENTE_COR,
  type GeoFeature,
  geometryToPath,
  PainelUnidade,
  posicionarPinos,
  PulsoAnel,
  type UnidadeMercadoLivre,
} from '@/components/MercadoLivreMap'
import { SATELLITE_RECT, VIEWBOX_HEIGHT, VIEWBOX_WIDTH } from '@/lib/brazil-projection'

// Mesma cor laranja do Brasil no globo (RotatingGlobe).
const COR_TERRITORIO = '#e05a1c'

// Duração do traçado do contorno.
const DURACAO_TRACADO_S = 2.4

const ZOOM_MIN = 1
const ZOOM_MAX = 6
const ZOOM_FOCO_UNIDADE = 3.4
const TRANSICAO_ZOOM = 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)'

interface Vista {
  escala: number
  // ponto do mapa (em unidades do viewBox) que fica no centro da tela
  cx: number
  cy: number
}

const VISTA_INICIAL: Vista = { escala: 1, cx: VIEWBOX_WIDTH / 2, cy: VIEWBOX_HEIGHT / 2 }

// Mantém o centro dentro do mapa, para não mostrar área vazia ao redor do Brasil.
function limitarVista(escala: number, cx: number, cy: number): Vista {
  const metadeW = VIEWBOX_WIDTH / (2 * escala)
  const metadeH = VIEWBOX_HEIGHT / (2 * escala)
  return {
    escala,
    cx: Math.min(Math.max(cx, metadeW), VIEWBOX_WIDTH - metadeW),
    cy: Math.min(Math.max(cy, metadeH), VIEWBOX_HEIGHT - metadeH),
  }
}

export function MercadoLivreMapTracado({ unidades }: { unidades: UnidadeMercadoLivre[] }) {
  const [contorno, setContorno] = useState<string | null>(null)
  const [estados, setEstados] = useState<{ id: string; path: string }[]>([])
  const [selecionadoCodigo, setSelecionadoCodigo] = useState<string | null>(null)
  const [vista, setVista] = useState<Vista>(VISTA_INICIAL)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/data/brazil-boundary.json').then((r) => r.json()) as Promise<FeatureCollection>,
      fetch('/data/brazil-states.json').then((r) => r.json()) as Promise<{ features: GeoFeature[] }>,
    ])
      .then(([boundary, states]) => {
        const feature = boundary.features[0] as Feature<Polygon | MultiPolygon>
        setContorno(geometryToPath(feature.geometry as GeoFeature['geometry']))
        setEstados(
          states.features.map((f) => ({
            id: f.properties.id,
            path: geometryToPath(f.geometry as GeoFeature['geometry']),
          })),
        )
      })
      .catch(() => setContorno(null))
  }, [])

  // dispara a transição depois de montar, para o navegador animar o traço
  useEffect(() => {
    if (contorno === null) return
    // setTimeout em vez de requestAnimationFrame: rAF pode ficar pausado em janela sem foco
    const id = window.setTimeout(() => setPronto(true), 60)
    return () => window.clearTimeout(id)
  }, [contorno])

  const pinos = useMemo(() => posicionarPinos(unidades), [unidades])
  const selecionado = unidades.find((u) => u.codigo === selecionadoCodigo) ?? null
  const ufSelecionada = selecionado?.uf.toLowerCase() ?? null
  const estadoDestacado = estados.find((e) => e.id === ufSelecionada) ?? null

  function selecionarUnidade(codigo: string) {
    const pino = pinos.find((p) => p.unidade.codigo === codigo)
    setSelecionadoCodigo(codigo)
    if (pino) setVista(limitarVista(ZOOM_FOCO_UNIDADE, pino.x, pino.y))
  }

  function fecharSelecao() {
    setSelecionadoCodigo(null)
    setVista(VISTA_INICIAL)
  }

  function alterarZoom(fator: number) {
    const escala = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vista.escala * fator))
    setVista(escala === ZOOM_MIN ? VISTA_INICIAL : limitarVista(escala, vista.cx, vista.cy))
  }

  const { escala, cx, cy } = vista
  // translação e escala do grupo: o ponto (cx, cy) do mapa vai para o centro do viewBox
  const transformMapa = `translate(${VIEWBOX_WIDTH / 2 - cx * escala}px, ${VIEWBOX_HEIGHT / 2 - cy * escala}px) scale(${escala})`

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 pt-24 pb-6 sm:px-8 sm:pt-28 sm:pb-8"
      style={{ background: 'radial-gradient(ellipse at center, #1c4f73 0%, #123a56 55%, #0a2540 100%)' }}
      onClick={fecharSelecao}
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
          <g style={{ transform: transformMapa, transition: TRANSICAO_ZOOM }}>
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
                fillOpacity={0.2}
                stroke={COR_TERRITORIO}
                strokeWidth={1.4}
                vectorEffect="non-scaling-stroke"
                style={{ transition: 'fill-opacity 0.5s ease, stroke 0.5s ease' }}
              />
            )}

            {/* contorno do Brasil traçado, de oeste a leste */}
            {contorno && (
              <path
                d={contorno}
                fill="none"
                stroke="#f4f1e8"
                strokeOpacity={0.8}
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
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
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* pinos das unidades: o tamanho na tela não muda com o zoom */}
            {pinos.map(({ unidade, x, y }) => {
              const ativo = unidade.codigo === selecionadoCodigo
              const apagado = selecionadoCodigo !== null && !ativo
              return (
                <g
                  key={unidade.codigo}
                  onClick={(event) => {
                    event.stopPropagation()
                    selecionarUnidade(unidade.codigo)
                  }}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${unidade.codigo}: ${unidade.cidade}, ${unidade.uf}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') selecionarUnidade(unidade.codigo)
                  }}
                  style={{
                    transform: `translate(${x}px, ${y}px) scale(${1 / escala})`,
                    transition: `${TRANSICAO_ZOOM}, opacity 0.6s ease ${pronto ? '2.2s' : '0s'}`,
                    opacity: pronto ? 1 : 0,
                  }}
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
          </g>
        </svg>
      </div>

      {/* controles de zoom */}
      <div
        className="absolute bottom-16 left-4 z-20 flex flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-md sm:left-8"
        onClick={(event) => event.stopPropagation()}
      >
        <BotaoZoom rotulo="Aproximar" onClick={() => alterarZoom(1.6)} desabilitado={escala >= ZOOM_MAX}>
          <Plus size={18} />
        </BotaoZoom>
        <div className="h-px w-full bg-white/[0.1]" />
        <BotaoZoom rotulo="Afastar" onClick={() => alterarZoom(1 / 1.6)} desabilitado={escala <= ZOOM_MIN}>
          <Minus size={18} />
        </BotaoZoom>
        <div className="h-px w-full bg-white/[0.1]" />
        <BotaoZoom rotulo="Mostrar o Brasil inteiro" onClick={fecharSelecao} desabilitado={escala === ZOOM_MIN && !selecionado}>
          <RotateCcw size={16} />
        </BotaoZoom>
      </div>

      <AnimatePresence>
        {selecionado && (
          <PainelUnidade key={selecionado.codigo} unidade={selecionado} onFechar={fecharSelecao} />
        )}
      </AnimatePresence>

      <p className="absolute bottom-4 left-4 text-xs text-white/25">
        Mapa: Natural Earth (domínio público) · Satélite: NASA Blue Marble
      </p>
    </div>
  )
}

function BotaoZoom({
  rotulo,
  onClick,
  desabilitado,
  children,
}: {
  rotulo: string
  onClick: () => void
  desabilitado: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-label={rotulo}
      className="flex h-11 w-11 items-center justify-center text-white/70 active:scale-95 disabled:opacity-30"
    >
      {children}
    </button>
  )
}
