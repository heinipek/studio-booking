export enum Permission {
  MANAGE_CALENDAR = 'manage_calendar',
  MANAGE_BOOKINGS = 'manage_bookings',
  MANAGE_WAITLIST = 'manage_waitlist',
  VIEW_ROSTER = 'view_roster',
  MANAGE_CUSTOMERS = 'manage_customers',
  MANAGE_PRODUCTS = 'manage_products',
  MANAGE_INSTRUCTORS = 'manage_instructors',
  MANAGE_PERMISSIONS = 'manage_permissions',
  VIEW_REPORTS = 'view_reports',
  MANAGE_SETTINGS = 'manage_settings',
  PROCESS_PAYMENTS = 'process_payments',
}

export type BaseRole = 'super_admin' | 'studio_admin' | 'instructor' | 'customer'

export const ROLE_DEFAULT_PERMISSIONS: Record<BaseRole, Permission[]> = {
  super_admin: Object.values(Permission),
  studio_admin: Object.values(Permission),
  instructor: [Permission.VIEW_ROSTER],
  customer: [],
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.MANAGE_CALENDAR]: 'Hallinnoi kalenteria',
  [Permission.MANAGE_BOOKINGS]: 'Hallinnoi varauksia',
  [Permission.MANAGE_WAITLIST]: 'Hallinnoi jonoa',
  [Permission.VIEW_ROSTER]: 'Näe osallistujalistat',
  [Permission.MANAGE_CUSTOMERS]: 'Hallinnoi asiakkaita',
  [Permission.MANAGE_PRODUCTS]: 'Hallinnoi hinnoittelua',
  [Permission.MANAGE_INSTRUCTORS]: 'Hallinnoi ohjaajia',
  [Permission.MANAGE_PERMISSIONS]: 'Hallinnoi oikeuksia',
  [Permission.VIEW_REPORTS]: 'Näe raportit',
  [Permission.MANAGE_SETTINGS]: 'Hallinnoi asetuksia',
  [Permission.PROCESS_PAYMENTS]: 'Käsittele maksuja',
}
