import { createClient } from '@/lib/supabase/server'
import { getTenant, getCurrentUser } from '@/lib/supabase/tenant'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns'
import { fi } from 'date-fns/locale'
import { SessionActions } from '@/components/admin/SessionActions'

interface Props {
  searchParams: Promise<{ vko?: string }>
}

export default async function TunnitPage({ searchParams }: Props) {
  const params = await searchParams
  const [tenant, user] = await Promise.all([getTenant(), getCurrentUser()])
  if (!tenant || !user) redirect('/auth/login')
  if (!hasPermission(user, Permission.MANAGE_CALENDAR)) redirect('/admin/dashboard')

  // Week offset from query param
  const weekOffset = parseInt(params.vko ?? '0', 10)
  const baseDate = addWeeks(new Date(), weekOffset)
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const supabase = await createClient()
  const { data: sessions } = await supabase
    .from('class_sessions')
    .select(`
      id, starts_at, ends_at, capacity, status, notes, display_title,
      class_types(id, name, color),
      instructors(id, name),
      bookings(count)
    `)
    .eq('tenant_id', tenant.id)
    .gte('starts_at', weekStart.toISOString())
    .lte('starts_at', weekEnd.toISOString())
    .order('starts_at')

  const sessionsByDay = days.map((day) => ({
    day,
    sessions: (sessions ?? []).filter((s) =>
      format(new Date(s.starts_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    ),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tunnit</h1>
        <div className="flex gap-2">
          <Link href="/admin/tunnit/tyypit">
            <Button variant="outline" size="sm">Tuntityypit</Button>
          </Link>
          <Link href="/admin/tunnit/uusi">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Lisää tunti
            </Button>
          </Link>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/tunnit?vko=${weekOffset - 1}`}>
          <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
        </Link>
        <span className="text-sm font-medium text-gray-700 min-w-48 text-center">
          {format(weekStart, "d.M.", { locale: fi })} – {format(weekEnd, "d.M.yyyy", { locale: fi })}
        </span>
        <Link href={`/admin/tunnit?vko=${weekOffset + 1}`}>
          <Button variant="outline" size="sm"><ChevronRight className="w-4 h-4" /></Button>
        </Link>
        {weekOffset !== 0 && (
          <Link href="/admin/tunnit">
            <Button variant="ghost" size="sm">Tänään</Button>
          </Link>
        )}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-3">
        {sessionsByDay.map(({ day, sessions }) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className={`text-center py-1 rounded-lg text-xs font-semibold ${isToday ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>
                <div>{format(day, 'EEE', { locale: fi })}</div>
                <div className="text-base font-bold">{format(day, 'd')}</div>
              </div>
              {sessions.map((session) => {
                const classType = session.class_types as { id: string; name: string; color: string } | null
                const instructor = session.instructors as { id: string; name: string } | null
                const bookingCount = (session.bookings as { count: number }[])?.[0]?.count ?? 0
                const isReserved = session.status === 'studio_reserved'
                const isCancelled = session.status === 'cancelled'

                return (
                  <div
                    key={session.id}
                    className={`rounded-lg p-2 text-xs space-y-1 border ${isCancelled ? 'opacity-50 bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isReserved ? '#94a3b8' : (classType?.color ?? '#6366f1') }}
                      />
                      <span className="font-semibold truncate text-gray-900">
                        {isReserved ? (session.display_title ?? 'Sali varattu') : classType?.name}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {format(new Date(session.starts_at), 'HH:mm')}–{format(new Date(session.ends_at), 'HH:mm')}
                    </div>
                    {instructor && <div className="text-gray-400 truncate">{instructor.name}</div>}
                    {!isReserved && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{bookingCount}/{session.capacity}</span>
                        {isCancelled && <Badge variant="destructive" className="text-xs py-0">Peruttu</Badge>}
                      </div>
                    )}
                    <SessionActions sessionId={session.id} status={session.status} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
