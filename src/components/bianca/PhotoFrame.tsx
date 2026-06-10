import Image from 'next/image'
import type { BiancaPhoto } from '@/data/bianca/letter'

interface Props {
  photo: BiancaPhoto
  className?: string
  sizes?: string
  priority?: boolean
  caption?: string
  glow?: boolean
  rounded?: string
}

/**
 * A photograph held inside a glass frame with a soft purple/blue halo. The
 * memory inside stays warm and human; only the frame and edges carry the
 * cool, starlit palette. Pure CSS hover — safe to render on the server.
 */
export default function PhotoFrame({
  photo,
  className = '',
  sizes = '(min-width: 768px) 40vw, 90vw',
  priority = false,
  caption,
  glow = true,
  rounded = '1.6rem',
}: Props) {
  return (
    <figure className={`group relative ${className}`}>
      <div
        className={`relative overflow-hidden border border-[#d6d9ff]/20 bg-[#111633]/50 p-2 backdrop-blur-sm transition-transform duration-700 ease-out group-hover:-translate-y-1 ${glow ? 'bianca-glow' : 'shadow-xl shadow-[#05070f]/50'}`}
        style={{ borderRadius: rounded }}
      >
        <div className="relative overflow-hidden" style={{ borderRadius: `calc(${rounded} - 0.5rem)` }}>
          <Image
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            sizes={sizes}
            priority={priority}
            className="h-auto w-full select-none object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.03]"
          />
          {/* cool starlight wash on the edges — keeps faces warm, ties to palette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0b1026]/35 via-transparent to-[#7c3aed]/12" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#a5b4fc]/10 to-transparent" />
        </div>
      </div>
      {caption ? (
        <figcaption className="bianca-serif mt-3 text-center text-base tracking-wide text-[#cbd5e1]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
