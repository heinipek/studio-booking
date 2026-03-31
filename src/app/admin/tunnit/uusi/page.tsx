import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import { SessionForm } from '@/components/admin/SessionForm'

export default async function UusiTuntiPage() {
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_CALENDAR)) redirect('/admin/dashboard')

  const supabase = await createClient()
  const [{ data: classTypes }, { data: instructors }] = await Promise.all([
    supabase.from('class_types').select('id, name, color').eq('tenant_id', tenant.id).eq('active', true).order('name'),
    supabase.from('instructors').select('id, name').eq('tenant_id', tenant.id).eq('active', true).order('name'),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lisää tunti</h1>
      <SessionForm
        tenantId={tenant.id}
        classTypes={classTypes ?? []}
        instructors={instructors ?? []}
      />
    </div>
  )
}
