import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string | number
  isExact?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrent?: boolean
}

export interface ProjectSummary {
  id: string
  name: string
  phase: string
  status: 'active' | 'completed' | 'on_hold'
  location: string
  startDate: string
  targetDate: string
  totalBudget: number
  totalSpent: number
}
