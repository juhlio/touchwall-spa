// useInactivityReset.ts
// Reset por inatividade do totem: depois de INACTIVITY_TIMEOUT_MS sem
// nenhum pointerdown/touchstart/keydown, chama onIdle() (App.tsx usa pra
// voltar pra Home, o que já desmonta modais/lightboxes das páginas
// atuais). Fica em pausa enquanto o Modo Slider da página Projetos está
// avançando sozinho — useInactivitySuppress registra essa pausa.

import { useEffect, useRef } from 'react'

export const INACTIVITY_TIMEOUT_MS = 90_000

let suppressCount = 0

export function useInactivitySuppress(active: boolean) {
  useEffect(() => {
    if (!active) return
    suppressCount++
    return () => {
      suppressCount--
    }
  }, [active])
}

export function useInactivityReset(onIdle: () => void) {
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function schedule() {
      timer = setTimeout(() => {
        if (suppressCount > 0) {
          schedule()
          return
        }
        onIdleRef.current()
      }, INACTIVITY_TIMEOUT_MS)
    }

    function reset() {
      clearTimeout(timer)
      schedule()
    }

    const events = ['pointerdown', 'touchstart', 'keydown'] as const
    events.forEach((event) => window.addEventListener(event, reset))
    schedule()

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset))
      clearTimeout(timer)
    }
  }, [])
}
