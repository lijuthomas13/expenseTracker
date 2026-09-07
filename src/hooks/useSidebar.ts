import { useState, useEffect } from 'react'

const SIDEBAR_STORAGE_KEY = 'homebuild_sidebar_collapsed'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed))
    } catch {
      // Ignore
    }
  }, [isCollapsed])

  const toggleCollapse = () => setIsCollapsed((prev) => !prev)
  const toggleMobile = () => setIsMobileOpen((prev) => !prev)
  const closeMobile = () => setIsMobileOpen(false)

  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapse,
    isMobileOpen,
    setIsMobileOpen,
    toggleMobile,
    closeMobile,
  }
}
