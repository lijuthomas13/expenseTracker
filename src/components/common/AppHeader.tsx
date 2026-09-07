import { useLocation, Link } from 'react-router-dom'
import {
  Bell,
  Menu,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { SearchInput } from './SearchInput'
import { AddExpenseButton } from './AddExpenseButton'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useActiveProject } from '@/hooks/useActiveProject'
import { ACTIVE_PROJECT } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'

export interface AppHeaderProps {
  onToggleMobileSidebar: () => void
}

export function AppHeader({ onToggleMobileSidebar }: AppHeaderProps) {
  const location = useLocation()
  const { resolvedTheme, setTheme } = useTheme()
  const { activeProject, isLoadingProjects } = useActiveProject()

  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith(ROUTES.EXPENSES)) return 'Expenses'
    if (path.startsWith(ROUTES.REPORTS)) return 'Reports'
    if (path.startsWith(ROUTES.SETTINGS_CATEGORIES)) return 'Categories Settings'
    if (path.startsWith(ROUTES.SETTINGS_VENDORS)) return 'Vendors Settings'
    if (path.startsWith(ROUTES.SETTINGS_PAYMENT_METHODS)) return 'Payment Methods'
    if (path.startsWith(ROUTES.SETTINGS_USERS)) return 'Users & Permissions'
    if (path.startsWith(ROUTES.SETTINGS_PROJECT)) return 'Project Settings'
    if (path.startsWith(ROUTES.SETTINGS)) return 'Settings'
    return 'Overview'
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/85 px-4 sm:px-6 backdrop-blur-md transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="iconSm"
          onClick={onToggleMobileSidebar}
          className="lg:hidden text-muted-foreground"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb: Projects > [Active Project] > Overview */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            to={ROUTES.DASHBOARD}
            className="hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="hover:text-foreground transition-colors font-medium">
            {isLoadingProjects ? (
              <span className="inline-block h-3 w-20 animate-pulse rounded bg-muted-foreground/20 align-middle" />
            ) : (
              activeProject?.name ?? 'Villa Greenfields'
            )}
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-foreground font-semibold">
            {getPageTitle()}
          </span>
        </nav>
      </div>

      {/* Right: Search, Notifications, Theme Toggle, Add Expense CTA, Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Bar */}
        <div className="hidden md:block w-52 lg:w-64">
          <SearchInput
            placeholder="Search expenses..."
            shortcutHint="⌘K"
          />
        </div>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="iconSm"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notification Bell with indicator */}
        <div className="relative">
          <Button
            variant="ghost"
            size="iconSm"
            className="text-muted-foreground hover:text-foreground"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
        </div>

        {/* Reusable Add Expense CTA Button */}
        <AddExpenseButton customLabel="Add Expense" />

        {/* User Avatar */}
        <div className="hidden sm:flex items-center pl-1">
          <img
            src={ACTIVE_PROJECT.user.avatar}
            alt={ACTIVE_PROJECT.user.name}
            className="h-8 w-8 rounded-full object-cover border border-border"
          />
        </div>
      </div>
    </header>
  )
}
