'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const signup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('パスワードは8文字以上にしてください'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24, gap: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🐠</div>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>登録完了！</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          確認メールを送信しました。<br />
          メール内のリンクをクリックして<br />
          アカウントを有効化してください。
        </p>
        <Link href="/auth/login" className="btn btn-ocean">ログインへ</Link>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ background: 'linear-gradient(160deg, var(--ocean-deep) 0%, var(--ocean-dark) 100%)', padding: '40px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>アカウント作成</h1>
        <p style={{ color: 'rgba(184,216,232,0.8)', fontSize: 13 }}>OceanEyes に参加して海の記録を残そう</p>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <form onSubmit={signup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">ハンドルネーム <span style={{ color: 'var(--accent-sun)' }}>*</span></label>
            <input
              className="input"
              placeholder="例：うみんちゅ"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">メールアドレス <span style={{ color: 'var(--accent-sun)' }}>*</span></label>
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
            <label className="label">パスワード <span style={{ color: 'var(--accent-sun)' }}>*</span></label>
            <input
              type="password"
              className="input"
              placeholder="8文字以上"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--status-reject-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--status-reject)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
            {loading ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          すでにアカウントがある方は{' '}
          <Link href="/auth/login" style={{ color: 'var(--ocean-dark)', fontWeight: 600 }}>ログイン</Link>
        </div>
      </div>
    </div>
  )
}
