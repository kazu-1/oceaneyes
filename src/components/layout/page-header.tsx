'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@/components/ui/icons'

type Props = {
  title: string
  showBack?: boolean
  right?: React.ReactNode
}

export function PageHeader({ title, showBack = false, right }: Props) {
  const router = useRouter()

  return (
    <header className="page-header">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-icon"
          style={{ marginLeft: -8 }}
          aria-label="戻る"
        >
          <ArrowLeftIcon size={20} />
        </button>
      )}
      <h1 style={{ flex: 1, fontSize: 16, fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      {right && <div>{right}</div>}
    </header>
  )
}
