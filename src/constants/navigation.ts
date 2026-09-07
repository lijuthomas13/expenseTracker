import {
  LayoutDashboard,
  Receipt,
  FileBarChart2,
  Settings,
  Tags,
  Users2,
  CreditCard,
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
    badge: 84,
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: FileBarChart2,
  },
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
  {
    title: 'Payment Methods',
    href: ROUTES.SETTINGS_PAYMENT_METHODS,
    icon: CreditCard,
  },
  {
    title: 'Users & Permissions',
    href: ROUTES.SETTINGS_USERS,
    icon: Users2,
  },
  {
    title: 'Project Details',
    href: ROUTES.SETTINGS_PROJECT,
    icon: Building2,
  },
]

export const ACTIVE_PROJECT = {
  id: 'vg-phase-1',
  name: 'Villa Greenfields',
  phase: 'Phase 1',
  statusDescription: 'Structural Execution Active',
  startDate: 'Started Jan 2024',
  targetDate: 'Target: Nov 2024',
  location: 'Site: Sector 48, Gurgaon',
  totalBudget: 5000000, // ₹50,00,000
  totalSpent: 1875000,  // ₹18,75,000
  monthlySpend: 142000, // ₹1,42,000
  user: {
    name: 'Rajesh Sharma',
    role: 'Project Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
} as const
