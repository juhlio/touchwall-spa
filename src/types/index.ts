// types/index.ts
// Tipos e interfaces compartilhados do projeto (serviços,
// clientes, cases, pontos de mapa, etc).

export type Page =
  | 'menu'
  | 'onde-estamos'
  | 'nossa-operacao'
  | 'projetos'
  | 'capacidade-tecnica'
  | 'fale-conosco'

export interface Client {
  id: string
  name: string
  lat: number
  lng: number
  city?: string
  state?: string
  photo?: string
  description?: string
}
