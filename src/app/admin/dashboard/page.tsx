import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, CreditCard, TrendingUp } from 'lucide-react'
import { format, startOfDay, endOfDay, addDays } from 'date-fns'
import { fi } from 'date-fns/locale'

export default async function DashboardPage() {
  const [supabase, tenant, user] = await Promise.all([
    createClient(),
    getTenant(),
    getCurrentUser(),
  ])

  if (!tenant) return null

  const today = new Date()
  const todayStart = startOfDay(today).toISOString()
  const todayEnd = endOfDay(today).toISOString()
  const weekEnd = endOfDay(addDays(today, 7)).toISOString()

  const [
    { count: todaySessions },
    { count: todayBookings },
    { count: totalCustomers },
    { count: activeProducts },
    { data: upcomingSessions },
  ] = await Promise.all([
    supabase
      .from('class_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .gte('starts_at', todayStart)
      .lte('starts_at', todayEnd)
      .eq('status', 'scheduled'),
    supabase
      .from('bookings')
      .select('*, class_sessions!inner(starts_at, tenant_id)', { count: 'exact', head: true })
      .eq('class_sessions.tenant_id', tenant.id)
      .gte('class_sessions.starts_at', todayStart)
      .lte('class_sessions.starts_at', todayEnd)
      .eq('status', 'confirmed'),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('base_role', 'customer'),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('active', true),
    supabase
      .from('class_sessions')
      .select(`
        id, starts_at, ends_at, capacity, status, display_title,
        class_types(name, color),
        instructors(name),
        bookings(count)
      `)
      .eq('tenant_id', tenant.id)
      .gte('starts_at', todayStart)
      .lte('starts_at', weekEnd)
      .in('status', ['scheduled', 'studio_reserved'])
      .order('starts_at')
      .limit(10),
  ])

  const stats = [
    { label: 'Tunteja tänään', value: todaySessions ?? 0, icon: Calendar, color: 'text-blue-600' },
    { label: 'Varauksia tänään', value: todayBookings ?? 0, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Asiakkaita', value: totalCustomers ?? 0, icon: Users, color: 'text-purple-600' },
    { label: 'Aktiiviset tuotteet', value: activeProducts ?? 0, icon: CreditCard, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {format(today, "EEEE d. MMMM yyyy", { locale: fi })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Upcoming sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tulevat tunnit (7 pv)</CardTitle>
        </CardHeader>
        <CardContent>
          {!upcomingSessions || upcomingSessions.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Ei tulevia tunteja</p>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map((session: {
                id: string; starts_at: string; ends_at: string; capacity: number; status: string; display_title: string | null;
                class_types: { name: string; color: string } | null;
                instructors: { name: string } | null;
                bookings: { count: number }[];
              }) => {
                const classType = session.class_types
                const instructor = session.instructors
                const bookingCount = session.bookings?.[0]?.count ?? 0
                const isReserved = session.status === 'studio_reserved'

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: isReserved ? '#94a3b8' : (classType?.color ?? '#6366f1') }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isReserved
                            ? (session.display_title ?? 'Sali varattu')
                            : classType?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(session.starts_at), "EEE d.M. HH:mm", { locale: fi })}
                          {instructor && ` · ${instructor.name}`}
                        </p>
                      </div>
                    </div>
                    {!isReserved && (
                      <span className="text-xs text-gray-500 shrink-0">
                        {bookingCount} / {session.capacity}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
