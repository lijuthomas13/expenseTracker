import {
  LayoutDashboard,
  Receipt,
  Settings,
  Tags,
  Users2,
  Building2,
  SlidersHorizontal,
} from 'lucide-react'
import type { NavItem } from '@/types/navigation.types'
import { ROUTES } from './routes'

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    isExact: true,
  },
  {
    title: 'Expenses',
    href: ROUTES.EXPENSES,
    icon: Receipt,
    // badge: 84,
  },
  // {
  //   title: 'Reports',
  //   href: ROUTES.REPORTS,
  //   icon: FileBarChart2,
  // },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  {
    title: 'General',
    href: ROUTES.SETTINGS,
    icon: SlidersHorizontal,
    isExact: true,
  },
  {
    title: 'Categories',
    href: ROUTES.SETTINGS_CATEGORIES,
    icon: Tags,
  },
  {
    title: 'Vendors & Contractors',
    href: ROUTES.SETTINGS_VENDORS,
    icon: Users2,
  },
  // {
  //   title: 'Payment Methods',
  //   href: ROUTES.SETTINGS_PAYMENT_METHODS,
  //   icon: CreditCard,
  // },
  // {
  //   title: 'Users & Permissions',
  //   href: ROUTES.SETTINGS_USERS,
  //   icon: Users2,
  // },
  {
    title: 'Project Details',
    href: ROUTES.SETTINGS_PROJECT,
    icon: Building2,
  },
]

