import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import { InstructorList } from '@/components/admin/InstructorList'

export default async function OhjaajatPage() {
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_INSTRUCTORS)) redirect('/admin/dashboard')

  const supabase = await createClient()
  const { data: instructors } = await supabase
    .from('instructors')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('name')

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ohjaajat</h1>
      <InstructorList tenantId={tenant.id} instructors={instructors ?? []} />
    </div>
  )
}
