// MapLayout.tsx
// Layout da tela de mapa: botão de voltar e marca sobrepostos ao
// BrazilMap, que ocupa a tela inteira.

import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'

interface MapLayoutProps {
  onBack: () => void
  children: ReactNode
}

export function MapLayout({ onBack, children }: MapLayoutProps) {
  return (
    <div className="relative h-full w-full bg-canvas">
      <div className="absolute top-7 left-8 z-[1100] flex items-center gap-3.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/5 text-white/50 backdrop-blur-md active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft size={16} />
        </button>
        <BrandMark />
      </div>
      {children}
    </div>
  )
}
