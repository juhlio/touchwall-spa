// FaleConosco.tsx
// Página "Fale Conosco": desafio (chamada pro visitante propor um
// problema), dados de contato e QR Code. QR Code real ainda pendente —
// placeholder pronto pra receber a imagem final.

import { Lightbulb, Mail, MapPin, Phone, QrCode } from 'lucide-react'

export function FaleConosco() {
  return (
    <div className="flex h-full w-full max-w-4xl items-stretch gap-4">
      <div className="flex flex-1 flex-col justify-between rounded-[20px] border border-brand/15 bg-[rgba(20,6,2,0.68)] p-8 backdrop-blur-xl">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10">
            <Lightbulb size={24} className="text-brand" strokeWidth={1.8} />
          </div>
          <h2 className="mb-2.5 text-2xl font-bold tracking-tight text-white">Desafie a Essencial</h2>
          <p className="text-[13px] leading-relaxed text-white/40">
            Tem um projeto complexo ou uma operação crítica? Conte pra gente o seu desafio — nossa
            equipe técnica retorna com uma solução sob medida.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 rounded-[20px] border border-white/[0.07] bg-[rgba(8,7,6,0.68)] p-8 backdrop-blur-xl">
        <h2 className="mb-1 text-xl font-bold tracking-tight text-white">Contato</h2>
        <ContactRow icon={Phone} label="(49) 0000-0000" />
        <ContactRow icon={Mail} label="contato@essencialgeradores.com.br" />
        <ContactRow icon={MapPin} label="Chapecó, SC" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-[20px] border border-white/[0.07] bg-[rgba(8,7,6,0.68)] p-8 backdrop-blur-xl">
        <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.02]">
          <QrCode size={40} className="text-white/15" />
        </div>
        <span className="text-[11px] font-medium tracking-wide text-white/25 uppercase">QR Code em breve</span>
      </div>
    </div>
  )
}

interface ContactRowProps {
  icon: typeof Phone
  label: string
}

function ContactRow({ icon: Icon, label }: ContactRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <Icon size={16} className="text-accent-blue" strokeWidth={1.8} />
      <span className="text-[13px] text-white/60">{label}</span>
    </div>
  )
}
