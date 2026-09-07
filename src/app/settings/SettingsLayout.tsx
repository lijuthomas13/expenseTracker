import { NavLink, Outlet } from 'react-router-dom'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { SETTINGS_NAV_ITEMS } from '@/constants/navigation'
import { cn } from '@/lib/utils'

export function SettingsLayout() {
  return (
    <PageContainer>
      <PageHeader
        title="Project Settings"
        subtitle="Manage classification tags, contractor records, billing methods, and team permissions."
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-border/80 mb-6 overflow-x-auto">
        <nav className="flex space-x-1" aria-label="Settings Tabs">
          {SETTINGS_NAV_ITEMS.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.href}
                to={tab.href}
                end={tab.isExact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.title}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Settings Subpage Content */}
      <div className="mt-4">
        <Outlet />
      </div>
    </PageContainer>
  )
}
