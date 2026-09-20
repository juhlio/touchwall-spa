// AtmosphereBackground.tsx
// Fundo decorativo compartilhado: blobs de gradiente radial desfocados +
// marca d'água gigante do texto da página, replicando a identidade visual
// dos mockups (Essencial Energia).

interface AtmosphereBackgroundProps {
  watermark?: string
}

export function AtmosphereBackground({ watermark }: AtmosphereBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      <div className="absolute -top-40 -left-20 h-[520px] w-[640px] rounded-full bg-[radial-gradient(ellipse,rgba(224,90,28,0.3)_0%,transparent_65%)] blur-[70px]" />
      <div className="absolute -top-24 -right-16 h-[400px] w-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(160,45,8,0.2)_0%,transparent_60%)] blur-[80px]" />
      <div className="absolute right-24 -bottom-32 h-[400px] w-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(74,130,180,0.1)_0%,transparent_65%)] blur-[80px]" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(192,100,20,0.1)_0%,transparent_65%)] blur-[60px]" />

      {watermark ? (
        <div className="absolute -right-8 -bottom-16 text-[260px] leading-none font-bold tracking-tighter whitespace-nowrap text-white/[0.02]">
          {watermark}
        </div>
      ) : null}
    </div>
  )
}
