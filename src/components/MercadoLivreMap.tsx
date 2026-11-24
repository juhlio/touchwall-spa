// MercadoLivreMap.tsx
// Mapa do Brasil com as unidades de atendimento do Mercado Livre
// (public/data/mercado-livre-unidades.json). Ao tocar em uma unidade, ela
// ganha destaque: ondas de pulso no pino, os demais escurecem e um painel
// com os dados da planilha desliza para dentro da tela.

import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SATELLITE_RECT, VIEWBOX_HEIGHT, VIEWBOX_WIDTH, project } from '@/lib/brazil-projection'

export interface UnidadeMercadoLivre {
  codigo: string
  regiao: string
  logradouro: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  lat: number
  lng: number
  precisao: 'link' | 'endereco' | 'bairro' | 'cidade' | 'manual'
  destaque: boolean
  regional?: string
  potencia?: string
  tipo?: string
  geradores?: number
}

interface StateFeature {
  id: string
  path: string
}

type Ring = [number, number][]

export interface GeoFeature {
  properties: { id: string }
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Ring[] | Ring[][] }
}

// Cor da marca do cliente, usada só nesta tela (o resto do app segue a Essencial).
export const CLIENTE_COR = '#ffe600'

// Pinos mais próximos que isso são afastados levemente (ex.: Recife tem duas unidades).
const MIN_DISTANCIA_PINOS = 5
const AFASTAMENTOS = [
  [0, 0],
  [4, 0],
  [-4, 0],
  [0, 4],
  [0, -4],
  [4, 4],
  [-4, -4],
  [4, -4],
  [-4, 4],
]

function ringToPath(ring: Ring) {
  return (
    ring
      .map(([lng, lat], index) => {
        const { x, y } = project(lat, lng)
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ') + ' Z'
  )
}

export function geometryToPath(geometry: GeoFeature['geometry']) {
  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as Ring[]).map(ringToPath).join(' ')
  }
  return (geometry.coordinates as Ring[][]).flat().map(ringToPath).join(' ')
}

export interface PinoPosicionado {
  unidade: UnidadeMercadoLivre
  x: number
  y: number
}

// Calcula a posição de cada pino e afasta os que caem em cima de outro.
export function posicionarPinos(unidades: UnidadeMercadoLivre[]): PinoPosicionado[] {
  const colocados: { x: number; y: number }[] = []
  return unidades.map((unidade) => {
    const base = project(unidade.lat, unidade.lng)
    const escolhido =
      AFASTAMENTOS.map(([dx, dy]) => ({ x: base.x + dx, y: base.y + dy })).find(
        (candidato) =>
          colocados.every((p) => Math.hypot(p.x - candidato.x, p.y - candidato.y) >= MIN_DISTANCIA_PINOS),
      ) ?? base
    colocados.push(escolhido)
    return { unidade, x: escolhido.x, y: escolhido.y }
  })
}

export function MercadoLivreMap({ unidades }: { unidades: UnidadeMercadoLivre[] }) {
  const [estados, setEstados] = useState<StateFeature[]>([])
  const [selecionadoCodigo, setSelecionadoCodigo] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/brazil-states.json')
      .then((res) => res.json())
      .then((data: { features: GeoFeature[] }) =>
        setEstados(
          data.features.map((feature) => ({
            id: feature.properties.id,
            path: geometryToPath(feature.geometry),
          })),
        ),
      )
      .catch(() => setEstados([]))
  }, [])

  const pinos = useMemo(() => posicionarPinos(unidades), [unidades])
  const selecionado = unidades.find((u) => u.codigo === selecionadoCodigo) ?? null
  const pinoSelecionado = pinos.find((p) => p.unidade.codigo === selecionadoCodigo) ?? null

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 pt-24 pb-6 sm:px-8 sm:pt-28 sm:pb-8"
      style={{ background: 'radial-gradient(ellipse at center, #1c4f73 0%, #123a56 55%, #0a2540 100%)' }}
      onClick={() => setSelecionadoCodigo(null)}
    >
      {/* legenda */}
      <div className="absolute top-24 left-4 z-10 flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-black/40 py-2 pr-4 pl-3 backdrop-blur-md sm:top-28 sm:left-8">
        <span className="h-3 w-3 rounded-full" style={{ background: CLIENTE_COR }} />
        <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
          Mercado Livre · {unidades.length} unidades
        </span>
      </div>

      {/* com o painel aberto, o mapa recua para a esquerda e o litoral continua visível */}
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
        {/* reserva de cor, caso a textura não cubra algum trecho */}
        {estados.map((estado) => (
          <path key={estado.id} d={estado.path} fill="#4a6b3d" />
        ))}

        <image
          href="/assets/images/brazil-satellite-clipped.webp"
          x={SATELLITE_RECT.x}
          y={SATELLITE_RECT.y}
          width={SATELLITE_RECT.width}
          height={SATELLITE_RECT.height}
          preserveAspectRatio="none"
        />

        {estados.map((estado) => (
          <path
            key={`${estado.id}-borda`}
            d={estado.path}
            fill="none"
            stroke="#f4f1e8"
            strokeOpacity={0.35}
            strokeWidth={0.7}
          />
        ))}

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
            >
              {/* ondas de pulso: só no pino selecionado */}
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

              {/* área de toque maior que o pino visível */}
              <circle r={22} fill="transparent" />
            </g>
          )
        })}
      </svg>
      </div>

      <AnimatePresence>
        {selecionado && (
          <PainelUnidade
            key={selecionado.codigo}
            unidade={selecionado}
            onFechar={() => setSelecionadoCodigo(null)}
          />
        )}
      </AnimatePresence>

      {/* posição do pino selecionado, usada só como referência de acessibilidade */}
      {pinoSelecionado && <span className="sr-only">Selecionado: {pinoSelecionado.unidade.cidade}</span>}

      <p className="absolute bottom-4 left-4 text-xs text-white/25">
        Mapa: Natural Earth (domínio público) · Satélite: NASA Blue Marble
      </p>
    </div>
  )
}

// Anel que se expande e some, em loop, centrado no pino (animação nativa do SVG).
export function PulsoAnel({ atraso }: { atraso: number }) {
  return (
    <circle r={8} fill="none" stroke={CLIENTE_COR} strokeWidth={2} className="pointer-events-none">
      <animate attributeName="r" from="8" to="34" dur="1.6s" begin={`${atraso}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.9" to="0" dur="1.6s" begin={`${atraso}s`} repeatCount="indefinite" />
    </circle>
  )
}

export function PainelUnidade({
  unidade,
  onFechar,
  inferior = 'bottom-16',
}: {
  unidade: UnidadeMercadoLivre
  onFechar: () => void
  inferior?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      onClick={(event) => event.stopPropagation()}
      className={`absolute top-24 right-4 ${inferior} z-20 flex w-[min(340px,calc(100%-2rem))] flex-col gap-4 overflow-y-auto rounded-[20px] border border-white/[0.1] bg-[rgba(8,7,6,0.85)] p-6 backdrop-blur-xl sm:top-28 sm:right-8`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${CLIENTE_COR}22`, border: `1px solid ${CLIENTE_COR}55` }}
          >
            <MapPin size={18} style={{ color: CLIENTE_COR }} strokeWidth={2} />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: CLIENTE_COR }}>
              {unidade.codigo}
            </div>
            <div className="text-[13px] text-white/50">Mercado Livre</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 active:scale-95"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {unidade.cidade}
          {unidade.uf ? ` · ${unidade.uf}` : ''}
        </h2>
        <p className="mt-1 text-sm text-white/50">Região {unidade.regiao}</p>
      </div>

      <dl className="flex flex-col gap-3 text-sm">
        {unidade.regional && <Campo rotulo="Regional" valor={unidade.regional} />}
        {unidade.potencia && <Campo rotulo="Potência" valor={unidade.potencia} />}
        {unidade.tipo && <Campo rotulo="Tipo" valor={unidade.tipo} />}
        {unidade.logradouro && <Campo rotulo="Endereço" valor={unidade.logradouro} />}
        {unidade.bairro && <Campo rotulo="Bairro" valor={unidade.bairro} />}
        {unidade.cep && <Campo rotulo="CEP" valor={unidade.cep} />}
      </dl>

      {(unidade.precisao === 'bairro' || unidade.precisao === 'cidade') && (
        <p className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-xs leading-relaxed text-white/50">
          {unidade.precisao === 'bairro'
            ? 'Localização aproximada, no bairro. O endereço exato não foi encontrado no mapa.'
            : 'Localização aproximada, no centro da cidade. O endereço exato não foi encontrado no mapa.'}
        </p>
      )}

      {unidade.destaque && (
        <span
          className="self-start rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
          style={{ background: `${CLIENTE_COR}22`, color: CLIENTE_COR }}
        >
          Marcada como destaque
        </span>
      )}
    </motion.div>
  )
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium tracking-wide text-white/40 uppercase">{rotulo}</dt>
      <dd className="mt-0.5 text-white/85">{valor}</dd>
    </div>
  )
}
