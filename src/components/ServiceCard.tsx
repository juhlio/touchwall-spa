// ServiceCard.tsx
// Página de um dos 3 serviços (Venda, Locação, Manutenção). Venda usa o
// layout de tiers em destaque do mockup; Locação e Manutenção usam cards
// no mesmo estilo visual, todos expansíveis ao toque.

import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  Lightbulb,
  Monitor,
  ShoppingBag,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'
import { BrandMark } from '@/components/BrandMark'
import type { ServiceId } from '@/types'

interface ServiceCardProps {
  service: ServiceId
  onBack: () => void
}

type Accent = 'brand' | 'blue' | 'copper' | 'neutral'

const ACCENT_CLASSES: Record<
  Accent,
  { line: string; icon: string; iconBg: string; text: string; check: string; dot: string; pulseBg: string }
> = {
  brand: {
    line: 'via-brand',
    icon: 'text-brand',
    iconBg: 'border-brand/25 bg-brand/10',
    text: 'text-brand',
    check: 'border-brand/25 bg-brand/10 text-brand',
    dot: 'bg-brand',
    pulseBg: 'bg-brand',
  },
  blue: {
    line: 'via-accent-blue',
    icon: 'text-accent-blue',
    iconBg: 'border-accent-blue/15 bg-accent-blue/10',
    text: 'text-accent-blue',
    check: 'border-accent-blue/15 bg-accent-blue/10 text-accent-blue',
    dot: 'bg-accent-blue',
    pulseBg: 'bg-accent-blue',
  },
  copper: {
    line: 'via-accent-copper',
    icon: 'text-accent-copper',
    iconBg: 'border-accent-copper/15 bg-accent-copper/10',
    text: 'text-accent-copper',
    check: 'border-accent-copper/15 bg-accent-copper/10 text-accent-copper',
    dot: 'bg-accent-copper',
    pulseBg: 'bg-accent-copper',
  },
  neutral: {
    line: 'via-white/15',
    icon: 'text-white/45',
    iconBg: 'border-white/10 bg-white/5',
    text: 'text-white/45',
    check: 'border-white/10 bg-white/5 text-white/40',
    dot: 'bg-white/45',
    pulseBg: 'bg-white/40',
  },
}

const SERVICE_META: Record<
  ServiceId,
  { title: string; icon: LucideIcon; heading: string; subtitle: string }
> = {
  venda: {
    title: 'Venda',
    icon: ShoppingBag,
    heading: 'Geradores para\ncada necessidade',
    subtitle: 'Do residencial ao industrial — potência, confiabilidade e suporte técnico especializado.',
  },
  locacao: {
    title: 'Locação',
    icon: Monitor,
    heading: 'Locação sob medida\npra cada operação',
    subtitle:
      'Equipamentos, equipe técnica e suporte completo — disponível quando e onde você precisar.',
  },
  manutencao: {
    title: 'Manutenção',
    icon: Wrench,
    heading: 'Manutenção que mantém\nsua operação girando',
    subtitle: 'Planos preventivos e corretivos com atendimento rápido, em qualquer lugar do Brasil.',
  },
}

// Dados de exemplo — substituir pelo conteúdo real de cada tier.
const VENDA_TIERS = [
  {
    id: 'residencial',
    badge: 'Residencial',
    range: 'até',
    highlight: '25',
    unit: 'kVA',
    description:
      'Ideal para casas, pequenos comércios e ambientes que precisam de energia de emergência confiável.',
    features: ['Monofásico e trifásico', 'Garantia 1 ano', 'Entrega em todo o Brasil'],
    details: 'Consulte a faixa exata de potência ideal para seu imóvel com um especialista técnico.',
    accent: 'neutral' as Accent,
    featured: false,
  },
  {
    id: 'comercial',
    badge: 'Comercial',
    range: '',
    highlight: '26 – 150',
    unit: 'kVA',
    description:
      'A faixa mais versátil. Perfeito para galerias, hotéis, clínicas, supermercados e operações comerciais.',
    features: [
      'Transferência automática',
      'Cabine acústica inclusa',
      'Manutenção preventiva grátis (1 ano)',
      'Monitoramento 24/7',
    ],
    details:
      'Projeto dimensionado conforme a carga crítica do estabelecimento, com instalação e comissionamento inclusos.',
    accent: 'brand' as Accent,
    featured: true,
    ribbon: 'Mais procurado',
    cta: 'Solicitar proposta',
  },
  {
    id: 'industrial',
    badge: 'Industrial',
    range: '',
    highlight: '150 – 2000+',
    unit: 'kVA',
    description:
      'Grandes operações industriais, data centers, mineradoras e projetos de infraestrutura crítica.',
    features: ['Projeto técnico personalizado', 'Suporte 24/7 dedicado', 'Parcelamento em até 36x'],
    details:
      'Equipe de engenharia dedicada para dimensionamento, paralelismo de unidades e integração com a operação.',
    accent: 'blue' as Accent,
    featured: false,
  },
]

interface GenericCard {
  id: string
  title: string
  icon: ComponentType<{ size?: number }>
  description: string
  details: string
  accent: Accent
}

const GENERIC_CARDS: Record<'locacao' | 'manutencao', GenericCard[]> = {
  locacao: [
    {
      id: 'locacao-equipamentos',
      title: 'Equipamentos',
      icon: Wrench,
      description: 'Frota completa disponível para locação imediata.',
      details: 'Geradores, climatização e equipamentos complementares com manutenção preventiva em dia.',
      accent: 'copper',
    },
    {
      id: 'locacao-equipe',
      title: 'Equipe',
      icon: Users,
      description: 'Técnicos especializados no local do evento.',
      details: 'Equipe própria para instalação, operação e suporte durante todo o período de locação.',
      accent: 'brand',
    },
    {
      id: 'locacao-dicas',
      title: 'Dicas de Evento',
      icon: Lightbulb,
      description: 'Boas práticas para dimensionar sua locação.',
      details:
        'Orientações sobre carga estimada, tempo de instalação e planos de contingência para o seu evento.',
      accent: 'blue',
    },
  ],
  manutencao: [
    {
      id: 'manutencao-preventiva',
      title: 'Preventiva',
      icon: CalendarCheck,
      description: 'Inspeções programadas para evitar falhas.',
      details:
        'Plano de visitas periódicas com checklist técnico completo, reduzindo riscos de parada não planejada.',
      accent: 'copper',
    },
    {
      id: 'manutencao-corretiva',
      title: 'Corretiva',
      icon: Wrench,
      description: 'Atendimento rápido para resolver falhas.',
      details: 'Equipe técnica mobilizada para diagnóstico e reparo, minimizando o tempo de indisponibilidade.',
      accent: 'brand',
    },
    {
      id: 'manutencao-suporte',
      title: 'Suporte 24h',
      icon: Clock,
      description: 'Atendimento emergencial a qualquer hora.',
      details:
        'Central de suporte disponível 24 horas por dia, 7 dias por semana, para emergências operacionais.',
      accent: 'blue',
    },
  ],
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function ServiceCard({ service, onBack }: ServiceCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pulsingId, setPulsingId] = useState<string | null>(null)
  const meta = SERVICE_META[service]
  const HeaderIcon = meta.icon

  function handleToggle(id: string) {
    setExpandedId((current) => (current === id ? null : id))
    setPulsingId(id)
    window.setTimeout(() => {
      setPulsingId((current) => (current === id ? null : current))
    }, 400)
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-canvas px-8 py-7">
      <AtmosphereBackground watermark={meta.title.toUpperCase()} />

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
            <HeaderIcon size={14} className="text-brand" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wide text-brand uppercase">{meta.title}</span>
          </div>
        </header>

        <div className="mb-5 flex-shrink-0">
          <h1 className="mb-1.5 text-4xl leading-[1.05] font-bold tracking-tight whitespace-pre-line text-white">
            {meta.heading}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/35">{meta.subtitle}</p>
        </div>

        {service === 'venda' ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="flex min-h-0 flex-1 items-stretch gap-3.5"
          >
            {VENDA_TIERS.map((tier) => (
              <VendaTierCard
                key={tier.id}
                tier={tier}
                isExpanded={expandedId === tier.id}
                isPulsing={pulsingId === tier.id}
                onToggle={() => handleToggle(tier.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="flex min-h-0 flex-1 flex-wrap items-start gap-3.5"
          >
            {GENERIC_CARDS[service].map((card) => (
              <GenericServiceCard
                key={card.id}
                card={card}
                isExpanded={expandedId === card.id}
                isPulsing={pulsingId === card.id}
                onToggle={() => handleToggle(card.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

interface VendaTierCardProps {
  tier: (typeof VENDA_TIERS)[number]
  isExpanded: boolean
  isPulsing: boolean
  onToggle: () => void
}

function VendaTierCard({ tier, isExpanded, isPulsing, onToggle }: VendaTierCardProps) {
  const classes = ACCENT_CLASSES[tier.accent]

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      style={{ flex: tier.featured ? 1.2 : 1 }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-[20px] border p-6 text-left backdrop-blur-xl ${
        tier.featured
          ? 'border-brand/25 bg-[rgba(20,6,2,0.72)] shadow-[0_0_60px_rgba(224,90,28,0.12)]'
          : 'border-white/[0.07] bg-[rgba(6,8,20,0.65)]'
      }`}
    >
      <div
        className={`absolute top-0 right-[5%] left-[5%] bg-gradient-to-r from-transparent to-transparent ${classes.line} ${
          tier.featured ? 'h-[2px]' : 'h-px'
        }`}
      />

      <AnimatePresence>
        {isPulsing ? (
          <motion.span
            key="pulse"
            initial={{ opacity: 0.35, scale: 1 }}
            animate={{ opacity: 0, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 z-0 rounded-[20px] bg-brand"
          />
        ) : null}
      </AnimatePresence>

      {tier.featured && 'ribbon' in tier ? (
        <div className="absolute top-5 right-5 rounded-lg bg-gradient-to-br from-brand to-brand-dark px-2.5 py-1">
          <span className="text-[9px] font-bold tracking-wide text-white uppercase">{tier.ribbon}</span>
        </div>
      ) : null}

      <div className="relative z-10">
        <div className={`mb-4 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${classes.iconBg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
          <span className={`text-[10px] font-semibold tracking-wide uppercase ${classes.text}`}>
            {tier.badge}
          </span>
        </div>

        <div className="mb-1 text-[44px] leading-[0.95] font-bold tracking-tight text-white">
          {tier.range ? <>{tier.range} </> : null}
          <span className={tier.featured || tier.accent === 'blue' ? classes.text : 'text-white/50'}>
            {tier.highlight}
          </span>
        </div>
        <div className={`mb-4 text-sm font-semibold ${classes.text}`}>{tier.unit}</div>

        <p className="text-[12.5px] leading-relaxed text-white/35">{tier.description}</p>
      </div>

      <div className="relative z-10 mt-5 flex flex-col gap-1.5">
        {tier.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${classes.check}`}>
              <Check size={9} strokeWidth={3} />
            </span>
            <span className="text-[11px] text-white/45">{feature}</span>
          </div>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative z-10 overflow-hidden"
          >
            <p className="mt-4 border-t border-white/[0.08] pt-4 text-[11.5px] leading-relaxed text-white/40">
              {tier.details}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={`relative z-10 mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold ${
          tier.featured
            ? 'bg-gradient-to-br from-brand to-brand-dark text-white'
            : `border ${classes.iconBg} ${classes.text}`
        }`}
      >
        {'cta' in tier ? tier.cta : 'Ver modelos'}
        {tier.featured ? <ArrowRight size={14} /> : null}
      </div>
    </motion.button>
  )
}

interface GenericServiceCardProps {
  card: GenericCard
  isExpanded: boolean
  isPulsing: boolean
  onToggle: () => void
}

function GenericServiceCard({ card, isExpanded, isPulsing, onToggle }: GenericServiceCardProps) {
  const Icon = card.icon
  const classes = ACCENT_CLASSES[card.accent]

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      onClick={onToggle}
      whileTap={{ scale: 0.96 }}
      className="relative w-full max-w-sm flex-1 overflow-hidden rounded-[20px] border border-white/[0.07] bg-[rgba(8,8,10,0.68)] p-7 text-left backdrop-blur-xl"
    >
      <div className={`absolute top-0 right-[5%] left-[5%] h-px bg-gradient-to-r from-transparent to-transparent ${classes.line}`} />

      <AnimatePresence>
        {isPulsing ? (
          <motion.span
            key="pulse"
            initial={{ opacity: 0.35, scale: 1 }}
            animate={{ opacity: 0, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`absolute inset-0 z-0 rounded-[20px] ${classes.pulseBg}`}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${classes.iconBg}`}>
            <Icon size={24} />
          </span>
          <h2 className="text-xl font-bold text-white">{card.title}</h2>
        </div>

        <p className="text-[13px] text-white/40">{card.description}</p>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="border-t border-white/[0.08] pt-4 text-[12px] leading-relaxed text-white/35">
                {card.details}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.button>
  )
}
