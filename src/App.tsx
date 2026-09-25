import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BrazilMap } from '@/components/BrazilMap'
import { CapacidadeTecnica } from '@/components/CapacidadeTecnica'
import { CaseCarousel } from '@/components/CaseCarousel'
import { FaleConosco } from '@/components/FaleConosco'
import { MainMenu } from '@/components/MainMenu'
import { NossaOperacao } from '@/components/NossaOperacao'
import { pageTransition, pageVariants } from '@/config/animations'
import { cases } from '@/config/cases'
import { MapLayout } from '@/layouts/MapLayout'
import { MenuLayout } from '@/layouts/MenuLayout'
import { ServiceLayout } from '@/layouts/ServiceLayout'
import type { Client, Page } from '@/types'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu')
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetch('/data/clients-locations.json')
      .then((res) => res.json())
      .then((data: Client[]) => setClients(data))
      .catch(() => setClients([]))
  }, [])

  function goToMenu() {
    setCurrentPage('menu')
  }

  function handlePinClick(client: Client) {
    console.log('Cliente selecionado no mapa:', client.name)
  }

  function renderPage() {
    switch (currentPage) {
      case 'onde-estamos':
        return (
          <MapLayout onBack={goToMenu}>
            <BrazilMap clients={clients} onPinClick={handlePinClick} />
          </MapLayout>
        )

      case 'nossa-operacao':
        return (
          <ServiceLayout title="Nossa Operação" onBack={goToMenu}>
            <NossaOperacao />
          </ServiceLayout>
        )

      case 'projetos':
        return <CaseCarousel cases={cases} onBack={goToMenu} />

      case 'capacidade-tecnica':
        return (
          <ServiceLayout title="Capacidade Técnica" onBack={goToMenu}>
            <CapacidadeTecnica />
          </ServiceLayout>
        )

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
    <div className="relative h-screen w-screen overflow-hidden bg-canvas">
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
