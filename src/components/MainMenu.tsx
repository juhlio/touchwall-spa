// MainMenu.tsx
// Menu principal de navegação da TV touch interactive.
// Exibe os 6 botões de entrada (serviços, mapa, cases, sobre) em grid 3x2.

import { motion, type Variants } from 'framer-motion'
import { Building, Building2, Hammer, Images, MapPin, ShoppingBag } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Page } from '@/types'

interface MainMenuProps {
  onNavigate: (page: Page) => void
}

interface MenuItem {
  page: Page
  label: string
  icon: ComponentType<{ size?: number }>
  badgeClass: string
  glowClass: string
}

const menuItems: MenuItem[] = [
  {
    page: 'venda',
    label: 'Venda',
    icon: ShoppingBag,
    badgeClass: 'bg-blue-100 text-blue-600',
    glowClass: 'hover:shadow-blue-500/40',
  },
  {
    page: 'locacao',
    label: 'Locação',
    icon: Building2,
    badgeClass: 'bg-green-100 text-green-600',
    glowClass: 'hover:shadow-green-500/40',
  },
  {
    page: 'manutencao',
    label: 'Manutenção',
    icon: Hammer,
    badgeClass: 'bg-red-100 text-red-600',
    glowClass: 'hover:shadow-red-500/40',
  },
  {
    page: 'mapa',
    label: 'Mapa Brasil',
    icon: MapPin,
    badgeClass: 'bg-orange-100 text-orange-600',
    glowClass: 'hover:shadow-orange-500/40',
  },
  {
    page: 'cases',
    label: 'Cases',
    icon: Images,
    badgeClass: 'bg-purple-100 text-purple-600',
    glowClass: 'hover:shadow-purple-500/40',
  },
  {
    page: 'sobre',
    label: 'Sobre a Empresa',
    icon: Building,
    badgeClass: 'bg-neutral-200 text-neutral-600',
    glowClass: 'hover:shadow-neutral-500/40',
  },
]

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex h-full w-full flex-col items-center justify-center gap-14 px-16"
    >
      <motion.h1
        variants={titleVariants}
        className="text-6xl font-semibold tracking-tight text-neutral-800"
      >
        TouchWall
      </motion.h1>

      <div className="grid w-full max-w-6xl grid-cols-3 grid-rows-2 gap-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.page}
              type="button"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-col items-center justify-center gap-5 rounded-3xl border border-neutral-200 bg-white p-10 shadow-lg transition-shadow duration-200 hover:shadow-2xl ${item.glowClass}`}
            >
              <span className={`flex h-20 w-20 items-center justify-center rounded-2xl ${item.badgeClass}`}>
                <Icon size={40} />
              </span>
              <span className="text-2xl font-semibold text-neutral-800">{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
