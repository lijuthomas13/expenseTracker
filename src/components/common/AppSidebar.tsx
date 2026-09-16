import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogOut,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { MAIN_NAV_ITEMS } from '@/constants/navigation'
import { Badge } from '@/components/ui/badge'
import { Combobox } from '@/components/ui/combobox'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export interface AppSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const {
    projects,
    activeProject,
    selectedProjectId,
    setSelectedProjectId,
    isLoadingProjects,
  } = useActiveProject()

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

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in-0"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/80 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:static lg:z-30 shadow-level-1 lg:shadow-none',
          isCollapsed ? 'w-[72px]' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-4">
          <div className={cn('flex items-center gap-3 overflow-hidden', isCollapsed && 'justify-center w-full')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Home className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display text-base font-bold tracking-tight text-foreground leading-none">
                  HomeBuild
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mt-0.5">
                  Expense Tracker
                </span>
              </div>
            )}
          </div>

          {/* Collapse/Close Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                'hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
                isCollapsed && 'hidden'
              )}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>

            {/* Mobile Close */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Collapsed expand button on desktop */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center py-2 border-b border-border/70">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Current Project Card (Dynamic via useProjectsQuery) */}
        {!isCollapsed ? (
          <div className="mx-3 mt-3.5 mb-2 rounded-xl border border-border/70 bg-muted/40 p-3 transition-colors">
            {isLoadingProjects ? (
              <div className="animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-16 bg-muted-foreground/20 rounded" />
                  <div className="h-3.5 w-10 bg-muted-foreground/20 rounded-full" />
                </div>
                <div className="h-4 w-28 bg-muted-foreground/25 rounded" />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Project
                  </span>
                  <Badge variant="success" className="text-[10px] px-2 py-0">
                    Phase 1
                  </Badge>
                </div>

                {projects.length > 1 ? (
                  <div className="mt-1">
                    <Combobox
                      placeholder="Select active project..."
                      searchPlaceholder="Search projects..."
                      emptyText="No projects found."
                      className="h-8 font-medium text-xs bg-muted/20 border-border/70 hover:bg-muted/40"
                      options={projects.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                      value={selectedProjectId ?? activeProject?.id ?? ''}
                      onChange={(val) => {
                        if (val) setSelectedProjectId(val)
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-1 text-sm font-semibold text-foreground truncate">
                    {activeProject?.name ?? 'No Project'}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 flex justify-center">
            <span
              className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"
              title={activeProject?.name ?? 'Active Project'}
            />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-3 overflow-y-auto" aria-label="Main Navigation">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.isExact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href)

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                  aria-hidden="true"
                />

                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-muted text-muted-foreground group-hover:bg-card'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Account & Logout Footer */}
        <div className="border-t border-border/70 p-3">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 p-2">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                  {initials}
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {fullName}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                title={`Sign out (${fullName})`}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
