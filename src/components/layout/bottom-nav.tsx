'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LEFT_ITEMS  = [
  { href: '/',        label: 'ホーム', icon: HomeIcon  },
  { href: '/species', label: '図鑑',   icon: BookIcon  },
]
const RIGHT_ITEMS = [
  { href: '/areas',   label: 'エリア', icon: PinIcon   },
  { href: '/mypage',  label: 'マイページ', icon: UserIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="bottom-nav">
      {LEFT_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
          <Icon active={isActive(href)} />
          <span>{label}</span>
        </Link>
      ))}

      <Link href="/post" className="nav-item-post">
        <div className="nav-item-post-circle">
          <CameraIcon />
        </div>
        <span>投稿</span>
      </Link>

      {RIGHT_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
          <Icon active={isActive(href)} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}

/* ---- Icons ---- */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill={active ? 'currentColor' : 'none'} fillOpacity={0.14} />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill={active ? 'currentColor' : 'none'} fillOpacity={0.14} />
    </svg>
  )
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill={active ? 'currentColor' : 'none'} fillOpacity={0.16} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function PinIcon({ active }: { active: boolean }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill={active ? 'currentColor' : 'none'} fillOpacity={0.14} />
      <circle cx="12" cy="10" r="3" fill={active ? 'currentColor' : 'none'} fillOpacity={0.5} />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
