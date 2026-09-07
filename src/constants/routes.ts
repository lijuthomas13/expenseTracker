export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EXPENSES: '/expenses',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  SETTINGS_CATEGORIES: '/settings/categories',
  SETTINGS_VENDORS: '/settings/vendors',
  SETTINGS_PAYMENT_METHODS: '/settings/payment-methods',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_PROJECT: '/settings/project',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
