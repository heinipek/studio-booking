'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ClassType { id: string; name: string; color: string }
interface Instructor { id: string; name: string }

interface Props {
  tenantId: string
  classTypes: ClassType[]
  instructors: Instructor[]
  defaultValues?: {
    class_type_id?: string
    instructor_id?: string
    starts_at?: string
    ends_at?: string
    capacity?: number
    status?: string
    display_title?: string
    notes?: string
  }
  sessionId?: string
}

export function SessionForm({ tenantId, classTypes, instructors, defaultValues, sessionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState(defaultValues?.status ?? 'scheduled')
  const [classTypeId, setClassTypeId] = useState(defaultValues?.class_type_id ?? '')
  const [instructorId, setInstructorId] = useState(defaultValues?.instructor_id ?? '')
  const [startsAt, setStartsAt] = useState(defaultValues?.starts_at?.slice(0, 16) ?? '')
  const [endsAt, setEndsAt] = useState(defaultValues?.ends_at?.slice(0, 16) ?? '')
  const [capacity, setCapacity] = useState(String(defaultValues?.capacity ?? 10))
  const [displayTitle, setDisplayTitle] = useState(defaultValues?.display_title ?? '')
  const [notes, setNotes] = useState(defaultValues?.notes ?? '')

  const isReserved = status === 'studio_reserved'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!startsAt || !endsAt) {
      setError('Täytä alkamis- ja päättymisaika.')
      setLoading(false)
      return
    }
    if (!isReserved && !classTypeId) {
      setError('Valitse tuntityyppi.')
      setLoading(false)
      return
    }

    // Salinvaraukselle käytetään ensimmäistä tuntityyppiä tai luodaan placeholder API:n kautta
    let resolvedClassTypeId = classTypeId
    if (isReserved) {
      if (classTypes.length === 0) {
        const ctRes = await fetch('/api/admin/class-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Salinvaraus', color: '#94a3b8', min_participants: 1 }),
        })
        if (!ctRes.ok) {
          setError(`Virhe: ${(await ctRes.json()).error}`)
          setLoading(false)
          return
        }
        resolvedClassTypeId = (await ctRes.json()).id
      } else {
        resolvedClassTypeId = classTypes[0]!.id
      }
    }

    const payload = {
      class_type_id: resolvedClassTypeId,
      instructor_id: instructorId || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      capacity: parseInt(capacity, 10),
      status,
      display_title: isReserved ? displayTitle : null,
      notes: notes || null,
    }

    const res = sessionId
      ? await fetch('/api/admin/sessions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: sessionId, ...payload }) })
      : await fetch('/api/admin/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

    if (!res.ok) {
      setError(`Virhe: ${(await res.json()).error}`)
      setLoading(false)
      return
    }

    router.push('/admin/tunnit')
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div className="space-y-2">
            <Label>Tyyppi</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Tunti</SelectItem>
                <SelectItem value="studio_reserved">Salinvaraus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isReserved ? (
            <div className="space-y-2">
              <Label htmlFor="display_title">Käyttötarkoitus</Label>
              <Input
                id="display_title"
                value={displayTitle}
                onChange={(e) => setDisplayTitle(e.target.value)}
                placeholder="esim. Treenit, Valokuvaustilaisuus..."
                required
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Tuntityyppi</Label>
                <Select value={classTypeId} onValueChange={(v) => v && setClassTypeId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse tuntityyppi" />
                  </SelectTrigger>
                  <SelectContent>
                    {classTypes.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ct.color }} />
                          {ct.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ohjaaja</Label>
                <Select value={instructorId} onValueChange={(v) => setInstructorId(v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse ohjaaja (valinnainen)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Ei ohjaajaa —</SelectItem>
                    {instructors.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasiteetti (max. osallistujia)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={100}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Alkaa</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Päättyy</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Muistiinpanot (vain admin)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sisäiset muistiinpanot..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Tallennetaan...' : sessionId ? 'Tallenna muutokset' : 'Lisää tunti'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Peruuta
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
