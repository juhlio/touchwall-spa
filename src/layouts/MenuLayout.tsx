// MenuLayout.tsx
// Layout da tela de menu principal, envolvendo o MainMenu
// e definindo a estrutura de fundo/header dessa etapa.

import type { ReactNode } from 'react'

interface MenuLayoutProps {
  children: ReactNode
}

// Fundo institucional (cinza/branco). Substitua a imagem em
// public/assets/images/menu-background.jpg pela arte oficial da Essencial
// quando disponível — o gradiente serve de fallback enquanto ela não existe.
const BACKGROUND_STYLE = {
  backgroundImage:
    "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(229,229,229,0.94)), url('/assets/images/menu-background.jpg')",
}

export function MenuLayout({ children }: MenuLayoutProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-neutral-100 bg-cover bg-center"
      style={BACKGROUND_STYLE}
    >
      {children}
    </div>
  )
}
