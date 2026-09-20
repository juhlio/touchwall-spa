// ServiceLayout.tsx
// Layout da tela de serviços, organizando os ServiceCard
// e o CaseCarousel associado ao serviço selecionado.

import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface ServiceLayoutProps {
  title: string
  onBack: () => void
  children: ReactNode
}

export function ServiceLayout({ title, onBack, children }: ServiceLayoutProps) {
  return (
    <div className="flex h-full w-full flex-col bg-neutral-950">
      <header className="flex items-center gap-6 p-8">
        <button
          type="button"
          onClick={onBack}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-white active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">{children}</main>
    </div>
  )
}
