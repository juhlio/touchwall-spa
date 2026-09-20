// CaseCarousel.tsx
// Carrossel de cases/projetos: grid de 3 cards por tela, navegável pelos
// botões Anterior/Próximo ou por swipe (drag). Ao tocar um case, expande
// em modal fullscreen com os detalhes completos.

import { AnimatePresence, motion, type PanInfo, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight, Gauge, ImageOff, MapPin, X } from 'lucide-react'
import { useState } from 'react'
import type { Case } from '@/types'

interface CaseCarouselProps {
  cases: Case[]
}

const CASES_PER_PAGE = 3
const SWIPE_THRESHOLD = 60

const slideVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -80 : 80 }),
}

export function CaseCarousel({ cases }: CaseCarouselProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0])
  const [selected, setSelected] = useState<Case | null>(null)

  const totalPages = Math.max(1, Math.ceil(cases.length / CASES_PER_PAGE))
  const currentCases = cases.slice(page * CASES_PER_PAGE, page * CASES_PER_PAGE + CASES_PER_PAGE)

  function goTo(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages) return
    setPage(([current]) => [nextPage, nextPage > current ? 1 : -1])
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(page + 1)
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(page - 1)
  }

  if (cases.length === 0) {
    return <p className="text-xl text-neutral-400">Nenhum case cadastrado.</p>
  }

  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-6">
      <div className="flex w-full items-center gap-4">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white disabled:opacity-30 active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="grid grid-cols-3 gap-6"
            >
              {currentCases.map((item) => (
                <CaseCard key={item.id} item={item} onSelect={() => setSelected(item)} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages - 1}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white disabled:opacity-30 active:scale-95"
          aria-label="Próximo"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {totalPages > 1 ? (
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === page ? 'bg-purple-400' : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {selected ? <CaseDetail item={selected} onClose={() => setSelected(null)} /> : null}
      </AnimatePresence>
    </div>
  )
}

interface CaseCardProps {
  item: Case
  onSelect: () => void
}

function CaseCard({ item, onSelect }: CaseCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col overflow-hidden rounded-3xl bg-neutral-900 text-left shadow-xl"
    >
      <CaseImage src={item.image} alt={item.title} className="h-48 w-full" />
      <div className="flex flex-col gap-2 p-6">
        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-neutral-400">{item.description}</p>
      </div>
    </motion.button>
  )
}

interface CaseDetailProps {
  item: Case
  onClose: () => void
}

function CaseDetail({ item, onClose }: CaseDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-10"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl"
      >
        <div className="relative">
          <CaseImage src={item.image} alt={item.title} className="h-80 w-full" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900/80 text-white active:scale-95"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-10">
          <h2 className="text-4xl font-semibold text-white">{item.title}</h2>
          <p className="text-lg leading-relaxed text-neutral-300">{item.description}</p>

          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3 text-neutral-200">
              <Gauge size={24} className="text-purple-400" />
              <span className="text-lg">{item.power}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-200">
              <MapPin size={24} className="text-purple-400" />
              <span className="text-lg">{item.location}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface CaseImageProps {
  src: string
  alt: string
  className?: string
}

function CaseImage({ src, alt, className = '' }: CaseImageProps) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-800 text-neutral-600 ${className}`}
      >
        <ImageOff size={40} />
      </div>
    )
  }

  return (
    <img src={src} alt={alt} onError={() => setBroken(true)} className={`object-cover ${className}`} />
  )
}
