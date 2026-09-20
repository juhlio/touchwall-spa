import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BrazilMap } from '@/components/BrazilMap'
import { CaseCarousel } from '@/components/CaseCarousel'
import { MainMenu } from '@/components/MainMenu'
import { ServiceCard } from '@/components/ServiceCard'
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
      case 'venda':
      case 'locacao':
      case 'manutencao':
        return <ServiceCard service={currentPage} onBack={goToMenu} />

      case 'mapa':
        return (
          <MapLayout onBack={goToMenu}>
            <BrazilMap clients={clients} onPinClick={handlePinClick} />
          </MapLayout>
        )

      case 'cases':
        return (
          <ServiceLayout title="Cases" onBack={goToMenu}>
            <CaseCarousel cases={cases} />
          </ServiceLayout>
        )

      case 'sobre':
        return (
          <ServiceLayout title="Sobre a Empresa" onBack={goToMenu}>
            <div className="max-w-3xl rounded-3xl bg-neutral-900 p-12 text-center shadow-xl">
              <p className="text-xl leading-relaxed text-neutral-300">
                A Essencial atua com soluções completas de venda, locação e manutenção,
                atendendo clientes em todo o Brasil com excelência e proximidade.
              </p>
            </div>
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
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950">
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
