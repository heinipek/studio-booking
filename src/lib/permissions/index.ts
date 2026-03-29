import { Permission, BaseRole, ROLE_DEFAULT_PERMISSIONS } from '@/types/permissions'
import { User } from '@/types/database'

export interface UserWithPermissions extends User {
  extra_permissions?: string[]
}

/**
 * Check if a user has a specific permission.
 * Studio admins and super admins always have all permissions.
 * Other roles get permissions from ROLE_DEFAULT_PERMISSIONS + any extra granted permissions.
 */
export function hasPermission(
  user: UserWithPermissions | null,
  permission: Permission
): boolean {
  if (!user) return false

  // Super admin and studio admin always have all permissions
  if (user.base_role === 'super_admin' || user.base_role === 'studio_admin') {
    return true
  }

  // Check default role permissions
  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.base_role as BaseRole] ?? []
  if (defaultPerms.includes(permission)) return true

  // Check extra granted permissions
  if (user.extra_permissions?.includes(permission)) return true

  return false
}

/**
 * Check if user has ALL of the given permissions.
 */
export function hasAllPermissions(
  user: UserWithPermissions | null,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(user, p))
}

/**
 * Check if user has ANY of the given permissions.
 */
export function hasAnyPermission(
  user: UserWithPermissions | null,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(user, p))
}

/**
 * Get all effective permissions for a user.
 */
export function getEffectivePermissions(user: UserWithPermissions | null): Permission[] {
  if (!user) return []

  if (user.base_role === 'super_admin' || user.base_role === 'studio_admin') {
    return Object.values(Permission)
  }

  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.base_role as BaseRole] ?? []
  const extraPerms = (user.extra_permissions ?? []) as Permission[]

  return [...new Set([...defaultPerms, ...extraPerms])]
}
