import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  X,
  ChevronDown,
} from 'lucide-react'
import { MAIN_NAV_ITEMS, ACTIVE_PROJECT } from '@/constants/navigation'
import { Badge } from '@/components/ui/badge'
import { useActiveProject } from '@/hooks/useActiveProject'
import { formatCurrency } from '@/utils/formatters'
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
  const {
    projects,
    activeProject,
    selectedProjectId,
    setSelectedProjectId,
    isLoadingProjects,
  } = useActiveProject()

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
                  <div className="relative mt-1">
                    <select
                      value={selectedProjectId ?? activeProject?.id ?? ''}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-foreground focus:outline-none cursor-pointer truncate"
                      aria-label="Select active project"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-card text-foreground">
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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

        {/* Bottom Section */}
        <div className="mt-auto border-t border-border/80 p-3 space-y-3">
          {/* Budget Utilized Widget (dynamically using activeProject total_budget) */}
          {!isCollapsed && (
            <div className="rounded-xl border border-border/70 bg-card p-3 shadow-level-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Budget Utilized</span>
                <span className="font-semibold text-foreground tabular-nums">37.5%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500 w-[37.5%]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>₹3.75M spent</span>
                <span>
                  {activeProject?.total_budget
                    ? `${formatCurrency(activeProject.total_budget, { compact: true })} cap`
                    : '₹10.0M cap'}
                </span>
              </div>
            </div>
          )}

          {/* User Profile Card */}
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60',
              isCollapsed && 'justify-center p-1'
            )}
          >
            <div className="relative shrink-0">
              <img
                src={ACTIVE_PROJECT.user.avatar}
                alt={ACTIVE_PROJECT.user.name}
                className="h-8 w-8 rounded-full object-cover border border-border"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-1 flex-col overflow-hidden text-left">
                <span className="truncate text-xs font-semibold text-foreground">
                  {ACTIVE_PROJECT.user.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {ACTIVE_PROJECT.user.role}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground p-1 rounded"
                aria-label="User account options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
