import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ObsGridCard } from '@/components/observation/obs-grid-card'
import type { ObservationWithRelations } from '@/types/database'
import { LogoutButton } from './logout-button'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/mypage')

  const [profileRes, obsRes, groupsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('observations')
      .select('*, profile:profiles(id,display_name), taxon:taxa(id,name_ja,name_scientific,colors,group_id), area:areas(id,name), point:points(id,name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('groups').select('id,name').order('sort_order'),
  ])

  type ProfileRow = {
    id: string; display_name: string | null; avatar_url: string | null;
    role: string; post_count: number; species_count: number
  }
  const profile      = profileRes.data as ProfileRow | null
  const observations = (obsRes.data ?? []) as ObservationWithRelations[]
  const groups       = (groupsRes.data ?? []) as { id: string; name: string }[]

  const pending   = observations.filter(o => ['unconfirmed', 'unidentified', 'review', 'rejected'].includes(o.status))
  const myRecords = observations

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'ゲスト'

  // Activity areas: unique area names from recent obs
  const areaNames = [...new Set(observations.slice(0, 10).map(o => o.area?.name).filter(Boolean))]
  const activityArea = areaNames.slice(0, 2).join('・')

  // MY GUIDE: count confirmed obs per group
  type TaxonRow = { group_id?: string | null } & Record<string, unknown>
  const groupCounts: Record<string, number> = {}
  observations
    .filter(o => ['shop_confirmed', 'expert_confirmed', 'research_grade'].includes(o.status))
    .forEach(o => {
      const gid = (o.taxon as TaxonRow | null)?.group_id
      if (gid) groupCounts[gid] = (groupCounts[gid] ?? 0) + 1
    })

  return (
    <div>
      {/* ── Dark profile header ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--ocean-deep) 0%, #1a6880 100%)',
        padding: '28px 20px 24px',
        color: '#fff',
      }}>
        {/* Top row: avatar + name + logout */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(122,179,200,0.25)',
            border: '2px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(184,216,232,0.9)" strokeWidth={1.5} strokeLinecap="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {displayName} <span style={{ fontWeight: 400, fontSize: 14 }}>さん</span>
            </p>
            <p style={{ fontSize: 12, color: 'rgba(184,216,232,0.75)', marginTop: 3 }}>
              {activityArea ? `${activityArea}エリアで活動中` : '西伊豆エリアで活動中'}
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Glass stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div className="stat-glass">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {profile?.post_count ?? observations.length}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(184,216,232,0.8)', marginTop: 5 }}>投稿数</p>
          </div>
          <div className="stat-glass">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {profile?.species_count ?? observations.filter(o => ['shop_confirmed','expert_confirmed','research_grade'].includes(o.status)).length}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(184,216,232,0.8)', marginTop: 5 }}>確認種数</p>
          </div>
          <div className="stat-glass">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {observations.filter(o => o.status === 'expert_confirmed' || o.status === 'research_grade').length}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(184,216,232,0.8)', marginTop: 5 }}>アワード候補</p>
          </div>
        </div>
      </div>

      {/* ── Post CTA ── */}
      <div style={{ padding: '16px 16px 8px', background: 'var(--bg-white)', borderBottom: '1px solid var(--border-light)' }}>
        <Link href="/post" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '13px' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          写真を投稿する
        </Link>
      </div>

      {/* ── PENDING 同定待ち ── */}
      {pending.length > 0 && (
        <section style={{ paddingBottom: 8 }}>
          <div className="section-header">
            <div>
              <p className="section-label">PENDING</p>
              <span className="section-title">同定待ち</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{pending.length} 件</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' }}>
            {pending.map(obs => <ObsGridCard key={obs.id} obs={obs} />)}
          </div>
        </section>
      )}

      {/* ── MY RECORDS 自分の投稿 ── */}
      <section style={{ paddingBottom: 8 }}>
        <div className="section-header">
          <div>
            <p className="section-label">MY RECORDS</p>
            <span className="section-title">自分の投稿</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{myRecords.length} 件</span>
        </div>

        {myRecords.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 13 }}>まだ記録がありません</p>
            <Link href="/post" className="btn btn-primary btn-sm">最初の記録を投稿する</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' }}>
            {myRecords.map(obs => <ObsGridCard key={obs.id} obs={obs} />)}
          </div>
        )}
      </section>

      {/* ── MY GUIDE あなたの西伊豆マイ図鑑 ── */}
      <section style={{ padding: '8px 0 20px', background: 'var(--bg-white)', borderTop: '1px solid var(--border-light)' }}>
        <div className="section-header">
          <div>
            <p className="section-label">MY GUIDE</p>
            <span className="section-title">あなたの西伊豆マイ図鑑</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 16px' }}>
          {Object.entries(groupCounts).length === 0 ? (
            <>
              <div className="stat-box-light">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--text-faint)', lineHeight: 1 }}>0</p>
                <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 5 }}>魚類</p>
              </div>
              <div className="stat-box-light">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--text-faint)', lineHeight: 1 }}>0</p>
                <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 5 }}>ウミウシ</p>
              </div>
              <div className="stat-box-light">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--text-faint)', lineHeight: 1 }}>0</p>
                <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 5 }}>甲殻類</p>
              </div>
            </>
          ) : (
            Object.entries(groupCounts).slice(0, 6).map(([gid, count]) => {
              const groupObj = groups.find(g => g.id === gid)
              return (
                <div key={gid} className="stat-box-light">
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--ocean-dark)', lineHeight: 1 }}>{count}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>{groupObj?.name ?? '—'}</p>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
