// useBlockPageZoom.ts
// Bloqueia o zoom da página inteira (pinça no Safari/WebKit via
// gesturestart, e ctrl+wheel do trackpad) em cima do touch-action global
// e do maximum-scale/user-scalable da viewport. O mapa e o visualizador
// de documentos continuam com zoom próprio porque implementam a pinça
// via pointer events, não via gesto nativo do navegador.

import { useEffect } from 'react'

export function useBlockPageZoom() {
  useEffect(() => {
    function blockGesture(event: Event) {
      event.preventDefault()
    }

    function blockCtrlWheel(event: WheelEvent) {
      if (event.ctrlKey) event.preventDefault()
    }

    document.addEventListener('gesturestart', blockGesture)
    document.addEventListener('wheel', blockCtrlWheel, { passive: false })

    return () => {
      document.removeEventListener('gesturestart', blockGesture)
      document.removeEventListener('wheel', blockCtrlWheel)
    }
  }, [])
}
