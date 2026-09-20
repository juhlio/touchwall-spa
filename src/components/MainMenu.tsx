// MainMenu.tsx
// Menu principal em bento grid, replicando o mockup: card de marca +
// Venda em destaque + Locação na primeira linha; Manutenção, Mapa Brasil,
// Cases e Sobre na segunda linha.

import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Home, Image, MapPin, Monitor, ShoppingBag, Wrench } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import type { Page } from '@/types'

interface MainMenuProps {
  onNavigate: (page: Page) => void
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex h-full w-full flex-col gap-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-shrink-0 items-center justify-between">
        <BrandMark />
        <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] py-1.5 pr-4 pl-2.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_9px_var(--color-brand)]" />
          <span className="text-[13px] font-medium tracking-wide text-white/45">Toque para explorar</span>
        </div>
      </motion.div>

      {/* Row 1: brand card + Venda (destaque) + Locação */}
      <div className="flex min-h-0 flex-[1.75] gap-4">
        <motion.div
          variants={itemVariants}
          className="flex w-72 shrink-0 flex-col justify-between rounded-[20px] border border-white/[0.07] bg-[rgba(12,5,3,0.72)] p-7 backdrop-blur-xl"
        >
          <div>
            <BrandMark size="lg" />
            <p className="mt-4 text-[13px] leading-relaxed text-white/35">
              Soluções completas em geração, locação e manutenção de geradores.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="rounded-lg border border-brand/20 bg-brand/10 px-2.5 py-1.5">
                <span className="text-base font-bold text-brand">15+</span>
                <span className="ml-1 text-[11px] text-white/35">anos</span>
              </div>
              <div className="rounded-lg border border-accent-blue/15 bg-accent-blue/10 px-2.5 py-1.5">
                <span className="text-base font-bold text-accent-blue-light">200+</span>
                <span className="ml-1 text-[11px] text-white/35">projetos</span>
              </div>
            </div>
            <div className="text-[11px] text-white/20">essencialgeradores.com.br</div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => onNavigate('venda')}
          className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[20px] border border-brand/15 bg-[rgba(20,6,2,0.68)] p-8 text-left shadow-[0_12px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <div className="absolute top-0 right-[5%] left-[5%] h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent" />
          <div className="pointer-events-none absolute -top-20 -right-16 h-[300px] w-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(224,90,28,0.22)_0%,transparent_65%)] blur-[20px]" />
          <div className="pointer-events-none absolute -right-3 -bottom-8 text-[140px] leading-none font-bold whitespace-nowrap text-brand/[0.055]">
            VENDA
          </div>

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-brand/25 bg-brand/10 px-2.5 py-1.5">
              <ShoppingBag size={14} className="text-brand" />
              <span className="text-[11px] font-semibold tracking-wide text-brand uppercase">Venda</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">
              Geradores de alta
              <br />
              performance
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/40">
              De 10 kVA a 2.000+ kVA. Residencial, comercial e industrial — entregamos a solução
              certa.
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-brand">10</div>
                <div className="text-[9px] tracking-wide text-white/30 uppercase">min kVA</div>
              </div>
              <div className="w-px bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-xl font-bold text-brand">2000+</div>
                <div className="text-[9px] tracking-wide text-white/30 uppercase">max kVA</div>
              </div>
            </div>
            <span className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/15 px-4 py-2.5 text-sm font-semibold text-brand">
              Explorar
              <ArrowRight size={16} />
            </span>
          </div>
        </motion.button>

        <motion.button
          type="button"
          variants={itemVariants}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => onNavigate('locacao')}
          className="relative flex w-80 shrink-0 flex-col justify-between overflow-hidden rounded-[20px] border border-accent-blue/15 bg-[rgba(3,8,16,0.68)] p-7 text-left shadow-[0_12px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <div className="absolute top-0 right-[5%] left-[5%] h-0.5 bg-gradient-to-r from-transparent via-accent-blue to-transparent" />
          <div className="pointer-events-none absolute -top-16 -right-10 h-[220px] w-[280px] rounded-full bg-[radial-gradient(ellipse,rgba(74,130,180,0.14)_0%,transparent_65%)] blur-[20px]" />

          <div className="relative z-10">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-accent-blue/20 bg-accent-blue/10">
              <Monitor size={22} className="text-accent-blue" strokeWidth={1.8} />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Locação</h2>
            <p className="text-[13px] leading-relaxed text-white/35">
              Geradores para eventos, obras e emergências — com suporte técnico incluso.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] font-medium text-accent-blue/70">Sob demanda</span>
            <ArrowRight size={16} className="text-accent-blue/50" />
          </div>
        </motion.button>
      </div>

      {/* Row 2: Manutenção, Mapa Brasil, Cases, Sobre */}
      <div className="flex min-h-0 flex-1 gap-4">
        <MenuTile
          onClick={() => onNavigate('manutencao')}
          icon={Wrench}
          title="Manutenção"
          description="Preventiva e corretiva"
          accent="copper"
        />
        <MenuTile
          onClick={() => onNavigate('mapa')}
          icon={MapPin}
          title="Mapa Brasil"
          description="18+ estados atendidos"
          accent="brand"
          grow
        />
        <MenuTile
          onClick={() => onNavigate('cases')}
          icon={Image}
          title="Cases"
          description="Projetos reais no Brasil"
          accent="blue"
        />
        <MenuTile
          onClick={() => onNavigate('sobre')}
          icon={Home}
          title="Sobre nós"
          description="Nossa história e missão"
          accent="neutral"
        />
      </div>
    </motion.div>
  )
}

type TileAccent = 'brand' | 'blue' | 'copper' | 'neutral'

const TILE_ACCENT_CLASSES: Record<TileAccent, { line: string; icon: string; iconBg: string }> = {
  brand: {
    line: 'via-brand',
    icon: 'text-brand',
    iconBg: 'border-brand/20 bg-brand/10',
  },
  blue: {
    line: 'via-accent-blue',
    icon: 'text-accent-blue',
    iconBg: 'border-accent-blue/20 bg-accent-blue/10',
  },
  copper: {
    line: 'via-accent-copper',
    icon: 'text-accent-copper',
    iconBg: 'border-accent-copper/20 bg-accent-copper/10',
  },
  neutral: {
    line: 'via-white/40',
    icon: 'text-white/60',
    iconBg: 'border-white/15 bg-white/[0.08]',
  },
}

interface MenuTileProps {
  onClick: () => void
  icon: typeof Wrench
  title: string
  description: string
  accent: TileAccent
  grow?: boolean
}

function MenuTile({ onClick, icon: Icon, title, description, accent, grow = false }: MenuTileProps) {
  const classes = TILE_ACCENT_CLASSES[accent]

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`relative flex flex-col gap-2.5 overflow-hidden rounded-[20px] border border-white/[0.06] bg-[rgba(8,7,6,0.68)] p-5 text-left backdrop-blur-xl ${
        grow ? 'flex-[1.3]' : 'flex-1'
      }`}
    >
      <div className={`absolute top-0 right-[5%] left-[5%] h-0.5 bg-gradient-to-r from-transparent to-transparent ${classes.line}`} />
      <div className={`flex h-9.5 w-9.5 items-center justify-center rounded-[10px] border ${classes.iconBg}`}>
        <Icon size={19} className={classes.icon} strokeWidth={1.9} />
      </div>
      <div>
        <div className="mb-1 text-lg font-bold tracking-tight text-white">{title}</div>
        <div className="text-[11.5px] leading-snug text-white/30">{description}</div>
      </div>
    </motion.button>
  )
}
