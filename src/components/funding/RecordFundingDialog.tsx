import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  UploadCloud,
  X,
  FileText,
  Loader2,
  Landmark,
  UserCheck,
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
import { Combobox } from '@/components/ui/combobox'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAuth } from '@/hooks/useAuth'
import { usePaymentMethodsQuery } from '@/hooks/queries'
import { useCreateFundingMutation } from '@/hooks/mutations'
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '@/validations/createExpense.schema'
import {
  fundingSchema,
  type FundingSchemaType,
} from '@/validations/funding.schema'
import { cn } from '@/lib/utils'

export interface RecordFundingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function RecordFundingDialog({
  open,
  onOpenChange,
  onSuccess,
}: RecordFundingDialogProps) {
  const { activeProject } = useActiveProject()
  const { user } = useAuth()
  const projectId = activeProject?.id ?? ''

  const loggedInUserId = user?.id ?? ''
  const loggedInUserName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Authenticated User'

  const {
    data: paymentMethods = [],
    isLoading: isLoadingPaymentMethods,
  } = usePaymentMethodsQuery()

  const createFundingMutation = useCreateFundingMutation()
  const isSaving = createFundingMutation.isPending

  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FundingSchemaType>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      amount: 0,
      funding_date: getTodayDateString(),
      payment_method_id: '',
      funded_by: loggedInUserId,
      description: '',
      attachment: null,
    },
  })

  // Ensure funded_by is updated if user object loads after initialization
  React.useEffect(() => {
    if (loggedInUserId) {
      setValue('funded_by', loggedInUserId)
    }
  }, [loggedInUserId, setValue])

  React.useEffect(() => {
    if (paymentMethods.length > 0 && !watch('payment_method_id')) {
      setValue('payment_method_id', paymentMethods[5]?.id || paymentMethods[0].id)
    }
  }, [paymentMethods, setValue, watch])

  const attachmentFile = watch('attachment')

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      setValue('attachment', null)
      clearErrors('attachment')
      return
    }

    if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
      setError('attachment', {
        type: 'manual',
        message: 'Allowed types: PNG, JPEG, PDF only',
      })
      toast.error('Invalid file type. Allowed: PNG, JPEG, PDF')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('attachment', {
        type: 'manual',
        message: 'File size must not exceed 10MB',
      })
      toast.error('File exceeds 10MB limit')
      return
    }

    clearErrors('attachment')
    setValue('attachment', file, { shouldValidate: true })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isSaving) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (isSaving) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileSelection(droppedFiles[0])
    }
  }

  const handleRemoveAttachment = (e: React.MouseEvent) => {
    e.stopPropagation()
    setValue('attachment', null, { shouldValidate: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: FundingSchemaType) => {
    if (!projectId) {
      toast.error('No active project found. Please select a project first.')
      return
    }

    try {
      await createFundingMutation.mutateAsync({
        projectId,
        fundingDate: data.funding_date,
        amount: data.amount,
        paymentMethodId: data.payment_method_id,
        fundedBy: data.funded_by || loggedInUserId,
        description: data.description || null,
        attachment: data.attachment || null,
      })

      toast.success('Funding recorded successfully.')
      reset({
        amount: 0,
        funding_date: getTodayDateString(),
        payment_method_id: paymentMethods[5]?.id || paymentMethods[0]?.id || '',
        funded_by: loggedInUserId,
        description: '',
        attachment: null,
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to record funding. Please try again.'
      toast.error(errorMsg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isSaving ? () => {} : onOpenChange}>
      <DialogContent
        className="sm:max-w-xl w-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] p-0 border border-border/80 shadow-level-4 rounded-2xl bg-card flex flex-col overflow-hidden"
        aria-describedby="funding-dialog-description"
      >
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center gap-3.5 border-b border-border/70 px-6 py-5 bg-card/60 backdrop-blur-sm space-y-0 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
              Record Funding
            </DialogTitle>
            <DialogDescription
              id="funding-dialog-description"
              className="text-xs text-muted-foreground truncate mt-0.5"
            >
              Add capital contribution to{' '}
              <strong className="font-semibold text-foreground">
                {activeProject?.name ?? 'Villa Greenfields'}
              </strong>{' '}
              ledger
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
        >
          <fieldset disabled={isSaving} className="space-y-4">
            {/* Amount Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="funding-amount"
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>AMOUNT (INR)</span>
                <span className="text-destructive text-xs">*</span>
              </label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    id="funding-amount"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    prefixNode={<span className="font-semibold text-foreground text-base">₹</span>}
                    className={cn(
                      'h-11 text-base font-semibold bg-muted/30 border-border/80 focus-visible:bg-card transition-colors',
                      errors.amount && 'border-destructive focus-visible:ring-destructive/30'
                    )}
                    aria-invalid={!!errors.amount}
                    aria-describedby={errors.amount ? 'amount-error' : undefined}
                    value={field.value === 0 || !field.value ? '' : field.value}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === '' ? 0 : Number(val))
                    }}
                    disabled={isSaving}
                    autoFocus
                  />
                )}
              />
              {errors.amount && (
                <p id="amount-error" className="text-xs text-destructive font-medium mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Grid Row: Funding Date & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="funding_date"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                >
                  <span>FUNDING DATE</span>
                  <span className="text-destructive text-xs">*</span>
                </label>
                <Controller
                  name="funding_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="funding_date"
                      type="date"
                      className={cn(
                        'h-10 text-sm bg-muted/30 border-border/80',
                        errors.funding_date && 'border-destructive focus-visible:ring-destructive/30'
                      )}
                      aria-invalid={!!errors.funding_date}
                      aria-describedby={errors.funding_date ? 'date-error' : undefined}
                      disabled={isSaving}
                      {...field}
                    />
                  )}
                />
                {errors.funding_date && (
                  <p id="date-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.funding_date.message}
                  </p>
                )}
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label
                  htmlFor="payment_method_id"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                >
                  <span>PAYMENT MODE</span>
                  <span className="text-destructive text-xs">*</span>
                </label>
                <Controller
                  name="payment_method_id"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      id="payment_method_id"
                      aria-label="Payment Mode"
                      disabled={isSaving || isLoadingPaymentMethods}
                      placeholder={
                        isLoadingPaymentMethods
                          ? 'Loading payment modes...'
                          : 'Select payment mode...'
                      }
                      searchPlaceholder="Search payment mode..."
                      emptyText="No payment modes found."
                      error={!!errors.payment_method_id}
                      options={paymentMethods.map((pm) => ({
                        value: pm.id,
                        label: pm.name,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.payment_method_id && (
                  <p id="payment-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.payment_method_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Funded By (Defaulted to logged-in user and disabled) */}
            <div className="space-y-1.5">
              <label
                htmlFor="funded_by_display"
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>FUNDED BY</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Logged-in User</span>
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-sm text-foreground select-none opacity-90 cursor-not-allowed">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {loggedInUserName}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user?.email ?? 'Current member'}
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                  You
                </span>
              </div>
              <input type="hidden" value={loggedInUserId} {...control.register('funded_by')} />
            </div>

            {/* Attachment Drop Zone */}
            <div className="space-y-1.5">
              <label
                id="attachment-upload-label"
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>ATTACH RECEIPT / PROOF</span>
                <span className="text-destructive text-xs">*</span>
              </label>

              <input
                ref={fileInputRef}
                id="attachment-file-input"
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="hidden"
                disabled={isSaving}
                onChange={(e) => {
                  const files = e.target.files
                  if (files && files.length > 0) {
                    handleFileSelection(files[0])
                  }
                }}
              />

              {!attachmentFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isSaving && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  aria-labelledby="attachment-upload-label"
                  className={cn(
                    'group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center cursor-pointer transition-all duration-150 hover:bg-primary/[0.03] hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.attachment && 'border-destructive/80 bg-destructive/5 hover:border-destructive',
                    isDragging && 'border-primary bg-primary/[0.08] scale-[0.99]',
                    isSaving && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2 transition-transform group-hover:scale-105">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Click to upload or drag funding receipt
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    PDF, PNG, JPG up to 10MB (required • stored in funding-receipts)
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/[0.04] p-3 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate max-w-[280px]">
                        {attachmentFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(attachmentFile.size)} • Ready to upload
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    disabled={isSaving}
                    onClick={handleRemoveAttachment}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Remove selected attachment"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {errors.attachment && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.attachment.message}
                </p>
              )}
            </div>

            {/* Description Notes */}
            <div className="space-y-1.5">
              <label
                htmlFor="funding-description"
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>DESCRIPTION / NOTES</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Max 500 chars</span>
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="funding-description"
                    rows={2}
                    maxLength={500}
                    placeholder="e.g. Partner capital contribution for Phase 1 construction"
                    disabled={isSaving}
                    className={cn(
                      'flex w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
                      errors.description && 'border-destructive focus-visible:ring-destructive/30'
                    )}
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? 'desc-error' : undefined}
                    {...field}
                  />
                )}
              />
              {errors.description && (
                <p id="desc-error" className="text-xs text-destructive font-medium mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </fieldset>

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-2 border-t border-border/60 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              className="font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="gap-2 min-w-[130px] font-medium shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Funding</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
