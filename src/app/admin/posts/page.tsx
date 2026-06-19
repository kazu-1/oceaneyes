import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Photo } from '@/components/ui/photo'
import { StatusBadge } from '@/components/ui/status-badge'
import type { ObservationWithRelations } from '@/types/database'

export default async function AdminPostsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('observations')
    .select(`
      *,
      profile:profiles(id, display_name),
      taxon:taxa(id, name_ja),
      area:areas(id, name),
      shop:shops(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const observations = (data ?? []) as ObservationWithRelations[]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>投稿一覧</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>全 {observations.length} 件</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>写真</th>
                <th>種名</th>
                <th>エリア</th>
                <th>ショップ</th>
                <th>投稿者</th>
                <th>撮影日</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {observations.map(obs => (
                <tr key={obs.id}>
                  <td>
                    <Link href={`/observations/${obs.id}`} target="_blank">
                      <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden' }}>
                        <Photo src={obs.photo_url} alt="" fill />
                      </div>
                    </Link>
                  </td>
                  <td>
                    <Link href={`/observations/${obs.id}`} target="_blank" style={{ fontWeight: 600, color: 'var(--ocean-dark)', textDecoration: 'none' }}>
                      {obs.taxon?.name_ja ?? obs.species_name_raw ?? '種不明'}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{obs.area?.name ?? '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{(obs as ObservationWithRelations & { shop?: { name: string } }).shop?.name ?? '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{obs.profile?.display_name ?? '—'}</td>
                  <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{obs.observed_at}</td>
                  <td><StatusBadge status={obs.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {observations.length === 0 && (
            <div className="empty-state" style={{ padding: 32 }}>
              <p style={{ fontSize: 13 }}>投稿がありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
