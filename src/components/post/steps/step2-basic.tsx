'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PostFormData } from '../post-wizard'
import type { Area, Shop, Taxon, Group } from '@/types/database'

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

const GROUP_DISPLAY: Record<string, { emoji: string; color: string; bg: string }> = {
  '魚類':       { emoji: '🐟', color: '#1a7090', bg: 'rgba(26,112,144,0.12)' },
  'ウミウシ':   { emoji: '🐙', color: '#c05830', bg: 'rgba(192,88,48,0.12)'  },
  '甲殻類':    { emoji: '🦀', color: '#906020', bg: 'rgba(144,96,32,0.12)'  },
  '頭足類':    { emoji: '🦑', color: '#2a6080', bg: 'rgba(42,96,128,0.12)'  },
  '海藻・海草': { emoji: '🌿', color: '#1a6038', bg: 'rgba(26,96,56,0.12)'   },
  'その他':    { emoji: '🐚', color: '#4a4a6a', bg: 'rgba(74,74,106,0.10)'  },
}

export function Step2Basic({ form, update, onNext }: Props) {
  const [areas, setAreas]   = useState<Area[]>([])
  const [shops, setShops]   = useState<Shop[]>([])
  const [taxa, setTaxa]     = useState<(Taxon & { group?: { id: string; name: string } | null })[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [taxaSearch, setTaxaSearch]               = useState('')
  const [showTaxaSuggestions, setShowTaxaSuggestions] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('areas').select('*').order('name').then(({ data }) => setAreas(data ?? []))
    supabase.from('groups').select('*').order('sort_order').then(({ data }) => setGroups(data ?? []))
    supabase.from('taxa').select('*, group:groups(id,name)').order('name_ja')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => setTaxa((data ?? []) as any))
  }, [])

  useEffect(() => {
    if (!form.areaId) { setShops([]); return }
    const supabase = createClient()
    supabase.from('shops').select('*').eq('area_id', form.areaId).order('name').then(({ data }) => setShops(data ?? []))
  }, [form.areaId])

  const filteredTaxa = taxaSearch.length >= 1
    ? taxa.filter(t => t.name_ja.includes(taxaSearch) || (t.name_scientific ?? '').toLowerCase().includes(taxaSearch.toLowerCase()))
    : []

  const isValid = form.observedAt && form.areaId && form.groupId

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>基本情報</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>撮影日、エリア、生き物の種類を入力してください</p>
      </div>

      {/* Title */}
      <div>
        <label className="label">写真タイトル（任意）</label>
        <input
          className="input"
          placeholder="例：カエルアンコウ発見！"
          value={form.title}
          onChange={e => update({ title: e.target.value })}
          maxLength={80}
        />
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

      {/* Shop name free text */}
      <div>
        <label className="label">利用したダイビングショップ名（任意）</label>
        <input
          className="input"
          placeholder="例：マリンスポーツ西伊豆"
          value={form.shopNameFree}
          onChange={e => update({ shopNameFree: e.target.value })}
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          リストにないショップの場合はこちらに入力してください
        </p>
      </div>

      {/* Group selector */}
      <div>
        <label className="label">生き物の種類 <span style={{ color: 'var(--accent-sun)' }}>*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {groups.map(g => {
            const d = GROUP_DISPLAY[g.name]
            const isSelected = form.groupId === g.id
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => update({ groupId: g.id })}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? `2px solid ${d?.color ?? '#888'}` : '2px solid var(--border-base)',
                  background: isSelected ? (d?.bg ?? 'rgba(0,0,0,0.06)') : 'var(--bg-white)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 22 }}>{d?.emoji ?? '•'}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? (d?.color ?? '#333') : 'var(--text-secondary)' }}>
                  {g.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

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
                  update({
                    speciesId: t.id,
                    speciesNameRaw: t.name_ja,
                    groupId: t.group_id ?? form.groupId,
                  })
                  setTaxaSearch(t.name_ja)
                  setShowTaxaSuggestions(false)
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name_ja}</span>
                {t.group && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                    {GROUP_DISPLAY[t.group.name]?.emoji} {t.group.name}
                  </span>
                )}
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
