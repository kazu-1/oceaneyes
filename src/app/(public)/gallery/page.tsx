'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ObsGridCard } from '@/components/observation/obs-grid-card'
import type { ObservationWithRelations, Area } from '@/types/database'

export default function GalleryPage() {
  const router = useRouter()
  const [observations, setObservations] = useState<ObservationWithRelations[]>([])
  const [areas, setAreas]               = useState<Area[]>([])
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('areas').select('*').order('name').then(({ data }) => setAreas(data ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase
      .from('observations')
      .select('*, profile:profiles(id,display_name), taxon:taxa(id,name_ja,name_scientific,colors), area:areas(id,name), point:points(id,name)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(40)
    if (selectedArea) q = q.eq('area_id', selectedArea)
    q.then(({ data }) => {
      setObservations((data ?? []) as ObservationWithRelations[])
      setLoading(false)
    })
  }, [selectedArea])

  return (
    <>
      {/* Light header */}
      <header className="page-header">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-icon"
          style={{ marginLeft: -8 }}
          aria-label="戻る"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 style={{ flex: 1, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          みんなの記録
        </h1>
        {!loading && (
          <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {observations.length} 件
          </span>
        )}
      </header>

      {/* Area filter chips */}
      <div className="chips-row" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <button className={`chip ${!selectedArea ? 'active' : ''}`} onClick={() => setSelectedArea(null)}>
          すべて
        </button>
        {areas.map(area => (
          <button key={area.id} className={`chip ${selectedArea === area.id ? 'active' : ''}`} onClick={() => setSelectedArea(area.id)}>
            {area.name}
          </button>
        ))}
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '4px 16px 20px' }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)' }} />
          ))
        ) : observations.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <p style={{ fontSize: 13 }}>記録がまだありません</p>
          </div>
        ) : (
          observations.map(obs => <ObsGridCard key={obs.id} obs={obs} />)
        )}
      </div>
    </>
  )
}
