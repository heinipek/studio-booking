'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClassType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

interface Props {
  tenantId: string
  classTypes: ClassType[]
}

const COLORS = ['#f96604', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444']

export function ClassTypeList({ tenantId, classTypes: initial }: Props) {
  const router = useRouter()
  const [classTypes, setClassTypes] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', category: '', color: COLORS[0], min_participants: '1' })

  function resetForm() {
    setForm({ name: '', category: '', color: COLORS[0], min_participants: '1' })
    setAdding(false)
    setEditingId(null)
  }

  async function save() {
    if (!form.name.trim()) return
    const body = { name: form.name, category: form.category || null, color: form.color, min_participants: parseInt(form.min_participants) }

    if (editingId) {
      const res = await fetch('/api/admin/class-types', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...body }) })
      if (!res.ok) { alert(`Virhe: ${(await res.json()).error}`); return }
      const data: ClassType = await res.json()
      setClassTypes((prev) => prev.map((ct) => ct.id === editingId ? data : ct))
    } else {
      const res = await fetch('/api/admin/class-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert(`Virhe: ${(await res.json()).error}`); return }
      const data: ClassType = await res.json()
      setClassTypes((prev) => [...prev, data])
    }
    resetForm()
    router.refresh()
  }

  async function toggleActive(ct: ClassType) {
    const res = await fetch('/api/admin/class-types', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ct.id, active: !ct.active }) })
    if (res.ok) setClassTypes((prev) => prev.map((c) => c.id === ct.id ? { ...c, active: !c.active } : c))
  }

  async function remove(id: string) {
    if (!confirm('Poistetaanko tuntityyppi?')) return
    const res = await fetch('/api/admin/class-types', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) setClassTypes((prev) => prev.filter((c) => c.id !== id))
  }

  function startEdit(ct: ClassType) {
    setEditingId(ct.id)
    setAdding(false)
    setForm({ name: ct.name, category: ct.category ?? '', color: ct.color, min_participants: String(ct.min_participants) })
  }

  return (
    <div className="space-y-4">
      {/* List */}
      <Card>
        <CardContent className="pt-4 divide-y divide-gray-100">
          {classTypes.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Ei tuntityyppejä vielä</p>
          )}
          {classTypes.map((ct) => (
            <div key={ct.id}>
              {editingId === ct.id ? (
                <InlineForm form={form} setForm={setForm} onSave={save} onCancel={resetForm} />
              ) : (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: ct.color }} />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{ct.name}</span>
                      {ct.category && <span className="text-xs text-gray-400 ml-2">{ct.category}</span>}
                    </div>
                    {!ct.active && <Badge variant="secondary" className="text-xs">Piilotettu</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(ct)}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(ct)} className="text-gray-400">
                      {ct.active ? 'Piilota' : 'Näytä'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(ct.id)} className="text-red-500"><Trash2 className="w-3 h-3" /></Button>
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
          <Plus className="w-4 h-4 mr-1" /> Lisää tuntityyppi
        </Button>
      )}
    </div>
  )
}

function InlineForm({ form, setForm, onSave, onCancel }: {
  form: { name: string; category: string; color: string; min_participants: string }
  setForm: (f: typeof form) => void
  onSave: () => void
  onCancel: () => void
}) {
  const COLORS = ['#f96604', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444']
  return (
    <div className="py-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Nimi</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="esim. Tankotanssi" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Kategoria</Label>
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="esim. Akrobatia" className="h-8 text-sm" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Väri</Label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: form.color === c ? '#111' : 'transparent' }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}><Check className="w-3 h-3 mr-1" /> Tallenna</Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3 h-3 mr-1" /> Peruuta</Button>
      </div>
    </div>
  )
}
