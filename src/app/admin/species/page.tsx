import { createClient } from '@/lib/supabase/server'
import { SpeciesMasterClient } from '@/components/admin/species-master-client'
import type { TaxonWithGroup } from '@/types/database'

export default async function AdminSpeciesPage() {
  const supabase = await createClient()
  const [taxaRes, groupsRes] = await Promise.all([
    supabase.from('taxa').select('*, group:groups(id, name)').order('name_ja'),
    supabase.from('groups').select('*').order('sort_order'),
  ])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>種マスタ</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>全 {taxaRes.data?.length ?? 0} 種</p>
      </div>
      <SpeciesMasterClient
        taxa={(taxaRes.data ?? []) as TaxonWithGroup[]}
        groups={groupsRes.data ?? []}
      />
    </div>
  )
}
