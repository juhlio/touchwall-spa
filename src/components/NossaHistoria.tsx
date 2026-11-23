// NossaHistoria.tsx
// Timeline "Jornada de Transformação": marcos da Essencial Energia de 2006 a 2026.
// No totem (paisagem), os marcos alternam acima e abaixo de uma linha horizontal.
// Em telas estreitas, viram uma lista vertical com a linha à esquerda.
// Animação de entrada: a linha se desenha, os pontos surgem e os cartões aparecem
// em sequência. Ao tocar em um marco, ele ganha destaque e os demais escurecem.

import { motion } from 'framer-motion'
import { useState } from 'react'

const COR = '#ffe600'
const COR_LINHA = '#e05a1c'

interface Marco {
  ano: string
  titulo: string
  texto: string
  faturamento: string
}

const MARCOS: Marco[] = [
  { ano: '2006', titulo: 'Fundação', texto: 'Início das atividades com foco em excelência.', faturamento: 'Fat. 3M' },
  { ano: '2008', titulo: 'Manutenção', texto: 'Especializada em manutenção de ativos.', faturamento: 'Fat. 9M' },
  { ano: '2011', titulo: 'Consolidação', texto: 'Expansão nacional nas regiões Sudeste e Nordeste.', faturamento: 'Fat. 16M' },
  { ano: '2014', titulo: 'Locação', texto: 'Empresa focada na locação de ativos.', faturamento: 'Fat. 32M' },
  {
    ano: '2017',
    titulo: 'Nova sede',
    texto: 'Sede com 2.500 m² na Av. Atlântica, em Santo André.',
    faturamento: 'Fat. 42M',
  },
  {
    ano: '2020',
    titulo: 'Concessionária',
    texto: 'Continuidade energética e alta complexidade.',
    faturamento: 'Fat. 62M',
  },
  {
    ano: '2025',
    titulo: 'Nova sede em São Bernardo',
    texto: '7.000 m² para suportar o crescimento.',
    faturamento: 'Fat. 127M',
  },
  { ano: '2026', titulo: 'Certificações', texto: 'Rumo às ISO 9001 e 14001.', faturamento: '' },
]

// tempos da sequência de entrada (segundos)
const T_LINHA = 0.2
const T_PONTO = (i: number) => 0.5 + i * 0.12
const T_CARTAO = (i: number) => 0.8 + i * 0.12

interface CartaoProps {
  marco: Marco
  selecionado: boolean
  esmaecido: boolean
  onClick: () => void
}

function Cartao({ marco, selecionado, esmaecido, onClick }: CartaoProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selecionado}
      animate={{ scale: selecionado ? 1.05 : 1, opacity: esmaecido ? 0.4 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="relative block w-full overflow-hidden rounded-[18px] border p-5 text-left backdrop-blur-xl transition-[border-color,box-shadow,background] duration-300"
      style={{
        borderColor: selecionado ? COR_LINHA : 'rgba(255,255,255,0.08)',
        background: selecionado ? 'rgba(40,14,6,0.9)' : 'rgba(8,7,6,0.72)',
        boxShadow: selecionado ? `0 0 0 1px ${COR_LINHA}, 0 0 28px ${COR_LINHA}66` : 'none',
      }}
    >
      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-transparent via-brand to-transparent" />
      <div className="text-3xl font-bold tracking-tight text-white">{marco.ano}</div>
      <div className="mt-1 text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: COR_LINHA }}>
        {marco.titulo}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/65">{marco.texto}</p>
      {marco.faturamento && (
        <span
          className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
          style={{ background: `${COR}22`, color: COR }}
        >
          {marco.faturamento}
        </span>
      )}
    </motion.button>
  )
}

// anel que pulsa em volta do ponto selecionado
function AnelPulso() {
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-full border-2"
      style={{ borderColor: COR_LINHA }}
      initial={{ scale: 1, opacity: 0.9 }}
      animate={{ scale: 2.6, opacity: 0 }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

export function NossaHistoria() {
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const alternar = (i: number) => setSelecionado((atual) => (atual === i ? null : i))

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <span className="text-xs font-semibold tracking-[0.14em] uppercase" style={{ color: COR_LINHA }}>
          Trajetória de sucesso
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Jornada de Transformação</h2>
      </div>

      {/* paisagem: linha horizontal com marcos alternados */}
      <div className="relative hidden h-[520px] w-full lg:block">
        <motion.div
          className="absolute top-1/2 right-0 left-0 h-[3px] -translate-y-1/2 origin-left rounded-full"
          style={{ background: COR_LINHA, opacity: 0.85 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: T_LINHA, ease: 'easeInOut' }}
        />
        {MARCOS.map((marco, i) => {
          // os pontos ficam dentro da área: o cartão (240px) nunca passa da borda
          const x = `calc(120px + (100% - 240px) * ${i / (MARCOS.length - 1)})`
          const acima = i % 2 === 0
          const ativo = selecionado === i
          const esmaecido = selecionado !== null && !ativo
          return (
            <div key={marco.ano}>
              <motion.div
                className="absolute w-[2px] -translate-x-1/2"
                style={{
                  left: x,
                  height: 36,
                  background: COR_LINHA,
                  transformOrigin: acima ? 'bottom' : 'top',
                  ...(acima ? { bottom: 'calc(50% + 9px)' } : { top: 'calc(50% + 9px)' }),
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1, opacity: esmaecido ? 0.3 : 1 }}
                transition={{ duration: 0.4, delay: T_CARTAO(i) - 0.2 }}
              />
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, width: 18, height: 18 }}
                initial={{ scale: 0 }}
                animate={{ scale: ativo ? 1.5 : 1, opacity: esmaecido ? 0.4 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: T_PONTO(i) }}
              >
                <div
                  className="h-full w-full rounded-full border-[3px] transition-colors duration-300"
                  style={{ borderColor: COR_LINHA, background: ativo ? COR_LINHA : '#070404' }}
                />
                {ativo && <AnelPulso />}
              </motion.div>
              <motion.div
                className="absolute w-[240px] -translate-x-1/2"
                style={{
                  left: x,
                  ...(acima ? { bottom: 'calc(50% + 45px)' } : { top: 'calc(50% + 45px)' }),
                  zIndex: ativo ? 10 : 1,
                }}
                initial={{ opacity: 0, y: acima ? 16 : -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: T_CARTAO(i), ease: 'easeOut' }}
              >
                <Cartao marco={marco} selecionado={ativo} esmaecido={esmaecido} onClick={() => alternar(i)} />
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* telas estreitas: lista vertical */}
      <div className="relative flex flex-col gap-4 pl-10 lg:hidden">
        <motion.div
          className="absolute top-2 bottom-2 left-[9px] w-[3px] origin-top rounded-full"
          style={{ background: COR_LINHA }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: T_LINHA, ease: 'easeInOut' }}
        />
        {MARCOS.map((marco, i) => {
          const ativo = selecionado === i
          const esmaecido = selecionado !== null && !ativo
          return (
            <motion.div
              key={marco.ano}
              className="relative"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: T_CARTAO(i), ease: 'easeOut' }}
            >
              <motion.div
                className="absolute top-6 -left-[38px] h-[18px] w-[18px]"
                initial={{ scale: 0 }}
                animate={{ scale: ativo ? 1.5 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: T_PONTO(i) }}
              >
                <div
                  className="h-full w-full rounded-full border-[3px] transition-colors duration-300"
                  style={{ borderColor: COR_LINHA, background: ativo ? COR_LINHA : '#070404' }}
                />
                {ativo && <AnelPulso />}
              </motion.div>
              <Cartao marco={marco} selecionado={ativo} esmaecido={esmaecido} onClick={() => alternar(i)} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
