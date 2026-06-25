import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ObservationWithRelations } from '@/types/database'
import { LogoutButton } from './logout-button'

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
      .order('observed_at', { ascending: false })
      .limit(60),
    supabase.from('groups').select('id,name').order('sort_order'),
  ])

  type ProfileRow = {
    id: string; display_name: string | null; avatar_url: string | null;
    role: string; post_count: number; species_count: number
  }
  const profile      = profileRes.data as ProfileRow | null
  const observations = (obsRes.data ?? []) as ObservationWithRelations[]
  const groups       = (groupsRes.data ?? []) as { id: string; name: string }[]

  const confirmed = observations.filter(o => ['shop_confirmed', 'expert_confirmed', 'research_grade'].includes(o.status))

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'ゲスト'

  type TaxonRow = { group_id?: string | null } & Record<string, unknown>
  const groupCounts: Record<string, number> = {}
  confirmed.forEach(o => {
    const gid = (o.taxon as TaxonRow | null)?.group_id
    if (gid) groupCounts[gid] = (groupCounts[gid] ?? 0) + 1
  })

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + 20px)' }}>
      {/* ── Dark profile header ── */}
      <div style={{
        background: 'linear-gradient(155deg, var(--ink-800) 0%, var(--ink-950) 100%)',
        padding: '28px 20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
          {/* Avatar */}
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'rgba(77,154,184,0.2)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(180,218,236,0.85)" strokeWidth={1.5} strokeLinecap="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 19, fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              {displayName}
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div className="stat-glass">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {observations.length}
            </p>
            <p style={{ fontSize: 10, color: 'var(--ink-300)', marginTop: 5 }}>投稿数</p>
          </div>
          <div className="stat-glass">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {confirmed.length}
            </p>
            <p style={{ fontSize: 10, color: 'var(--ink-300)', marginTop: 5 }}>確認済み</p>
          </div>
          <div className="stat-glass">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {Object.keys(groupCounts).length}
            </p>
            <p style={{ fontSize: 10, color: 'var(--ink-300)', marginTop: 5 }}>生物グループ</p>
          </div>
        </div>
      </div>

      {/* ── Post CTA ── */}
      <div style={{ padding: '14px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <Link href="/post" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '13px' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          写真を投稿する
        </Link>
      </div>

      {/* ── 投稿写真一覧 (photo gallery) ── */}
      <section>
        <div className="section-header" style={{ paddingBottom: 10 }}>
          <div>
            <p className="section-label">MY PHOTOS</p>
            <span className="section-title">投稿写真</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)' }}>{observations.length} 枚</span>
        </div>

        {observations.length === 0 ? (
          <div className="empty-state">
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>まだ写真がありません</p>
            <Link href="/post" className="btn btn-primary btn-sm">最初の1枚を投稿する</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {observations.map(obs => {
              const g = gradientFor(obs.id)
              const isConfirmed = ['shop_confirmed', 'expert_confirmed', 'research_grade'].includes(obs.status)
              return (
                <Link
                  key={obs.id}
                  href={`/observations/${obs.id}`}
                  style={{ display: 'block', position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: `linear-gradient(145deg, ${g.from} 0%, ${g.to} 100%)` }}
                >
                  {obs.photo_url ? (
                    <img
                      src={obs.photo_url}
                      alt={obs.taxon?.name_ja ?? obs.species_name_raw ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  ) : (
                    /* No photo: show fish icon on gradient */
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.4} strokeLinecap="round">
                        <path d="M6.5 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6" />
                        <path d="M2 12l4-4v8L2 12z" />
                      </svg>
                    </div>
                  )}

                  {/* Species name overlay (bottom) */}
                  {(obs.taxon?.name_ja || obs.species_name_raw) && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(5,15,28,0.72))',
                      padding: '12px 6px 5px',
                    }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                        {obs.taxon?.name_ja ?? obs.species_name_raw}
                      </p>
                    </div>
                  )}

                  {/* Status indicator dot */}
                  {isConfirmed && (
                    <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: 'var(--status-expert)', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.9)' }} />
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── MY GUIDE ── */}
      {Object.keys(groupCounts).length > 0 && (
        <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', marginTop: 16 }}>
          <div className="section-header" style={{ paddingBottom: 10 }}>
            <div>
              <p className="section-label">MY GUIDE</p>
              <span className="section-title">確認できた生物</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 16px 20px' }}>
            {Object.entries(groupCounts).slice(0, 6).map(([gid, count]) => {
              const groupObj = groups.find(g => g.id === gid)
              return (
                <div key={gid} className="stat-box-light">
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 900, color: 'var(--ink-600)', lineHeight: 1, letterSpacing: '-0.02em' }}>{count}</p>
                  <p style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 5 }}>{groupObj?.name ?? '—'}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
