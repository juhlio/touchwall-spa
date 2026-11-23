import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { ConhecendoGerador } from '@/components/ConhecendoGerador'
import { FaleConosco } from '@/components/FaleConosco'
import { MainMenu } from '@/components/MainMenu'
import type { UnidadeMercadoLivre } from '@/components/MercadoLivreMap'
import { BrazilMap } from '@/components/BrazilMap'
import { NossaOperacao } from '@/components/NossaOperacao'
import { Projetos } from '@/components/Projetos'
import { pageTransition, pageVariants } from '@/config/animations'
import { useBlockPageZoom } from '@/hooks/useBlockPageZoom'
import { useInactivityReset } from '@/hooks/useInactivityReset'
import { MapLayout } from '@/layouts/MapLayout'
import { MenuLayout } from '@/layouts/MenuLayout'
import { ServiceLayout } from '@/layouts/ServiceLayout'
import type { Client, Page } from '@/types'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu')
  const [unidades, setUnidades] = useState<UnidadeMercadoLivre[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetch('/data/clients-locations.json')
      .then((res) => res.json())
      .then((data: Client[]) => setClients(data))
      .catch(() => setClients([]))
  }, [])

  useEffect(() => {
    fetch('/data/mercado-livre-unidades.json')
      .then((res) => res.json())
      .then((data: UnidadeMercadoLivre[]) => setUnidades(data))
      .catch(() => setUnidades([]))
  }, [])

  const goToMenu = useCallback(() => {
    setCurrentPage('menu')
  }, [])

  useBlockPageZoom()
  // Troca de página desmonta a página atual (AnimatePresence mode="wait"),
  // o que já fecha qualquer modal/lightbox aberto nela.
  useInactivityReset(goToMenu)

  function renderPage() {
    switch (currentPage) {
      case 'onde-estamos':
        return (
          <MapLayout onBack={goToMenu}>
            <BrazilMap clients={clients} unidades={unidades} onPinClick={() => {}} />
          </MapLayout>
        )

      case 'nossa-operacao':
        return (
          <ServiceLayout title="Nossa Operação" onBack={goToMenu}>
            <NossaOperacao />
          </ServiceLayout>
        )

      case 'conhecendo-gerador':
        return <ConhecendoGerador onBack={goToMenu} />

      case 'projetos':
        return <Projetos onBack={goToMenu} />

      case 'fale-conosco':
        return (
          <ServiceLayout title="Fale Conosco" onBack={goToMenu}>
            <FaleConosco />
          </ServiceLayout>
        )

      case 'menu':
      default:
        return (
          <MenuLayout>
            <MainMenu onNavigate={setCurrentPage} />
          </MenuLayout>
        )
    }
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-canvas">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          className="h-full w-full"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
