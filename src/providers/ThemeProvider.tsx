import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Theme } from '@/types/theme.types'
import { ThemeContext, THEME_STORAGE_KEY } from './ThemeContext'

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    } catch {
      // Ignore local storage errors in restricted contexts
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = window.document.documentElement

    const updateTheme = () => {
      const activeTheme: 'light' | 'dark' =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : theme

      setResolvedTheme(activeTheme)

      root.classList.remove('light', 'dark')
      root.classList.add(activeTheme)
    }

    updateTheme()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => updateTheme()
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch {
      // Ignore
    }
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
