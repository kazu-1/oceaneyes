'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlusIcon, EditIcon, XIcon } from '@/components/ui/icons'
import type { TaxonWithGroup, Group } from '@/types/database'

type Props = { taxa: TaxonWithGroup[]; groups: Group[] }

type FormData = {
  name_ja: string
  name_scientific: string
  group_id: string
  description: string
  colors: string
}

const EMPTY_FORM: FormData = {
  name_ja: '',
  name_scientific: '',
  group_id: '',
  description: '',
  colors: '',
}

export function SpeciesMasterClient({ taxa, groups }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TaxonWithGroup | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? taxa.filter(t => t.name_ja.includes(search) || (t.name_scientific ?? '').toLowerCase().includes(search.toLowerCase()))
    : taxa

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (t: TaxonWithGroup) => {
    setEditing(t)
    setForm({
      name_ja: t.name_ja,
      name_scientific: t.name_scientific ?? '',
      group_id: t.group_id ?? '',
      description: t.description ?? '',
      colors: (t.colors as string[] | null)?.join(', ') ?? '',
    })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name_ja.trim()) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      name_ja: form.name_ja.trim(),
      name_scientific: form.name_scientific.trim() || null,
      group_id: form.group_id || null,
      description: form.description.trim() || null,
      colors: form.colors.trim() ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taxaTable = supabase.from('taxa') as any
    if (editing) {
      await taxaTable.update(payload).eq('id', editing.id)
    } else {
      await taxaTable.insert(payload)
    }

    setSaving(false)
    setShowModal(false)
    router.refresh()
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="種名・学名で検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <PlusIcon size={14} />
          追加
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>和名</th>
                <th>学名</th>
                <th>分類</th>
                <th>記録数</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><span style={{ fontWeight: 600 }}>{t.name_ja}</span></td>
                  <td style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {t.name_scientific ?? '—'}
                  </td>
                  <td>
                    {t.group && (
                      <span className="badge badge-muted">{t.group.name}</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t.record_count}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(t)}>
                      <EditIcon size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state" style={{ padding: 32 }}>
              <p style={{ fontSize: 13 }}>該当する種がありません</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{editing ? '種を編集' : '種を追加'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>
                <XIcon size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">和名 *</label>
                <input className="input" value={form.name_ja} onChange={e => setForm(f => ({ ...f, name_ja: e.target.value }))} placeholder="例：カエルアンコウ" />
              </div>
              <div>
                <label className="label">学名</label>
                <input className="input" value={form.name_scientific} onChange={e => setForm(f => ({ ...f, name_scientific: e.target.value }))} placeholder="例：Antennarius striatus" style={{ fontStyle: 'italic' }} />
              </div>
              <div>
                <label className="label">分類</label>
                <select className="input" value={form.group_id} onChange={e => setForm(f => ({ ...f, group_id: e.target.value }))}>
                  <option value="">分類を選択...</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">説明</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="生態・特徴..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="label">代表カラー（カンマ区切り）</label>
                <input className="input" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="例：#ff6b35, #4a90d9" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>キャンセル</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={save} disabled={saving || !form.name_ja.trim()}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
