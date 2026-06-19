import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { ChevronRightIcon, FishIcon, AnchorIcon } from '@/components/ui/icons'
import type { Area } from '@/types/database'

export default async function AreasPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('areas').select('*').order('name')
  const areas = (data ?? []) as Area[]

  return (
    <>
      <PageHeader title="エリアから探す" showBack />

      <div style={{ padding: '12px 16px 8px' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          西伊豆の主要なダイビングエリア。それぞれの海の特徴と記録を見られます。
        </p>
      </div>

      <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {areas.map(area => (
          <Link key={area.id} href={`/gallery?area=${area.id}`} className="card card-hover" style={{ padding: 16, textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--ocean-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ocean-pale)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{area.name}</h2>
                {area.name_en && (
                  <p style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: 1 }}>
                    {area.name_en.toUpperCase()}
                  </p>
                )}
              </div>
            </div>

            {area.description && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                {area.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--ocean-dark)', fontFamily: 'var(--font-mono)' }}>{area.species_count}</span> 種
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--ocean-dark)', fontFamily: 'var(--font-mono)' }}>{area.post_count}</span> 記録
                </span>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--ocean-dark)', fontWeight: 600 }}>
                記録を見る
                <ChevronRightIcon size={14} />
              </span>
            </div>
          </Link>
        ))}

        {areas.length === 0 && (
          <div className="empty-state">
            <p style={{ fontSize: 13 }}>エリア情報がまだ登録されていません</p>
          </div>
        )}
      </div>
    </>
  )
}
