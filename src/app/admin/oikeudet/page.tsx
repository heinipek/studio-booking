import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import { PermissionsManager } from '@/components/admin/PermissionsManager'

export default async function OikeudetPage() {
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_PERMISSIONS)) redirect('/admin/dashboard')

  const supabase = await createClient()
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, full_name, email, base_role')
    .eq('tenant_id', tenant.id)
    .neq('base_role', 'super_admin')
    .order('full_name')

  const { data: allPerms } = await supabase
    .from('user_permissions')
    .select('user_id, permission')
    .eq('tenant_id', tenant.id)

  const usersWithPerms = (allUsers ?? []).map((u) => ({
    ...u,
    user_permissions: (allPerms ?? [])
      .filter((p) => p.user_id === u.id)
      .map((p) => ({ permission: p.permission })),
  }))

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Käyttöoikeudet</h1>
      <p className="text-sm text-gray-500">
        Studio-adminit saavat automaattisesti kaikki oikeudet. Muille käyttäjille voit myöntää yksittäisiä oikeuksia.
      </p>
      <PermissionsManager tenantId={tenant.id} currentUserId={user.id} users={usersWithPerms} />
    </div>
  )
}
