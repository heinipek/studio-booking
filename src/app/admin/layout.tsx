import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/tenant'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) redirect('/auth/login?redirectTo=/admin/dashboard')

  const isAdmin = user.base_role === 'super_admin' || user.base_role === 'studio_admin'
  const hasAnyAdminPermission =
    isAdmin ||
    user.extra_permissions.length > 0 ||
    user.base_role === 'instructor'

  if (!hasAnyAdminPermission) redirect('/')

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={user} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
