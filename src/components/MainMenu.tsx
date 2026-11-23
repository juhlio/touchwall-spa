// MainMenu.tsx
// Tela Home: marca + bloco institucional (quem é a Essencial Energia +
// selo de distribuidor CAT) + 5 botões de navegação (Onde Estamos,
// Nossa Operação, Projetos, Capacidade Técnica, Fale Conosco).

import { motion, type Variants } from 'framer-motion'
import { Building2, Image, MapPin, Milestone, MessageCircle, Zap } from 'lucide-react'
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

const ABOUT_STATS = [
  { label: 'Experiência', value: '+20 anos' },
  { label: 'Solução', value: 'Energia' },
  { label: 'Foco', value: 'Operação crítica' },
  { label: 'Ativo', value: 'Estrutura própria' },
  { label: 'Alcance', value: 'Atuação nacional' },
]

export function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex w-full flex-col gap-4 lg:h-full lg:gap-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <BrandMark />
          <img
            src="/assets/images/logo-iso.webp"
            alt="Certificação ISO"
            className="h-16 w-16 rounded-lg bg-white p-1.5"
          />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] py-1.5 pr-4 pl-2.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_9px_var(--color-brand)]" />
          <span className="text-[13px] font-medium tracking-wide text-white/70">Toque para explorar</span>
        </div>
      </motion.div>

      {/* Bloco institucional: quem é a empresa + selo de distribuidor CAT */}
      <motion.div
        variants={itemVariants}
        className="flex flex-shrink-0 flex-col gap-4 rounded-[20px] border border-white/[0.07] bg-[rgba(10,6,4,0.72)] p-5 backdrop-blur-xl sm:p-7 lg:flex-row"
      >
        <div className="flex-1">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">
            Quem é a Essencial Energia
          </span>
          <h1 className="mt-2 mb-4 text-[22px] leading-[1.15] font-bold tracking-tight text-white sm:text-[28px]">
            +20 anos gerando energia
            <br />
            para operações críticas no Brasil.
          </h1>
          <p className="mb-5 max-w-xl text-[15px] leading-relaxed font-semibold text-brand/90">
            "Energia não é apenas um serviço. É parte da infraestrutura da operação."
          </p>

          <div className="flex flex-wrap gap-3.5">
            {ABOUT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-5 py-3.5"
              >
                <div className="text-[12.5px] font-medium tracking-wide text-white/55 uppercase">
                  {stat.label}
                </div>
                <div className="text-[21px] font-bold text-white/80">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-5 rounded-[16px] lg:w-80 border border-accent-blue/20 bg-gradient-to-b from-accent-blue/[0.12] to-transparent p-7 text-center">
          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white px-6 py-3 sm:h-24">
              <img src="/assets/images/logo-caterpillar.svg" alt="Caterpillar" className="h-9 w-auto" />
            </div>
            <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white px-6 py-2 sm:h-24">
              <img src="/assets/images/logo-fgwilson.webp" alt="FG Wilson" className="h-[76px] w-auto" />
            </div>
          </div>
          <div className="text-[13px] font-semibold tracking-wide text-white/60 uppercase">
            Distribuidor oficial das marcas referência do mercado
          </div>
        </div>
      </motion.div>

      {/* 5 botões de navegação, todos do mesmo tamanho */}
      <div className="grid grid-cols-2 gap-3 lg:flex lg:min-h-0 lg:flex-1 lg:gap-4">
        <MenuTile
          onClick={() => onNavigate('nossa-historia')}
          icon={Milestone}
          title="Nossa história"
          description="Da fundação às novas sedes"
          accent="copper"
        />
        <MenuTile
          onClick={() => onNavigate('onde-estamos')}
          icon={MapPin}
          title="Locais da Operação"
          description="Mapa com clientes em todo o Brasil"
          accent="brand"
        />
        <MenuTile
          onClick={() => onNavigate('nossa-operacao')}
          icon={Building2}
          title="Nossa Operação"
          description="Conheça nosso COE"
          accent="blue"
        />
        <MenuTile
          onClick={() => onNavigate('conhecendo-gerador')}
          icon={Zap}
          title="Conhecendo um gerador"
          description="Gerador 3D interativo"
          accent="brand"
        />
        <MenuTile
          onClick={() => onNavigate('projetos')}
          icon={Image}
          title="Projetos"
          description="Cases reais de usinas no Brasil"
          accent="copper"
        />
        <MenuTile
          onClick={() => onNavigate('fale-conosco')}
          icon={MessageCircle}
          title="Fale Conosco"
          description="Desafio, contato e QR Code"
          accent="blue"
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
  icon: typeof MapPin
  title: string
  description: string
  accent: TileAccent
  className?: string
}

function MenuTile({ onClick, icon: Icon, title, description, accent, className }: MenuTileProps) {
  const classes = TILE_ACCENT_CLASSES[accent]

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-label={`${title} — ${description}`}
      className={`relative flex min-h-[170px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-white/[0.06] bg-[rgba(8,7,6,0.68)] p-4 text-center backdrop-blur-xl lg:min-h-0 lg:flex-1 lg:gap-3.5 lg:p-5 ${className ?? ''}`}
    >
      <div className={`absolute top-0 right-[5%] left-[5%] h-0.5 bg-gradient-to-r from-transparent to-transparent ${classes.line}`} />
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border lg:h-20 lg:w-20 ${classes.iconBg}`}>
        <Icon size={38} className={classes.icon} strokeWidth={1.7} />
      </div>
      <div className="flex flex-col justify-center lg:h-[70px]">
        <div className="text-xl leading-tight font-bold tracking-tight text-white lg:text-2xl">{title}</div>
        <div className="text-sm leading-snug text-white/65">{description}</div>
      </div>
    </motion.button>
  )
}
