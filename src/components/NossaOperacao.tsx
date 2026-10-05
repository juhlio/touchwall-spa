// NossaOperacao.tsx
// Página "Nossa Operação": duas fotos reais do COE (Centro de
// Operações) — a entrada com a marca na parede e a sala de operação —
// cada uma em seu próprio card, com destaques gráficos pra operação
// 24/7/365, monitoramento e equipe dedicada.

import { Activity, Radar, Users } from 'lucide-react'

export function NossaOperacao() {
  return (
    <div className="flex h-full w-full max-w-6xl gap-5">
      <div className="relative h-full flex-1 overflow-hidden rounded-[20px] border border-white/[0.07]">
        <img
          src="/assets/images/coe-entrada.webp"
          alt="Entrada do Centro de Operações da Essencial Energia"
          className="h-full w-full object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/35" />

        {/* selo de equipe: reforça presença humana dedicada, não só automação */}
        <div className="absolute top-7 left-7 flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-[rgba(8,7,6,0.68)] py-2 pr-4 pl-3 backdrop-blur-xl">
          <Users size={14} className="text-brand" strokeWidth={2} />
          <span className="text-xs font-medium tracking-wide text-white/70 uppercase">Equipe técnica dedicada</span>
        </div>

        <div className="absolute bottom-7 left-7 flex items-center gap-4 rounded-[20px] border border-white/[0.1] bg-[rgba(8,7,6,0.68)] py-5 pr-7 pl-5 backdrop-blur-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
            <Radar size={24} className="animate-[spin_6s_linear_infinite] text-brand" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">24/7/365</h2>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
            </div>
            <p className="text-sm text-white/50">Operação contínua, todos os dias do ano.</p>
          </div>
        </div>
      </div>

      <div className="relative h-full flex-1 overflow-hidden rounded-[20px] border border-white/[0.07]">
        <img
          src="/assets/images/coe-operacao.webp"
          alt="Centro de Operações da Essencial Energia"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/35" />

        {/* selo "ao vivo": pisca pra reforçar monitoramento em tempo real */}
        <div className="absolute top-7 right-7 flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-[rgba(8,7,6,0.68)] py-2 pr-4 pl-3 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Activity size={14} className="text-white/60" strokeWidth={2} />
          <span className="text-xs font-medium tracking-wide text-white/70 uppercase">Monitoramento em tempo real</span>
        </div>
      </div>
    </div>
  )
}
