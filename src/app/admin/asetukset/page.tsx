import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function AsetuksetPage() {
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_SETTINGS)) redirect('/admin/dashboard')

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Asetukset</h1>
      <SettingsForm tenant={tenant} />
    </div>
  )
}
