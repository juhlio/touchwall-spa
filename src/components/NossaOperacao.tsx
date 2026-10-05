// NossaOperacao.tsx
// Página "Nossa Operação": duas fotos reais do COE (Centro de
// Operações) — a entrada com a marca na parede e a sala de operação —
// cada uma em seu próprio card, com destaques gráficos pra operação
// 24/7/365, monitoramento e equipe dedicada. Toque numa foto abre ela
// em tela cheia (mesmo padrão de visualizador da página Projetos).

import { animate, AnimatePresence, motion, type PanInfo, useMotionValue } from 'framer-motion'
import { Activity, ChevronLeft, ChevronRight, Radar, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OperacaoPhoto {
  src: string
  alt: string
}

const PHOTOS: OperacaoPhoto[] = [
  { src: '/assets/images/coe-entrada.webp', alt: 'Entrada do Centro de Operações da Essencial Energia' },
  { src: '/assets/images/coe-operacao.webp', alt: 'Centro de Operações da Essencial Energia' },
]

const SWIPE_THRESHOLD = 60

export function NossaOperacao() {
  const [index, setIndex] = useState<number | null>(null)

  return (
    <div className="flex w-full gap-5">
      <motion.button
        type="button"
        onClick={() => setIndex(0)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        aria-label={`Ver em tela cheia: ${PHOTOS[0].alt}`}
        className="relative aspect-[4/3] flex-1 overflow-hidden rounded-[20px] border border-white/[0.07]"
      >
        <img src={PHOTOS[0].src} alt={PHOTOS[0].alt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/35" />

        {/* selo de equipe: reforça presença humana dedicada, não só automação */}
        <div className="absolute top-7 left-7 flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-[rgba(8,7,6,0.68)] py-2 pr-4 pl-3 backdrop-blur-xl">
          <Users size={14} className="text-brand" strokeWidth={2} />
          <span className="text-xs font-medium tracking-wide text-white/70 uppercase">Equipe técnica dedicada</span>
        </div>

        <div className="absolute bottom-7 left-7 flex items-center gap-4 rounded-[20px] border border-white/[0.1] bg-[rgba(8,7,6,0.68)] py-5 pr-7 pl-5 backdrop-blur-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
            <Radar size={24} className="animate-[spin_6s_linear_infinite] text-brand" strokeWidth={1.8} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">24/7/365</h2>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
            </div>
            <p className="text-sm text-white/50">Operação contínua, todos os dias do ano.</p>
          </div>
        </div>
      </motion.button>

      <motion.button
        type="button"
        onClick={() => setIndex(1)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        aria-label={`Ver em tela cheia: ${PHOTOS[1].alt}`}
        className="relative aspect-[4/3] flex-1 overflow-hidden rounded-[20px] border border-white/[0.07]"
      >
        <img src={PHOTOS[1].src} alt={PHOTOS[1].alt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/35" />

        {/* selo "ao vivo": pisca pra reforçar monitoramento em tempo real */}
        <div className="absolute top-7 right-7 flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-[rgba(8,7,6,0.68)] py-2 pr-4 pl-3 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Activity size={14} className="text-white/60" strokeWidth={2} />
          <span className="text-xs font-medium tracking-wide text-white/70 uppercase">Monitoramento em tempo real</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {index !== null ? <PhotoViewer index={index} onChange={setIndex} onClose={() => setIndex(null)} /> : null}
      </AnimatePresence>
    </div>
  )
}

interface PhotoViewerProps {
  index: number
  onChange: (index: number) => void
  onClose: () => void
}

function PhotoViewer({ index, onChange, onClose }: PhotoViewerProps) {
  const [direction, setDirection] = useState(1)

  function goTo(next: number) {
    if (next < 0 || next >= PHOTOS.length) return
    setDirection(next > index ? 1 : -1)
    onChange(next)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft') goTo(index - 1)
      else if (event.key === 'ArrowRight') goTo(index + 1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizador de fotos — ${PHOTOS[index].alt}`}
      className="fixed inset-0 z-[1200] flex flex-col bg-black"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white active:scale-95"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="absolute left-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 disabled:opacity-0 active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <ViewerImage
            key={index}
            photo={PHOTOS[index]}
            direction={direction}
            canGoPrev={index > 0}
            canGoNext={index < PHOTOS.length - 1}
            onNavigate={(step) => goTo(index + step)}
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === PHOTOS.length - 1}
          className="absolute right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 disabled:opacity-0 active:scale-95"
          aria-label="Próxima"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex flex-shrink-0 justify-center gap-1.5 pb-6">
        {PHOTOS.map((_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-brand' : 'bg-white/20'}`} />
        ))}
      </div>
    </motion.div>
  )
}

interface ViewerImageProps {
  photo: OperacaoPhoto
  direction: number
  canGoPrev: boolean
  canGoNext: boolean
  onNavigate: (step: 1 | -1) => void
}

function ViewerImage({ photo, direction, canGoPrev, canGoNext, onNavigate }: ViewerImageProps) {
  const x = useMotionValue(0)

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD && canGoNext) {
      onNavigate(1)
    } else if (info.offset.x > SWIPE_THRESHOLD && canGoPrev) {
      onNavigate(-1)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
    }
  }

  return (
    <motion.img
      src={photo.src}
      alt={photo.alt}
      style={{ x }}
      custom={direction}
      initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      drag="x"
      dragElastic={1}
      onDragEnd={handleDragEnd}
      className="max-h-full max-w-full object-contain"
    />
  )
}
