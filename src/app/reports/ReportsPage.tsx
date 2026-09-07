import { FileBarChart2, Download, Calendar } from 'lucide-react'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

export function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Financial & Variance Reports"
        subtitle="Audit milestone disbursement health, contractor cost allocations, and material variance."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.info('Date range filter')}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Select Date Range</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.info('Generating comprehensive report...')}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Generate Audit PDF</span>
            </Button>
          </>
        }
      />

      <EmptyState
        icon={FileBarChart2}
        title="Analytical Reports Hub"
        description="Comprehensive financial reporting models will populate here, including phase-wise run-rate projections, contractor settlement ledgers, and budget contingency analysis."
        actionLabel="Configure Custom Report"
        onAction={() => toast.info('Custom report configuration module')}
      />
    </PageContainer>
  )
}
