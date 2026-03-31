'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Instructor } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

interface Props {
  tenantId: string
  instructors: Instructor[]
}

const emptyForm = { name: '', bio: '', specialties: '' }

export function InstructorList({ tenantId, instructors: initial }: Props) {
  const router = useRouter()
  const [instructors, setInstructors] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  function resetForm() {
    setForm(emptyForm)
    setAdding(false)
    setEditingId(null)
  }

  function initials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  async function save() {
    if (!form.name.trim()) return
    const supabase = createClient()
    const specialties = form.specialties.split(',').map((s) => s.trim()).filter(Boolean)

    if (editingId) {
      const { data } = await supabase
        .from('instructors')
        .update({ name: form.name, bio: form.bio || null, specialties })
        .eq('id', editingId)
        .select()
        .single()
      if (data) setInstructors((prev) => prev.map((i) => i.id === editingId ? data : i))
    } else {
      const { data } = await supabase
        .from('instructors')
        .insert({ tenant_id: tenantId, name: form.name, bio: form.bio || null, specialties })
        .select()
        .single()
      if (data) setInstructors((prev) => [...prev, data])
    }
    resetForm()
    router.refresh()
  }

  async function toggleActive(instructor: Instructor) {
    const supabase = createClient()
    await supabase.from('instructors').update({ active: !instructor.active }).eq('id', instructor.id)
    setInstructors((prev) => prev.map((i) => i.id === instructor.id ? { ...i, active: !i.active } : i))
  }

  async function remove(id: string) {
    if (!confirm('Poistetaanko ohjaaja?')) return
    const supabase = createClient()
    await supabase.from('instructors').delete().eq('id', id)
    setInstructors((prev) => prev.filter((i) => i.id !== id))
  }

  function startEdit(instructor: Instructor) {
    setEditingId(instructor.id)
    setAdding(false)
    setForm({ name: instructor.name, bio: instructor.bio ?? '', specialties: instructor.specialties.join(', ') })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 divide-y divide-gray-100">
          {instructors.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Ei ohjaajia vielä</p>
          )}
          {instructors.map((instructor) => (
            <div key={instructor.id}>
              {editingId === instructor.id ? (
                <InlineForm form={form} setForm={setForm} onSave={save} onCancel={resetForm} />
              ) : (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                        {initials(instructor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{instructor.name}</span>
                        {!instructor.active && <Badge variant="secondary" className="text-xs">Piilotettu</Badge>}
                      </div>
                      {instructor.specialties.length > 0 && (
                        <p className="text-xs text-gray-400">{instructor.specialties.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(instructor)}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(instructor)} className="text-gray-400 text-xs">
                      {instructor.active ? 'Piilota' : 'Näytä'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(instructor.id)} className="text-red-500"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {adding && <InlineForm form={form} setForm={setForm} onSave={save} onCancel={resetForm} />}
        </CardContent>
      </Card>

      {!adding && !editingId && (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-1" /> Lisää ohjaaja
        </Button>
      )}
    </div>
  )
}

function InlineForm({ form, setForm, onSave, onCancel }: {
  form: { name: string; bio: string; specialties: string }
  setForm: (f: typeof form) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="py-3 space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Nimi</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Etunimi Sukunimi" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Erikoisalat (pilkulla eroteltu)</Label>
        <Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} placeholder="Tankotanssi, Ilma-akrobatia" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Bio (valinnainen)</Label>
        <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Lyhyt esittely..." className="h-8 text-sm" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}><Check className="w-3 h-3 mr-1" /> Tallenna</Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3 h-3 mr-1" /> Peruuta</Button>
      </div>
    </div>
  )
}
