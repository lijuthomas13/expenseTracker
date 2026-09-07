import { Tags, Plus } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { DateDisplay } from '@/components/common/DateDisplay'
import { useActiveProject } from '@/hooks/useActiveProject'
import { toast } from 'react-toastify'

export function CategoriesSettingsPage() {
  const { categories, isLoadingCategories, activeProject } = useActiveProject()

  if (isLoadingCategories) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3">
        <LoadingSpinner size="md" label="Loading categories..." />
        <span className="text-xs text-muted-foreground">Fetching project categories...</span>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="Work Package & Cost Categories"
        description={`No active categories configured yet for "${activeProject?.name ?? 'this project'}". Create categories to classify construction expenses.`}
        actionLabel="Create New Category"
        onAction={() => toast.info('New Category modal placeholder')}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            Project Categories ({categories.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Active expense classifications for {activeProject?.name}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() => toast.info('New Category modal placeholder')}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Category</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-4 flex items-center justify-between shadow-level-1">
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-border/50"
                style={{ backgroundColor: cat.color || '#4f46e5' }}
              />
              <div>
                <span className="font-semibold text-sm text-foreground block">
                  {cat.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Added <DateDisplay date={cat.created_at} format="short" />
                </span>
              </div>
            </div>
            <Badge variant={cat.is_active ? 'success' : 'secondary'} className="text-[10px]">
              {cat.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  )
}
