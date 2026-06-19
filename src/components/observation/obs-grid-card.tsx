import Link from 'next/link'
import { StatusBadge } from '@/components/ui/status-badge'
import type { ObservationWithRelations } from '@/types/database'

type Props = { obs: ObservationWithRelations }

function formatYearMonth(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

const GRADIENTS = [
  { from: '#0e3e5a', to: '#1a7090' },
  { from: '#5a2808', to: '#c05020' },
  { from: '#2a3a5a', to: '#4a6090' },
  { from: '#4a2808', to: '#906030' },
  { from: '#0a2e44', to: '#145a78' },
  { from: '#5a3808', to: '#a07028' },
]
function gradientFor(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return GRADIENTS[code % GRADIENTS.length]
}

export function ObsGridCard({ obs }: Props) {
  const label    = obs.taxon?.name_ja ?? obs.species_name_raw ?? '未同定'
  const areaName = obs.area?.name ?? '—'
  const dateStr  = obs.observed_at ? formatYearMonth(obs.observed_at) : ''
  const credit   = obs.profile?.display_name ?? ''
  const g        = gradientFor(obs.id)

  return (
    <Link href={`/observations/${obs.id}`} className="obs-grid-card">
      {/* Square photo */}
      <div className="obs-grid-card-photo">
        {obs.photo_url ? (
          <img src={obs.photo_url} alt={label} loading="lazy" />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(155deg, ${g.from} 0%, ${g.to} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 75%, rgba(232,113,74,0.14) 0%, transparent 50%)' }} />
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 1,
            }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.4} strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="8" r="3" />
                <path d="M6.2 20.8a8 8 0 0111.6 0" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="obs-grid-card-body">
        <p style={{
          fontSize: 13, fontWeight: 800, color: 'var(--fg)',
          lineHeight: 1.25, marginBottom: 3, letterSpacing: '-0.02em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {label}
        </p>
        <p style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 6, letterSpacing: '0.01em' }}>
          {areaName}{dateStr ? ` · ${dateStr}` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StatusBadge status={obs.status} />
          {credit && (
            <span style={{ fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>@{credit}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
