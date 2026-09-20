// services.ts
// Lista de serviços exibidos em ServiceLayout/ServiceCard.

import type { Service } from '@/types'

export const services: Service[] = [
  {
    id: 'venda',
    title: 'Venda',
    description: 'Conheça nossas soluções de venda para o seu negócio.',
  },
  {
    id: 'locacao',
    title: 'Locação',
    description: 'Opções de locação flexíveis, sob medida para cada projeto.',
  },
  {
    id: 'manutencao',
    title: 'Manutenção',
    description: 'Suporte técnico e manutenção especializada quando você precisar.',
  },
]
