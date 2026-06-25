import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ObsGridCard } from '@/components/observation/obs-grid-card'
import type { ObservationWithRelations, Taxon, Shop } from '@/types/database'

async function getHomeData() {
  const supabase = await createClient()

  const [{ data: { user } }, obsRes, taxaRes, shopsRes, statsRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('observations')
      .select('*, profile:profiles(id,display_name), taxon:taxa(id,name_ja,name_scientific,colors), area:areas(id,name), point:points(id,name)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('taxa').select('*, group:groups(name)').order('record_count', { ascending: false }).limit(8),
    supabase.from('shops').select('*, area:areas(name)').limit(8),
    supabase.from('observations').select('id, species_id', { count: 'exact', head: false }).eq('is_public', true),
  ])

  const totalPosts   = statsRes.count ?? 0
  const uniqueIds    = new Set((statsRes.data ?? []).map((o: { species_id: string | null }) => o.species_id).filter(Boolean))
  const totalSpecies = uniqueIds.size

  return {
    user,
    observations: (obsRes.data ?? []) as ObservationWithRelations[],
    taxa:         (taxaRes.data ?? []) as (Taxon & { group?: { name: string } | null })[],
    shops:        (shopsRes.data ?? []) as (Shop & { area?: { name: string } | null })[],
    totalPosts,
    totalSpecies,
  }
}

export default async function HomePage() {
  const { user, observations, taxa, shops, totalPosts, totalSpecies } = await getHomeData()

  return (
    <div>
      {/* ── App header ── */}
      <header className="app-header">
        <div className="app-header-logo">
          <AnchorSvg />
          <span className="app-header-title">西伊豆 海中生物アーカイブ</span>
        </div>
        {user ? (
          <Link href="/mypage" className="btn btn-outline-dark btn-sm" style={{ fontSize: 12, padding: '6px 14px', gap: 6 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            マイページ
          </Link>
        ) : (
          <Link href="/auth/login" className="btn btn-outline-dark btn-sm" style={{ fontSize: 12, padding: '6px 14px' }}>
            ログイン
          </Link>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="hero-section">
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nishiizu-hero.jpg"
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 55%',
            zIndex: 0,
          }}
        />
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(170deg, rgba(4,14,28,0.72) 0%, rgba(4,14,26,0.82) 55%, rgba(4,14,26,0.92) 100%)',
        }} />
        {/* Coral accent glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'radial-gradient(ellipse at 10% 90%, rgba(232,113,74,0.18) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 3 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            color: 'var(--ink-300)', letterSpacing: '0.16em', marginBottom: 16,
          }}>
            NISHIIZU MARINE LOG
          </p>

          <h1 style={{
            fontSize: 32, fontWeight: 900, lineHeight: 1.18, color: '#fff',
            marginBottom: 14, letterSpacing: '-0.04em',
          }}>
            西伊豆の海を、<br />
            <span style={{ color: 'var(--ink-300)' }}>みんなで記録する。</span>
          </h1>

          <p style={{ fontSize: 13, color: 'rgba(180,216,232,0.8)', lineHeight: 1.8, marginBottom: 24 }}>
            ダイバーの一枚が、西伊豆の生物多様性データになる。<br />
            ショップと市民が協力して海の図鑑をつくるプロジェクト。
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            <Link href="/post" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              投稿する
            </Link>
            <Link href="/species" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              生物図鑑
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', padding: '13px 14px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {totalPosts.toLocaleString()}
              </p>
              <p style={{ fontSize: 11, color: 'var(--ink-300)', marginTop: 5, letterSpacing: '0.02em' }}>投稿写真</p>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', padding: '13px 14px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {totalSpecies.toLocaleString()}
              </p>
              <p style={{ fontSize: 11, color: 'var(--ink-300)', marginTop: 5, letterSpacing: '0.02em' }}>記録した種</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — horizontal scroll cards ── */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', paddingBottom: 24 }}>
        <div style={{ padding: '28px 20px 0' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--ink-500)', letterSpacing: '0.14em', marginBottom: 4 }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 20 }}>
            3分で海の記録に。
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 20px 16px', scrollbarWidth: 'none' as const }}>
          {/* Card 1 */}
          <div style={{
            flexShrink: 0, width: 200, borderRadius: 'var(--r-xl)',
            background: 'var(--ink-950)',
            overflow: 'hidden', boxShadow: 'var(--sh-md)',
          }}>
            <div style={{ height: 120, position: 'relative', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nishiizu-hero.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,14,28,0.1) 30%, rgba(4,14,28,0.85) 100%)' }} />
              <span style={{ position: 'absolute', bottom: 12, left: 18, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-300)', letterSpacing: '0.1em' }}>01</span>
            </div>
            <div style={{ padding: '14px 18px 20px' }}>
              <div style={{ marginBottom: 10, width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'rgba(77,154,184,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink-300)" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M12 22V12M12 12l-4 4M12 12l4 4" /><path d="M5 8a7 7 0 0114 0" /><circle cx="12" cy="5" r="2" />
                </svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>潜って、撮る</h3>
              <p style={{ fontSize: 12, color: 'rgba(180,216,232,0.7)', lineHeight: 1.65 }}>ダイビングで出会った生き物を撮影。難しい設定は不要。</p>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            flexShrink: 0, width: 200, borderRadius: 'var(--r-xl)',
            background: '#3a1204',
            overflow: 'hidden', boxShadow: 'var(--sh-md)',
          }}>
            <div style={{ height: 120, position: 'relative', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nishiizu-hero.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 75%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(90,34,8,0.1) 30%, rgba(90,34,8,0.85) 100%)' }} />
              <span style={{ position: 'absolute', bottom: 12, left: 18, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'rgba(240,160,100,0.9)', letterSpacing: '0.1em' }}>02</span>
            </div>
            <div style={{ padding: '14px 18px 20px' }}>
              <div style={{ marginBottom: 10, width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'rgba(232,113,74,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(240,160,100,0.9)" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>3分で投稿</h3>
              <p style={{ fontSize: 12, color: 'rgba(240,200,170,0.75)', lineHeight: 1.65 }}>エリアと生き物の名前を選ぶだけ。わからなくてOK。</p>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            flexShrink: 0, width: 200, borderRadius: 'var(--r-xl)',
            background: '#051e14',
            overflow: 'hidden', boxShadow: 'var(--sh-md)',
          }}>
            <div style={{ height: 120, position: 'relative', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nishiizu-hero.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '30% 90%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,30,20,0.1) 30%, rgba(5,30,20,0.85) 100%)' }} />
              <span style={{ position: 'absolute', bottom: 12, left: 18, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'rgba(80,200,140,0.9)', letterSpacing: '0.1em' }}>03</span>
            </div>
            <div style={{ padding: '14px 18px 20px' }}>
              <div style={{ marginBottom: 10, width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'rgba(64,192,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(80,200,140,0.9)" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>海の記録になる</h3>
              <p style={{ fontSize: 12, color: 'rgba(160,220,190,0.7)', lineHeight: 1.65 }}>専門家が同定。西伊豆の図鑑に永続記録されます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 今月の生き物 ── */}
      {taxa.length > 0 && (
        <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', paddingBottom: 20 }}>
          <div className="section-header">
            <div>
              <p className="section-label">THIS MONTH</p>
              <span className="section-title">今月見られている生き物</span>
            </div>
            <Link href="/species" className="section-link">
              図鑑へ <ChevronRight />
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 4px', scrollbarWidth: 'none' as const }}>
            {taxa.map(taxon => {
              const colors = taxon.colors as string[] | null
              const c = colors?.[0] ?? '#2a7a9e'
              return (
                <Link key={taxon.id} href={`/species/${taxon.id}`} style={{ flexShrink: 0, width: 88, textDecoration: 'none' }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: 'var(--r-xl)',
                    background: `linear-gradient(145deg, ${c}dd 0%, ${c}66 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 8, position: 'relative', overflow: 'hidden',
                    boxShadow: `0 4px 14px ${c}44`,
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 28%, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
                      <path d="M6.5 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6" />
                      <path d="M2 12l4-4v8L2 12z" /><circle cx="15" cy="10" r="1" fill="rgba(255,255,255,0.75)" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.3, textAlign: 'center', letterSpacing: '-0.01em' }} className="truncate-2">
                    {taxon.name_ja}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      )}


      {/* ── 最新の投稿 ── */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', paddingBottom: 20 }}>
        <div className="section-header">
          <div>
            <p className="section-label">LATEST</p>
            <span className="section-title">最新の投稿</span>
          </div>
          <Link href="/gallery" className="section-link">
            すべてを見る <ChevronRight />
          </Link>
        </div>

        {observations.length === 0 ? (
          <div className="empty-state">
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" strokeWidth={1.2} strokeLinecap="round">
              <path d="M6.5 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6" />
              <path d="M2 12l4-4v8L2 12z" />
            </svg>
            <p style={{ fontSize: 13 }}>まだ記録がありません</p>
            <Link href="/post" className="btn btn-primary btn-sm">最初の記録を投稿する</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
            {observations.map(obs => <ObsGridCard key={obs.id} obs={obs} />)}
          </div>
        )}
      </section>

      {/* ── 協力ダイビングショップ ── */}
      {shops.length > 0 && (
        <section style={{ background: 'var(--bg-page)', paddingBottom: 20, borderTop: '1px solid var(--border-light)' }}>
          <div className="section-header">
            <div>
              <p className="section-label">DIVE SHOPS</p>
              <span className="section-title">協力ダイビングショップ</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' as const }}>
            {shops.map(shop => (
              <div key={shop.id} style={{
                flexShrink: 0, background: 'var(--bg-card)',
                borderRadius: 'var(--r-xl)', padding: '18px 18px 16px',
                boxShadow: 'var(--sh-sm)', width: 148,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  background: 'var(--ink-800)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900, color: 'var(--ink-200)',
                  marginBottom: 10,
                }}>
                  {shop.name.charAt(0)}
                </div>
                <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 4 }}>
                  {shop.name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--fg-4)' }}>
                  {(shop as { area?: { name: string } | null }).area?.name ?? ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ABOUT THIS PROJECT ── */}
      <section className="about-section">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--ink-400)', letterSpacing: '0.14em', marginBottom: 16 }}>
          ABOUT THIS PROJECT
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.3, marginBottom: 14 }}>
          ダイバーが育てる、<br />西伊豆の海の図鑑。
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(180,216,232,0.75)', lineHeight: 1.9 }}>
          西伊豆 海中生物アーカイブは、ダイバーが日常的に撮影する水中写真を集め、西伊豆の海の生物多様性を継続的に記録・可視化する市民科学プロジェクトです。集まった写真はショップ・環境調査に活用されます。
        </p>
        {!user && (
          <Link href="/auth/signup" className="btn btn-sm" style={{ marginTop: 22, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.18)', fontSize: 12 }}>
            アカウントを作る（無料）
          </Link>
        )}
      </section>
    </div>
  )
}

/* ── Inline SVG helpers ── */

function AnchorSvg() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink-600)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="8" x2="12" y2="22" />
      <path d="M5 16H2a10 10 0 0020 0h-3" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
