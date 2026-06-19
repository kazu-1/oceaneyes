'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Step1Photo } from './steps/step1-photo'
import { Step2Basic } from './steps/step2-basic'
import { Step3Point } from './steps/step3-point'
import { Step4Details } from './steps/step4-details'
import { Step5Permissions } from './steps/step5-permissions'
import { Step6Confirm } from './steps/step6-confirm'
import { CheckIcon } from '@/components/ui/icons'

export type PostFormData = {
  photoFile: File | null
  photoPreview: string | null
  observedAt: string
  areaId: string
  shopId: string
  speciesNameRaw: string
  speciesId: string | null
  pointId: string | null
  mapCoords: { x: number; y: number } | null
  depthMin: string
  depthMax: string
  temperature: string
  visibility: string
  abundance: string
  substrate: string
  habitat: string
  comment: string
  permWebPublic: boolean
  permPrUse: boolean
  permResearchUse: boolean
  creditType: 'handle' | 'real_name' | 'anonymous'
}

const INITIAL_FORM: PostFormData = {
  photoFile: null,
  photoPreview: null,
  observedAt: new Date().toISOString().slice(0, 10),
  areaId: '',
  shopId: '',
  speciesNameRaw: '',
  speciesId: null,
  pointId: null,
  mapCoords: null,
  depthMin: '',
  depthMax: '',
  temperature: '',
  visibility: '',
  abundance: '',
  substrate: '',
  habitat: '',
  comment: '',
  permWebPublic: true,
  permPrUse: false,
  permResearchUse: false,
  creditType: 'handle',
}

const STEP_LABELS = ['写真', '基本情報', 'ポイント', '詳細', '権利', '確認']

export function PostWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PostFormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const update = useCallback((partial: Partial<PostFormData>) => {
    setForm(prev => ({ ...prev, ...partial }))
  }, [])

  const next = () => setStep(s => Math.min(s + 1, 6))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const submit = async () => {
    if (!form.photoFile) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login?next=/post'); return }

      // Upload photo
      const ext = form.photoFile.name.split('.').pop()
      const path = `observations/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, form.photoFile, { upsert: false })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)

      // Insert observation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from('observations') as any).insert({
        user_id: user.id,
        photo_url: publicUrl,
        photo_path: path,
        observed_at: form.observedAt,
        area_id: form.areaId || null,
        shop_id: form.shopId || null,
        species_name_raw: form.speciesNameRaw || null,
        species_id: form.speciesId || null,
        point_id: form.pointId || null,
        map_coords: form.mapCoords,
        depth_min: form.depthMin ? parseInt(form.depthMin) : null,
        depth_max: form.depthMax ? parseInt(form.depthMax) : null,
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        visibility: form.visibility ? parseInt(form.visibility) : null,
        abundance: form.abundance || null,
        substrate: form.substrate || null,
        habitat: form.habitat || null,
        comment: form.comment || null,
        permissions: {
          web_public: form.permWebPublic,
          pr_use: form.permPrUse,
          research_use: form.permResearchUse,
          credit_type: form.creditType,
        },
        status: form.speciesId ? 'poster_identified' : 'unconfirmed',
        is_public: form.permWebPublic,
      })
      if (insertError) throw insertError

      setDone(true)
    } catch (e) {
      console.error(e)
      alert('投稿に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24, gap: 16, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-confirm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon size={28} color="var(--status-confirm)" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>投稿完了！</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          記録を受け付けました。<br />ショップや専門家による同定をお待ちください。
        </p>
        <button className="btn btn-ocean" onClick={() => router.push('/')}>
          ホームに戻る
        </button>
        <button className="btn btn-ghost" onClick={() => { setForm(INITIAL_FORM); setStep(1); setDone(false) }}>
          続けて投稿する
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 0', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {step > 1 ? (
            <button onClick={back} className="btn btn-ghost btn-icon" style={{ marginLeft: -8 }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          ) : (
            <div style={{ width: 32 }} />
          )}
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flex: 1, textAlign: 'center' }}>
            写真を投稿する
          </span>
          <button onClick={() => router.back()} className="btn btn-ghost btn-icon" style={{ marginRight: -8, color: 'var(--text-muted)' }} aria-label="閉じる">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Segmented progress bar */}
        <div className="step-segments" style={{ marginTop: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`step-segment ${i < step ? 'done' : ''}`} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 1 && <Step1Photo form={form} update={update} onNext={next} />}
        {step === 2 && <Step2Basic form={form} update={update} onNext={next} />}
        {step === 3 && <Step3Point form={form} update={update} onNext={next} />}
        {step === 4 && <Step4Details form={form} update={update} onNext={next} />}
        {step === 5 && <Step5Permissions form={form} update={update} onNext={next} />}
        {step === 6 && <Step6Confirm form={form} onSubmit={submit} submitting={submitting} onBack={back} />}
      </div>
    </div>
  )
}
