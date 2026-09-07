import { useState, type ReactNode } from 'react'
import { useProjectsQuery } from '@/hooks/queries/useProjectsQuery'
import { useExpenseCategoriesQuery } from '@/hooks/queries/useExpenseCategoriesQuery'
import { ProjectContext, PROJECT_STORAGE_KEY } from './ProjectContext'

export interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjectsQuery()

  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PROJECT_STORAGE_KEY)
    } catch {
      return null
    }
  })

  // Automatically resolve active project: uses user selection or defaults to the first project
  const activeProject =
    (selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null) ??
    (projects.length > 0 ? projects[0] : null)

  const setSelectedProjectId = (id: string) => {
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, id)
    } catch {
      // Ignore
    }
    setSelectedProjectIdState(id)
  }

  // Fetch categories for the active project
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
    refetch: refetchCategories,
  } = useExpenseCategoriesQuery(activeProject?.id ?? '')

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        selectedProjectId: activeProject?.id ?? selectedProjectId,
        setSelectedProjectId,
        isLoadingProjects,
        isProjectsError,
        projectsError,
        categories,
        isLoadingCategories,
        isCategoriesError,
        categoriesError,
        refetchProjects,
        refetchCategories,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
