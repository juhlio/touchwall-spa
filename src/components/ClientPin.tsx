// ClientPin.tsx
// Pin individual de cliente exibido sobre o BrazilMap: círculo vermelho
// com pulsação, posicionado em coordenadas já projetadas do SVG.

import type { Client } from '@/types'

interface ClientPinProps {
  client: Client
  x: number
  y: number
  onClick: () => void
}

export function ClientPin({ client, x, y, onClick }: ClientPinProps) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={client.name}
      className="cursor-pointer"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick()
      }}
    >
      {/* halo pulsante */}
      <circle r={9} className="fill-red-500/70 animate-ping" />
      {/* pin visível */}
      <circle r={5.5} className="fill-red-500 stroke-white" strokeWidth={1.5} />
      {/* área de toque generosa, invisível */}
      <circle r={16} fill="transparent" />
    </g>
  )
}
