// MercadoLivreMapLeaflet.tsx
// Protótipo do mapa do Mercado Livre com Leaflet e mapa de ruas (OpenStreetMap).
// Permite zoom até as ruas. Precisa de internet para carregar os tiles.
// Ao tocar em uma unidade, o mapa voa até ela e o painel abre.

import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { CLIENTE_COR, PainelUnidade, type UnidadeMercadoLivre } from '@/components/MercadoLivreMap'

const BRASIL_CENTRO: LatLngExpression = [-14.2, -51.9]
const ZOOM_BRASIL = 4
const ZOOM_UNIDADE = 16

function VoarPara({ alvo }: { alvo: UnidadeMercadoLivre | null }) {
  const map = useMap()
  useEffect(() => {
    if (alvo) {
      map.flyTo([alvo.lat, alvo.lng], ZOOM_UNIDADE, { duration: 1.4 })
    } else {
      map.flyTo(BRASIL_CENTRO, ZOOM_BRASIL, { duration: 1.2 })
    }
  }, [alvo, map])
  return null
}

export function MercadoLivreMapLeaflet({ unidades }: { unidades: UnidadeMercadoLivre[] }) {
  const [selecionadoCodigo, setSelecionadoCodigo] = useState<string | null>(null)
  const selecionado = unidades.find((u) => u.codigo === selecionadoCodigo) ?? null

  return (
    <div className="relative h-full w-full">
      {/* isolate: os z-index internos do Leaflet ficam contidos aqui, abaixo do painel */}
      <div className="absolute inset-0 isolate">
      <MapContainer
        center={BRASIL_CENTRO}
        zoom={ZOOM_BRASIL}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: '#0a2540' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <VoarPara alvo={selecionado} />
        {unidades.map((u) => {
          const ativo = u.codigo === selecionadoCodigo
          return (
            <CircleMarker
              key={u.codigo}
              center={[u.lat, u.lng]}
              radius={ativo ? 11 : 9}
              pathOptions={{ color: '#0a2540', weight: 2, fillColor: CLIENTE_COR, fillOpacity: 1 }}
              eventHandlers={{ click: () => setSelecionadoCodigo(u.codigo) }}
            />
          )
        })}
      </MapContainer>
      </div>

      {selecionado && (
        <PainelUnidade
          key={selecionado.codigo}
          unidade={selecionado}
          onFechar={() => setSelecionadoCodigo(null)}
        />
      )}
    </div>
  )
}
