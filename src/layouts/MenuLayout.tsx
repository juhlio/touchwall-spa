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
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-canvas px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <AtmosphereBackground watermark="ESSENCIAL" />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  )
}
