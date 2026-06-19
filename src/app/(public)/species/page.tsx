'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TaxonWithGroup, Group } from '@/types/database'

const GROUP_COLORS: Record<string, { from: string; to: string }> = {
  '魚類':       { from: '#0e3e5a', to: '#1a7090' },
  'ウミウシ':   { from: '#5a2810', to: '#c05830' },
  '甲殻類':    { from: '#3a2808', to: '#906020' },
  '頭足類':    { from: '#1a3050', to: '#2a6080' },
  '海藻・海草': { from: '#0a3020', to: '#1a6038' },
  'その他':    { from: '#2a2a3a', to: '#4a4a6a' },
}
const DEFAULT_COLORS = { from: '#0d2d42', to: '#164560' }

export default function SpeciesPage() {
  const [taxa, setTaxa]                   = useState<TaxonWithGroup[]>([])
  const [groups, setGroups]               = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [loading, setLoading]             = useState(true)
  const [totalCount, setTotalCount]       = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('groups').select('*').order('sort_order').then(({ data }) => setGroups(data ?? []))
    supabase.from('taxa').select('id', { count: 'exact', head: true }).then(({ count }) => setTotalCount(count ?? 0))
  }, [])

  useEffect(() => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('taxa').select('*, group:groups(*)').order('record_count', { ascending: false })
    if (selectedGroup) q = q.eq('group_id', selectedGroup)
    q.then(({ data }) => {
      let results = (data ?? []) as TaxonWithGroup[]
      if (search.trim()) {
        const s = search.toLowerCase()
        results = results.filter(t =>
          t.name_ja.toLowerCase().includes(s) ||
          (t.name_scientific ?? '').toLowerCase().includes(s)
        )
      }
      setTaxa(results)
      setLoading(false)
    })
  }, [selectedGroup, search])

  return (
    <>
      {/* ── FIELD GUIDE header ── */}
      <div className="field-guide-header">
        <p className="field-guide-label">FIELD GUIDE</p>
        <h1 className="field-guide-title">西伊豆 海中生物図鑑</h1>
        <p className="field-guide-sub">
          みんなの投稿から作られる海の図鑑。{totalCount > 0 ? `${totalCount} 種を記録中。` : ''}
        </p>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg
            width={15} height={15} viewBox="0 0 24 24" fill="none"
            stroke="var(--fg-4)" strokeWidth={2.2} strokeLinecap="round"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input-search"
            placeholder="生物名・学名で探す"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tab toggle */}
        <div className="tab-row">
          <button className="tab-item active">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3.5" cy="6" r="1.5" fill="currentColor" /><circle cx="3.5" cy="12" r="1.5" fill="currentColor" /><circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
            </svg>
            リスト
          </button>
          <button className="tab-item">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            マップ
          </button>
        </div>
      </div>

      {/* ── Group filter chips ── */}
      <div className="chips-row" style={{ background: 'var(--bg-card)', paddingTop: 10, paddingBottom: 10, borderBottom: '1px solid var(--border-light)' }}>
        <button className={`chip ${!selectedGroup ? 'active' : ''}`} onClick={() => setSelectedGroup(null)}>
          すべて
        </button>
        {groups.map(g => (
          <button key={g.id} className={`chip ${selectedGroup === g.id ? 'active' : ''}`} onClick={() => setSelectedGroup(g.id)}>
            {g.name}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 16px 20px' }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--r-lg)' }} />
          ))
        ) : taxa.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" strokeWidth={1.2} strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p style={{ fontSize: 13 }}>該当する種が見つかりません</p>
          </div>
        ) : (
          taxa.map(taxon => {
            const groupName = taxon.group?.name ?? ''
            const gc = GROUP_COLORS[groupName] ?? DEFAULT_COLORS
            return (
              <Link key={taxon.id} href={`/species/${taxon.id}`} className="species-grid-card">
                {/* Photo area */}
                <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    width: '100%', height: '100%',
                    background: `linear-gradient(155deg, ${gc.from} 0%, ${gc.to} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {/* Light shimmer */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
                    {/* Caustic glow */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 80%, rgba(232,113,74,0.12) 0%, transparent 50%)' }} />
                    {/* Icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(255,255,255,0.16)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', zIndex: 1,
                    }}>
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.4} strokeLinecap="round">
                        <path d="M6.5 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6" />
                        <path d="M2 12l4-4v8L2 12z" />
                      </svg>
                    </div>
                    {/* Category badge */}
                    {groupName && (
                      <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '3px 9px', borderRadius: 'var(--r-full)',
                          fontSize: 10, fontWeight: 700,
                          background: 'rgba(0,0,0,0.42)', color: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(8px)',
                          letterSpacing: '0.01em',
                        }}>
                          {groupName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '10px 12px 13px' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg)', lineHeight: 1.25, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
                    {taxon.name_ja}
                  </p>
                  {taxon.name_scientific && (
                    <p style={{ fontSize: 10, color: 'var(--fg-4)', fontStyle: 'italic', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                      {taxon.name_scientific}
                    </p>
                  )}
                  <p style={{ fontSize: 10, color: 'var(--fg-3)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-500)', fontSize: 12 }}>{taxon.record_count}</span>{' '}件の記録
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </>
  )
}
