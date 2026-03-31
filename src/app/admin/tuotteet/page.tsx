import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import { ProductList } from '@/components/admin/ProductList'

export default async function TuotteetPage() {
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_PRODUCTS)) redirect('/admin/dashboard')

  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('type')
    .order('price_cents')

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tuotteet & hinnat</h1>
      <ProductList tenantId={tenant.id} products={products ?? []} />
    </div>
  )
}
