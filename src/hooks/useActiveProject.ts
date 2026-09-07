import { useContext } from 'react'
import { ProjectContext, type ProjectContextType } from '@/providers/ProjectContext'

export function useActiveProject(): ProjectContextType {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useActiveProject must be used within a ProjectProvider')
  }
  return context
}

export type { ProjectContextType }
