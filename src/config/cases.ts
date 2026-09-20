// cases.ts
// Lista de cases/projetos exibidos no CaseCarousel.
// Dados de exemplo — substituir pelo conteúdo real e pelas imagens em
// public/assets/cases/.

import type { Case } from '@/types'

export const cases: Case[] = [
  {
    id: 'case-1',
    title: 'Centro de Distribuição — SP',
    description:
      'Implantação de solução completa de energia de backup para centro de distribuição logística, garantindo continuidade operacional 24 horas.',
    image: '/assets/cases/case-1.jpg',
    power: '500 kVA',
    location: 'São Paulo, SP',
  },
  {
    id: 'case-2',
    title: 'Planta Industrial — RJ',
    description:
      'Contrato de manutenção preventiva para planta industrial, com visitas técnicas programadas e monitoramento contínuo dos equipamentos.',
    image: '/assets/cases/case-2.jpg',
    power: '750 kVA',
    location: 'Rio de Janeiro, RJ',
  },
  {
    id: 'case-3',
    title: 'Evento Corporativo — RS',
    description:
      'Locação de equipamentos e equipe técnica dedicada para evento corporativo de grande porte, com instalação e operação completas.',
    image: '/assets/cases/case-3.jpg',
    power: '200 kVA',
    location: 'Porto Alegre, RS',
  },
  {
    id: 'case-4',
    title: 'Polo Industrial — AM',
    description:
      'Fornecimento de energia de backup de alta potência para polo industrial, com projeto sob medida e acompanhamento técnico dedicado.',
    image: '/assets/cases/case-4.jpg',
    power: '900 kVA',
    location: 'Manaus, AM',
  },
  {
    id: 'case-5',
    title: 'Operação Portuária — BA',
    description:
      'Suporte técnico 24h para operação portuária, com equipe de plantão para atendimento emergencial a qualquer hora.',
    image: '/assets/cases/case-5.jpg',
    power: '650 kVA',
    location: 'Salvador, BA',
  },
  {
    id: 'case-6',
    title: 'Centro de Processamento — PA',
    description:
      'Manutenção corretiva emergencial em planta de processamento, com diagnóstico e reparo rápidos para minimizar o tempo de parada.',
    image: '/assets/cases/case-6.jpg',
    power: '350 kVA',
    location: 'Belém, PA',
  },
]
