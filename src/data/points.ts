export interface MapPoint {
  id: string
  title: string
  description?: string
  position: [number, number]
}

export const points: MapPoint[] = [
  {
    id: 'sp-centro',
    title: 'Centro de São Paulo',
    description: 'Ponto de partida da exibição interativa.',
    position: [-23.5505, -46.6333],
  },
  {
    id: 'sp-paulista',
    title: 'Avenida Paulista',
    description: 'Principal via cultural e financeira.',
    position: [-23.5613, -46.6565],
  },
]
