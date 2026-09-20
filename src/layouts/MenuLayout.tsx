// MenuLayout.tsx
// Layout da tela de menu principal: fundo escuro da marca (Essencial
// Energia) com atmosfera de gradientes, envolvendo o MainMenu.

import type { ReactNode } from 'react'
import { AtmosphereBackground } from '@/components/AtmosphereBackground'

interface MenuLayoutProps {
  children: ReactNode
}

export function MenuLayout({ children }: MenuLayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-canvas px-8 py-7">
      <AtmosphereBackground watermark="ESSENCIAL" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
