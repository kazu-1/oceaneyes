import type { ObservationStatus } from '@/types/database'

const STATUS_CONFIG: Record<ObservationStatus, { label: string; cls: string }> = {
  unconfirmed:       { label: '未同定',          cls: 'badge badge-muted'   },
  unidentified:      { label: '未同定',          cls: 'badge badge-muted'   },
  poster_identified: { label: '投稿者同定',      cls: 'badge badge-new'     },
  shop_confirmed:    { label: 'ショップ確認済',  cls: 'badge badge-review'  },
  expert_confirmed:  { label: '専門家確認済',    cls: 'badge badge-confirm' },
  research_grade:    { label: '専門家確認済',    cls: 'badge badge-confirm' },
  review:            { label: '要再確認',        cls: 'badge badge-review'  },
  rejected:          { label: '要再確認',        cls: 'badge badge-reject'  },
}

type Props = { status: ObservationStatus }

export function StatusBadge({ status }: Props) {
  const { label, cls } = STATUS_CONFIG[status] ?? STATUS_CONFIG.unconfirmed
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}
