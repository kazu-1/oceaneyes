'use client'

import type { PostFormData } from '../post-wizard'

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

const ABUNDANCE_OPTIONS = [
  { value: '1',   label: '１' },
  { value: '少数', label: '少数' },
  { value: '多数', label: '多数' },
  { value: '大群', label: '大群' },
]

export function Step4Details({ form, update, onNext }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Step label */}
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 4 }}>
            STEP 4 / 5
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--fg)', letterSpacing: '-0.03em' }}>
            観察詳細
          </h2>
          <p style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 4 }}>
            水中環境の情報を入力してください（すべて任意）
          </p>
        </div>

        {/* Depth — single value */}
        <div>
          <label className="label">水深（m）</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number"
              className="input"
              placeholder="例：18"
              value={form.depth}
              onChange={e => update({ depth: e.target.value })}
              min={0}
              max={100}
              style={{ maxWidth: 140 }}
            />
            <span style={{ fontSize: 14, color: 'var(--fg-3)' }}>m</span>
          </div>
        </div>

        {/* Temperature */}
        <div>
          <label className="label">水温（℃）</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number"
              className="input"
              placeholder="例：22.5"
              value={form.temperature}
              onChange={e => update({ temperature: e.target.value })}
              step={0.5}
              min={0}
              max={35}
              style={{ maxWidth: 140 }}
            />
            <span style={{ fontSize: 14, color: 'var(--fg-3)' }}>℃</span>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="label">透明度（m）</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number"
              className="input"
              placeholder="例：15"
              value={form.visibility}
              onChange={e => update({ visibility: e.target.value })}
              min={0}
              max={50}
              style={{ maxWidth: 140 }}
            />
            <span style={{ fontSize: 14, color: 'var(--fg-3)' }}>m</span>
          </div>
        </div>

        {/* Abundance — 4 options */}
        <div>
          <label className="label">個体数</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {ABUNDANCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`chip ${form.abundance === opt.value ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => update({ abundance: form.abundance === opt.value ? '' : opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="label">コメント（任意）</label>
          <textarea
            className="input"
            placeholder="行動の観察、特記事項など..."
            value={form.comment}
            onChange={e => update({ comment: e.target.value })}
            rows={3}
            style={{ resize: 'vertical' }}
          />
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
