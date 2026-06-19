import { createClient } from '@/lib/supabase/server'
import { IdentificationQueue } from '@/components/admin/identification-queue'
import type { ObservationWithRelations } from '@/types/database'

export default async function QueuePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('observations')
    .select(`
      *,
      profile:profiles(id, display_name),
      taxon:taxa(id, name_ja, name_scientific, colors),
      area:areas(id, name),
      point:points(id, name),
      shop:shops(id, name),
      identifications(
        *,
        profile:profiles(id, display_name, role),
        taxon:taxa(id, name_ja)
      )
    `)
    .in('status', ['unconfirmed', 'unidentified', 'poster_identified', 'review'])
    .order('created_at', { ascending: true })
    .limit(50)

  const observations = (data ?? []) as ObservationWithRelations[]

  const counts = {
    unconfirmed: observations.filter(o => o.status === 'unconfirmed').length,
    unidentified: observations.filter(o => o.status === 'unidentified').length,
    poster_identified: observations.filter(o => o.status === 'poster_identified').length,
    review: observations.filter(o => o.status === 'review').length,
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>同定キュー</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>種が未確定の投稿を同定してください</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="未確認" value={counts.unconfirmed} color="var(--text-muted)" />
        <StatCard label="種不明" value={counts.unidentified} color="var(--status-new)" />
        <StatCard label="投稿者同定" value={counts.poster_identified} color="var(--status-review)" />
        <StatCard label="要確認" value={counts.review} color="var(--status-reject)" />
      </div>

      <IdentificationQueue observations={observations} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ padding: '12px 16px' }}>
      <p style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
    </div>
  )
}
