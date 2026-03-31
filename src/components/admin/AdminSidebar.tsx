'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'
import { UserWithPermissions } from '@/lib/permissions'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Package,
  ShieldCheck,
  Settings,
  LogOut,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  permission?: Permission
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tunnit', label: 'Tunnit', icon: Calendar, permission: Permission.MANAGE_CALENDAR },
  { href: '/admin/ohjaajat', label: 'Ohjaajat', icon: UserCheck, permission: Permission.MANAGE_INSTRUCTORS },
  { href: '/admin/asiakkaat', label: 'Asiakkaat', icon: Users, permission: Permission.MANAGE_CUSTOMERS },
  { href: '/admin/tuotteet', label: 'Tuotteet & hinnat', icon: Package, permission: Permission.MANAGE_PRODUCTS },
  { href: '/admin/oikeudet', label: 'Käyttöoikeudet', icon: ShieldCheck, permission: Permission.MANAGE_PERMISSIONS },
  { href: '/admin/asetukset', label: 'Asetukset', icon: Settings, permission: Permission.MANAGE_SETTINGS },
]

interface Props {
  user: UserWithPermissions
}

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true
    return hasPermission(user, item.permission)
  })

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo / studio name */}
      <div className="px-6 py-5 border-b border-gray-200">
        <span className="text-lg font-bold text-gray-900">Studio Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Kirjaudu ulos
          </button>
        </form>
      </div>
    </aside>
  )
}
