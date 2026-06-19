'use client'

import type { PostFormData } from '../post-wizard'

type Props = {
  form: PostFormData
  onSubmit: () => void
  submitting: boolean
  onBack: () => void
}

export function Step6Confirm({ form, onSubmit, submitting, onBack }: Props) {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>投稿内容の確認</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>以下の内容で投稿します</p>
      </div>

      {/* Photo preview */}
      {form.photoPreview && (
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <img src={form.photoPreview} alt="投稿写真" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Summary */}
      <div style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ConfirmRow label="撮影日" value={form.observedAt} />
        <ConfirmRow label="種名" value={form.speciesNameRaw || '（不明）'} />
        {form.depth && <ConfirmRow label="水深" value={`${form.depth}m`} />}
        {form.temperature && <ConfirmRow label="水温" value={`${form.temperature}℃`} />}
        {form.visibility && <ConfirmRow label="透明度" value={`${form.visibility}m`} />}
        {form.comment && <ConfirmRow label="コメント" value={form.comment} />}
        <ConfirmRow label="Web公開" value={form.permWebPublic ? 'する' : 'しない'} />
        <ConfirmRow label="クレジット" value={{ handle: 'ハンドルネーム', real_name: '実名', anonymous: '匿名' }[form.creditType]} />
      </div>

      {/* Notice */}
      <div style={{ padding: 12, background: 'var(--status-new-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--status-new)', fontSize: 12, color: 'var(--status-new)', lineHeight: 1.6 }}>
        投稿後、ショップまたは専門家による種の同定が行われます。
        同定結果はマイページで確認できます。
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onBack} disabled={submitting}>
          修正する
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? '投稿中...' : '投稿する'}
        </button>
      </div>
    </div>
  )
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
