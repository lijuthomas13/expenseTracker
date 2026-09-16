import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { SearchInput } from './SearchInput'
import { AddExpenseButton } from './AddExpenseButton'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useTheme } from '@/hooks/useTheme'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

export interface AppHeaderProps {
  onToggleMobileSidebar: () => void
}

export function AppHeader({ onToggleMobileSidebar }: AppHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const { activeProject, isLoadingProjects } = useActiveProject()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch {
      toast.error('Unable to sign out. Please try again.')
    }
  }

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'User'

  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'

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

        {/* User Profile & Logout Popover */}
        <div className="flex items-center pl-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="User account menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer select-none"
                title={fullName}
              >
                {initials}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="px-2.5 py-2">
                <p className="text-xs font-semibold text-foreground truncate">
                  {fullName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <div className="h-px bg-border my-1" />
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
