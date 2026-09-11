import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Users2,
  Loader2,
  Check,
  Phone,
  FileText,
  Briefcase,
} from 'lucide-react'
import { toast } from 'react-toastify'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useCreateVendorMutation } from '@/hooks/mutations'
import {
  createVendorSchema,
  type CreateVendorSchemaType,
} from '@/validations/vendor.schema'
import { cn } from '@/lib/utils'

export interface CreateVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const VENDOR_TYPES = [
  'Material Supplier',
  'Subcontractor',
  'Labor Contractor',
  'Equipment & Machinery',
  'Professional Services',
  'Other',
]

export function CreateVendorDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateVendorDialogProps) {
  const { activeProject } = useActiveProject()
  const projectId = activeProject?.id ?? ''

  const createVendorMutation = useCreateVendorMutation()
  const isSubmitting = createVendorMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateVendorSchemaType>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: {
      name: '',
      phone: '',
      vendorType: 'Material Supplier',
      notes: '',
    },
  })

  // Watch fields for dynamic live preview
  const watchedName = watch('name')
  const watchedType = watch('vendorType')
  const watchedPhone = watch('phone')
  const watchedNotes = watch('notes')

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        phone: '',
        vendorType: 'Material Supplier',
        notes: '',
      })
    }
  }, [open, reset])

  const onSubmit = async (data: CreateVendorSchemaType) => {
    if (!projectId) {
      toast.error('No active project found. Please select or create a project first.')
      return
    }

    try {
      await createVendorMutation.mutateAsync({
        projectId,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        vendorType: data.vendorType?.trim() || null,
        notes: data.notes?.trim() || null,
      })

      toast.success(`Vendor "${data.name.trim()}" registered successfully!`)
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to register vendor. Please try again.'
      toast.error(errorMessage)
    }
  }

  // Derive initials for avatar preview
  const initials = React.useMemo(() => {
    const trimmed = watchedName?.trim() || ''
    if (!trimmed) return 'V'
    const parts = trimmed.split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }, [watchedName])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Register Vendor / Contractor</DialogTitle>
              <DialogDescription>
                Add a contractor, supplier, or partner to{' '}
                <span className="font-semibold text-foreground">
                  {activeProject?.name ?? 'this project'}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Vendor Name */}
          <div className="space-y-1.5">
            <label htmlFor="vendor-name-input" className="text-xs font-semibold text-foreground">
              Vendor / Company Name <span className="text-destructive">*</span>
            </label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="vendor-name-input"
                  placeholder="e.g. UltraTech Cement, Sharma Electricals"
                  disabled={isSubmitting}
                  autoFocus
                />
              )}
            />
            {errors.name && (
              <p className="text-[12px] font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Vendor Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Vendor Type / Classification
            </label>
            <Controller
              control={control}
              name="vendorType"
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {VENDOR_TYPES.map((type) => {
                      const isSelected = field.value === type
                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => field.onChange(type)}
                          className={cn(
                            'px-2.5 py-1 text-xs rounded-md border font-medium transition-all focus:outline-none',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                          )}
                        >
                          {type}
                        </button>
                      )
                    })}
                  </div>
                  <Input
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Or enter custom type..."
                    disabled={isSubmitting}
                    className="h-8 text-xs"
                  />
                </div>
              )}
            />
            {errors.vendorType && (
              <p className="text-[12px] font-medium text-destructive">{errors.vendorType.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label htmlFor="vendor-phone-input" className="text-xs font-semibold text-foreground">
              Phone / Contact Number <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ''}
                  id="vendor-phone-input"
                  placeholder="+91 98765 43210"
                  disabled={isSubmitting}
                  prefixNode={<Phone className="h-3.5 w-3.5 text-muted-foreground" />}
                />
              )}
            />
            {errors.phone && (
              <p className="text-[12px] font-medium text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Notes / Contract Details */}
          <div className="space-y-1.5">
            <label htmlFor="vendor-notes-input" className="text-xs font-semibold text-foreground">
              Notes & Contract Terms <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ''}
                  id="vendor-notes-input"
                  placeholder="GSTIN number, payment terms, point of contact..."
                  disabled={isSubmitting}
                  prefixNode={<FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                />
              )}
            />
            {errors.notes && (
              <p className="text-[12px] font-medium text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Real-time Preview Card */}
          <div className="rounded-lg border border-border/70 bg-card/60 p-3 shadow-xs space-y-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase block">
              Live Card Preview
            </span>
            <div className="flex items-center justify-between bg-card p-3 rounded-md border border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                  {initials}
                </div>
                <div>
                  <span className="font-semibold text-sm text-foreground block">
                    {watchedName.trim() || 'Vendor / Contractor Name'}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    {watchedType && (
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        <Briefcase className="h-3 w-3" />
                        {watchedType}
                      </span>
                    )}
                    {watchedPhone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {watchedPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Badge variant="success" className="text-[10px]">
                Active
              </Badge>
            </div>
            {watchedNotes && (
              <p className="text-[11px] text-muted-foreground italic px-1 truncate">
                Note: {watchedNotes}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 min-w-[130px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Vendor</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
