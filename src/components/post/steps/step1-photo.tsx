'use client'

import { useCallback } from 'react'
import type { PostFormData } from '../post-wizard'

type Props = { form: PostFormData; update: (p: Partial<PostFormData>) => void; onNext: () => void }

export function Step1Photo({ form, update, onNext }: Props) {
  const handleFile = useCallback((file: File) => {
    update({ photoFile: file, photoPreview: URL.createObjectURL(file) })
  }, [update])

  const onDrop  = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f) }
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Step label */}
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.1em', marginBottom: 4 }}>
            STEP 1 / 5
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            写真を選ぶ
          </h2>
        </div>

        {/* Drop zone */}
        <label
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            display: 'block',
            border: `2px dashed ${form.photoPreview ? 'var(--status-confirm)' : 'var(--border-base)'}`,
            borderRadius: 'var(--radius-lg)',
            background: form.photoPreview ? undefined : '#f5f8fa',
            overflow: 'hidden',
            cursor: 'pointer',
            minHeight: 220,
            transition: 'border-color 0.15s',
          }}
        >
          <input type="file" accept="image/*" onChange={onInput} style={{ display: 'none' }} />

          {form.photoPreview ? (
            <img
              src={form.photoPreview}
              alt="preview"
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              {/* Plus circle */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--bg-white)',
                border: '1.5px solid var(--border-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(12,64,90,0.08)',
              }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--ocean-dark)" strokeWidth={1.8} strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>写真をアップロード</p>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>複数枚まとめて選べます</p>
              </div>
            </div>
          )}
        </label>

        {form.photoPreview && (
          <label className="btn btn-outline-dark btn-sm" style={{ justifyContent: 'center', cursor: 'pointer' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            写真を変更
            <input type="file" accept="image/*" onChange={onInput} style={{ display: 'none' }} />
          </label>
        )}

        {/* Info note */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: 'var(--status-new-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--status-new)" strokeWidth={1.8} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            生き物がはっきり写った写真を選んでください。
          </p>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div style={{ padding: '12px 16px 20px', background: 'var(--bg-white)', borderTop: '1px solid var(--border-light)' }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: 15, padding: '14px', opacity: form.photoFile ? 1 : 0.45 }}
          disabled={!form.photoFile}
          onClick={onNext}
        >
          次へ →
        </button>
      </div>
    </div>
  )
}
