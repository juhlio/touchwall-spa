// RotatingGlobe.tsx
// Globo terrestre em wireframe pontilhado (Canvas + d3-geo), usado como
// intro animada antes do BrazilMap. Gira sozinho com o Brasil destacado em
// laranja, responde a toque/mouse (Pointer Events) pra girar manualmente,
// e expõe focusOnBrazil() para centralizar no Brasil e avisar quando a
// transição pro mapa pode acontecer (via onFocusComplete).
//
// Dados: Natural Earth (domínio público), servidos localmente em
// public/data/ — sem dependência de rede em runtime. Os pontos (dots) já
// vêm pré-calculados por scripts/generate-land-dots.mjs.

import { geoCentroid, geoGraticule, geoOrthographic, geoPath } from 'd3-geo'
import { timer } from 'd3-timer'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

interface RotatingGlobeProps {
  width?: number
  height?: number
  className?: string
  onFocusComplete?: () => void
}

export interface RotatingGlobeHandle {
  focusOnBrazil: () => void
}

type Dot = [lng: number, lat: number]

const BRAZIL_COLOR = '#e05a1c'
const FOCUS_DURATION_MS = 1400

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export const RotatingGlobe = forwardRef<RotatingGlobeHandle, RotatingGlobeProps>(function RotatingGlobe(
  { width = 800, height = 600, className = '', onFocusComplete },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const focusOnBrazilRef = useRef<() => void>(() => {})

  useImperativeHandle(ref, () => ({
    focusOnBrazil: () => focusOnBrazilRef.current(),
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const containerWidth = Math.min(width, window.innerWidth - 40)
    const containerHeight = Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.5

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    const projection = geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = geoPath(projection, context)

    let landFeatures: FeatureCollection<Polygon | MultiPolygon> | null = null
    let allDots: Dot[] = []
    let brazilFeature: Feature<Polygon | MultiPolygon> | null = null
    let brazilDots: Dot[] = []
    let brazilCentroid: [number, number] | null = null

    const drawDots = (dots: Dot[], color: string, scaleFactor: number) => {
      context.fillStyle = color
      dots.forEach(([lng, lat]) => {
        const projected = projection([lng, lat])
        if (
          projected &&
          projected[0] >= 0 &&
          projected[0] <= containerWidth &&
          projected[1] >= 0 &&
          projected[1] <= containerHeight
        ) {
          context.beginPath()
          context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
          context.fill()
        }
      })
    }

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight)

      const scaleFactor = projection.scale() / radius

      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, projection.scale(), 0, 2 * Math.PI)
      context.fillStyle = '#000000'
      context.fill()
      context.strokeStyle = '#ffffff'
      context.lineWidth = 2 * scaleFactor
      context.stroke()

      if (!landFeatures) return

      context.beginPath()
      path(geoGraticule()())
      context.strokeStyle = '#ffffff'
      context.lineWidth = 1 * scaleFactor
      context.globalAlpha = 0.25
      context.stroke()
      context.globalAlpha = 1

      context.beginPath()
      landFeatures.features.forEach((feature) => path(feature))
      context.strokeStyle = '#ffffff'
      context.lineWidth = 1 * scaleFactor
      context.stroke()

      if (brazilFeature) {
        context.beginPath()
        path(brazilFeature)
        context.strokeStyle = BRAZIL_COLOR
        context.lineWidth = 1.6 * scaleFactor
        context.stroke()
      }

      drawDots(allDots, '#999999', scaleFactor)
      drawDots(brazilDots, BRAZIL_COLOR, scaleFactor)
    }

    const rotation: [number, number] = [0, 0]
    let autoRotate = true
    const rotationSpeed = 0.5

    const rotationTimer = timer(() => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      }
    })

    focusOnBrazilRef.current = () => {
      if (!brazilCentroid) {
        onFocusComplete?.()
        return
      }

      autoRotate = false
      const [targetLng, targetLat] = brazilCentroid
      const targetYaw = -targetLng
      const targetPitch = -targetLat

      const startYaw = rotation[0]
      const startPitch = rotation[1]
      const deltaYaw = (((targetYaw - startYaw + 180) % 360) + 360) % 360 - 180

      const startTime = performance.now()

      const step = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(1, elapsed / FOCUS_DURATION_MS)
        const eased = easeInOutCubic(t)

        rotation[0] = startYaw + deltaYaw * eased
        rotation[1] = startPitch + (targetPitch - startPitch) * eased
        projection.rotate(rotation)
        render()

        if (t < 1) {
          requestAnimationFrame(step)
        } else {
          onFocusComplete?.()
        }
      }

      requestAnimationFrame(step)
    }

    function handlePointerDown(event: PointerEvent) {
      autoRotate = false
      canvas!.setPointerCapture(event.pointerId)
      const startX = event.clientX
      const startY = event.clientY
      const startRotation: [number, number] = [...rotation]

      function handlePointerMove(moveEvent: PointerEvent) {
        const sensitivity = 0.5
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity))

        projection.rotate(rotation)
        render()
      }

      function handlePointerUp() {
        canvas!.removeEventListener('pointermove', handlePointerMove)
        canvas!.removeEventListener('pointerup', handlePointerUp)
        canvas!.removeEventListener('pointercancel', handlePointerUp)
        window.setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      canvas!.addEventListener('pointermove', handlePointerMove)
      canvas!.addEventListener('pointerup', handlePointerUp)
      canvas!.addEventListener('pointercancel', handlePointerUp)
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      const factor = event.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * factor))
      projection.scale(newScale)
      render()
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    Promise.all([
      fetch('/data/land-110m.json').then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar o mapa-múndi')
        return res.json() as Promise<FeatureCollection<Polygon | MultiPolygon>>
      }),
      fetch('/data/land-dots.json').then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar os pontos do globo')
        return res.json() as Promise<Dot[]>
      }),
      fetch('/data/brazil-boundary.json').then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar o contorno do Brasil')
        return res.json() as Promise<FeatureCollection<Polygon | MultiPolygon>>
      }),
      fetch('/data/brazil-dots.json').then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar os pontos do Brasil')
        return res.json() as Promise<Dot[]>
      }),
    ])
      .then(([land, dots, brazil, brazilDotsData]) => {
        landFeatures = land
        allDots = dots
        brazilFeature = brazil.features[0] ?? null
        brazilDots = brazilDotsData
        brazilCentroid = brazilFeature ? geoCentroid(brazilFeature) : null
        render()
      })
      .catch(() => setError('Não foi possível carregar o globo.'))

    return () => {
      rotationTimer.stop()
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [width, height, onFocusComplete])

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-neutral-900 p-8 ${className}`}>
        <p className="text-sm text-white/40">{error}</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-auto w-full touch-none rounded-2xl bg-canvas"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
})
