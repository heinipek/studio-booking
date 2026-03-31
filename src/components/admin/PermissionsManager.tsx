'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Permission, PERMISSION_LABELS } from '@/types/permissions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface UserRow {
  id: string
  full_name: string
  email: string
  base_role: string
  user_permissions: { permission: string }[]
}

interface Props {
  tenantId: string
  currentUserId: string
  users: UserRow[]
}

const ROLE_LABELS: Record<string, string> = {
  studio_admin: 'Studio Admin',
  instructor: 'Ohjaaja',
  customer: 'Asiakas',
}

export function PermissionsManager({ tenantId, currentUserId, users }: Props) {
  const router = useRouter()
  const [permissions, setPermissions] = useState<Record<string, string[]>>(
    Object.fromEntries(users.map((u) => [u.id, u.user_permissions.map((p) => p.permission)]))
  )
  const [roles, setRoles] = useState<Record<string, string>>(
    Object.fromEntries(users.map((u) => [u.id, u.base_role]))
  )

  function initials(name: string) {
    return name.split(' ').map((n) => n[0] ?? '').join('').toUpperCase().slice(0, 2)
  }

  async function changeRole(userId: string, newRole: string) {
    const supabase = createClient()
    await supabase.from('users').update({ base_role: newRole }).eq('id', userId)
    setRoles((prev) => ({ ...prev, [userId]: newRole }))
    router.refresh()
  }

  async function togglePermission(userId: string, permission: Permission) {
    const supabase = createClient()
    const current = permissions[userId] ?? []
    const has = current.includes(permission)

    if (has) {
      await supabase.from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('permission', permission)
      setPermissions((prev) => ({ ...prev, [userId]: current.filter((p) => p !== permission) }))
    } else {
      await supabase.from('user_permissions').insert({
        user_id: userId,
        tenant_id: tenantId,
        permission,
        granted_by: currentUserId,
      })
      setPermissions((prev) => ({ ...prev, [userId]: [...current, permission] }))
    }
  }

  const isAdminRole = (role: string) => role === 'studio_admin'

  return (
    <div className="space-y-4">
      {users.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-400 text-sm">
            Ei hallittavia käyttäjiä
          </CardContent>
        </Card>
      )}
      {users.map((u) => {
        const role = roles[u.id]
        const userPerms = permissions[u.id] ?? []
        const isAdmin = isAdminRole(role)

        return (
          <Card key={u.id}>
            <CardContent className="pt-4 space-y-4">
              {/* User header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                      {initials(u.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <Select value={role} onValueChange={(v) => v && changeRole(u.id, v)}>
                  <SelectTrigger className="h-7 text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Permissions */}
              {isAdmin ? (
                <p className="text-xs text-gray-400 italic">Studio Admin saa automaattisesti kaikki oikeudet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.values(Permission).map((perm) => {
                    const active = userPerms.includes(perm)
                    return (
                      <button
                        key={perm}
                        onClick={() => togglePermission(u.id, perm)}
                        className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-orange-100 border-orange-300 text-orange-800'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {PERMISSION_LABELS[perm]}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
