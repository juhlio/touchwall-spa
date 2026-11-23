// NossaHistoria.tsx
// Timeline "Jornada de Transformação": marcos da Essencial Energia de 2006 a 2026.
// No totem (paisagem), os marcos alternam acima e abaixo de uma linha horizontal.
// Em telas estreitas, viram uma lista vertical com a linha à esquerda.

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

function Cartao({ marco }: { marco: Marco }) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-[rgba(8,7,6,0.72)] p-5 backdrop-blur-xl">
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
    </div>
  )
}

export function NossaHistoria() {
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
        <div
          className="absolute top-1/2 right-0 left-0 h-[3px] -translate-y-1/2 rounded-full"
          style={{ background: COR_LINHA, opacity: 0.85 }}
        />
        {MARCOS.map((marco, i) => {
          // os pontos ficam dentro da área: o cartão (240px) nunca passa da borda
          const x = `calc(120px + (100% - 240px) * ${i / (MARCOS.length - 1)})`
          const acima = i % 2 === 0
          return (
            <div key={marco.ano}>
              <div
                className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-[#070404]"
                style={{ left: x, borderColor: COR_LINHA }}
              />
              <div
                className="absolute w-[2px] -translate-x-1/2"
                style={{
                  left: x,
                  height: 36,
                  background: COR_LINHA,
                  ...(acima ? { bottom: 'calc(50% + 9px)' } : { top: 'calc(50% + 9px)' }),
                }}
              />
              <div
                className="absolute w-[240px] -translate-x-1/2"
                style={{
                  left: x,
                  ...(acima ? { bottom: 'calc(50% + 45px)' } : { top: 'calc(50% + 45px)' }),
                }}
              >
                <Cartao marco={marco} />
              </div>
            </div>
          )
        })}
      </div>

      {/* telas estreitas: lista vertical */}
      <div className="relative flex flex-col gap-4 pl-10 lg:hidden">
        <div className="absolute top-2 bottom-2 left-[9px] w-[3px] rounded-full" style={{ background: COR_LINHA }} />
        {MARCOS.map((marco) => (
          <div key={marco.ano} className="relative">
            <div
              className="absolute top-6 -left-[38px] h-[18px] w-[18px] rounded-full border-[3px] bg-[#070404]"
              style={{ borderColor: COR_LINHA }}
            />
            <Cartao marco={marco} />
          </div>
        ))}
      </div>
    </div>
  )
}
