// ServiceCard.tsx
// Página de um dos 3 serviços (Venda, Locação, Manutenção). Renderiza o
// cabeçalho com botão de voltar e os cards específicos do serviço,
// cada um expansível ao toque.

import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Gauge,
  Lightbulb,
  Rocket,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { useState, type ComponentType } from 'react'
import type { ServiceId } from '@/types'

interface ServiceCardProps {
  service: ServiceId
  onBack: () => void
}

interface SubCard {
  id: string
  title: string
  icon: ComponentType<{ size?: number }>
  description: string
  details: string
}

const SERVICE_TITLES: Record<ServiceId, string> = {
  venda: 'Venda',
  locacao: 'Locação',
  manutencao: 'Manutenção',
}

// Dados de exemplo — substituir pelo conteúdo real de cada serviço.
const SERVICE_CARDS: Record<ServiceId, SubCard[]> = {
  venda: [
    {
      id: 'venda-200',
      title: 'Até 200 kVA',
      icon: Zap,
      description: 'Geradores compactos para pequenos e médios negócios.',
      details:
        'Ideal para comércios, condomínios e pequenas indústrias. Instalação rápida e baixo custo de manutenção.',
    },
    {
      id: 'venda-750',
      title: 'Até 750 kVA',
      icon: Gauge,
      description: 'Solução intermediária para operações de maior porte.',
      details:
        'Atende indústrias e centros de distribuição com demanda elevada e necessidade de backup contínuo.',
    },
    {
      id: 'venda-750-plus',
      title: '750 kVA+',
      icon: Rocket,
      description: 'Alta potência para grandes plantas industriais.',
      details:
        'Projetos sob medida com equipe dedicada para dimensionamento, instalação e acompanhamento técnico.',
    },
  ],
  locacao: [
    {
      id: 'locacao-equipamentos',
      title: 'Equipamentos',
      icon: Wrench,
      description: 'Frota completa disponível para locação imediata.',
      details:
        'Geradores, climatização e equipamentos complementares com manutenção preventiva em dia.',
    },
    {
      id: 'locacao-equipe',
      title: 'Equipe',
      icon: Users,
      description: 'Técnicos especializados no local do evento.',
      details:
        'Equipe própria para instalação, operação e suporte durante todo o período de locação.',
    },
    {
      id: 'locacao-dicas',
      title: 'Dicas de Evento',
      icon: Lightbulb,
      description: 'Boas práticas para dimensionar sua locação.',
      details:
        'Orientações sobre carga estimada, tempo de instalação e planos de contingência para o seu evento.',
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
    },
    {
      id: 'manutencao-corretiva',
      title: 'Corretiva',
      icon: Wrench,
      description: 'Atendimento rápido para resolver falhas.',
      details:
        'Equipe técnica mobilizada para diagnóstico e reparo, minimizando o tempo de indisponibilidade.',
    },
    {
      id: 'manutencao-suporte',
      title: 'Suporte 24h',
      icon: Clock,
      description: 'Atendimento emergencial a qualquer hora.',
      details:
        'Central de suporte disponível 24 horas por dia, 7 dias por semana, para emergências operacionais.',
    },
  ],
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function ServiceCard({ service, onBack }: ServiceCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pulsingId, setPulsingId] = useState<string | null>(null)

  function handleToggle(id: string) {
    setExpandedId((current) => (current === id ? null : id))
    setPulsingId(id)
    window.setTimeout(() => {
      setPulsingId((current) => (current === id ? null : current))
    }, 400)
  }

  return (
    <div className="flex h-full w-full flex-col bg-neutral-950">
      <header className="flex items-center gap-6 p-8">
        <button
          type="button"
          onClick={onBack}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-white active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-semibold text-white">{SERVICE_TITLES[service]}</h1>
      </header>

      <motion.main
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="flex flex-1 flex-wrap items-start justify-center gap-8 overflow-y-auto p-8"
      >
        {SERVICE_CARDS[service].map((card) => {
          const Icon = card.icon
          const isExpanded = expandedId === card.id

          return (
            <motion.button
              key={card.id}
              type="button"
              variants={cardVariants}
              layout
              onClick={() => handleToggle(card.id)}
              whileTap={{ scale: 0.94 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-900 p-8 text-left shadow-xl"
            >
              <AnimatePresence>
                {pulsingId === card.id ? (
                  <motion.span
                    key="pulse"
                    initial={{ opacity: 0.45, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 z-0 rounded-3xl bg-purple-400"
                  />
                ) : null}
              </AnimatePresence>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400">
                    <Icon size={28} />
                  </span>
                  <h2 className="text-2xl font-semibold text-white">{card.title}</h2>
                </div>

                <p className="text-base text-neutral-300">{card.description}</p>

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-neutral-800 pt-4 text-sm leading-relaxed text-neutral-400">
                        {card.details}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.button>
          )
        })}
      </motion.main>
    </div>
  )
}
