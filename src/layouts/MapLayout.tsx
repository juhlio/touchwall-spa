// MapLayout.tsx
// Layout da tela de mapa, envolvendo o BrazilMap e o painel
// de detalhes exibido ao selecionar um ClientPin.

import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface MapLayoutProps {
  onBack: () => void
  children: ReactNode
}

export function MapLayout({ onBack, children }: MapLayoutProps) {
  return (
    <div className="relative h-full w-full bg-neutral-950">
      <button
        type="button"
        onClick={onBack}
        className="absolute left-8 top-8 z-[1100] flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900/90 text-white shadow-lg active:scale-95"
        aria-label="Voltar"
      >
        <ArrowLeft size={28} />
      </button>
      {children}
    </div>
  )
}
