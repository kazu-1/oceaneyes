'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Step1Photo } from './steps/step1-photo'
import { Step2Basic } from './steps/step2-basic'
import { Step3Point } from './steps/step3-point'
import { Step4Details } from './steps/step4-details'
import { Step5Confirm } from './steps/step5-confirm'
import { CheckIcon } from '@/components/ui/icons'

export type PostFormData = {
  photoFile: File | null
  photoPreview: string | null
  title: string
  observedAt: string
  areaId: string
  shopId: string
  shopNameFree: string
  groupId: string
  speciesNameRaw: string
  speciesId: string | null
  pointId: string | null
  mapCoords: { lat: number; lng: number } | null
  depth: string
  temperature: string
  abundance: string
  comment: string
}

const INITIAL_FORM: PostFormData = {
  photoFile: null,
  photoPreview: null,
  title: '',
  observedAt: new Date().toISOString().slice(0, 10),
  areaId: '',
  shopId: '',
  shopNameFree: '',
  groupId: '',
  speciesNameRaw: '',
  speciesId: null,
  pointId: null,
  mapCoords: null,
  depth: '',
  temperature: '',
  abundance: '',
  comment: '',
}

const TOTAL_STEPS = 5

export function PostWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PostFormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const update = useCallback((partial: Partial<PostFormData>) => {
    setForm(prev => ({ ...prev, ...partial }))
  }, [])

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const submit = async () => {
    if (!form.photoFile) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login?next=/post'); return }

      const ext = form.photoFile.name.split('.').pop()
      const path = `observations/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, form.photoFile, { upsert: false })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from('observations') as any).insert({
        user_id: user.id,
        photo_url: publicUrl,
        photo_path: path,
        title: form.title || null,
        observed_at: form.observedAt,
        area_id: form.areaId || null,
        shop_id: form.shopId || null,
        shop_name_free: form.shopNameFree || null,
        group_id: form.groupId || null,
        species_name_raw: form.speciesNameRaw || null,
        species_id: form.speciesId || null,
        point_id: form.pointId || null,
        map_coords: form.mapCoords,
        depth_min: form.depth ? parseInt(form.depth) : null,
        depth_max: form.depth ? parseInt(form.depth) : null,
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        abundance: form.abundance || null,
        comment: form.comment || null,
        permissions: {
          web_public: true,
          pr_use: false,
          research_use: false,
          credit_type: 'handle',
        },
        status: form.speciesId ? 'poster_identified' : 'unconfirmed',
        is_public: true,
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
        <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--fg)', letterSpacing: '-0.03em' }}>投稿完了！</h1>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.75 }}>
          記録を受け付けました。<br />ショップや専門家による同定をお待ちください。
        </p>
        <button className="btn btn-ocean" onClick={() => router.push('/')}>ホームに戻る</button>
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
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          ) : (
            <div style={{ width: 32 }} />
          )}
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg)', flex: 1, textAlign: 'center', letterSpacing: '-0.02em' }}>
            写真を投稿する
          </span>
          <button onClick={() => router.back()} className="btn btn-ghost btn-icon" style={{ marginRight: -8 }} aria-label="閉じる">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="step-segments" style={{ marginBottom: 0 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`step-segment ${i < step ? 'done' : ''}`} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 1 && <Step1Photo   form={form} update={update} onNext={next} />}
        {step === 2 && <Step2Basic   form={form} update={update} onNext={next} />}
        {step === 3 && <Step3Point   form={form} update={update} onNext={next} />}
        {step === 4 && <Step4Details form={form} update={update} onNext={next} />}
        {step === 5 && <Step5Confirm form={form} onSubmit={submit} submitting={submitting} onBack={back} />}
      </div>
    </div>
  )
}
