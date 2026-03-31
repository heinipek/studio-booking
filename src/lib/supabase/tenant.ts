import { createClient } from './server'
import { Tenant, TenantSettings } from '@/types/database'
import { cache } from 'react'

const DEFAULT_TENANT_SLUG = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? 'piagrina'

/**
 * Get the current tenant. Uses the DEFAULT_TENANT_SLUG env var.
 * In a multi-tenant setup this would resolve from subdomain/domain.
 * Cached per request via React cache().
 */
export const getTenant = cache(async (): Promise<Tenant | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', DEFAULT_TENANT_SLUG)
    .eq('active', true)
    .single()

  return data
})

/**
 * Get tenant settings with type safety.
 */
export async function getTenantSettings(): Promise<TenantSettings | null> {
  const tenant = await getTenant()
  if (!tenant) return null
  return tenant.settings as unknown as TenantSettings
}

/**
 * Get the current authenticated user with their extra permissions.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) return null

  const { data: perms } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', authUser.id)

  return {
    ...user,
    extra_permissions: (perms ?? []).map((p) => p.permission),
  }
})
