'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Group, Area } from '@/types/database'
import type { ObsMarker } from '@/components/map/species-map'

const SpeciesMap = dynamic(
  () => import('@/components/map/species-map').then(m => m.SpeciesMap),
  { ssr: false, loading: () => <div className="skeleton" style={{ width: '100%', height: 480 }} /> }
)

const GROUP_COLORS: Record<string, { from: string; to: string }> = {
  '魚類':       { from: '#0e3e5a', to: '#1a7090' },
  'ウミウシ':   { from: '#5a2810', to: '#c05830' },
  '甲殻類':    { from: '#3a2808', to: '#906020' },
  '頭足類':    { from: '#1a3050', to: '#2a6080' },
  '海藻・海草': { from: '#0a3020', to: '#1a6038' },
  'その他':    { from: '#2a2a3a', to: '#4a4a6a' },
}
const DEFAULT_COLORS = { from: '#0d2d42', to: '#164560' }

type SpeciesEntry = {
  key: string
  displayName: string
  scientificName: string | null
  groupId: string | null
  groupName: string | null
  speciesId: string | null
  count: number
  photoUrl: string | null
}

type RawObs = {
  species_name_raw: string | null
  species_id: string | null
  photo_url: string | null
  map_coords: { lat: number; lng: number } | null
  area_id: string | null
  group_id: string | null
  obs_group: { id: string; name: string } | null
  taxon: {
    id: string
    name_ja: string
    name_scientific: string | null
    group_id: string | null
    group: { id: string; name: string } | null
  } | null
}

export default function SpeciesPage() {
  const [entries, setEntries]             = useState<SpeciesEntry[]>([])
  const [rawObs, setRawObs]               = useState<RawObs[]>([])
  const [groups, setGroups]               = useState<Group[]>([])
  const [areas, setAreas]                 = useState<Area[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedArea, setSelectedArea]   = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [loading, setLoading]             = useState(true)
  const [view, setView]                   = useState<'list' | 'map'>('list')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('groups').select('*').order('sort_order').then(({ data }) => setGroups(data ?? []))
    supabase.from('areas').select('*').order('name').then(({ data }) => setAreas(data ?? []))

    supabase
      .from('observations')
      .select('species_name_raw, species_id, photo_url, map_coords, area_id, group_id, obs_group:groups(id, name), taxon:taxa(id, name_ja, name_scientific, group_id, group:groups(id, name))')
      .eq('is_public', true)
      .then(({ data }) => {
        const obs = (data ?? []) as unknown as RawObs[]
        setRawObs(obs)

        const map = new Map<string, SpeciesEntry>()
        for (const o of obs) {
          const rawName = o.species_name_raw
          if (!rawName) continue
          const key = rawName
          if (!map.has(key)) {
            const taxon = o.taxon
            map.set(key, {
              key,
              displayName:    taxon?.name_ja ?? rawName,
              scientificName: taxon?.name_scientific ?? null,
              groupId:        taxon?.group_id ?? o.group_id ?? null,
              groupName:      taxon?.group?.name ?? o.obs_group?.name ?? null,
              speciesId:      o.species_id ?? null,
              count:          0,
              photoUrl:       o.photo_url ?? null,
            })
          }
          const entry = map.get(key)!
          entry.count++
          if (!entry.photoUrl && o.photo_url) entry.photoUrl = o.photo_url
        }
        setEntries(Array.from(map.values()).sort((a, b) => b.count - a.count))
        setLoading(false)
      })
  }, [])

  // Keys of species that appear in the selected area
  const areaSpeciesKeys = useMemo(() => {
    if (!selectedArea) return null
    const keys = new Set<string>()
    rawObs.filter(o => o.area_id === selectedArea && o.species_name_raw).forEach(o => keys.add(o.species_name_raw!))
    return keys
  }, [rawObs, selectedArea])

  const filtered = useMemo(() => {
    let result = entries
    if (areaSpeciesKeys) result = result.filter(e => areaSpeciesKeys.has(e.key))
    if (selectedGroup)   result = result.filter(e => e.groupId === selectedGroup)
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(e =>
        e.displayName.toLowerCase().includes(s) ||
        (e.scientificName ?? '').toLowerCase().includes(s)
      )
    }
    return result
  }, [entries, areaSpeciesKeys, selectedGroup, search])

  // Build map markers filtered by current search / group
  const mapMarkers = useMemo<ObsMarker[]>(() => {
    const filteredKeys = new Set(filtered.map(e => e.key))
    return rawObs
      .filter(o => o.map_coords && o.species_name_raw && filteredKeys.has(o.species_name_raw))
      .map(o => ({
        lat:         o.map_coords!.lat,
        lng:         o.map_coords!.lng,
        speciesName: o.taxon?.name_ja ?? o.species_name_raw!,
        photoUrl:    o.photo_url ?? null,
        groupName:   o.taxon?.group?.name ?? o.obs_group?.name ?? null,
      }))
  }, [rawObs, filtered])

  return (
    <>
      {/* ── FIELD GUIDE header ── */}
      <div className="field-guide-header">
        <p className="field-guide-label">FIELD GUIDE</p>
        <h1 className="field-guide-title">西伊豆 海中生物図鑑</h1>
        <p className="field-guide-sub">
          みんなの投稿から作られる海の図鑑。{entries.length > 0 ? `${entries.length} 種を記録中。` : ''}
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
          <button
            className={`tab-item ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3.5" cy="6" r="1.5" fill="currentColor" /><circle cx="3.5" cy="12" r="1.5" fill="currentColor" /><circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
            </svg>
            リスト
          </button>
          <button
            className={`tab-item ${view === 'map' ? 'active' : ''}`}
            onClick={() => setView('map')}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            マップ
          </button>
        </div>
      </div>

      {/* ── Area filter chips ── */}
      {areas.length > 0 && (
        <div className="chips-row" style={{ background: 'var(--bg-card)', paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', flexShrink: 0, alignSelf: 'center' }}>AREA</span>
          <button className={`chip ${!selectedArea ? 'active' : ''}`} onClick={() => setSelectedArea(null)}>すべて</button>
          {areas.map(a => (
            <button key={a.id} className={`chip ${selectedArea === a.id ? 'active' : ''}`} onClick={() => setSelectedArea(a.id)}>
              {a.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Group filter chips ── */}
      <div className="chips-row" style={{ background: 'var(--bg-card)', paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', flexShrink: 0, alignSelf: 'center' }}>種類</span>
        <button className={`chip ${!selectedGroup ? 'active' : ''}`} onClick={() => setSelectedGroup(null)}>すべて</button>
        {groups.map(g => (
          <button key={g.id} className={`chip ${selectedGroup === g.id ? 'active' : ''}`} onClick={() => setSelectedGroup(g.id)}>
            {g.name}
          </button>
        ))}
      </div>

      {/* ── Map view ── */}
      {view === 'map' && (
        <div>
          {mapMarkers.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 16px' }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <p style={{ fontSize: 13 }}>位置情報付きの記録がまだありません</p>
              <p style={{ fontSize: 12, color: 'var(--fg-4)' }}>投稿時に地図でピンを立てると表示されます</p>
            </div>
          ) : (
            <SpeciesMap key={`${selectedGroup}-${search}`} markers={mapMarkers} height={520} />
          )}
          <p style={{ fontSize: 11, color: 'var(--fg-4)', padding: '10px 16px', textAlign: 'center' }}>
            {mapMarkers.length} 件の位置情報付き記録を表示中
          </p>
        </div>
      )}

      {/* ── List view ── */}
      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 16px 20px' }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--r-lg)' }} />
            ))
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" strokeWidth={1.2} strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p style={{ fontSize: 13 }}>該当する種が見つかりません</p>
            </div>
          ) : (
            filtered.map(entry => {
              const gc = GROUP_COLORS[entry.groupName ?? ''] ?? DEFAULT_COLORS
              const href = entry.speciesId ? `/species/${entry.speciesId}` : `/gallery?q=${encodeURIComponent(entry.key)}`
              return (
                <Link key={entry.key} href={href} className="species-grid-card">
                  <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden' }}>
                    {entry.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.photoUrl} alt={entry.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: `linear-gradient(155deg, ${gc.from} 0%, ${gc.to} 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                      }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 80%, rgba(232,113,74,0.12) 0%, transparent 50%)' }} />
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.4} strokeLinecap="round">
                            <path d="M6.5 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6" />
                            <path d="M2 12l4-4v8L2 12z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '3px 9px', borderRadius: 'var(--r-full)',
                        fontSize: 10, fontWeight: 700,
                        background: 'rgba(0,0,0,0.42)',
                        color: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(8px)',
                      }}>
                        {entry.groupName ?? '−'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px 13px' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg)', lineHeight: 1.25, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
                      {entry.displayName}
                    </p>
                    {entry.scientificName && (
                      <p style={{ fontSize: 10, color: 'var(--fg-4)', fontStyle: 'italic', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                        {entry.scientificName}
                      </p>
                    )}
                    <p style={{ fontSize: 10, color: 'var(--fg-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-500)', fontSize: 12 }}>{entry.count}</span>{' '}件の記録
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </>
  )
}
