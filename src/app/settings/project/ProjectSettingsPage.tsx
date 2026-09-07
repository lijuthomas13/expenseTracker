import { Building2, Calendar, DollarSign, Edit3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay'
import { DateDisplay } from '@/components/common/DateDisplay'
import { useActiveProject } from '@/hooks/useActiveProject'
import { toast } from 'react-toastify'

export function ProjectSettingsPage() {
  const { activeProject, isLoadingProjects } = useActiveProject()

  if (isLoadingProjects) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3">
        <LoadingSpinner size="md" label="Loading project parameters..." />
        <span className="text-xs text-muted-foreground">Fetching project details...</span>
      </div>
    )
  }

  if (!activeProject) {
    return (
      <Card className="p-8 text-center shadow-level-1">
        <p className="text-sm text-muted-foreground">No active project found.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-level-1">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-foreground">
              {activeProject.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Project Identifier: <span className="font-mono text-foreground">{activeProject.id}</span>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info('Edit Project modal placeholder')}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Project</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1">
              <span className="label-sm text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                Total Budget
              </span>
              <CurrencyDisplay
                amount={activeProject.total_budget}
                className="text-lg font-bold text-foreground block"
              />
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1">
              <span className="label-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                Start Date
              </span>
              <span className="text-sm font-semibold text-foreground block">
                {activeProject.start_date ? (
                  <DateDisplay date={activeProject.start_date} format="full" />
                ) : (
                  'Not set'
                )}
              </span>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1">
              <span className="label-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                Target Completion
              </span>
              <span className="text-sm font-semibold text-foreground block">
                {activeProject.expected_end_date ? (
                  <DateDisplay date={activeProject.expected_end_date} format="full" />
                ) : (
                  'Not set'
                )}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Description & Site Scope
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {activeProject.description || 'No site scope description provided yet for this project.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>
              Created: <DateDisplay date={activeProject.created_at} format="medium" />
            </span>
            <Badge variant="success" dot>
              Active Project
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
