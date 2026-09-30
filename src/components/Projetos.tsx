// Projetos.tsx
// Página "Projetos": duas pastas de fotos reais (Data Center e Outros
// Projetos). Ao abrir uma pasta, mostra uma grade com todas as fotos pra
// escolher uma e ver em detalhes, ou um botão "Modo Slider" que abre um
// slideshow em tela cheia avançando sozinho enquanto ninguém interage.
// Sem nome, local ou qualquer texto sobre as fotos, conforme diretrizes.

import { animate, AnimatePresence, motion, type PanInfo, useMotionValue } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Folder, Images, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'
import { BrandMark } from '@/components/BrandMark'

interface ProjetosProps {
  onBack: () => void
}

interface PhotoFolder {
  id: string
  title: string
  cover: string
  photos: string[]
}

interface ViewerState {
  index: number
  autoplay: boolean
}

const SWIPE_THRESHOLD = 60
const AUTOPLAY_DELAY_MS = 4000

export function Projetos({ onBack }: ProjetosProps) {
  const [folders, setFolders] = useState<PhotoFolder[] | null>(null)
  const [openFolder, setOpenFolder] = useState<PhotoFolder | null>(null)
  const [viewer, setViewer] = useState<ViewerState | null>(null)

  useEffect(() => {
    fetch('/data/projetos-fotos.json')
      .then((res) => res.json())
      .then((data: { dataCenter: string[]; outros: string[] }) => {
        setFolders([
          { id: 'data-center', title: 'Data Center', cover: data.dataCenter[0], photos: data.dataCenter },
          { id: 'outros', title: 'Outros Projetos', cover: data.outros[0], photos: data.outros },
        ])
      })
      .catch(() => setFolders([]))
  }, [])

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-canvas px-8 py-7">
      <AtmosphereBackground watermark="PROJETOS" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="mb-5 flex flex-shrink-0 items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => (openFolder ? setOpenFolder(null) : onBack())}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/5 text-white/50 active:scale-95"
              aria-label="Voltar"
            >
              <ArrowLeft size={16} />
            </button>
            <BrandMark />
          </div>

          {openFolder ? (
            <button
              type="button"
              onClick={() => setViewer({ index: 0, autoplay: true })}
              className="flex items-center gap-2 rounded-[10px] border border-brand/20 bg-brand/[0.07] py-1.5 pr-3.5 pl-2.5 active:scale-95"
            >
              <Play size={14} className="text-brand" strokeWidth={2} />
              <span className="text-xs font-semibold tracking-wide text-brand uppercase">Modo Slider</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-[10px] border border-brand/20 bg-brand/[0.07] py-1.5 pr-3.5 pl-2.5">
              <Images size={14} className="text-brand" strokeWidth={2} />
              <span className="text-xs font-semibold tracking-wide text-brand uppercase">Projetos</span>
            </div>
          )}
        </header>

        {openFolder ? (
          <PhotoGrid folder={openFolder} onSelect={(index) => setViewer({ index, autoplay: false })} />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center gap-6">
            {folders?.map((folder) => (
              <FolderTile key={folder.id} folder={folder} onOpen={() => setOpenFolder(folder)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {openFolder && viewer ? (
          <PhotoViewer folder={openFolder} viewer={viewer} onChange={setViewer} onClose={() => setViewer(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

interface FolderTileProps {
  folder: PhotoFolder
  onOpen: () => void
}

function FolderTile({ folder, onOpen }: FolderTileProps) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="relative h-full max-h-[560px] w-full max-w-md flex-1 overflow-hidden rounded-[20px] border border-white/[0.08] bg-black/40"
    >
      <img src={folder.cover} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

      <div className="absolute top-5 left-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/25 bg-brand/15 backdrop-blur-md">
        <Folder size={20} className="text-brand" strokeWidth={1.8} />
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-2.5">
        <h2 className="text-2xl font-bold tracking-tight text-white">{folder.title}</h2>
        <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70 backdrop-blur-md">
          {folder.photos.length}
        </span>
      </div>
    </motion.button>
  )
}

interface PhotoGridProps {
  folder: PhotoFolder
  onSelect: (index: number) => void
}

function PhotoGrid({ folder, onSelect }: PhotoGridProps) {
  // Monta uma grade de colunas/linhas fixas (em vez de rolagem) pra todas
  // as fotos caberem de uma vez na tela — o número de colunas é calculado
  // a partir da quantidade de fotos, mirando um formato próximo ao da
  // área disponível (mais larga que alta, tela de TV).
  const count = folder.photos.length
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * 2.2)))
  const rows = Math.max(1, Math.ceil(count / cols))

  return (
    <div
      className="grid min-h-0 flex-1 gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {folder.photos.map((src, index) => (
        <motion.button
          key={src}
          type="button"
          onClick={() => onSelect(index)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="min-h-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40"
        >
          <img src={src} alt="" className="h-full w-full object-cover" />
        </motion.button>
      ))}
    </div>
  )
}

interface PhotoViewerProps {
  folder: PhotoFolder
  viewer: ViewerState
  onChange: (viewer: ViewerState) => void
  onClose: () => void
}

function PhotoViewer({ folder, viewer, onChange, onClose }: PhotoViewerProps) {
  const { index, autoplay } = viewer
  const [direction, setDirection] = useState(1)

  function goTo(next: number, opts: { autoplay: boolean }) {
    if (next < 0 || next >= folder.photos.length) return
    setDirection(next > index ? 1 : -1)
    onChange({ index: next, autoplay: opts.autoplay })
  }

  function handleManualNav(next: number) {
    goTo(next, { autoplay: false })
  }

  // avança sozinho a cada intervalo enquanto autoplay estiver ativo —
  // qualquer navegação manual (seta, arrastar) desativa o autoplay, então
  // esse efeito para de reagendar e o slideshow congela onde o usuário
  // parou.
  useEffect(() => {
    if (!autoplay) return
    const timer = setTimeout(() => {
      const next = (index + 1) % folder.photos.length
      setDirection(1)
      onChange({ index: next, autoplay: true })
    }, AUTOPLAY_DELAY_MS)
    return () => clearTimeout(timer)
  }, [autoplay, index, folder.photos.length, onChange])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-[1200] flex flex-col bg-black"
    >
      {autoplay ? (
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 rounded-full border border-brand/25 bg-brand/15 py-2 pr-4 pl-3 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-brand uppercase">Modo Slider</span>
        </div>
      ) : null}

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
          onClick={() => handleManualNav(index - 1)}
          disabled={index === 0}
          className="absolute left-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 disabled:opacity-0 active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <ViewerImage
            key={index}
            src={folder.photos[index]}
            direction={direction}
            canGoPrev={index > 0}
            canGoNext={index < folder.photos.length - 1}
            onNavigate={(step) => handleManualNav(index + step)}
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={() => handleManualNav(index + 1)}
          disabled={index === folder.photos.length - 1}
          className="absolute right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 disabled:opacity-0 active:scale-95"
          aria-label="Próxima"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex flex-shrink-0 justify-center gap-1.5 pb-6">
        {folder.photos.map((_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-brand' : 'bg-white/20'}`} />
        ))}
      </div>
    </motion.div>
  )
}

interface ViewerImageProps {
  src: string
  direction: number
  canGoPrev: boolean
  canGoNext: boolean
  onNavigate: (step: 1 | -1) => void
}

// Cada foto é uma instância nova desse componente (key={index} no pai),
// então o motion value nasce zerado a cada troca — arrastar segue o dedo
// de verdade; soltando antes do limite, a foto volta suavemente pro
// centro em vez de trocar.
function ViewerImage({ src, direction, canGoPrev, canGoNext, onNavigate }: ViewerImageProps) {
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
      src={src}
      alt=""
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
