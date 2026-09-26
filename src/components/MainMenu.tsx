// MainMenu.tsx
// Tela Home: marca + bloco institucional (quem é a Essencial Energia +
// selo de distribuidor CAT) + 5 botões de navegação (Onde Estamos,
// Nossa Operação, Projetos, Capacidade Técnica, Fale Conosco).

import { motion, type Variants } from 'framer-motion'
import { Award, Building2, Image, MapPin, MessageCircle } from 'lucide-react'
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
      className="flex h-full w-full flex-col gap-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandMark />
          <img
            src="/assets/images/logo-iso.png"
            alt="Certificação ISO"
            className="h-16 w-16 rounded-lg bg-white p-1.5"
          />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] py-1.5 pr-4 pl-2.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_9px_var(--color-brand)]" />
          <span className="text-[13px] font-medium tracking-wide text-white/45">Toque para explorar</span>
        </div>
      </motion.div>

      {/* Bloco institucional: quem é a empresa + selo de distribuidor CAT */}
      <motion.div
        variants={itemVariants}
        className="flex flex-shrink-0 gap-4 rounded-[20px] border border-white/[0.07] bg-[rgba(10,6,4,0.72)] p-7 backdrop-blur-xl"
      >
        <div className="flex-1">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">
            Quem é a Essencial Energia
          </span>
          <h1 className="mt-2 mb-4 text-[28px] leading-[1.15] font-bold tracking-tight text-white">
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
                <div className="text-[12.5px] font-medium tracking-wide text-white/30 uppercase">
                  {stat.label}
                </div>
                <div className="text-[21px] font-bold text-white/80">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-80 shrink-0 flex-col items-center justify-between gap-4 rounded-[16px] border border-accent-blue/20 bg-gradient-to-b from-accent-blue/[0.12] to-transparent p-7 text-center">
          <div className="flex h-16 items-center justify-center rounded-lg bg-white px-6 py-3">
            <img src="/assets/images/logo-caterpillar.svg" alt="Caterpillar" className="h-6 w-auto" />
          </div>
          <div>
            <div className="mb-1.5 text-[13px] font-semibold tracking-wide text-white/60 uppercase">
              Distribuidor desde 2006
            </div>
            <p className="text-[13px] leading-relaxed text-white/35">
              Parceria direta com a fábrica Caterpillar de Piracicaba.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 5 botões de navegação, todos do mesmo tamanho */}
      <div className="flex min-h-0 flex-1 gap-4">
        <MenuTile
          onClick={() => onNavigate('onde-estamos')}
          icon={MapPin}
          title="Onde Estamos"
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
          onClick={() => onNavigate('projetos')}
          icon={Image}
          title="Projetos"
          description="Cases reais de usinas no Brasil"
          accent="copper"
        />
        <MenuTile
          onClick={() => onNavigate('capacidade-tecnica')}
          icon={Award}
          title="Capacidade Técnica"
          description="Atestados, CAT e reconhecimentos"
          accent="brand"
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
  icon: typeof Award
  title: string
  description: string
  accent: TileAccent
}

function MenuTile({ onClick, icon: Icon, title, description, accent }: MenuTileProps) {
  const classes = TILE_ACCENT_CLASSES[accent]

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="relative flex flex-1 flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[20px] border border-white/[0.06] bg-[rgba(8,7,6,0.68)] p-5 text-center backdrop-blur-xl"
    >
      <div className={`absolute top-0 right-[5%] left-[5%] h-0.5 bg-gradient-to-r from-transparent to-transparent ${classes.line}`} />
      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${classes.iconBg}`}>
        <Icon size={38} className={classes.icon} strokeWidth={1.7} />
      </div>
      <div>
        <div className="mb-2 text-2xl font-bold tracking-tight text-white">{title}</div>
        <div className="text-sm leading-snug text-white/30">{description}</div>
      </div>
    </motion.button>
  )
}
