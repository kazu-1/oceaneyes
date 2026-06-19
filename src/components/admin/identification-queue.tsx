'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Photo } from '@/components/ui/photo'
import { StatusBadge } from '@/components/ui/status-badge'
import { SearchIcon, CheckIcon, AlertIcon, MapPinIcon, DepthIcon, TempIcon } from '@/components/ui/icons'
import type { ObservationWithRelations, ObservationStatus, Taxon } from '@/types/database'

type Props = { observations: ObservationWithRelations[] }

export function IdentificationQueue({ observations: initialObs }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<ObservationWithRelations | null>(initialObs[0] ?? null)
  const [taxaSearch, setTaxaSearch] = useState('')
  const [taxaResults, setTaxaResults] = useState<Taxon[]>([])
  const [selectedTaxon, setSelectedTaxon] = useState<Taxon | null>(null)
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState(false)

  const searchTaxa = async (q: string) => {
    setTaxaSearch(q)
    if (q.length < 1) { setTaxaResults([]); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('taxa')
      .select('*')
      .or(`name_ja.ilike.%${q}%,name_scientific.ilike.%${q}%`)
      .limit(10)
    setTaxaResults(data ?? [])
  }

  const act = async (action: 'confirm' | 'hold' | 'reject') => {
    if (!selected) return
    if (action === 'confirm' && !selectedTaxon) { alert('種を選択してください'); return }
    setProcessing(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
    const profile = profileData as { role: string } | null

    const newStatus: ObservationStatus = action === 'confirm'
      ? profile?.role === 'expert' ? 'expert_confirmed' : 'shop_confirmed'
      : action === 'hold' ? 'review' : 'rejected'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('observations') as any).update({
      status: newStatus,
      species_id: action === 'confirm' ? selectedTaxon!.id : selected.species_id,
      updated_at: new Date().toISOString(),
    }).eq('id', selected.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('identifications') as any).insert({
      observation_id: selected.id,
      user_id: user!.id,
      species_id: action === 'confirm' ? selectedTaxon!.id : null,
      role: profile?.role ?? 'user',
      comment: comment || null,
      action,
    })

    setProcessing(false)
    setSelectedTaxon(null)
    setTaxaSearch('')
    setComment('')
    router.refresh()
  }

  const depth = selected?.depth_min != null
    ? selected.depth_max != null ? `${selected.depth_min}–${selected.depth_max}m` : `${selected.depth_min}m`
    : null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, minHeight: '60vh' }}>
      {/* Left: Queue list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{initialObs.length}件 未処理</p>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          {initialObs.map(obs => (
            <button
              key={obs.id}
              onClick={() => { setSelected(obs); setSelectedTaxon(null); setTaxaSearch(''); setComment('') }}
              style={{
                width: '100%', display: 'flex', gap: 10, padding: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: selected?.id === obs.id ? 'var(--bg-base)' : 'transparent',
                borderLeft: selected?.id === obs.id ? '3px solid var(--ocean-dark)' : '3px solid transparent',
                borderBottom: '1px solid var(--border-light)',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                <Photo src={obs.photo_url} alt="" fill />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {obs.taxon?.name_ja ?? obs.species_name_raw ?? '種不明'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StatusBadge status={obs.status} />
                  <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{obs.observed_at}</span>
                </div>
              </div>
            </button>
          ))}
          {initialObs.length === 0 && (
            <div className="empty-state" style={{ padding: 32 }}>
              <CheckIcon size={24} color="var(--status-confirm)" />
              <p style={{ fontSize: 12 }}>キューは空です</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Work panel */}
      {selected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Photo */}
            <div style={{ position: 'relative' }}>
              <Photo src={selected.photo_url} alt="" aspectRatio="16/9" fill />
              <div style={{ position: 'absolute', top: 8, left: 8 }}>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            {/* Metadata */}
            <div style={{ padding: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                {selected.taxon?.name_ja ?? selected.species_name_raw ?? '種不明'}
              </h2>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {selected.area?.name && <MetaItem icon={<MapPinIcon size={12} />} label={selected.area.name} />}
                {depth && <MetaItem icon={<DepthIcon size={12} />} label={depth} />}
                {selected.temperature != null && <MetaItem icon={<TempIcon size={12} />} label={`${selected.temperature}℃`} />}
              </div>
              {selected.comment && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                  {selected.comment}
                </p>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
                投稿者: {selected.profile?.display_name ?? '不明'} | {selected.observed_at}
              </p>
            </div>
          </div>

          {/* Identification panel */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>種の同定</h3>

            {/* Species search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <label className="label">種名で検索</label>
              <div style={{ position: 'relative' }}>
                <SearchIcon size={14} color="var(--text-faint)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties} />
                <input
                  className="input"
                  style={{ paddingLeft: 32 }}
                  placeholder="種名を入力..."
                  value={selectedTaxon?.name_ja ?? taxaSearch}
                  onChange={e => { setSelectedTaxon(null); searchTaxa(e.target.value) }}
                />
              </div>
              {taxaResults.length > 0 && !selectedTaxon && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                  background: 'var(--bg-white)', border: '1px solid var(--border-base)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', maxHeight: 180, overflowY: 'auto', marginTop: 4,
                }}>
                  {taxaResults.map(t => (
                    <button
                      key={t.id}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
                      onClick={() => { setSelectedTaxon(t); setTaxaResults([]); setTaxaSearch(t.name_ja) }}
                    >
                      <strong>{t.name_ja}</strong>
                      {t.name_scientific && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{t.name_scientific}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedTaxon && (
              <div style={{ padding: '8px 12px', background: 'var(--status-confirm-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--status-confirm)', marginBottom: 12 }}>
                ✓ {selectedTaxon.name_ja}
                {selectedTaxon.name_scientific && <span style={{ marginLeft: 8, fontStyle: 'italic', fontSize: 11 }}>{selectedTaxon.name_scientific}</span>}
              </div>
            )}

            {/* Comment */}
            <div style={{ marginBottom: 12 }}>
              <label className="label">コメント（任意）</label>
              <textarea
                className="input"
                rows={2}
                placeholder="同定根拠や備考..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={processing || !selectedTaxon}
                onClick={() => act('confirm')}
              >
                <CheckIcon size={14} />
                {processing ? '処理中...' : '同定確認'}
              </button>
              <button
                className="btn btn-outline"
                disabled={processing}
                onClick={() => act('hold')}
              >
                保留
              </button>
              <button
                className="btn btn-ghost"
                style={{ color: 'var(--status-reject)' }}
                disabled={processing}
                onClick={() => act('reject')}
              >
                <AlertIcon size={14} />
                却下
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p style={{ fontSize: 13 }}>左から記録を選択してください</p>
        </div>
      )}
    </div>
  )
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
      {icon}{label}
    </span>
  )
}
