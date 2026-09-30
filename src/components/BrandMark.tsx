// BrandMark.tsx
// Identidade da marca (logo oficial da Essencial Energia), reutilizada no
// cabeçalho de todas as páginas e no card de destaque do menu principal.

interface BrandMarkProps {
  size?: 'sm' | 'lg'
}

export function BrandMark({ size = 'sm' }: BrandMarkProps) {
  return (
    <img
      src="/assets/images/logo-essencial-energia.png"
      srcSet="/assets/images/logo-essencial-energia.png 1x, /assets/images/logo-essencial-energia@2x.png 2x"
      alt="Essencial Energia"
      className={size === 'lg' ? 'h-20 w-auto' : 'h-16 w-auto'}
    />
  )
}
