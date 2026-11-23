// Projetos.tsx
// Página "Projetos": duas pastas de fotos reais (Data Center e Outros
// Projetos). Ao abrir uma pasta, mostra uma grade com todas as fotos pra
// escolher uma e ver em detalhes, ou um botão "Modo Slider" que abre um
// slideshow em tela cheia avançando sozinho enquanto ninguém interage.
// Sem nome, local ou qualquer texto sobre as fotos, conforme diretrizes.

import { animate, AnimatePresence, motion, type PanInfo, useMotionValue } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Images, Pause, Play, X } from 'lucide-react'
import { useEffect, type ReactNode, useState } from 'react'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'
import { BrandMark } from '@/components/BrandMark'
import { DATA_CENTER_CASE, type ProjectCase } from '@/config/project-cases'
import { useInactivitySuppress } from '@/hooks/useInactivityReset'

interface ProjetosProps {
  onBack: () => void
}

interface Photo {
  full: string
  thumb: string
}

interface PhotoFolder {
  id: string
  title: string
  cover: string
  photos: Photo[]
  about?: ProjectCase
}

interface ViewerState {
  index: number
  autoplay: boolean
}

const SWIPE_THRESHOLD = 60
const AUTOPLAY_DELAY_MS = 4000

export function Projetos({ onBack }: ProjetosProps) {
  const [openFolder, setOpenFolder] = useState<PhotoFolder | null>(null)
  const [viewer, setViewer] = useState<ViewerState | null>(null)
  const [showCaseInfo, setShowCaseInfo] = useState(false)

  useInactivitySuppress(viewer?.autoplay ?? false)

  useEffect(() => {
    type FolderData = { full: string[]; thumb: string[] }
    fetch('/data/projetos-fotos.json')
      .then((res) => res.json())
      .then((data: { dataCenter: FolderData; outros: FolderData }) => {
        function toPhotos(folder: FolderData): Photo[] {
          return folder.full.map((full, i) => ({ full, thumb: folder.thumb[i] }))
        }
        // todas as fotos juntas, numa única grade, já aberta ao entrar na seção
        const todas: PhotoFolder = {
          id: 'todas',
          title: 'Projetos',
          cover: data.dataCenter.thumb[0],
          photos: [...toPhotos(data.dataCenter), ...toPhotos(data.outros)],
          about: DATA_CENTER_CASE,
        }
        setOpenFolder(todas)
      })
      .catch(() => setOpenFolder(null))
  }, [])

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-canvas px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <AtmosphereBackground watermark="PROJETOS" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="mb-5 flex flex-shrink-0 flex-wrap items-center justify-between gap-3">
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

          {openFolder ? (
            <div className="flex items-center gap-2.5">
              {openFolder.about ? (
                <button
                  type="button"
                  onClick={() => setShowCaseInfo(true)}
                  className="flex items-center gap-2 rounded-[10px] border border-white/[0.1] bg-white/5 py-1.5 pr-3.5 pl-2.5 text-white/70 active:scale-95"
                >
                  <FileText size={14} strokeWidth={2} />
                  <span className="text-xs font-semibold tracking-wide uppercase">Sobre o projeto</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setViewer({ index: 0, autoplay: true })}
                className="flex items-center gap-2 rounded-[10px] border border-brand/20 bg-brand/[0.07] py-1.5 pr-3.5 pl-2.5 active:scale-95"
              >
                <Play size={14} className="text-brand" strokeWidth={2} />
                <span className="text-xs font-semibold tracking-wide text-brand uppercase">Modo Slider</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-[10px] border border-brand/20 bg-brand/[0.07] py-1.5 pr-3.5 pl-2.5">
              <Images size={14} className="text-brand" strokeWidth={2} />
              <span className="text-xs font-semibold tracking-wide text-brand uppercase">Projetos</span>
            </div>
          )}
        </header>

        {openFolder ? (
          <PhotoGrid folder={openFolder} onSelect={(index) => setViewer({ index, autoplay: false })} />
        ) : null}
      </div>

      <AnimatePresence>
        {openFolder && viewer ? (
          <PhotoViewer folder={openFolder} viewer={viewer} onChange={setViewer} onClose={() => setViewer(null)} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {openFolder?.about && showCaseInfo ? (
          <CaseInfoModal projectCase={openFolder.about} onClose={() => setShowCaseInfo(false)} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

interface PhotoGridProps {
  folder: PhotoFolder
  onSelect: (index: number) => void
}

// Telas estreitas (celular/tablet em retrato) usam grade de 2 colunas com rolagem.
function useIsNarrow(maxWidth = 768) {
  const [narrow, setNarrow] = useState(() => window.innerWidth < maxWidth)
  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < maxWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [maxWidth])
  return narrow
}

function PhotoGrid({ folder, onSelect }: PhotoGridProps) {
  // Monta uma grade de colunas/linhas fixas (em vez de rolagem) pra todas
  // as fotos caberem de uma vez na tela — o número de colunas é calculado
  // a partir da quantidade de fotos, mirando um formato próximo ao da
  // área disponível (mais larga que alta, tela de TV).
  const narrow = useIsNarrow()
  const count = folder.photos.length
  const cols = narrow ? 2 : Math.max(1, Math.ceil(Math.sqrt(count * 2.2)))
  const rows = Math.max(1, Math.ceil(count / cols))

  return (
    <div
      className={narrow ? 'grid min-h-0 flex-1 content-start gap-3 overflow-y-auto' : 'grid min-h-0 flex-1 gap-3'}
      style={
        narrow
          ? { gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: '170px' }
          : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }
      }
    >
      {folder.photos.map((photo, index) => (
        <motion.button
          key={photo.full}
          type="button"
          onClick={() => onSelect(index)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          aria-label={`Ver foto ${index + 1} de ${folder.photos.length} — ${folder.title}`}
          className="min-h-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40"
        >
          <img
            src={photo.thumb}
            alt={`${folder.title} – foto ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
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

  function togglePlay() {
    onChange({ index, autoplay: !autoplay })
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft') handleManualNav(index - 1)
      else if (event.key === 'ArrowRight') handleManualNav(index + 1)
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
      aria-label={`Visualizador de fotos — ${folder.title}`}
      className="fixed inset-0 z-[1200] flex flex-col bg-black"
    >
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={autoplay ? 'Pausar apresentação' : 'Iniciar apresentação automática'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/25 bg-brand/15 text-brand backdrop-blur-md active:scale-95"
        >
          {autoplay ? <Pause size={18} /> : <Play size={18} />}
        </button>

        {autoplay ? (
          <div className="flex h-11 items-center gap-2 overflow-hidden rounded-full border border-brand/25 bg-brand/15 pr-4 pl-3.5 backdrop-blur-md">
            <span className="text-xs font-semibold tracking-wide text-brand uppercase">Modo Slider</span>
            <span className="relative h-1 w-14 overflow-hidden rounded-full bg-brand/20">
              <motion.span
                key={index}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: AUTOPLAY_DELAY_MS / 1000, ease: 'linear' }}
                className="absolute inset-y-0 left-0 rounded-full bg-brand"
              />
            </span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white active:scale-95"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden pt-16">
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
            src={folder.photos[index].full}
            alt={`${folder.title} – foto ${index + 1} de ${folder.photos.length}`}
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
  alt: string
  direction: number
  canGoPrev: boolean
  canGoNext: boolean
  onNavigate: (step: 1 | -1) => void
}

// Cada foto é uma instância nova desse componente (key={index} no pai),
// então o motion value nasce zerado a cada troca — arrastar segue o dedo
// de verdade; soltando antes do limite, a foto volta suavemente pro
// centro em vez de trocar.
function ViewerImage({ src, alt, direction, canGoPrev, canGoNext, onNavigate }: ViewerImageProps) {
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
      alt={alt}
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

interface CaseInfoModalProps {
  projectCase: ProjectCase
  onClose: () => void
}

function CaseInfoModal({ projectCase: c, onClose }: CaseInfoModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Sobre o projeto — ${c.title}`}
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/85 p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[rgba(10,7,5,0.97)] shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-6 border-b border-white/[0.08] p-8 pb-6">
          <div>
            <span className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">Case</span>
            <h2 className="mt-2 text-[22px] leading-[1.25] font-bold sm:text-[26px] tracking-tight text-white">{c.title}</h2>
            <p className="mt-3 text-base font-semibold text-brand/90">{c.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 active:scale-95"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-6">
          <CaseSection>
            {c.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </CaseSection>

          <CaseSection heading={c.challengeTitle}>
            {c.challenge.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </CaseSection>

          <CaseSection heading={c.solutionTitle}>
            <p>{c.solutionIntro}</p>
            <ul className="flex flex-col gap-2.5">
              {c.solutionSpecs.map((spec) => (
                <li key={spec} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
            <p>{c.tieBreakerNote}</p>
          </CaseSection>

          <CaseSection heading={c.continuityTitle}>
            {c.continuity.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </CaseSection>

          <CaseSection heading={c.resultsTitle}>
            <p>{c.resultsIntro}</p>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {c.results.map((result) => (
                <div
                  key={result.title}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
                >
                  <div className="mb-1.5 text-sm font-bold text-white">{result.title}</div>
                  <p className="text-[13px] leading-relaxed text-white/55">{result.description}</p>
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection heading={c.closingTitle} last>
            {c.closing.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </CaseSection>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface CaseSectionProps {
  heading?: string
  last?: boolean
  children: ReactNode
}

function CaseSection({ heading, last, children }: CaseSectionProps) {
  return (
    <div className={`flex flex-col gap-3 text-[15px] leading-relaxed text-white/70 ${last ? '' : 'mb-7'}`}>
      {heading ? <h3 className="text-lg font-bold text-white">{heading}</h3> : null}
      {children}
    </div>
  )
}
