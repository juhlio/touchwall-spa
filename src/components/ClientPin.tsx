// ClientPin.tsx
// Pin individual de cliente exibido sobre o BrazilMap: círculo laranja
// (cor da marca) com pulsação, posicionado em coordenadas já projetadas
// do SVG.

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
      className="cursor-pointer outline-none"
      style={{ outline: 'none' }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick()
      }}
    >
      {/* halo pulsante, decorativo — não intercepta toque (evita roubar o
          clique de pins/clusters vizinhos quando muitos estão próximos) */}
      <circle r={8} className="pointer-events-none fill-brand/70 animate-ping" />
      {/* pin visível */}
      <circle r={5} className="fill-brand stroke-white" strokeWidth={1.5} />
      {/* área de toque, invisível */}
      <circle r={5} fill="transparent" />
    </g>
  )
}
