// NossaOperacao.tsx
// Página "Nossa Operação": galeria de fotos do COE (Centro de Operações).
// Fotos reais ainda pendentes — grid de placeholders prontos pra receber
// as imagens finais.

import { Building2 } from 'lucide-react'

const PLACEHOLDER_SLOTS = Array.from({ length: 6 }, (_, index) => index)

export function NossaOperacao() {
  return (
    <div className="grid h-full w-full max-w-5xl grid-cols-3 grid-rows-2 gap-4">
      {PLACEHOLDER_SLOTS.map((slot) => (
        <div
          key={slot}
          className="flex flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-white/[0.12] bg-white/[0.03] p-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
            <Building2 size={22} className="text-brand" strokeWidth={1.8} />
          </div>
          <span className="text-[11px] font-medium tracking-wide text-white/25 uppercase">Foto do COE</span>
        </div>
      ))}
    </div>
  )
}
