import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: string } | null

  if (!profile || !['admin', 'expert', 'shop'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <AdminSidebar role={profile.role} />
      <main className="admin-main" style={{ flex: 1, marginLeft: 220, padding: 24 }}>
        {children}
      </main>
    </div>
  )
}
