'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PostFormData } from '../post-wizard'
import type { Area, Shop, Taxon } from '@/types/database'

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

export function Step2Basic({ form, update, onNext }: Props) {
  const [areas, setAreas] = useState<Area[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [taxa, setTaxa] = useState<Taxon[]>([])
  const [taxaSearch, setTaxaSearch] = useState('')
  const [showTaxaSuggestions, setShowTaxaSuggestions] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('areas').select('*').order('name').then(({ data }) => setAreas(data ?? []))
    supabase.from('taxa').select('*').order('name_ja').then(({ data }) => setTaxa(data ?? []))
  }, [])

  useEffect(() => {
    if (!form.areaId) { setShops([]); return }
    const supabase = createClient()
    supabase.from('shops').select('*').eq('area_id', form.areaId).order('name').then(({ data }) => setShops(data ?? []))
  }, [form.areaId])

  const filteredTaxa = taxaSearch.length >= 1
    ? taxa.filter(t => t.name_ja.includes(taxaSearch) || (t.name_scientific ?? '').toLowerCase().includes(taxaSearch.toLowerCase()))
    : []

  const isValid = form.observedAt && form.areaId

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>基本情報</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>撮影日、エリア、種名を入力してください</p>
      </div>

      {/* Date */}
      <div>
        <label className="label">撮影日 <span style={{ color: 'var(--accent-sun)' }}>*</span></label>
        <input
          type="date"
          className="input"
          value={form.observedAt}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => update({ observedAt: e.target.value })}
        />
      </div>

      {/* Area */}
      <div>
        <label className="label">エリア <span style={{ color: 'var(--accent-sun)' }}>*</span></label>
        <select
          className="input"
          value={form.areaId}
          onChange={e => update({ areaId: e.target.value, shopId: '', pointId: null })}
        >
          <option value="">エリアを選択...</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Shop */}
      {shops.length > 0 && (
        <div>
          <label className="label">ショップ（任意）</label>
          <select
            className="input"
            value={form.shopId}
            onChange={e => update({ shopId: e.target.value })}
          >
            <option value="">ショップを選択...</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Species name with autocomplete */}
      <div style={{ position: 'relative' }}>
        <label className="label">種名（任意）</label>
        <input
          className="input"
          placeholder="例：カエルアンコウ"
          value={form.speciesId ? taxa.find(t => t.id === form.speciesId)?.name_ja ?? form.speciesNameRaw : form.speciesNameRaw}
          onChange={e => {
            setTaxaSearch(e.target.value)
            update({ speciesNameRaw: e.target.value, speciesId: null })
            setShowTaxaSuggestions(true)
          }}
          onFocus={() => setShowTaxaSuggestions(true)}
          onBlur={() => setTimeout(() => setShowTaxaSuggestions(false), 150)}
        />
        {showTaxaSuggestions && filteredTaxa.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-white)',
            border: '1px solid var(--border-base)', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)', zIndex: 50, maxHeight: 200, overflowY: 'auto', marginTop: 4,
          }}>
            {filteredTaxa.slice(0, 8).map(t => (
              <button
                key={t.id}
                type="button"
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer' }}
                onClick={() => {
                  update({ speciesId: t.id, speciesNameRaw: t.name_ja })
                  setTaxaSearch(t.name_ja)
                  setShowTaxaSuggestions(false)
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name_ja}</span>
                {t.name_scientific && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontStyle: 'italic' }}>
                    {t.name_scientific}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          種名が分からない場合は空欄でOKです
        </p>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 8 }}
        disabled={!isValid}
        onClick={onNext}
      >
        次へ進む
      </button>
    </div>
  )
}
