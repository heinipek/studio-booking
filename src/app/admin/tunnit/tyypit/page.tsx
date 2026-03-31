import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassTypeList } from '@/components/admin/ClassTypeList'

export default async function TuntityypitPage() {
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_CALENDAR)) redirect('/admin/dashboard')

  const supabase = await createClient()
  const { data: classTypes } = await supabase
    .from('class_types')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('name')

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tuntityypit</h1>
      <ClassTypeList tenantId={tenant.id} classTypes={classTypes ?? []} />
    </div>
  )
}
