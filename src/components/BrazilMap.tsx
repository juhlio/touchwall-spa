// BrazilMap.tsx
// Mapa SVG do Brasil com textura de satélite real (offline, sem tiles
// externos) e pins de clientes (ClientPin) posicionados via projeção de
// lat/long. Ao tocar um pin, expande um modal com foto + info do cliente.
//
// Contorno dos estados: Natural Earth (Admin 1 – States/Provinces, 50m,
// domínio público), carregado de public/data/brazil-states.json e
// desenhado com a mesma projeção equiretangular (project()) usada pra
// recortar public/assets/images/brazil-satellite-clipped.png (gerado por
// scripts/clip-satellite-image.py) — garante que a textura e as
// fronteiras fiquem alinhadas por construção, já que as duas vêm da
// mesma referência de coordenadas reais.

import { AnimatePresence, motion } from 'framer-motion'
import { Home, MapPin, Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ClientPin } from '@/components/ClientPin'
import {
  CLIENTE_COR,
  PainelUnidade,
  PulsoAnel,
  posicionarPinos,
  type UnidadeMercadoLivre,
} from '@/components/MercadoLivreMap'
import type { Client } from '@/types'

interface StateFeature {
  id: string
  name: string
  path: string
}

const VIEWBOX_WIDTH = 800
const VIEWBOX_HEIGHT = 796

// Limites geográficos usados para projetar lat/long em coordenadas do
// viewBox via uma projeção equiretangular. Cobre a extensão real do
// Brasil continental de ponta a ponta — o mapa aparece inteiro, sem
// recortar nenhum estado; o espaço disponível na tela é usado só pra
// escalar (zoom out), nunca pra cortar geografia.
const GEO_BOUNDS = {
  latMax: 5.27, // Monte Caburaí (RR)
  latMin: -33.75, // Arroio Chuí (RS)
  lngMin: -73.99, // Serra da Contamana (AC)
  lngMax: -34.79, // Ponta do Seixas (PB)
}

function project(lat: number, lng: number) {
  const x =
    ((lng - GEO_BOUNDS.lngMin) / (GEO_BOUNDS.lngMax - GEO_BOUNDS.lngMin)) * VIEWBOX_WIDTH
  const y =
    ((GEO_BOUNDS.latMax - lat) / (GEO_BOUNDS.latMax - GEO_BOUNDS.latMin)) * VIEWBOX_HEIGHT
  return { x, y }
}

type Ring = [number, number][]

function ringToPath(ring: Ring) {
  return (
    ring
      .map(([lng, lat], index) => {
        const { x, y } = project(lat, lng)
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ') + ' Z'
  )
}

interface GeoGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: Ring[] | Ring[][]
}

function geometryToPath(geometry: GeoGeometry) {
  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as Ring[]).map(ringToPath).join(' ')
  }
  return (geometry.coordinates as Ring[][]).flat().map(ringToPath).join(' ')
}

interface GeoFeature {
  properties: { id: string; name: string }
  geometry: GeoGeometry
}

// Textura de satélite: recorte do NASA Blue Marble 2002 (domínio
// público, NASA Goddard/Reto Stöckli) com margem de 4° ao redor do
// Brasil — brazil-satellite.jpg é a fonte bruta, e
// brazil-satellite-clipped.png (gerado por
// scripts/clip-satellite-image.py) é a versão já recortada no contorno
// real, usada em tempo de execução.
const SATELLITE_PAD_DEG = 4
const satelliteTopLeft = project(GEO_BOUNDS.latMax + SATELLITE_PAD_DEG, GEO_BOUNDS.lngMin - SATELLITE_PAD_DEG)
const satelliteBottomRight = project(
  GEO_BOUNDS.latMin - SATELLITE_PAD_DEG,
  GEO_BOUNDS.lngMax + SATELLITE_PAD_DEG,
)

const MIN_SCALE = 1
const MAX_SCALE = 8
const DRAG_CLICK_THRESHOLD = 8
// Quanto (em unidades do viewBox) dá pra arrastar/aproximar além da borda
// do Brasil antes de travar — sem isso, zoom perto de qualquer costa
// esbarra numa "moldura" dura assim que a janela visível encosta em
// x/y=0 ou no limite do mapa. Aproximadamente a mesma folga da imagem de
// satélite (4° ao redor do país).
const PAN_MARGIN = 400

// Estado do zoom/pan expresso como uma janela do próprio viewBox do SVG
// (em vez de um CSS transform no elemento inteiro). Evita que o navegador
// precise rasterizar uma textura gigante pra desenhar o zoom — em zoom
// alto, um `transform: scale()` no SVG inteiro pode passar do limite de
// tamanho de textura da GPU e cortar o desenho; mudar o viewBox nunca
// desenha mais que o tamanho real da tela.
interface MapView {
  scale: number
  offsetX: number
  offsetY: number
}

const IDENTITY_VIEW: MapView = { scale: 1, offsetX: 0, offsetY: 0 }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

interface Cluster {
  x: number
  y: number
  clients: Client[]
}

// Agrupa clientes cujos pins ficariam próximos demais na tela (< radius,
// em unidades do viewBox) — o raio encolhe conforme o zoom aumenta, então
// os clusters vão se separando naturalmente até virarem pins individuais.
// Raio visual de um cluster, dado o número de clientes agrupados.
function radiusForCount(count: number) {
  return count <= 1 ? 5 : Math.min(11, 6.5 + Math.log2(count) * 1.5)
}

// Depois de agrupar por proximidade geográfica, empurra clusters cujos
// círculos (já no tamanho visual final) ainda se sobrepõem, pra nunca
// ficarem uns em cima dos outros na tela — só um pequeno ajuste de
// posição, não muda o agrupamento em si.
// Nunca deixa um cluster se afastar mais que isso (em unidades do
// viewBox) da sua posição geográfica real — sem esse limite, em áreas
// muito densas o ajuste de sobreposição podia "empurrar" um cluster pra
// cima do oceano ou de um estado vizinho.
const MAX_DECLUTTER_DRIFT = 10

function resolveOverlaps(clusters: Cluster[]) {
  const positions = clusters.map((cluster) => ({
    ...cluster,
    radius: radiusForCount(cluster.clients.length),
    originX: cluster.x,
    originY: cluster.y,
  }))

  function clampDrift(point: (typeof positions)[number]) {
    const dx = point.x - point.originX
    const dy = point.y - point.originY
    const drift = Math.hypot(dx, dy)
    if (drift > MAX_DECLUTTER_DRIFT) {
      const ratio = MAX_DECLUTTER_DRIFT / drift
      point.x = point.originX + dx * ratio
      point.y = point.originY + dy * ratio
    }
  }

  for (let iteration = 0; iteration < 80; iteration++) {
    let moved = false
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i]
        const b = positions[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const minDist = a.radius + b.radius + 5
        let dist = Math.hypot(dx, dy)
        if (dist >= minDist) continue
        moved = true
        if (dist < 0.001) dist = 0.001
        const overlap = (minDist - dist) / 2
        const ux = dx / dist
        const uy = dy / dist
        a.x -= ux * overlap
        a.y -= uy * overlap
        b.x += ux * overlap
        b.y += uy * overlap
        clampDrift(a)
        clampDrift(b)
      }
    }
    if (!moved) break
  }

  return positions
}

function clusterClients(clients: Client[], radius: number): Cluster[] {
  // Clientes fora dos extremos continentais definidos em GEO_BOUNDS (ex.:
  // Fernando de Noronha, a leste de Ponta do Seixas) projetariam fora do
  // viewBox e nunca apareceriam — prende a posição na borda mais próxima
  // pra garantir que todo cliente tenha um pin visível e clicável.
  const points = clients.map((client) => {
    const projected = project(client.lat, client.lng)
    return {
      client,
      x: clamp(projected.x, 4, VIEWBOX_WIDTH - 4),
      y: clamp(projected.y, 4, VIEWBOX_HEIGHT - 4),
    }
  })
  const taken = new Array(points.length).fill(false)
  const clusters: Cluster[] = []

  for (let i = 0; i < points.length; i++) {
    if (taken[i]) continue
    taken[i] = true
    const group = [points[i]]
    for (let j = i + 1; j < points.length; j++) {
      if (taken[j]) continue
      if (Math.hypot(points[j].x - points[i].x, points[j].y - points[i].y) <= radius) {
        taken[j] = true
        group.push(points[j])
      }
    }
    clusters.push({
      x: group.reduce((sum, p) => sum + p.x, 0) / group.length,
      y: group.reduce((sum, p) => sum + p.y, 0) / group.length,
      clients: group.map((p) => p.client),
    })
  }
  return resolveOverlaps(clusters)
}

const BASE_CLUSTER_RADIUS = 16
// Nunca deixa o raio de agrupamento encolher abaixo disso, mesmo no zoom
// máximo — evita que pins/clusters vizinhos fiquem tão próximos que suas
// áreas de toque se sobreponham e o clique acerte o vizinho errado.
const MIN_CLUSTER_RADIUS = 9

interface BrazilMapProps {
  clients: Client[]
  unidades?: UnidadeMercadoLivre[]
  onPinClick: (client: Client) => void
}

export function BrazilMap({ clients, unidades = [], onPinClick }: BrazilMapProps) {
  const [selected, setSelected] = useState<Client | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<Client[] | null>(null)
  const [unidadeSelecionadaCodigo, setUnidadeSelecionadaCodigo] = useState<string | null>(null)
  // destaque de qualquer pin tocado: estado laranja + anéis de pulso no ponto
  const [destaque, setDestaque] = useState<{ uf: string | null; x: number; y: number } | null>(null)
  const [mostrarClientes, setMostrarClientes] = useState(true)
  const [mostrarUnidades, setMostrarUnidades] = useState(true)
  const [states, setStates] = useState<StateFeature[]>([])
  const [view, setView] = useState<MapView>(IDENTITY_VIEW)

  const clusters = useMemo(
    () => clusterClients(clients, Math.max(MIN_CLUSTER_RADIUS, BASE_CLUSTER_RADIUS / view.scale)),
    [clients, view.scale],
  )

  const viewportRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgPxPerUnit, setSvgPxPerUnit] = useState(1)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null)
  const dragDistanceRef = useRef(0)

  // onWheel do React é passivo por padrão (não dá pra chamar preventDefault
  // nele), então o zoom por roda do mouse/trackpad precisa de um listener
  // nativo.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      const factor = event.deltaY > 0 ? 0.9 : 1.1
      zoomAt(event.clientX, event.clientY, (currentScale) => currentScale * factor)
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [])

  useEffect(() => {
    fetch('/data/brazil-states.json')
      .then((res) => res.json())
      .then((data: { features: GeoFeature[] }) => {
        setStates(
          data.features.map((feature) => ({
            id: feature.properties.id,
            name: feature.properties.name,
            path: geometryToPath(feature.geometry),
          })),
        )
      })
      .catch(() => setStates([]))
  }, [])

  // aproxima e centraliza o pino tocado, com transição suave
  const animacaoRef = useRef<number | null>(null)
  function focarPonto(px: number, py: number) {
    const inicio = view
    const escalaAlvo = 3.2
    const largura = VIEWBOX_WIDTH / escalaAlvo
    const altura = VIEWBOX_HEIGHT / escalaAlvo
    const alvo: MapView = {
      scale: escalaAlvo,
      offsetX: clamp(px - largura / 2, -PAN_MARGIN, VIEWBOX_WIDTH - largura + PAN_MARGIN),
      offsetY: clamp(py - altura / 2, -PAN_MARGIN, VIEWBOX_HEIGHT - altura + PAN_MARGIN),
    }
    if (animacaoRef.current !== null) window.clearInterval(animacaoRef.current)
    const inicioTempo = performance.now()
    const duracaoMs = 900
    const id = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - inicioTempo) / duracaoMs)
      const e = 1 - (1 - t) ** 3
      setView({
        scale: inicio.scale + (alvo.scale - inicio.scale) * e,
        offsetX: inicio.offsetX + (alvo.offsetX - inicio.offsetX) * e,
        offsetY: inicio.offsetY + (alvo.offsetY - inicio.offsetY) * e,
      })
      if (t >= 1) {
        window.clearInterval(id)
        animacaoRef.current = null
      }
    }, 16)
    animacaoRef.current = id
  }

  useEffect(
    () => () => {
      if (animacaoRef.current !== null) window.clearInterval(animacaoRef.current)
    },
    [],
  )

  function handlePinClick(client: Client) {
    if (dragDistanceRef.current > DRAG_CLICK_THRESHOLD) return
    const ponto = project(client.lat, client.lng)
    setDestaque({ uf: client.state ? client.state.toLowerCase() : null, x: ponto.x, y: ponto.y })
    focarPonto(ponto.x, ponto.y)
    setSelected(client)
    onPinClick(client)
  }

  // Zoom mantendo fixo o ponto da tela (screenX, screenY): acha em que
  // parte do viewBox esse ponto cai hoje, calcula a nova janela pro
  // scale alvo, e reposiciona o offset pra esse mesmo ponto do conteúdo
  // continuar embaixo do dedo/cursor.
  function zoomAt(screenX: number, screenY: number, computeScale: (currentScale: number) => number) {
    const svg = svgRef.current
    if (!svg) return
    const svgRect = svg.getBoundingClientRect()
    const relX = (screenX - svgRect.left) / svgRect.width
    const relY = (screenY - svgRect.top) / svgRect.height
    setView((current) => {
      const width = VIEWBOX_WIDTH / current.scale
      const height = VIEWBOX_HEIGHT / current.scale
      const contentX = current.offsetX + relX * width
      const contentY = current.offsetY + relY * height

      const nextScale = clamp(computeScale(current.scale), MIN_SCALE, MAX_SCALE)
      const nextWidth = VIEWBOX_WIDTH / nextScale
      const nextHeight = VIEWBOX_HEIGHT / nextScale

      return {
        scale: nextScale,
        offsetX: clamp(contentX - relX * nextWidth, -PAN_MARGIN, VIEWBOX_WIDTH - nextWidth + PAN_MARGIN),
        offsetY: clamp(contentY - relY * nextHeight, -PAN_MARGIN, VIEWBOX_HEIGHT - nextHeight + PAN_MARGIN),
      }
    })
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Não captura o ponteiro se o toque começou num elemento clicável (ex.:
    // botão "Redefinir zoom" ou um pin, que usa role="button") —
    // setPointerCapture redireciona o click subsequente pro elemento
    // capturado, impedindo o onClick de disparar.
    dragDistanceRef.current = 0
    if ((event.target as HTMLElement).closest('button, [role="button"]')) return
    ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      pinchStartRef.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        scale: view.scale,
      }
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return
    const previous = pointersRef.current.get(event.pointerId)!
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [a, b] = [...pointersRef.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const midX = (a.x + b.x) / 2
      const midY = (a.y + b.y) / 2
      const { distance: startDistance, scale: startScale } = pinchStartRef.current
      dragDistanceRef.current += 1
      zoomAt(midX, midY, () => startScale * (distance / startDistance))
      return
    }

    if (pointersRef.current.size === 1) {
      const dx = event.clientX - previous.x
      const dy = event.clientY - previous.y
      dragDistanceRef.current += Math.hypot(dx, dy)
      const svg = svgRef.current
      if (svg && view.scale > MIN_SCALE) {
        const svgRect = svg.getBoundingClientRect()
        setView((current) => {
          const width = VIEWBOX_WIDTH / current.scale
          const height = VIEWBOX_HEIGHT / current.scale
          return {
            ...current,
            offsetX: clamp(
              current.offsetX - (dx / svgRect.width) * width,
              -PAN_MARGIN,
              VIEWBOX_WIDTH - width + PAN_MARGIN,
            ),
            offsetY: clamp(
              current.offsetY - (dy / svgRect.height) * height,
              -PAN_MARGIN,
              VIEWBOX_HEIGHT - height + PAN_MARGIN,
            ),
          }
        })
      }
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)
    pinchStartRef.current = null
  }

  function resetTransform() {
    setView(IDENTITY_VIEW)
  }

  // Zoom pelos botões +/- (sem ponto de toque pra ancorar): usa o centro
  // da própria área visível do SVG, igual ao botão de zoom do Google Maps.
  function zoomByFactor(factor: number) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, (currentScale) => currentScale * factor)
  }

  const isZoomed = view.scale > MIN_SCALE + 0.01
  const viewBoxWidth = VIEWBOX_WIDTH / view.scale
  const viewBoxHeight = VIEWBOX_HEIGHT / view.scale

  // Quantos px de tela equivalem a 1 unidade do viewBox agora — usado pra
  // manter a área de toque dos pins em pelo menos 44x44px reais, mesmo
  // que o círculo visível continue pequeno.
  useEffect(() => {
    function updateScale() {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      setSvgPxPerUnit(Math.min(rect.width / viewBoxWidth, rect.height / viewBoxHeight))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [viewBoxWidth, viewBoxHeight])

  const TOUCH_TARGET_PX = 44
  const touchRadius = Math.max(5, TOUCH_TARGET_PX / 2 / svgPxPerUnit)
  const pinosUnidades = useMemo(() => posicionarPinos(unidades), [unidades])
  const unidadeAberta = unidades.find((u) => u.codigo === unidadeSelecionadaCodigo) ?? null
  const estadoAberto = destaque?.uf ? states.find((e) => e.id === destaque.uf) ?? null : null

  // contorno do Brasil traçado na entrada, como na intro do globo
  const [contorno, setContorno] = useState<string | null>(null)
  const [tracadoPronto, setTracadoPronto] = useState(false)
  useEffect(() => {
    fetch('/data/brazil-boundary.json')
      .then((r) => r.json())
      .then((data: { features: { geometry: GeoFeature['geometry'] }[] }) =>
        setContorno(geometryToPath(data.features[0].geometry)),
      )
      .catch(() => setContorno(null))
  }, [])
  // o destaque some quando o cartão ou o painel é fechado
  useEffect(() => {
    if (!selected && !unidadeAberta) setDestaque(null)
  }, [selected, unidadeAberta])

  useEffect(() => {
    if (contorno === null) return
    // setTimeout em vez de requestAnimationFrame: rAF pode ficar pausado em janela sem foco
    const id = window.setTimeout(() => setTracadoPronto(true), 60)
    return () => window.clearTimeout(id)
  }, [contorno])

  return (
    <div
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex h-full w-full touch-none items-center justify-center overflow-hidden px-4 pt-24 pb-6 sm:px-8 sm:pt-28 sm:pb-8"
      style={{
        background: 'radial-gradient(ellipse at center, #1c4f73 0%, #123a56 55%, #0a2540 100%)',
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`${view.offsetX} ${view.offsetY} ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Mapa do Brasil"
        className="h-full w-full"
      >
        {/* preenchimento de reserva, caso a imagem não cubra algum canto */}
        {states.map((state) => (
          <path key={state.id} d={state.path} fill="#4a6b3d" />
        ))}

        {/*
          A imagem já vem recortada no contorno do Brasil (transparência
          real, gerada por scripts/clip-satellite-image.py) em vez de usar
          clip-path no <image> em tempo de execução — clipPath + <image>
          no mesmo SVG é um ponto conhecido de bugs de rasterização em
          algumas GPUs/drivers (visto como um corte reto cruzando alguns
          pins próximos à costa).
        */}
        <image
          href="/assets/images/brazil-satellite-clipped.webp"
          x={satelliteTopLeft.x}
          y={satelliteTopLeft.y}
          width={satelliteBottomRight.x - satelliteTopLeft.x}
          height={satelliteBottomRight.y - satelliteTopLeft.y}
          preserveAspectRatio="none"
        />

        {states.map((state) => (
          <path
            key={`${state.id}-border`}
            d={state.path}
            fill="none"
            stroke="#f4f1e8"
            strokeOpacity={0.35}
            strokeWidth={0.7}
          />
        ))}

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
            strokeDashoffset={tracadoPronto ? 0 : 1}
            style={{ transition: 'stroke-dashoffset 2.4s ease-in-out' }}
          />
        )}

        {/* estado da unidade selecionada fica laranja, como o Brasil no globo */}
        {estadoAberto && (
          <path
            d={estadoAberto.path}
            fill="#e05a1c"
            fillOpacity={0.2}
            stroke="#e05a1c"
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
            style={{ transition: 'fill-opacity 0.5s ease' }}
          />
        )}

        {destaque && (
          <g transform={`translate(${destaque.x}, ${destaque.y}) scale(${1 / view.scale})`} className="pointer-events-none">
            <PulsoAnel atraso={0} />
            <PulsoAnel atraso={0.8} />
          </g>
        )}

        {mostrarClientes && clusters.map((cluster) =>
          cluster.clients.length === 1 ? (
            <ClientPin
              key={cluster.clients[0].id}
              client={cluster.clients[0]}
              x={cluster.x}
              y={cluster.y}
              touchRadius={touchRadius}
              onClick={() => handlePinClick(cluster.clients[0])}
            />
          ) : (
            <ClusterPin
              key={`cluster-${cluster.clients[0].id}`}
              x={cluster.x}
              y={cluster.y}
              count={cluster.clients.length}
              onClick={(event) => {
                // destaca o estado do agrupamento, como nos outros pinos
                setDestaque({ uf: cluster.clients[0].state ? cluster.clients[0].state.toLowerCase() : null, x: cluster.x, y: cluster.y })
                // no zoom máximo o agrupamento não separa mais (alguns
                // clientes chegam a compartilhar o mesmo endereço) — nesse
                // caso mostra a lista em vez de um zoom que não faz nada
                if (view.scale >= MAX_SCALE - 0.01) {
                  setSelectedCluster(cluster.clients)
                  return
                }
                // centraliza no meio real do cluster (não no ponto exato do
                // toque) — deixa o próximo toque mais previsível, já que o
                // alvo fica centralizado após o zoom
                const rect = event.currentTarget.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                zoomAt(centerX, centerY, (currentScale) => Math.min(MAX_SCALE, currentScale * 2.5))
              }}
            />
          ),
        )}
        {mostrarUnidades &&
          pinosUnidades.map(({ unidade, x, y }) => {
            const ativo = unidade.codigo === unidadeSelecionadaCodigo
            return (
              <g
                key={`ml-${unidade.codigo}`}
                transform={`translate(${x}, ${y})`}
                onClick={() => {
                  if (dragDistanceRef.current > DRAG_CLICK_THRESHOLD) return
                  setUnidadeSelecionadaCodigo(unidade.codigo)
                  setDestaque({ uf: unidade.uf.toLowerCase(), x, y })
                  focarPonto(x, y)
                }}
                className="cursor-pointer"
                role="button"
                aria-label={`Mercado Livre ${unidade.codigo}: ${unidade.cidade}, ${unidade.uf}`}
              >
                <circle r={ativo ? 7 : 5} fill={CLIENTE_COR} stroke="#0a2540" strokeWidth={1.5} />
                <circle r={touchRadius} fill="transparent" />
              </g>
            )
          })}
      </svg>

      {/* camadas: liga e desliga clientes da Essencial e unidades do Mercado Livre */}
      <div className="absolute top-24 left-4 z-10 flex flex-col gap-2 sm:top-28 sm:left-8">
        <BotaoCamada
          ativo={mostrarClientes}
          onClick={() => setMostrarClientes((v) => !v)}
          cor="#e05a1c"
          rotulo="Clientes Essencial"
        />
        <BotaoCamada
          ativo={mostrarUnidades}
          onClick={() => setMostrarUnidades((v) => !v)}
          cor={CLIENTE_COR}
          rotulo={`Mercado Livre · ${unidades.length}`}
        />
      </div>

      <AnimatePresence>
        {unidadeAberta && (
          <PainelUnidade
            key={unidadeAberta.codigo}
            unidade={unidadeAberta}
            onFechar={() => setUnidadeSelecionadaCodigo(null)}
            inferior="bottom-44"
          />
        )}
      </AnimatePresence>

      <p className="absolute bottom-4 left-4 text-xs text-white/25">
        Mapa: Natural Earth (domínio público) · Satélite: NASA Blue Marble
      </p>

      {/* Controles de navegação estilo Google Maps: recentralizar + zoom */}
      <div className="absolute right-6 bottom-6 flex flex-col items-center gap-3">
        <AnimatePresence>
          {isZoomed ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={resetTransform}
              aria-label="Centralizar mapa"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] bg-black/40 text-white/70 backdrop-blur-md active:scale-95"
            >
              <Home size={18} />
            </motion.button>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-md">
          <button
            type="button"
            onClick={() => zoomByFactor(1.4)}
            disabled={view.scale >= MAX_SCALE - 0.01}
            aria-label="Aumentar zoom"
            className="flex h-11 w-11 items-center justify-center text-white/70 active:scale-95 disabled:opacity-30"
          >
            <Plus size={18} />
          </button>
          <div className="h-px w-full bg-white/[0.1]" />
          <button
            type="button"
            onClick={() => zoomByFactor(1 / 1.4)}
            disabled={!isZoomed}
            aria-label="Diminuir zoom"
            className="flex h-11 w-11 items-center justify-center text-white/70 active:scale-95 disabled:opacity-30"
          >
            <Minus size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/70 p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-[20px] border border-white/[0.08] bg-[rgba(10,7,5,0.95)] shadow-2xl backdrop-blur-xl"
            >
              {selected.photo ? (
                <img src={selected.photo} alt={selected.name} className="h-48 w-full object-cover" />
              ) : (
                <div className="relative flex h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-brand/25 via-[rgba(20,10,4,0.9)] to-[rgba(10,7,5,0.95)]">
                  <MapPin size={20} className="text-brand" strokeWidth={2} />
                  {selected.city ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold tracking-tight text-white">{selected.city}</div>
                      {selected.state ? (
                        <div className="text-sm font-semibold tracking-[0.2em] text-brand uppercase">
                          {selected.state}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm font-medium tracking-wide text-white/50 uppercase">Cliente Essencial Energia</div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-4 p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{selected.name}</h2>
                    {selected.city ? (
                      <p className="text-sm text-neutral-400">
                        {selected.city}
                        {selected.state ? ` - ${selected.state}` : ''}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white active:scale-95"
                    aria-label="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>

                {selected.description ? (
                  <p className="text-base leading-relaxed text-neutral-300">
                    {selected.description}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCluster ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCluster(null)}
            className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/70 p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
              className="flex w-full max-w-lg flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[rgba(10,7,5,0.95)] shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] p-6">
                <h2 className="text-xl font-semibold text-white">
                  {selectedCluster.length} clientes nesta região
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedCluster(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white active:scale-95"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex max-h-[60vh] flex-col overflow-y-auto">
                {selectedCluster.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setSelectedCluster(null)
                      handlePinClick(client)
                    }}
                    className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4 text-left last:border-b-0 active:bg-white/5"
                  >
                    <span className="text-[15px] text-white">{client.name}</span>
                    {client.city ? (
                      <span className="shrink-0 text-sm text-neutral-400">
                        {client.city}
                        {client.state ? ` - ${client.state}` : ''}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

interface ClusterPinProps {
  x: number
  y: number
  count: number
  onClick: (event: React.MouseEvent<SVGGElement>) => void
}

function ClusterPin({ x, y, count, onClick }: ClusterPinProps) {
  const radius = radiusForCount(count)

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${count} clientes nesta região`}
      className="cursor-pointer outline-none"
      style={{ outline: 'none' }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick(event as never)
      }}
    >
      <circle r={radius} className="fill-brand stroke-white" strokeWidth={1.5} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        className="pointer-events-none select-none fill-white font-bold"
        style={{ fontSize: Math.min(11, 8 + radius * 0.15) }}
      >
        {count}
      </text>
    </g>
  )
}

interface BotaoCamadaProps {
  ativo: boolean
  onClick: () => void
  cor: string
  rotulo: string
}

function BotaoCamada({ ativo, onClick, cor, rotulo }: BotaoCamadaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`flex items-center gap-2.5 rounded-full border py-2 pr-4 pl-3 text-xs font-semibold tracking-wide uppercase backdrop-blur-md transition-opacity active:scale-95 ${
        ativo ? 'border-white/[0.1] bg-black/40 text-white/80' : 'border-white/[0.06] bg-black/20 text-white/35'
      }`}
    >
      <span
        className="h-3 w-3 rounded-full"
        style={{ background: cor, opacity: ativo ? 1 : 0.35 }}
      />
      {rotulo}
    </button>
  )
}
