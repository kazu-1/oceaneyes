'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PostFormData } from '../post-wizard'
import type { Point } from '@/types/database'
import { DiveAreaMap } from '@/components/map/dive-area-map'

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

export function Step3Point({ form, update, onNext }: Props) {
  const [points, setPoints] = useState<Point[]>([])

  useEffect(() => {
    if (!form.areaId) return
    const supabase = createClient()
    supabase.from('points').select('*').eq('area_id', form.areaId).order('name').then(({ data }) => setPoints(data ?? []))
  }, [form.areaId])

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>ポイント・場所</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>撮影したポイントと地図上の位置を指定してください</p>
      </div>

      {/* Point select */}
      {points.length > 0 && (
        <div>
          <label className="label">ダイビングポイント</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {points.map(p => (
              <button
                key={p.id}
                className={`chip ${form.pointId === p.id ? 'active' : ''}`}
                onClick={() => update({ pointId: p.id })}
              >
                {p.name}
                {p.type === 'beach' ? ' (ビーチ)' : p.type === 'boat' ? ' (ボート)' : ''}
              </button>
            ))}
            <button
              className={`chip ${!form.pointId ? 'active' : ''}`}
              onClick={() => update({ pointId: null })}
            >
              ポイント不明
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div>
        <label className="label">地図上の位置（任意）</label>
        <DiveAreaMap
          areaId={form.areaId}
          selectedCoords={form.mapCoords}
          onPinPlace={coords => update({ mapCoords: coords })}
        />
        {form.mapCoords && (
          <p style={{ fontSize: 11, color: 'var(--status-confirm)', marginTop: 4 }}>
            ✓ 位置が設定されました (x:{form.mapCoords.x.toFixed(0)}, y:{form.mapCoords.y.toFixed(0)})
          </p>
        )}
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          地図をタップして撮影場所を指定できます（任意）
        </p>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 8 }}
        onClick={onNext}
      >
        次へ進む
      </button>
    </div>
  )
}
