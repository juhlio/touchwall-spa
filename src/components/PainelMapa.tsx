// PainelMapa.tsx
// Painel lateral padrão dos pins do mapa (mesmo formato do painel do Mercado Livre).
// Usado para clientes individuais e para a lista de um agrupamento.

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { CLIENTE_COR } from '@/components/MercadoLivreMap'

export interface ItemLista {
  id: string
  nome: string
  detalhe?: string
  onClick: () => void
}

interface PainelMapaProps {
  icone: ReactNode
  cor?: string
  rotulo: string
  subtitulo: string
  titulo: string
  linhas?: { rotulo: string; valor: string }[]
  aviso?: string
  badge?: string
  lista?: ItemLista[]
  inferior?: string
  onFechar: () => void
}

export function PainelMapa({
  icone,
  cor = CLIENTE_COR,
  rotulo,
  subtitulo,
  titulo,
  linhas = [],
  aviso,
  badge,
  lista,
  inferior = 'bottom-44',
  onFechar,
}: PainelMapaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      onClick={(event) => event.stopPropagation()}
      className={`absolute top-24 right-4 ${inferior} z-20 flex w-[min(340px,calc(100%-2rem))] flex-col gap-4 overflow-y-auto rounded-[20px] border border-white/[0.1] bg-[rgba(8,7,6,0.85)] p-6 backdrop-blur-xl sm:top-28 sm:right-8`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${cor}22`, border: `1px solid ${cor}55` }}
          >
            <span style={{ color: cor }}>{icone}</span>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: cor }}>
              {rotulo}
            </div>
            <div className="text-[13px] text-white/50">{subtitulo}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 active:scale-95"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{titulo}</h2>
      </div>

      {linhas.length > 0 && (
        <dl className="flex flex-col gap-3 text-sm">
          {linhas.map((linha) => (
            <div key={linha.rotulo}>
              <dt className="text-[11px] font-medium tracking-wide text-white/40 uppercase">{linha.rotulo}</dt>
              <dd className="mt-0.5 text-white/85">{linha.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {lista && (
        <ul className="flex flex-col divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.07]">
          {lista.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={item.onClick}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-white/5"
              >
                <span className="text-sm text-white/85">{item.nome}</span>
                {item.detalhe && <span className="shrink-0 text-xs text-white/45">{item.detalhe}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {aviso && (
        <p className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-xs leading-relaxed text-white/50">
          {aviso}
        </p>
      )}

      {badge && (
        <span
          className="self-start rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
          style={{ background: `${cor}22`, color: cor }}
        >
          {badge}
        </span>
      )}
    </motion.div>
  )
}
