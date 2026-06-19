'use client'

import type { PostFormData } from '../post-wizard'

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

type CreditType = 'handle' | 'real_name' | 'anonymous'

export function Step5Permissions({ form, update, onNext }: Props) {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>写真の利用設定</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>あなたの写真の使用範囲を設定してください</p>
      </div>

      {/* Permissions */}
      {[
        {
          key: 'permWebPublic' as const,
          label: 'Web公開',
          desc: 'サイトのギャラリーに掲載',
          required: false,
        },
        {
          key: 'permPrUse' as const,
          label: 'PR・広報利用',
          desc: '西伊豆観光プロモーション等での使用',
          required: false,
        },
        {
          key: 'permResearchUse' as const,
          label: '研究利用',
          desc: '学術研究・データベースへの提供',
          required: false,
        },
      ].map(({ key, label, desc }) => (
        <label
          key={key}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 14,
            background: form[key] ? 'var(--status-confirm-bg)' : 'var(--bg-base)',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${form[key] ? 'var(--status-confirm)' : 'var(--border-light)'}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <input
            type="checkbox"
            checked={form[key]}
            onChange={e => update({ [key]: e.target.checked })}
            style={{ width: 18, height: 18, marginTop: 1, accentColor: 'var(--status-confirm)' }}
          />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
          </div>
        </label>
      ))}

      {/* Credit type */}
      <div>
        <label className="label">クレジット表記</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([
            { value: 'handle', label: 'ハンドルネーム' },
            { value: 'real_name', label: '実名' },
            { value: 'anonymous', label: '匿名' },
          ] as { value: CreditType; label: string }[]).map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: form.creditType === value ? 'var(--status-new-bg)' : 'var(--bg-base)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                border: `1.5px solid ${form.creditType === value ? 'var(--status-new)' : 'var(--border-light)'}`,
                transition: 'all 0.15s',
              }}
            >
              <input
                type="radio"
                name="creditType"
                value={value}
                checked={form.creditType === value}
                onChange={() => update({ creditType: value })}
                style={{ accentColor: 'var(--status-new)' }}
              />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={onNext}>
        内容を確認する
      </button>
    </div>
  )
}
