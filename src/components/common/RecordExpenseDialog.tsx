import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  UploadCloud,
  X,
  FileText,
  Loader2,
  ReceiptText,
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
import { useActiveProject } from '@/hooks/useActiveProject'
import {
  useExpenseCategoriesQuery,
  usePaymentMethodsQuery,
  useVendorsQuery,
} from '@/hooks/queries'
import { useCreateExpenseMutation } from '@/hooks/mutations'
import {
  createExpenseSchema,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type CreateExpenseSchemaType,
} from '@/validations/createExpense.schema'
import { cn } from '@/lib/utils'

export interface RecordExpenseDialogProps {
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

export function RecordExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
}: RecordExpenseDialogProps) {
  const { activeProject } = useActiveProject()
  const projectId = activeProject?.id ?? ''

  // Load dropdown data using React Query hooks (no hardcoded data)
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useExpenseCategoriesQuery(projectId)

  const {
    data: paymentMethods = [],
    isLoading: isLoadingPaymentMethods,
  } = usePaymentMethodsQuery()

  const {
    data: vendors = [],
    isLoading: isLoadingVendors,
  } = useVendorsQuery(projectId)

  // React Query mutation for creating expense
  const createExpenseMutation = useCreateExpenseMutation()
  const isSaving = createExpenseMutation.isPending

  // Drag-and-drop state
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // React Hook Form setup with Zod resolver and controlled state
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateExpenseSchemaType>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
      expense_date: getTodayDateString(),
      status: 'Paid',
      description: '',
      vendor_id: '',
      invoice_number: '',
      category_id: '',
      payment_method_id: '',
      receipt: null,
    },
  })

  // Watch receipt to display upload preview or placeholder
  const receiptFile = watch('receipt')

  // Auto-select first category / payment method if available and not yet set
  React.useEffect(() => {
    if (categories.length > 0 && !watch('category_id')) {
      setValue('category_id', categories[0].id)
    }
  }, [categories, setValue, watch])

  React.useEffect(() => {
    if (paymentMethods.length > 0 && !watch('payment_method_id')) {
      setValue('payment_method_id', paymentMethods[0].id)
    }
  }, [paymentMethods, setValue, watch])

  // Handle file selection from drag-and-drop or file picker
  const handleFileSelection = (file: File | null) => {
    if (!file) {
      setValue('receipt', null)
      clearErrors('receipt')
      return
    }

    // Validate file type
    if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
      setError('receipt', {
        type: 'manual',
        message: 'Allowed types: PNG, JPEG, PDF only',
      })
      toast.error('Invalid file type. Allowed: PNG, JPEG, PDF')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('receipt', {
        type: 'manual',
        message: 'Receipt file size must not exceed 10MB',
      })
      toast.error('File exceeds 10MB limit')
      return
    }

    clearErrors('receipt')
    setValue('receipt', file, { shouldValidate: true })
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

  const handleRemoveReceipt = (e: React.MouseEvent) => {
    e.stopPropagation()
    setValue('receipt', null, { shouldValidate: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form submission
  const onSubmit = async (data: CreateExpenseSchemaType) => {
    if (!projectId) {
      toast.error('No active project found. Please select a project first.')
      return
    }

    try {
      await createExpenseMutation.mutateAsync({
        projectId,
        categoryId: data.category_id,
        paymentMethodId: data.payment_method_id,
        amount: data.amount,
        expenseDate: data.expense_date,
        description: data.description || null,
        vendorId: data.vendor_id || null,
        invoiceNumber: data.invoice_number || null,
        status: data.status || 'Paid',
        receipt: data.receipt || null,
      })

      // On Success: Toast, reset form, close dialog
      toast.success('Expense added successfully.')
      reset({
        amount: 0,
        expense_date: getTodayDateString(),
        status: 'Paid',
        description: '',
        vendor_id: '',
        invoice_number: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        payment_method_id: paymentMethods.length > 0 ? paymentMethods[0].id : '',
        receipt: null,
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      // On Error: Toast error, keep dialog open, do not reset form
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to record expense. Please try again.'
      toast.error(errorMsg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isSaving ? () => {} : onOpenChange}>
      <DialogContent
        className="sm:max-w-xl p-0 overflow-hidden border border-border/80 shadow-level-4 rounded-2xl bg-card"
        aria-describedby="dialog-description"
      >
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center gap-3.5 border-b border-border/70 px-6 py-5 bg-card/60 backdrop-blur-sm space-y-0 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
              Record Expense
            </DialogTitle>
            <DialogDescription
              id="dialog-description"
              className="text-xs text-muted-foreground truncate mt-0.5"
            >
              Add new transaction to{' '}
              <strong className="font-semibold text-foreground">
                {activeProject?.name ?? 'Villa Greenfields'}
              </strong>{' '}
              ledger
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          <fieldset disabled={isSaving} className="space-y-4">
            {/* Amount Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="amount"
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
                    id="amount"
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

            {/* Grid Row: Billing Date & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Billing Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="expense_date"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                >
                  <span>BILLING DATE</span>
                  <span className="text-destructive text-xs">*</span>
                </label>
                <Controller
                  name="expense_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="expense_date"
                      type="date"
                      className={cn(
                        'h-10 text-sm bg-muted/30 border-border/80',
                        errors.expense_date && 'border-destructive focus-visible:ring-destructive/30'
                      )}
                      aria-invalid={!!errors.expense_date}
                      aria-describedby={errors.expense_date ? 'date-error' : undefined}
                      disabled={isSaving}
                      {...field}
                    />
                  )}
                />
                {errors.expense_date && (
                  <p id="date-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.expense_date.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label
                  htmlFor="category_id"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                >
                  <span>CATEGORY</span>
                  <span className="text-destructive text-xs">*</span>
                </label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="category_id"
                      aria-label="Category"
                      aria-invalid={!!errors.category_id}
                      aria-describedby={errors.category_id ? 'category-error' : undefined}
                      disabled={isSaving || isLoadingCategories}
                      className={cn(
                        'flex h-10 w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
                        errors.category_id && 'border-destructive focus-visible:ring-destructive/30'
                      )}
                      {...field}
                    >
                      <option value="" disabled>
                        {isLoadingCategories ? 'Loading categories...' : 'Select category...'}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.category_id && (
                  <p id="category-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Row: Vendor / Contractor & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Vendor */}
              <div className="space-y-1.5">
                <label
                  htmlFor="vendor_id"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                >
                  <span>VENDOR / CONTRACTOR</span>
                  <span className="text-[10px] text-muted-foreground/70 font-normal">Optional</span>
                </label>
                <Controller
                  name="vendor_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="vendor_id"
                      aria-label="Vendor or Contractor"
                      disabled={isSaving || isLoadingVendors}
                      className="flex h-10 w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">
                        {isLoadingVendors ? 'Loading vendors...' : 'e.g. ABC Constructions (optional)'}
                      </option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
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
                    <select
                      id="payment_method_id"
                      aria-label="Payment Mode"
                      aria-invalid={!!errors.payment_method_id}
                      aria-describedby={errors.payment_method_id ? 'payment-error' : undefined}
                      disabled={isSaving || isLoadingPaymentMethods}
                      className={cn(
                        'flex h-10 w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
                        errors.payment_method_id && 'border-destructive focus-visible:ring-destructive/30'
                      )}
                      {...field}
                    >
                      <option value="" disabled>
                        {isLoadingPaymentMethods ? 'Loading payment modes...' : 'Select payment mode...'}
                      </option>
                      {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.payment_method_id && (
                  <p id="payment-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.payment_method_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Receipt Upload Drop Zone */}
            <div className="space-y-1.5">
              <label
                id="receipt-upload-label"
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>ATTACH RECEIPT</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Optional</span>
              </label>

              <input
                ref={fileInputRef}
                id="receipt-file-input"
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

              {!receiptFile ? (
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
                  aria-labelledby="receipt-upload-label"
                  className={cn(
                    'group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center cursor-pointer transition-all duration-150 hover:bg-primary/[0.03] hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20',
                    isDragging && 'border-primary bg-primary/[0.08] scale-[0.99]',
                    isSaving && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2 transition-transform group-hover:scale-105">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Click to upload or drag receipt file
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    PDF, PNG, JPG up to 10MB
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
                        {receiptFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(receiptFile.size)} • Ready to upload
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    disabled={isSaving}
                    onClick={handleRemoveReceipt}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Remove selected receipt"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {errors.receipt && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.receipt.message}
                </p>
              )}
            </div>

            {/* Project Notes / Bill Reference */}
            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>PROJECT NOTES / BILL REFERENCE</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Max 500 chars</span>
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="description"
                    rows={2}
                    maxLength={500}
                    placeholder="e.g. 50 bags OPC 53 Grade cement for Ground Floor beam shuttering"
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

            {/* Optional Invoice Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="invoice_number"
                className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
              >
                <span>INVOICE NUMBER</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Optional</span>
              </label>
              <Controller
                name="invoice_number"
                control={control}
                render={({ field }) => (
                  <Input
                    id="invoice_number"
                    type="text"
                    placeholder="e.g. INV-2024-001"
                    disabled={isSaving}
                    className="h-9 text-sm bg-muted/30 border-border/80"
                    {...field}
                  />
                )}
              />
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
                <span>Save Expense</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
