// CapacidadeTecnica.tsx
// Página "Capacidade Técnica": atestados, CAT (Certidão de Acervo
// Técnico) e reconhecimentos. Documentos reais ainda pendentes — cards
// prontos pra receber os PDFs/imagens finais.

import { Award, FileCheck2, ShieldCheck, type LucideIcon } from 'lucide-react'

interface DocGroup {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

const DOC_GROUPS: DocGroup[] = [
  {
    id: 'atestados',
    title: 'Atestados',
    description: 'Atestados de capacidade técnica emitidos por clientes e parceiros.',
    icon: FileCheck2,
  },
  {
    id: 'cat',
    title: 'CAT',
    description: 'Certidões de Acervo Técnico registradas junto ao CREA.',
    icon: ShieldCheck,
  },
  {
    id: 'reconhecimentos',
    title: 'Reconhecimentos',
    description: 'Prêmios e certificações que atestam a qualidade da nossa operação.',
    icon: Award,
  },
]

export function CapacidadeTecnica() {
  return (
    <div className="flex h-full w-full max-w-4xl items-stretch gap-4">
      {DOC_GROUPS.map((group) => {
        const Icon = group.icon
        return (
          <div
            key={group.id}
            className="flex flex-1 flex-col gap-4 rounded-[20px] border border-white/[0.07] bg-[rgba(8,7,6,0.68)] p-7 backdrop-blur-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
              <Icon size={24} className="text-brand" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="mb-2 text-xl font-bold tracking-tight text-white">{group.title}</h2>
              <p className="text-[13px] leading-relaxed text-white/40">{group.description}</p>
            </div>
            <div className="mt-auto flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] py-8">
              <Icon size={20} className="text-white/15" />
              <span className="text-[11px] font-medium tracking-wide text-white/25 uppercase">
                Documento em breve
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
