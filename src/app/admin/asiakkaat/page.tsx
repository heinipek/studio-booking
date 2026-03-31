import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'

export default async function AsiakkaatPage() {
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_CUSTOMERS)) redirect('/admin/dashboard')

  const supabase = await createClient()
  const { data: customers } = await supabase
    .from('users')
    .select(`
      id, full_name, email, phone, base_role, notification_preference, created_at,
      purchases(id, status, expires_at, credits_total, credits_used, products(name))
    `)
    .eq('tenant_id', tenant.id)
    .neq('base_role', 'super_admin')
    .order('full_name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Asiakkaat</h1>
        <span className="text-sm text-gray-500">{customers?.length ?? 0} henkilöä</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nimi</TableHead>
                <TableHead>Sähköposti</TableHead>
                <TableHead>Puhelin</TableHead>
                <TableHead>Aktiivinen kortti</TableHead>
                <TableHead>Ilmoitukset</TableHead>
                <TableHead>Liittynyt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!customers || customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">Ei asiakkaita vielä</TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  const activePurchase = (customer.purchases as { id: string; status: string; credits_total: number; credits_used: number; expires_at: string; products: { name: string } | null }[] | null)
                    ?.find((p) => p.status === 'active')

                  const roleLabel: Record<string, string> = {
                    studio_admin: 'Admin',
                    instructor: 'Ohjaaja',
                    customer: '',
                  }

                  const notifLabel: Record<string, string> = {
                    email: 'Sähköposti',
                    sms: 'SMS',
                    both: 'Molemmat',
                  }

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.full_name}
                        {roleLabel[customer.base_role] && (
                          <Badge variant="secondary" className="ml-2 text-xs">{roleLabel[customer.base_role]}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{customer.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">{customer.phone ?? '—'}</TableCell>
                      <TableCell>
                        {activePurchase ? (
                          <div className="text-xs">
                            <div className="font-medium text-gray-900">{activePurchase.products?.name}</div>
                            <div className="text-gray-500">
                              {activePurchase.credits_total - activePurchase.credits_used} / {activePurchase.credits_total} jäljellä
                              · voimassa {format(new Date(activePurchase.expires_at), 'd.M.yyyy', { locale: fi })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Ei aktiivia korttia</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">{notifLabel[customer.notification_preference]}</span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {format(new Date(customer.created_at), 'd.M.yyyy', { locale: fi })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
