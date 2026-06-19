'use client'

import type { PostFormData } from '../post-wizard'

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

const ABUNDANCE_OPTIONS = [
  { value: 'single', label: '単独' },
  { value: 'few', label: '数個体' },
  { value: 'several', label: '数十個体' },
  { value: 'many', label: '多数' },
  { value: 'school', label: '群れ' },
]

export function Step4Details({ form, update, onNext }: Props) {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>観察詳細</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>水中環境の情報を入力してください（すべて任意）</p>
      </div>

      {/* Depth */}
      <div>
        <label className="label">水深（m）</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            className="input"
            placeholder="最浅"
            value={form.depthMin}
            onChange={e => update({ depthMin: e.target.value })}
            min={0} max={100}
            style={{ flex: 1 }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>〜</span>
          <input
            type="number"
            className="input"
            placeholder="最深"
            value={form.depthMax}
            onChange={e => update({ depthMax: e.target.value })}
            min={0} max={100}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Temperature */}
      <div>
        <label className="label">水温（℃）</label>
        <input
          type="number"
          className="input"
          placeholder="例：22.5"
          value={form.temperature}
          onChange={e => update({ temperature: e.target.value })}
          step={0.5} min={0} max={35}
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="label">透明度（m）</label>
        <input
          type="number"
          className="input"
          placeholder="例：15"
          value={form.visibility}
          onChange={e => update({ visibility: e.target.value })}
          min={0} max={50}
        />
      </div>

      {/* Abundance */}
      <div>
        <label className="label">個体数</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ABUNDANCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`chip ${form.abundance === opt.value ? 'active' : ''}`}
              onClick={() => update({ abundance: form.abundance === opt.value ? '' : opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Substrate */}
      <div>
        <label className="label">底質（任意）</label>
        <input
          className="input"
          placeholder="例：砂地、岩礁、砂泥"
          value={form.substrate}
          onChange={e => update({ substrate: e.target.value })}
        />
      </div>

      {/* Habitat */}
      <div>
        <label className="label">生息環境（任意）</label>
        <input
          className="input"
          placeholder="例：珊瑚礁の隙間、海藻の下"
          value={form.habitat}
          onChange={e => update({ habitat: e.target.value })}
        />
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

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={onNext}>
        次へ進む
      </button>
    </div>
  )
}
