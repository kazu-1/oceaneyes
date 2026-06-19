import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { ObsCard } from '@/components/observation/obs-card'
import { FishIcon, MapPinIcon } from '@/components/ui/icons'
import type { ObservationWithRelations, Taxon, Group } from '@/types/database'

type TaxonRow = Taxon & { group?: Group | null }

export default async function SpeciesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const taxonResult = await supabase
    .from('taxa')
    .select('*, group:groups(name)')
    .eq('id', id)
    .single()

  const obsResult = await supabase
    .from('observations')
    .select(`
      *,
      profile:profiles(id, display_name),
      taxon:taxa(id, name_ja, name_scientific, colors),
      area:areas(id, name),
      point:points(id, name)
    `)
    .eq('species_id', id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!taxonResult.data) notFound()

  const taxon = taxonResult.data as unknown as TaxonRow
  const observations = (obsResult.data ?? []) as ObservationWithRelations[]
  const colors = taxon.colors as string[] | null
  const primaryColor = colors?.[0] ?? '#3f7e98'

  return (
    <>
      <PageHeader title={taxon.name_ja} showBack />

      {/* Hero */}
      <div style={{
        background: `linear-gradient(160deg, ${primaryColor}22 0%, ${primaryColor}11 100%)`,
        borderBottom: `1px solid ${primaryColor}33`,
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--radius-lg)',
          background: `${primaryColor}22`, border: `2px solid ${primaryColor}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FishIcon size={28} color={primaryColor} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
            {taxon.name_ja}
          </h1>
          {taxon.name_scientific && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              {taxon.name_scientific}
            </p>
          )}
          {taxon.group?.name && (
            <span className="badge badge-new" style={{ fontSize: 11 }}>{taxon.group.name}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
        <StatBox label="記録数" value={taxon.record_count} />
        <StatBox label="確認エリア" value={taxon.confirmed_areas?.length ?? 0} unit="箇所" />
      </div>

      {/* Description */}
      {taxon.description && (
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>生態・特徴</p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {taxon.description}
          </p>
        </div>
      )}

      <hr className="divider" style={{ margin: '0 16px' }} />

      {/* Observations */}
      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          最新の記録
        </p>
        {observations.length === 0 ? (
          <div className="empty-state">
            <MapPinIcon size={28} color="var(--text-faint)" />
            <p style={{ fontSize: 13 }}>まだ記録がありません</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {observations.map(obs => (
              <ObsCard key={obs.id} obs={obs} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function StatBox({ label, value, unit = '件' }: { label: string; value: number; unit?: string }) {
  return (
    <div style={{ flex: 1, padding: '16px', textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>
      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--ocean-dark)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{unit} {label}</p>
    </div>
  )
}
