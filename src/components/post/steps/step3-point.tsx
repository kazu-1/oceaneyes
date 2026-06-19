'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PostFormData } from '../post-wizard'
import type { Point } from '@/types/database'
import type { LatLng } from '@/components/map/leaflet-map'

/* Leaflet uses window — disable SSR */
const LeafletMap = dynamic(
  () => import('@/components/map/leaflet-map').then(m => m.LeafletMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

export function Step3Point({ form, update, onNext }: Props) {
  const [points, setPoints] = useState<Point[]>([])

  useEffect(() => {
    if (!form.areaId) return
    const supabase = createClient()
    supabase.from('points').select('*').eq('area_id', form.areaId).order('name')
      .then(({ data }) => setPoints(data ?? []))
  }, [form.areaId])

  const handleMapClick = (pos: LatLng) => {
    update({ mapCoords: pos })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Step label */}
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 4 }}>
            STEP 3 / 5
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--fg)', letterSpacing: '-0.03em' }}>
            ポイント・場所
          </h2>
          <p style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 4 }}>
            地図をタップして撮影場所をピンで指定してください
          </p>
        </div>

        {/* Point chips */}
        {points.length > 0 && (
          <div>
            <p className="label">ダイビングポイント</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {points.map(p => (
                <button
                  key={p.id}
                  className={`chip ${form.pointId === p.id ? 'active' : ''}`}
                  onClick={() => update({ pointId: form.pointId === p.id ? null : p.id })}
                >
                  {p.name}
                  {p.type === 'beach' ? ' (ビーチ)' : p.type === 'boat' ? ' (ボート)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real map */}
        <div>
          <p className="label" style={{ marginBottom: 8 }}>
            地図上の位置
            {form.mapCoords && (
              <span style={{ marginLeft: 8, color: 'var(--status-expert)', fontWeight: 700 }}>✓ 設定済み</span>
            )}
          </p>

          <LeafletMap
            markerPos={form.mapCoords}
            onMapClick={handleMapClick}
            height={300}
          />

          {form.mapCoords ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <p style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>
                {form.mapCoords.lat.toFixed(5)}, {form.mapCoords.lng.toFixed(5)}
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => update({ mapCoords: null })}
                style={{ fontSize: 11, padding: '4px 10px', color: 'var(--fg-4)' }}
              >
                ピンを削除
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--fg-4)', marginTop: 8 }}>
              地図をタップするとピンが立ちます（任意）
            </p>
          )}
        </div>
      </div>

      {/* Fixed bottom */}
      <div style={{ padding: '12px 16px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)' }}>
        <button className="btn btn-primary" style={{ width: '100%', fontSize: 15, padding: '14px' }} onClick={onNext}>
          次へ →
        </button>
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="skeleton" style={{ width: '100%', height: 300, borderRadius: 'var(--r-lg)' }} />
  )
}
