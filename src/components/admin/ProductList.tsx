'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

interface Props {
  tenantId: string
  products: Product[]
}

const TYPE_LABELS: Record<string, string> = {
  single: 'Yksittäinen tunti',
  series: 'Sarjakortti',
  season: 'Kausikortti',
  drop_in: 'Drop-in',
  private: 'Yksityistunti',
  rental: 'Salivuokra',
}

const TARGET_LABELS: Record<string, string> = {
  all: 'Kaikki',
  adult: 'Aikuiset',
  child: 'Lapset',
}

const emptyForm = {
  name: '', type: 'series', price_cents: '', credits: '1',
  validity_days: '90', target_group: 'all', description: '',
}

export function ProductList({ tenantId, products: initial }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const grouped = Object.entries(TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
    items: products.filter((p) => p.type === type),
  })).filter((g) => g.items.length > 0 || (adding && form.type === g.type))

  function resetForm() {
    setForm(emptyForm)
    setAdding(false)
    setEditingId(null)
  }

  async function save() {
    if (!form.name.trim() || !form.price_cents) return
    const supabase = createClient()
    const payload = {
      tenant_id: tenantId,
      name: form.name,
      type: form.type as Product['type'],
      price_cents: Math.round(parseFloat(form.price_cents) * 100),
      credits: parseInt(form.credits),
      validity_days: parseInt(form.validity_days),
      target_group: form.target_group as Product['target_group'],
      description: form.description || null,
    }

    if (editingId) {
      const { data } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
      if (data) setProducts((prev) => prev.map((p) => p.id === editingId ? data : p))
    } else {
      const { data } = await supabase.from('products').insert(payload).select().single()
      if (data) setProducts((prev) => [...prev, data])
    }
    resetForm()
    router.refresh()
  }

  async function toggleActive(product: Product) {
    const supabase = createClient()
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id)
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, active: !p.active } : p))
  }

  async function remove(id: string) {
    if (!confirm('Poistetaanko tuote?')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function startEdit(product: Product) {
    setEditingId(product.id)
    setAdding(false)
    setForm({
      name: product.name,
      type: product.type,
      price_cents: String(product.price_cents / 100),
      credits: String(product.credits),
      validity_days: String(product.validity_days),
      target_group: product.target_group,
      description: product.description ?? '',
    })
  }

  return (
    <div className="space-y-4">
      {products.length === 0 && !adding && (
        <Card>
          <CardContent className="py-8 text-center text-gray-400 text-sm">
            Ei tuotteita vielä. Lisää ensimmäinen tuote alta.
          </CardContent>
        </Card>
      )}

      {products.map((product) => {
        if (editingId !== product.id) {
          return (
            <Card key={product.id} className={!product.active ? 'opacity-60' : ''}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[product.type]}</Badge>
                    {TARGET_LABELS[product.target_group] !== 'Kaikki' && (
                      <Badge variant="secondary" className="text-xs">{TARGET_LABELS[product.target_group]}</Badge>
                    )}
                    {!product.active && <Badge variant="secondary" className="text-xs">Piilotettu</Badge>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(product.price_cents / 100).toFixed(2)} € · {product.credits} kertaa · voimassa {product.validity_days} pv
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(product)}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(product)} className="text-gray-400 text-xs">
                    {product.active ? 'Piilota' : 'Näytä'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(product.id)} className="text-red-500"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          )
        }
        return <ProductForm key={product.id} form={form} setForm={setForm} onSave={save} onCancel={resetForm} />
      })}

      {adding && <ProductForm form={form} setForm={setForm} onSave={save} onCancel={resetForm} />}

      {!adding && !editingId && (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-1" /> Lisää tuote
        </Button>
      )}
    </div>
  )
}

function ProductForm({ form, setForm, onSave, onCancel }: {
  form: typeof emptyForm
  setForm: (f: typeof emptyForm) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Nimi</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="esim. 10 kerran sarjakortti" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tyyppi</Label>
            <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kohderyhmä</Label>
            <Select value={form.target_group} onValueChange={(v) => v && setForm({ ...form, target_group: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TARGET_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hinta (€)</Label>
            <Input type="number" step="0.01" min="0" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} placeholder="149.00" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kerrat</Label>
            <Input type="number" min="1" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Voimassaolo (päivää)</Label>
            <Input type="number" min="1" value={form.validity_days} onChange={(e) => setForm({ ...form, validity_days: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kuvaus (valinnainen)</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Lyhyt kuvaus..." className="h-8 text-sm" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}><Check className="w-3 h-3 mr-1" /> Tallenna</Button>
          <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3 h-3 mr-1" /> Peruuta</Button>
        </div>
      </CardContent>
    </Card>
  )
}
