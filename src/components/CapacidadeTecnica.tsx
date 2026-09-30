// CapacidadeTecnica.tsx
// Página "Capacidade Técnica": galeria única com os documentos reais
// (atestados de clientes + carta de distribuidor Caterpillar), sem
// separação por categoria. Cada documento fica numa moldura sóbria
// (mesmo estilo de card do resto do app), reta e com sombra discreta —
// diferencia da galeria de fotos da página Projetos pela moldura e pelo
// espaçamento generoso, sem recorrer a nada informal. Toque abre em
// tela cheia, com zoom (pinça ou duplo toque) pra ler o documento.

import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { ChevronLeft, ChevronRight, FileCheck2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Document {
  src: string
  title: string
}

const DOCUMENTS: Document[] = [
  { src: '/assets/capacidade-tecnica/atestado-zerbini.jpg', title: 'Atestado Zerbini' },
  // TODO: este atestado traz a marca "INTERNAL" da Enel e mostra o valor
  // do contrato — revisar com o cliente se pode ficar visível assim antes
  // de ir pra produção.
  { src: '/assets/capacidade-tecnica/atestado-enel.jpg', title: 'Atestado Enel' },
  { src: '/assets/capacidade-tecnica/cat-caterpillar.jpg', title: 'Carta Caterpillar' },
]

export function CapacidadeTecnica() {
  const [index, setIndex] = useState<number | null>(null)

  return (
    <div className="flex h-full w-full max-w-4xl items-stretch justify-center gap-6">
      {DOCUMENTS.map((doc, i) => (
        <motion.button
          key={doc.src}
          type="button"
          onClick={() => setIndex(i)}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          aria-label={`Abrir documento: ${doc.title}`}
          className="relative flex flex-1 flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-[rgba(8,7,6,0.68)] p-4 backdrop-blur-xl"
        >
          <div className="absolute top-5 left-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-brand/20 bg-brand/10">
            <FileCheck2 size={16} className="text-brand" strokeWidth={1.8} />
          </div>
          <div className="aspect-[210/297] w-full overflow-hidden rounded-lg bg-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <img
              src={doc.src}
              alt={doc.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="mt-3 text-center text-sm font-semibold text-white/75">{doc.title}</div>
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
  const doc = DOCUMENTS[index]

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft') onChange(Math.max(0, index - 1))
      else if (event.key === 'ArrowRight') onChange(Math.min(DOCUMENTS.length - 1, index + 1))
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
      aria-label={`Visualizador de documentos — ${doc.title}`}
      className="fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-black p-10"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white active:scale-95"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>

      <div className="absolute top-6 left-6 z-10 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm font-semibold text-white/80">
        {doc.title}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.max(0, index - 1))}
        disabled={index === 0}
        className="absolute left-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 disabled:opacity-0 active:scale-95"
        aria-label="Anterior"
      >
        <ChevronLeft size={24} />
      </button>

      <ZoomableImage key={doc.src} src={doc.src} alt={doc.title} />

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

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const DOUBLE_TAP_ZOOM = 2.5
const DOUBLE_TAP_WINDOW_MS = 300

interface ZoomableImageProps {
  src: string
  alt: string
}

// Visualizador com pinça (dois dedos) e duplo toque pra ampliar o
// documento — a imagem ocupa ~90% da altura da tela e pode ser
// arrastada quando ampliada, igual o gesto nativo de zoom de foto.
function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const scale = useMotionValue(1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null)
  const panStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null)
  const lastTapRef = useRef(0)
  const [isZoomed, setIsZoomed] = useState(false)

  function applyZoom(nextScale: number) {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextScale))
    scale.set(clamped)
    setIsZoomed(clamped > MIN_ZOOM + 0.01)
    if (clamped <= MIN_ZOOM + 0.01) {
      x.set(0)
      y.set(0)
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    containerRef.current?.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      pinchStartRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: scale.get() }
      panStartRef.current = null
      return
    }

    if (pointersRef.current.size === 1) {
      panStartRef.current = { x: event.clientX, y: event.clientY, originX: x.get(), originY: y.get() }

      const now = Date.now()
      if (now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS) {
        applyZoom(scale.get() > MIN_ZOOM + 0.01 ? MIN_ZOOM : DOUBLE_TAP_ZOOM)
        lastTapRef.current = 0
      } else {
        lastTapRef.current = now
      }
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [a, b] = [...pointersRef.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      applyZoom(pinchStartRef.current.scale * (distance / pinchStartRef.current.distance))
      return
    }

    if (pointersRef.current.size === 1 && panStartRef.current && scale.get() > MIN_ZOOM + 0.01) {
      const start = panStartRef.current
      x.set(start.originX + (event.clientX - start.x))
      y.set(start.originY + (event.clientY - start.y))
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)
    pinchStartRef.current = null
    panStartRef.current = null
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={() => applyZoom(scale.get() > MIN_ZOOM + 0.01 ? MIN_ZOOM : DOUBLE_TAP_ZOOM)}
      className="flex h-[90%] w-full touch-none items-center justify-center overflow-hidden"
      style={{ cursor: isZoomed ? 'grab' : 'zoom-in' }}
    >
      <motion.img src={src} alt={alt} style={{ scale, x, y }} className="max-h-full max-w-full object-contain shadow-2xl" />
    </div>
  )
}
