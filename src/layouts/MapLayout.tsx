// MapLayout.tsx
// Layout da tela de mapa: o globo girando (RotatingGlobe) fica rodando
// indefinidamente como intro, com o Brasil destacado em laranja. Ao toque,
// o globo gira até centralizar no Brasil e só então dá lugar ao BrazilMap,
// com uma transição suave. Botão de voltar e marca ficam sobrepostos
// durante toda a tela.

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { BrandMark } from '@/components/BrandMark'
import { RotatingGlobe, type RotatingGlobeHandle } from '@/components/RotatingGlobe'

interface MapLayoutProps {
  onBack: () => void
  children: ReactNode
}

export function MapLayout({ onBack, children }: MapLayoutProps) {
  const [showIntro, setShowIntro] = useState(true)
  const globeRef = useRef<RotatingGlobeHandle>(null)

  return (
    <div className="relative h-full w-full overflow-hidden bg-canvas">
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

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            onClick={() => globeRef.current?.focusOnBrazil()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6"
          >
            <RotatingGlobe
              ref={globeRef}
              width={720}
              height={720}
              onFocusComplete={() => setShowIntro(false)}
            />
            <span className="rounded-full border border-white/[0.08] bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/40 uppercase">
              Toque para ver o mapa
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
