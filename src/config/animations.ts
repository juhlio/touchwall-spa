// animations.ts
// Variantes e configurações do Framer Motion reutilizadas
// pelos componentes da TV touch interactive.

import type { Transition, Variants } from 'framer-motion'

export const pageVariants: Variants = {
  initial: { opacity: 0, x: 48 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -48 },
}

export const pageTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
}
