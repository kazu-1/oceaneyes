import Link from 'next/link'
import { Photo } from '@/components/ui/photo'
import { StatusBadge } from '@/components/ui/status-badge'
import { MapPinIcon, DepthIcon } from '@/components/ui/icons'
import type { ObservationWithRelations } from '@/types/database'

type Props = { obs: ObservationWithRelations }

export function ObsCard({ obs }: Props) {
  const depth = obs.depth_min != null
    ? obs.depth_max != null
      ? `${obs.depth_min}–${obs.depth_max}m`
      : `${obs.depth_min}m`
    : null

  return (
    <Link href={`/observations/${obs.id}`} className="obs-card card-hover" style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textDecoration: 'none', color: 'inherit' }}>
      <div className="obs-card-thumb">
        <Photo src={obs.photo_url} alt={obs.taxon?.name_ja ?? ''} className="w-full h-full" fill />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            {obs.taxon?.name_ja ?? obs.species_name_raw ?? '種不明'}
          </span>
          <StatusBadge status={obs.status} />
        </div>

        {obs.taxon?.name_scientific && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            {obs.taxon.name_scientific}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {obs.area?.name && (
            <span className="meta-row">
              <MapPinIcon size={12} />
              {obs.area.name}
            </span>
          )}
          {depth && (
            <span className="meta-row">
              <DepthIcon size={12} />
              {depth}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 'auto' }}>
            {obs.observed_at}
          </span>
        </div>
      </div>
    </Link>
  )
}
