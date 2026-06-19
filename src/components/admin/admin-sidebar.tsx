'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardIcon, FishIcon, HomeIcon, AnchorIcon, BookIcon } from '@/components/ui/icons'

type Props = { role: string }

const NAV = [
  { href: '/admin/queue',   label: '同定キュー', Icon: ClipboardIcon },
  { href: '/admin/posts',   label: '投稿一覧',   Icon: FishIcon },
  { href: '/admin/species', label: '種マスタ',   Icon: BookIcon },
]

export function AdminSidebar({ role: _role }: Props) {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AnchorIcon size={18} color="var(--ocean-pale)" />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>OceanEyes</span>
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>管理コンソール</p>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`admin-nav-item ${active ? 'active' : ''}`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" className="admin-nav-item">
          <HomeIcon size={16} />
          サイトへ戻る
        </Link>
      </div>
    </aside>
  )
}
