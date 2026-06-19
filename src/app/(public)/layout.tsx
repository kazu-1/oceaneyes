import { BottomNav } from '@/components/layout/bottom-nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <main className="page-content">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
