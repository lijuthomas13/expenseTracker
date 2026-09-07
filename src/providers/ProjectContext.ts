import { createContext } from 'react'
import type { Project } from '@/types/project'
import type { ExpenseCategory } from '@/types/category'

export interface ProjectContextType {
  projects: Project[]
  activeProject: Project | null
  selectedProjectId: string | null
  setSelectedProjectId: (id: string) => void
  isLoadingProjects: boolean
  isProjectsError: boolean
  projectsError: Error | null
  categories: ExpenseCategory[]
  isLoadingCategories: boolean
  isCategoriesError: boolean
  categoriesError: Error | null
  refetchProjects: () => void
  refetchCategories: () => void
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined)
export const PROJECT_STORAGE_KEY = 'homebuild_active_project_id'
