// CaseCarousel.tsx
// Página de cases: 1 case em destaque + 2 cards secundários + barra de
// stats, replicando o mockup. Os grupos de 3 avançam com os botões
// Anterior/Próximo, swipe ou o botão "Ver todos", percorrendo todos os
// cases cadastrados. Ao tocar um case, expande fullscreen com zoom.

import { AnimatePresence, motion, type PanInfo, type Variants } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Factory,
  Gauge,
  Image as ImageIcon,
  MapPin,
  Phone,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'
import { BrandMark } from '@/components/BrandMark'
import type { Case } from '@/types'

interface CaseCarouselProps {
  cases: Case[]
  onBack: () => void
}

const CASES_PER_PAGE = 3
const SWIPE_THRESHOLD = 60

const slideVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -80 : 80 }),
}

export function CaseCarousel({ cases, onBack }: CaseCarouselProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0])
  const [selected, setSelected] = useState<Case | null>(null)

  const totalPages = Math.max(1, Math.ceil(cases.length / CASES_PER_PAGE))
  const pageCases = cases.slice(page * CASES_PER_PAGE, page * CASES_PER_PAGE + CASES_PER_PAGE)
  const [featured, ...secondary] = pageCases

  function goTo(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages) return
    setPage(([current]) => [nextPage, nextPage > current ? 1 : -1])
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(page + 1)
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(page - 1)
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-canvas px-8 py-7">
      <AtmosphereBackground watermark="CASES" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="mb-5 flex flex-shrink-0 items-center justify-between">
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
          <div className="flex items-center gap-2 rounded-[10px] border border-brand/20 bg-brand/[0.07] py-1.5 pr-3.5 pl-2.5">
            <ImageIcon size={14} className="text-brand" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wide text-brand uppercase">Cases</span>
          </div>
        </header>

        {cases.length === 0 ? (
          <p className="text-white/40">Nenhum case cadastrado.</p>
        ) : (
          <>
            <div className="relative flex min-h-0 flex-1 items-stretch gap-3">
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page === 0}
                className="flex h-11 w-11 shrink-0 self-center items-center justify-center rounded-full border border-white/[0.08] bg-white/5 text-white/50 disabled:opacity-20 active:scale-95"
                aria-label="Anterior"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="relative min-h-0 flex-1 overflow-hidden">
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
                    className="flex h-full gap-3"
                  >
                    {featured ? (
                      <FeaturedCaseCard item={featured} onSelect={() => setSelected(featured)} />
                    ) : null}

                    <div className="flex flex-1 flex-col gap-3">
                      {secondary.map((item, index) => (
                        <SecondaryCaseCard
                          key={item.id}
                          item={item}
                          index={index}
                          onSelect={() => setSelected(item)}
                        />
                      ))}
                      <div className="flex-1" />
                      <StatsBar onViewAll={() => goTo(page + 1)} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages - 1}
                className="flex h-11 w-11 shrink-0 self-center items-center justify-center rounded-full border border-white/[0.08] bg-white/5 text-white/50 disabled:opacity-20 active:scale-95"
                aria-label="Próximo"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {totalPages > 1 ? (
              <div className="mt-4 flex flex-shrink-0 justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${index === page ? 'bg-brand' : 'bg-white/15'}`}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      <AnimatePresence>
        {selected ? <CaseDetail item={selected} onClose={() => setSelected(null)} /> : null}
      </AnimatePresence>
    </div>
  )
}

interface FeaturedCaseCardProps {
  item: Case
  onSelect: () => void
}

function FeaturedCaseCard({ item, onSelect }: FeaturedCaseCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex flex-[1.3] flex-col overflow-hidden rounded-[20px] border border-brand/20 bg-[rgba(14,5,2,0.72)] text-left shadow-[0_0_60px_rgba(224,90,28,0.1)] backdrop-blur-xl"
    >
      <div className="absolute top-0 right-[5%] left-[5%] h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent" />

      <div className="relative h-56 shrink-0 overflow-hidden">
        <CaseImage src={item.image} alt={item.title} className="h-full w-full" />
        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-lg border border-brand/35 bg-brand/15 px-3 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--color-brand)]" />
          <span className="text-[10px] font-semibold tracking-wide text-[#f07330] uppercase">Destaque</span>
        </div>
        <div className="absolute top-4 right-4 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-white/70">{item.location}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h2 className="mb-2.5 text-2xl leading-[1.15] font-bold tracking-tight text-white">
            {item.title}
          </h2>
          <p className="line-clamp-3 max-w-md text-[12.5px] leading-relaxed text-white/35">
            {item.description}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-md border border-brand/18 bg-brand/[0.08] px-2.5 py-1 text-[10px] font-semibold text-brand/75">
            {item.power}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-brand/65">
            Ver detalhes
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </motion.button>
  )
}

const SECONDARY_ICONS: LucideIcon[] = [Phone, Star, Factory]
const SECONDARY_COLORS = ['#4a82b4', '#c07828', '#e05a1c']

interface SecondaryCaseCardProps {
  item: Case
  index: number
  onSelect: () => void
}

function SecondaryCaseCard({ item, index, onSelect }: SecondaryCaseCardProps) {
  const Icon = SECONDARY_ICONS[index % SECONDARY_ICONS.length]
  const color = SECONDARY_COLORS[index % SECONDARY_COLORS.length]

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className="relative flex shrink-0 items-start gap-4 overflow-hidden rounded-[16px] border border-white/[0.07] bg-[rgba(3,7,16,0.68)] p-5 text-left backdrop-blur-xl"
    >
      <div
        className="absolute top-0 right-0 left-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }}
      />
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
        style={{ background: `${color}14`, borderColor: `${color}28` }}
      >
        <Icon size={20} style={{ color }} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-[15px] leading-tight font-bold tracking-tight text-white">{item.title}</h3>
          <span className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[9px] whitespace-nowrap text-white/25">
            {item.location}
          </span>
        </div>
        <p className="line-clamp-2 mb-2 text-[11.5px] leading-relaxed text-white/32">
          {item.description}
        </p>
        <span
          className="inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: `${color}12`, borderColor: `${color}26`, color }}
        >
          {item.power}
        </span>
      </div>
    </motion.button>
  )
}

interface StatsBarProps {
  onViewAll: () => void
}

function StatsBar({ onViewAll }: StatsBarProps) {
  return (
    <div className="relative flex items-center justify-between overflow-hidden rounded-[16px] border border-white/[0.07] bg-[rgba(8,5,3,0.72)] px-5 py-3.5 backdrop-blur-xl">
      <div className="absolute top-0 right-[5%] left-[5%] h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent" />
      <StatItem value="200+" label="projetos" className="text-brand" />
      <div className="h-8 w-px bg-white/[0.07]" />
      <StatItem value="18+" label="estados" className="text-accent-blue" />
      <div className="h-8 w-px bg-white/[0.07]" />
      <StatItem value="15+" label="anos" className="text-accent-copper" />
      <div className="h-8 w-px bg-white/[0.07]" />
      <button
        type="button"
        onClick={onViewAll}
        className="flex items-center gap-1.5 rounded-[10px] border border-brand/18 bg-brand/[0.07] px-3.5 py-2 active:scale-95"
      >
        <span className="text-[11px] font-semibold text-brand/75">Ver todos</span>
        <ArrowRight size={12} className="text-brand/65" />
      </button>
    </div>
  )
}

interface StatItemProps {
  value: string
  label: string
  className: string
}

function StatItem({ value, label, className }: StatItemProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl leading-none font-bold tracking-tight ${className}`}>{value}</div>
      <div className="mt-0.5 text-[9.5px] font-medium tracking-wide text-white/25 uppercase">{label}</div>
    </div>
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
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[rgba(10,7,5,0.95)] shadow-2xl backdrop-blur-xl"
      >
        <div className="relative">
          <CaseImage src={item.image} alt={item.title} className="h-72 w-full" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white active:scale-95"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-9">
          <h2 className="text-3xl font-bold tracking-tight text-white">{item.title}</h2>
          <p className="text-[15px] leading-relaxed text-white/45">{item.description}</p>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2.5 text-white/70">
              <Gauge size={20} className="text-brand" />
              <span className="text-[15px]">{item.power}</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/70">
              <MapPin size={20} className="text-brand" />
              <span className="text-[15px]">{item.location}</span>
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
        className={`flex items-center justify-center bg-gradient-to-br from-brand/[0.12] via-brand-dark/[0.22] to-black/40 ${className}`}
      >
        <Factory size={40} className="text-white/15" />
      </div>
    )
  }

  return (
    <img src={src} alt={alt} onError={() => setBroken(true)} className={`object-cover ${className}`} />
  )
}
