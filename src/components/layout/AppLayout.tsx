import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/common/AppSidebar'
import { AppHeader } from '@/components/common/AppHeader'
import { useSidebar } from '@/hooks/useSidebar'

export function AppLayout() {
  const {
    isCollapsed,
    toggleCollapse,
    isMobileOpen,
    closeMobile,
    toggleMobile,
  } = useSidebar()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground antialiased">
      {/* Collapsible & Responsive Sidebar */}
      <AppSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Sticky Header */}
        <AppHeader onToggleMobileSidebar={toggleMobile} />

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
