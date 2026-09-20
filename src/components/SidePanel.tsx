import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, X } from 'lucide-react'
import type { MapPoint } from '@/data/points'

interface SidePanelProps {
  point: MapPoint | null
  onClose: () => void
}

export function SidePanel({ point, onClose }: SidePanelProps) {
  return (
    <AnimatePresence>
      {point ? (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="absolute right-0 top-0 z-[1000] flex h-full w-[28rem] flex-col gap-4 bg-neutral-900/95 p-8 shadow-2xl backdrop-blur"
        >
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 active:scale-95"
            aria-label="Fechar painel"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3 text-purple-400">
            <MapPin size={28} />
            <h2 className="text-2xl font-semibold text-white">{point.title}</h2>
          </div>
          {point.description ? (
            <p className="text-lg leading-relaxed text-neutral-300">{point.description}</p>
          ) : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
