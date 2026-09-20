// BrazilMap.tsx
// Mapa SVG customizado do Brasil (offline, sem dependência de tiles
// externos) com os pins de clientes (ClientPin) posicionados via projeção
// de lat/long. Ao tocar um pin, expande um modal com foto + info do
// cliente e um botão "Ver Case" quando houver case associado.
//
// Contorno dos estados: pacote @svg-maps/brazil (CC BY 4.0, mapa original
// por MapSVG — https://mapsvg.com/maps/brazil).

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, MapPin, X } from 'lucide-react'
import { useState } from 'react'
import rawBrazilMap from '@svg-maps/brazil'
import { ClientPin } from '@/components/ClientPin'
import type { Client } from '@/types'

interface SvgMapLocation {
  id: string
  name: string
  path: string
}

interface SvgMapData {
  label: string
  viewBox: string
  locations: SvgMapLocation[]
}

// O pacote @svg-maps/brazil não publica tipos resolvíveis fora do seu
// monorepo (referencia "svg-maps__common"); tipamos o shape localmente.
const brazilMap = rawBrazilMap as SvgMapData

const [, , VIEWBOX_WIDTH, VIEWBOX_HEIGHT] = brazilMap.viewBox.split(' ').map(Number)

// Extremos geográficos do Brasil continental (sem ilhas oceânicas), usados
// para projetar lat/long em coordenadas do viewBox via uma projeção
// equiretangular aproximada. A projeção original usada para gerar o SVG
// não é documentada publicamente, então os pins podem exigir pequenos
// ajustes finos caso precisão cartográfica exata seja necessária.
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

interface BrazilMapProps {
  clients: Client[]
  onPinClick: (client: Client) => void
  onViewCase?: (client: Client) => void
}

export function BrazilMap({ clients, onPinClick, onViewCase }: BrazilMapProps) {
  const [selected, setSelected] = useState<Client | null>(null)

  function handlePinClick(client: Client) {
    setSelected(client)
    onPinClick(client)
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-neutral-950 p-8">
      <svg
        viewBox={brazilMap.viewBox}
        role="img"
        aria-label={brazilMap.label}
        className="h-full max-h-full w-auto max-w-full"
      >
        {brazilMap.locations.map((location) => (
          <path
            key={location.id}
            d={location.path}
            className="fill-neutral-700 stroke-neutral-500"
            strokeWidth={0.8}
          />
        ))}

        {clients.map((client) => {
          const { x, y } = project(client.lat, client.lng)
          return (
            <ClientPin
              key={client.id}
              client={client}
              x={x}
              y={y}
              onClick={() => handlePinClick(client)}
            />
          )
        })}
      </svg>

      <p className="absolute bottom-4 right-6 text-xs text-neutral-600">
        Mapa: @svg-maps/brazil (CC BY 4.0, MapSVG)
      </p>

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
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl"
            >
              {selected.photo ? (
                <img src={selected.photo} alt={selected.name} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-neutral-800 text-neutral-500">
                  <MapPin size={48} />
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

                {selected.caseId ? (
                  <button
                    type="button"
                    onClick={() => onViewCase?.(selected)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-6 py-3 text-lg font-medium text-white active:scale-95"
                  >
                    Ver Case
                    <ArrowUpRight size={20} />
                  </button>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
