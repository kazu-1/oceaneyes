'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AnchorIcon } from '@/components/ui/icons'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.replace(next)
    router.refresh()
  }

  return (
    <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="label">メールアドレス</label>
        <input
          type="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label">パスワード</label>
        <input
          type="password"
          className="input"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: 'var(--status-reject-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--status-reject)' }}>
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-ocean" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ background: 'linear-gradient(160deg, var(--ocean-deep) 0%, var(--ocean-dark) 100%)', padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(127,180,201,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <AnchorIcon size={24} color="var(--ocean-pale)" />
        </div>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>ログイン</h1>
        <p style={{ color: 'rgba(184,216,232,0.8)', fontSize: 13 }}>OceanEyes へようこそ</p>
      </div>

      <div style={{ flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Suspense fallback={<div className="skeleton" style={{ height: 200 }} />}>
          <LoginForm />
        </Suspense>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          アカウントがない方は{' '}
          <Link href="/auth/signup" style={{ color: 'var(--ocean-dark)', fontWeight: 600 }}>新規登録</Link>
        </div>
      </div>
    </div>
  )
}
