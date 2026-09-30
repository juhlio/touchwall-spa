// CapacidadeTecnica.tsx
// Página "Capacidade Técnica": galeria única com os documentos reais
// (atestados de clientes + carta de distribuidor Caterpillar), sem
// separação por categoria. Cada documento fica numa moldura sóbria
// (mesmo estilo de card do resto do app), reta e com sombra discreta —
// diferencia da galeria de fotos da página Projetos pela moldura e pelo
// espaçamento generoso, sem recorrer a nada informal. Toque abre em
// tela cheia.

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, FileCheck2, X } from 'lucide-react'
import { useState } from 'react'

const DOCUMENTS = [
  '/assets/capacidade-tecnica/atestado-zerbini.jpg',
  '/assets/capacidade-tecnica/atestado-enel.jpg',
  '/assets/capacidade-tecnica/cat-caterpillar.jpg',
]

export function CapacidadeTecnica() {
  const [index, setIndex] = useState<number | null>(null)

  return (
    <div className="flex h-full w-full max-w-4xl items-stretch justify-center gap-6">
      {DOCUMENTS.map((doc, i) => (
        <motion.button
          key={doc}
          type="button"
          onClick={() => setIndex(i)}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          className="relative flex-1 overflow-hidden rounded-[20px] border border-white/[0.07] bg-[rgba(8,7,6,0.68)] p-4 backdrop-blur-xl"
        >
          <div className="absolute top-5 left-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-brand/20 bg-brand/10">
            <FileCheck2 size={16} className="text-brand" strokeWidth={1.8} />
          </div>
          <div className="aspect-[210/297] h-full overflow-hidden rounded-lg bg-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <img src={doc} alt="" className="h-full w-full object-cover object-top" />
          </div>
        </motion.button>
      ))}

      <AnimatePresence>
        {index !== null ? <DocumentViewer index={index} onChange={setIndex} onClose={() => setIndex(null)} /> : null}
      </AnimatePresence>
    </div>
  )
}

interface DocumentViewerProps {
  index: number
  onChange: (index: number) => void
  onClose: () => void
}

function DocumentViewer({ index, onChange, onClose }: DocumentViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-black/90 p-10"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white active:scale-95"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>

      <button
        type="button"
        onClick={() => onChange(Math.max(0, index - 1))}
        disabled={index === 0}
        className="absolute left-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 disabled:opacity-0 active:scale-95"
        aria-label="Anterior"
      >
        <ChevronLeft size={24} />
      </button>

      <img src={DOCUMENTS[index]} alt="" className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />

      <button
        type="button"
        onClick={() => onChange(Math.min(DOCUMENTS.length - 1, index + 1))}
        disabled={index === DOCUMENTS.length - 1}
        className="absolute right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 disabled:opacity-0 active:scale-95"
        aria-label="Próximo"
      >
        <ChevronRight size={24} />
      </button>
    </motion.div>
  )
}
