import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { MapPoint } from '@/data/points'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface TouchMapProps {
  points: MapPoint[]
  center?: [number, number]
  zoom?: number
  onSelect?: (point: MapPoint) => void
}

export function TouchMap({
  points,
  center = [-23.5505, -46.6333],
  zoom = 12,
  onSelect,
}: TouchMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      touchZoom
      doubleClickZoom
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={point.position}
          icon={markerIcon}
          eventHandlers={{ click: () => onSelect?.(point) }}
        >
          <Popup>
            <strong>{point.title}</strong>
            {point.description ? <p>{point.description}</p> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
