// types/index.ts
// Tipos e interfaces compartilhados do projeto (serviços,
// clientes, cases, pontos de mapa, etc).

export type Page = 'menu' | 'venda' | 'locacao' | 'manutencao' | 'mapa' | 'cases' | 'sobre'

export type ServiceId = Extract<Page, 'venda' | 'locacao' | 'manutencao'>

export interface Service {
  id: ServiceId
  title: string
  description: string
}

export interface Case {
  id: string
  title: string
  description: string
  image: string
  /** Potência do projeto, ex.: "350 kVA". */
  power: string
  /** Localização do projeto, ex.: "São Paulo, SP". */
  location: string
}

export interface Client {
  id: string
  name: string
  lat: number
  lng: number
  city?: string
  state?: string
  photo?: string
  description?: string
  /** Id de um item em config/cases.ts, se houver case associado ao cliente. */
  caseId?: string
}
