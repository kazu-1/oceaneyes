import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Photo } from '@/components/ui/photo'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  MapPinIcon, DepthIcon, TempIcon, EyeIcon, FishIcon, UserIcon, ChevronRightIcon, AnchorIcon
} from '@/components/ui/icons'
import type { ObservationWithRelations } from '@/types/database'

const ABUNDANCE_LABEL: Record<string, string> = {
  single: '単独',
  few: '数個体',
  several: '数十個体',
  many: '多数',
  school: '群れ',
}

export default async function ObservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('observations')
    .select(`
      *,
      profile:profiles(id, display_name),
      taxon:taxa(*, group:groups(name)),
      area:areas(id, name),
      point:points(id, name),
      shop:shops(id, name),
      identifications(
        *,
        profile:profiles(id, display_name, role),
        taxon:taxa(id, name_ja)
      )
    `)
    .eq('id', id)
    .single()

  if (!data) notFound()

  const obs = data as ObservationWithRelations & {
    shop?: { id: string; name: string }
    taxon?: ObservationWithRelations['taxon'] & { group?: { name: string } }
  }

  const depth = obs.depth_min != null
    ? obs.depth_max != null
      ? `${obs.depth_min}–${obs.depth_max}m`
      : `${obs.depth_min}m`
    : null

  return (
    <>
      <PageHeader title="記録詳細" showBack />

      {/* Photo */}
      <Photo src={obs.photo_url} alt={obs.taxon?.name_ja ?? ''} className="w-full" aspectRatio="4/3" />

      {/* Species + Status */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
            {obs.taxon?.name_ja ?? obs.species_name_raw ?? '種不明'}
          </h1>
          {obs.taxon?.name_scientific && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
              {obs.taxon.name_scientific}
            </p>
          )}
          {obs.taxon?.['group'] && (
            <p style={{ fontSize: 11, color: 'var(--ocean-base)', fontWeight: 600, marginTop: 4 }}>
              {(obs.taxon as { group?: { name: string } }).group?.name}
            </p>
          )}
        </div>
        <StatusBadge status={obs.status} />
      </div>

      {/* Link to species */}
      {obs.taxon && (
        <Link
          href={`/species/${obs.taxon.id}`}
          style={{ margin: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--ocean-dark)' }}
        >
          <FishIcon size={16} color="var(--ocean-dark)" />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>この種の全記録を見る</span>
          <ChevronRightIcon size={16} />
        </Link>
      )}

      <hr className="divider" style={{ margin: '0 16px' }} />

      {/* Metadata grid */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MetaItem icon={<MapPinIcon size={14} />} label="エリア" value={obs.area?.name} />
        <MetaItem icon={<MapPinIcon size={14} />} label="ポイント" value={obs.point?.name} />
        {depth && <MetaItem icon={<DepthIcon size={14} />} label="水深" value={depth} />}
        {obs.temperature != null && <MetaItem icon={<TempIcon size={14} />} label="水温" value={`${obs.temperature}℃`} />}
        {obs.visibility != null && <MetaItem icon={<EyeIcon size={14} />} label="透明度" value={`${obs.visibility}m`} />}
        {obs.abundance && <MetaItem icon={<FishIcon size={14} />} label="個体数" value={ABUNDANCE_LABEL[obs.abundance] ?? obs.abundance} />}
        <MetaItem icon={<UserIcon size={14} />} label="投稿日" value={obs.observed_at} />
        {obs.shop && <MetaItem icon={<AnchorIcon size={14} />} label="ショップ" value={obs.shop.name} />}
      </div>

      {/* Comment */}
      {obs.comment && (
        <div style={{ padding: '0 16px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>コメント</p>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, background: 'var(--bg-base)', padding: 12, borderRadius: 'var(--radius-md)' }}>
            {obs.comment}
          </p>
        </div>
      )}

      <hr className="divider" style={{ margin: '0 16px' }} />

      {/* Identification history */}
      {obs.identifications && obs.identifications.length > 0 && (
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>同定履歴</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {obs.identifications.map((ident: { id: string; taxon?: { name_ja: string } | null; profile?: { display_name: string | null; role: string } | null; comment?: string | null; created_at: string }) => (
              <div key={ident.id} style={{ padding: 12, background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--ocean-base)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{ident.taxon?.name_ja ?? '同定なし'}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                    {new Date(ident.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {ident.profile?.display_name} ({ident.profile?.role})
                </div>
                {ident.comment && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{ident.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </>
  )
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <div className="meta-row" style={{ marginBottom: 2 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', paddingLeft: 20 }}>{value}</p>
    </div>
  )
}

