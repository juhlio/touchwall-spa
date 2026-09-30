// FaleConosco.tsx
// Página "Fale Conosco": chamada pro próximo passo (o que a Essencial
// entrega na conversa) + dados reais de contato, adaptado do material
// fornecido pela empresa.

import { Award, Globe, Phone } from 'lucide-react'

const NEXT_STEPS = ['Locação', 'Venda', 'Manutenção', 'COE']

// Mesmos dados institucionais já usados no card "Quem é a Essencial
// Energia" da Home — reaproveitados aqui (não são números novos) pra
// preencher o espaço vazio que sobrava na coluna esquerda.
const ABOUT_FACTS = [
  { label: 'Experiência', value: '+20 anos' },
  { label: 'Foco', value: 'Operação crítica' },
  { label: 'Alcance', value: 'Atuação nacional' },
]

const CONTACT_ROWS = [
  {
    icon: Phone,
    label: 'Plantão 24h & Comercial',
    value: '0800 779 9009',
  },
  {
    icon: Globe,
    label: 'Acesse nosso site',
    value: 'essencialgeradores.com.br',
  },
]

export function FaleConosco() {
  return (
    <div className="flex h-full w-full max-w-7xl items-stretch gap-6">
      <div className="flex flex-1 flex-col justify-between rounded-[24px] border border-white/[0.07] bg-[rgba(8,7,6,0.68)] p-10 backdrop-blur-xl">
        <div>
          <span className="text-sm font-semibold tracking-[0.12em] text-brand uppercase">
            Próximo passo
          </span>
          <h2 className="mt-3 mb-6 text-[42px] leading-[1.12] font-bold tracking-tight text-white">
            Vamos falar sobre
            <br />a sua operação.
          </h2>
          <p className="mb-9 text-xl leading-relaxed font-semibold text-brand/90">
            "Onde a energia é crítica, a solução precisa estar pronta antes do problema."
          </p>

          <div className="mb-4 h-px w-14 bg-white/15" />
          <span className="mb-4 block text-sm font-medium tracking-wide text-white/45 uppercase">
            O que entregamos
          </span>
          <div className="flex flex-wrap gap-2.5">
            {NEXT_STEPS.map((step) => (
              <span
                key={step}
                className="text-lg font-semibold text-white/70 after:ml-2.5 after:text-white/20 after:content-['·'] last:after:content-none"
              >
                {step}
              </span>
            ))}
          </div>

          <div className="mt-8 h-px w-14 bg-white/15" />
          <span className="mt-4 mb-3 block text-sm font-medium tracking-wide text-white/45 uppercase">
            Nossa estrutura
          </span>
          <div className="flex flex-wrap gap-3.5">
            {ABOUT_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-5 py-3.5"
              >
                <div className="text-[12.5px] font-medium tracking-wide text-white/40 uppercase">{fact.label}</div>
                <div className="text-lg font-bold text-white/85">{fact.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-full border border-brand/20 bg-brand/[0.07] py-3 pr-6 pl-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15">
            <Award size={20} className="text-brand" strokeWidth={2} />
          </div>
          <span className="text-base font-medium text-white/60">
            Atuação Nacional · Desde 2006 · Distribuidor CAT
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between rounded-[24px] border border-brand/15 bg-[rgba(20,6,2,0.68)] p-10 backdrop-blur-xl">
        <div>
          <h2 className="mb-9 text-[34px] leading-[1.2] font-bold tracking-tight text-white">
            Fale com nossos especialistas
          </h2>
          <div className="flex flex-col gap-5">
            {CONTACT_ROWS.map((row) => (
              <ContactRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
            ))}
          </div>
        </div>

        {/* QR do WhatsApp em destaque — é o principal canal de contato do
            estande, então ganha o maior bloco visual da coluna. */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand/20 bg-white/[0.04] p-7">
          <img
            src="/assets/images/whatsapp-qr-comercial.png"
            alt="QR Code para falar no WhatsApp Comercial"
            className="h-56 w-56 shrink-0 rounded-xl bg-white p-2.5"
          />
          <div className="text-center">
            <div className="text-xl font-bold text-white">WhatsApp Comercial</div>
            <div className="text-sm text-white/40">Aponte a câmera e fale agora</div>
          </div>
        </div>

        <p className="text-right text-3xl font-bold text-white">
          Nós temos a energia <span className="text-brand">que você precisa!</span>
        </p>
      </div>
    </div>
  )
}

interface ContactRowProps {
  icon: typeof Phone
  label: string
  value: string
}

function ContactRow({ icon: Icon, label, value }: ContactRowProps) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white">
        <Icon size={26} className="text-brand" strokeWidth={2} />
      </div>
      <div>
        <div className="text-sm text-white/40">{label}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>
    </div>
  )
}
