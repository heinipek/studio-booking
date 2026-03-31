import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getAuthenticatedAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('base_role, tenant_id').eq('id', user.id).single()
  if (!data) return null
  const isAdmin = data.base_role === 'studio_admin' || data.base_role === 'super_admin'
  const { data: perm } = await supabase.from('user_permissions').select('permission').eq('user_id', user.id).eq('permission', 'manage_products').maybeSingle()
  if (!isAdmin && !perm) return null
  return { userId: user.id, tenantId: data.tenant_id }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedAdmin()
  if (!auth) return NextResponse.json({ error: 'Ei oikeuksia' }, { status: 403 })
  const body = await req.json()
  const { data, error } = await createAdminClient().from('products').insert({ ...body, tenant_id: auth.tenantId }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedAdmin()
  if (!auth) return NextResponse.json({ error: 'Ei oikeuksia' }, { status: 403 })
  const { id, ...body } = await req.json()
  const { data, error } = await createAdminClient().from('products').update(body).eq('id', id).eq('tenant_id', auth.tenantId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthenticatedAdmin()
  if (!auth) return NextResponse.json({ error: 'Ei oikeuksia' }, { status: 403 })
  const { id } = await req.json()
  const { error } = await createAdminClient().from('products').delete().eq('id', id).eq('tenant_id', auth.tenantId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
