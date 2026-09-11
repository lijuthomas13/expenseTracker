import { useState } from 'react'
import { Users2, Plus, Phone, Briefcase, FileText } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { DateDisplay } from '@/components/common/DateDisplay'
import { CreateVendorDialog } from '@/components/common/CreateVendorDialog'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useVendorsQuery } from '@/hooks/queries'

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'V'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function VendorsSettingsPage() {
  const { activeProject } = useActiveProject()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const {
    data: vendors = [],
    isLoading: isLoadingVendors,
  } = useVendorsQuery(activeProject?.id)

  if (isLoadingVendors) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3">
        <LoadingSpinner size="md" label="Loading vendors..." />
        <span className="text-xs text-muted-foreground">Fetching project contractors and suppliers...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            Project Vendors & Contractors ({vendors.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Active contractors, material suppliers, and service providers for{' '}
            {activeProject?.name ?? 'selected project'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Register Vendor</span>
        </Button>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="Contractors & Material Vendors"
          description={`No contractors or suppliers registered yet for "${activeProject?.name ?? 'this project'}". Add vendors to track contracts, receipts, and expenses.`}
          actionLabel="Register Vendor"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {vendors.map((vendor) => {
            const initials = getInitials(vendor.name)
            return (
              <Card
                key={vendor.id}
                className="p-4 flex flex-col justify-between gap-3 shadow-level-1 hover:shadow-level-2 transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-foreground block truncate">
                        {vendor.name}
                      </span>
                      {vendor.vendor_type && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium mt-0.5">
                          <Briefcase className="h-3 w-3 shrink-0" />
                          <span className="truncate">{vendor.vendor_type}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={vendor.is_active ? 'success' : 'secondary'}
                    className="text-[10px] shrink-0"
                  >
                    {vendor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-border/60 text-xs">
                  {vendor.phone && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                      <a
                        href={`tel:${vendor.phone}`}
                        className="text-[11px] hover:text-foreground hover:underline truncate"
                      >
                        {vendor.phone}
                      </a>
                    </div>
                  )}

                  {vendor.notes && (
                    <div className="flex items-start gap-1.5 text-muted-foreground">
                      <FileText className="h-3 w-3 text-muted-foreground/70 shrink-0 mt-0.5" />
                      <span className="text-[11px] italic line-clamp-2">
                        {vendor.notes}
                      </span>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground/80 pt-0.5">
                    Added <DateDisplay date={vendor.created_at} format="short" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Register Vendor Dialog */}
      <CreateVendorDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
