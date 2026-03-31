import { Permission, BaseRole, ROLE_DEFAULT_PERMISSIONS } from '@/types/permissions'

export interface UserWithPermissions {
  id: string
  tenant_id: string
  email: string
  full_name: string
  phone: string | null
  date_of_birth: string | null
  base_role: string
  notification_preference: string
  phone_verified: boolean
  created_at: string
  extra_permissions: string[]
}

export function hasPermission(
  user: UserWithPermissions | null,
  permission: Permission
): boolean {
  if (!user) return false
  if (user.base_role === 'super_admin' || user.base_role === 'studio_admin') return true
  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.base_role as BaseRole] ?? []
  if (defaultPerms.includes(permission)) return true
  if (user.extra_permissions?.includes(permission)) return true
  return false
}

export function hasAllPermissions(
  user: UserWithPermissions | null,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(user, p))
}

export function hasAnyPermission(
  user: UserWithPermissions | null,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(user, p))
}

export function getEffectivePermissions(user: UserWithPermissions | null): Permission[] {
  if (!user) return []
  if (user.base_role === 'super_admin' || user.base_role === 'studio_admin') {
    return Object.values(Permission)
  }
  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.base_role as BaseRole] ?? []
  const extraPerms = (user.extra_permissions ?? []) as Permission[]
  return [...new Set([...defaultPerms, ...extraPerms])]
}
