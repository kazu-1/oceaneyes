import Image from 'next/image'
import { ImageIcon } from './icons'

type PhotoProps = {
  src?: string | null
  alt?: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  aspectRatio?: string
}

export function Photo({ src, alt = '', className = '', fill, sizes, priority, aspectRatio = '4/3' }: PhotoProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: fill ? undefined : aspectRatio }}>
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes ?? '(max-width: 440px) 100vw, 440px'}
          className="object-cover"
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div
      className={`photo-placeholder ${className}`}
      style={{ aspectRatio: fill ? undefined : aspectRatio }}
    >
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(127,180,201,0.6)' }}>
        <ImageIcon size={28} />
      </div>
    </div>
  )
}
