// ConhecendoGerador.tsx
// Tela "Conhecendo um gerador": embute o gerador 3D interativo (arquivo
// public/genset.html, servido como estático) num iframe de tela cheia,
// com cabeçalho de voltar no mesmo padrão das demais telas.

import { ArrowLeft, Zap } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { BrandMark } from '@/components/BrandMark'

// Eventos de atividade do totem (mesmos de useInactivityReset).
const ACTIVITY_EVENTS = ['pointerdown', 'touchstart', 'keydown'] as const

interface ConhecendoGeradorProps {
  onBack: () => void
}

export function ConhecendoGerador({ onBack }: ConhecendoGeradorProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const detachRef = useRef<(() => void) | null>(null)

  // Toques dentro do iframe não chegam à janela principal. Repassamos esses
  // eventos para a janela, para o reset por inatividade continuar contando.
  const attachForwarding = useCallback(() => {
    detachRef.current?.()
    const win = frameRef.current?.contentWindow
    if (!win) return

    const forward = (event: Event) => window.dispatchEvent(new Event(event.type))
    ACTIVITY_EVENTS.forEach((type) => win.addEventListener(type, forward))
    detachRef.current = () => {
      ACTIVITY_EVENTS.forEach((type) => win.removeEventListener(type, forward))
    }
  }, [])

  useEffect(() => () => detachRef.current?.(), [])

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-canvas">
      <header className="flex h-16 flex-shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 sm:h-[72px] sm:px-8">
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
        <div className="hidden items-center gap-2 rounded-[10px] border border-brand/20 bg-brand/[0.07] py-1.5 pr-3.5 pl-2.5 sm:flex">
          <Zap size={14} className="text-brand" strokeWidth={2} />
          <span className="text-xs font-semibold tracking-wide text-brand uppercase">Conhecendo um gerador</span>
        </div>
      </header>

      <iframe
        ref={frameRef}
        src="/genset.html?only3d"
        title="Conhecendo um gerador: gerador 3D interativo"
        onLoad={attachForwarding}
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  )
}
