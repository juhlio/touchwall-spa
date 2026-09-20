// ServiceLayout.tsx
// Layout genérico de página com cabeçalho (voltar + marca + badge) e
// atmosfera de fundo, no mesmo estilo visual das demais telas. Usado
// pela página "Sobre a Empresa".

import { ArrowLeft, Home } from 'lucide-react'
import type { ReactNode } from 'react'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'
import { BrandMark } from '@/components/BrandMark'

interface ServiceLayoutProps {
  title: string
  onBack: () => void
  children: ReactNode
}

export function ServiceLayout({ title, onBack, children }: ServiceLayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-canvas px-8 py-7">
      <AtmosphereBackground watermark={title.toUpperCase()} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="mb-5 flex flex-shrink-0 items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/5 text-white/50 active:scale-95"
              aria-label="Voltar"
            >
              <ArrowLeft size={16} />
            </button>
            <BrandMark />
          </div>
          <div className="flex items-center gap-2 rounded-[10px] border border-brand/20 bg-brand/[0.07] py-1.5 pr-3.5 pl-2.5">
            <Home size={14} className="text-brand" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wide text-brand uppercase">{title}</span>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center">{children}</main>
      </div>
    </div>
  )
}
