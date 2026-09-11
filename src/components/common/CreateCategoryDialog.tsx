import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Tag,
  Loader2,
  Check,
  Hash,
  Layers,
  Hammer,
  Wrench,
  HardHat,
  Building2,
  Home,
  Zap,
  Droplets,
  Paintbrush,
  Truck,
  Box,
  DoorOpen,
  type LucideIcon,
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
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useCreateCategoryMutation } from '@/hooks/mutations'
import {
  createCategorySchema,
  HEX_COLOR_REGEX,
  type CreateCategorySchemaType,
} from '@/validations/category.schema'
import { cn } from '@/lib/utils'

export interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const AVAILABLE_ICONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'layers', label: 'General', icon: Layers },
  { key: 'hammer', label: 'Carpentry / Framing', icon: Hammer },
  { key: 'wrench', label: 'Plumbing & Hardware', icon: Wrench },
  { key: 'hardhat', label: 'Labor & Safety', icon: HardHat },
  { key: 'building', label: 'Structure & Masonry', icon: Building2 },
  { key: 'house', label: 'Architecture', icon: Home },
  { key: 'zap', label: 'Electrical', icon: Zap },
  { key: 'droplets', label: 'Sanitary / Water', icon: Droplets },
  { key: 'paint', label: 'Finishing / Paint', icon: Paintbrush },
  { key: 'truck', label: 'Logistics & Hauling', icon: Truck },
  { key: 'box', label: 'Materials / Storage', icon: Box },
  { key: 'door', label: 'Doors & Windows', icon: DoorOpen },
]

const QUICK_COLORS = [
  '#4F46E5', // Indigo
  '#2563EB', // Blue
  '#0284C7', // Sky
  '#0D9488', // Teal
  '#16A34A', // Green
  '#CA8A04', // Yellow/Gold
  '#EA580C', // Orange
  '#DC2626', // Red
  '#E11D48', // Rose
  '#9333EA', // Purple
  '#475569', // Slate
]

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCategoryDialogProps) {
  const { activeProject } = useActiveProject()
  const projectId = activeProject?.id ?? ''

  const createCategoryMutation = useCreateCategoryMutation()
  const isSubmitting = createCategoryMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      color: '#4F46E5',
      icon: 'layers',
    },
  })

  // Watch form fields for real-time live preview
  const watchedName = watch('name')
  const watchedColor = watch('color')
  const watchedIcon = watch('icon')

  const isValidHex = React.useMemo(() => {
    return HEX_COLOR_REGEX.test(watchedColor?.trim() || '')
  }, [watchedColor])

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        color: '#4F46E5',
        icon: 'layers',
      })
    }
  }, [open, reset])

  const onSubmit = async (data: CreateCategorySchemaType) => {
    if (!projectId) {
      toast.error('No active project found. Please select or create a project first.')
      return
    }

    // Ensure hex starts with #
    let formattedColor = data.color.trim()
    if (!formattedColor.startsWith('#')) {
      formattedColor = `#${formattedColor}`
    }

    try {
      await createCategoryMutation.mutateAsync({
        projectId,
        name: data.name.trim(),
        color: formattedColor,
        icon: data.icon || null,
      })

      toast.success(`Category "${data.name.trim()}" created successfully!`)
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create category. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Expense Category</DialogTitle>
              <DialogDescription>
                Create a new cost category for{' '}
                <span className="font-semibold text-foreground">
                  {activeProject?.name ?? 'this project'}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Category Name */}
          <div className="space-y-1.5">
            <label htmlFor="category-name-input" className="text-xs font-semibold text-foreground">
              Category Name <span className="text-destructive">*</span>
            </label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="category-name-input"
                  placeholder="e.g. Electrical & Wiring, Foundation, Masonry"
                  disabled={isSubmitting}
                  autoFocus
                />
              )}
            />
            {errors.name && (
              <p className="text-[12px] font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Color Hex Code Input with Live Swatch */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="category-color-input" className="text-xs font-semibold text-foreground">
                Color Hex Code <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">Format: #RRGGBB</span>
            </div>

            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="relative flex items-center">
                    <Input
                      {...field}
                      id="category-color-input"
                      placeholder="#4F46E5"
                      maxLength={7}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const val = e.target.value
                        // If user types without #, keep it or allow typing
                        field.onChange(val)
                      }}
                      onBlur={(e) => {
                        let val = e.target.value.trim()
                        if (val && !val.startsWith('#') && (val.length === 3 || val.length === 6)) {
                          val = `#${val}`
                          field.onChange(val)
                        }
                        field.onBlur()
                      }}
                      prefixNode={
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span
                            className={cn(
                              'h-4 w-4 rounded-full border border-border/80 shadow-sm transition-all shrink-0',
                              !isValidHex && 'bg-muted border-dashed border-muted-foreground/50'
                            )}
                            style={{
                              backgroundColor: isValidHex ? watchedColor : undefined,
                            }}
                            title={isValidHex ? `Color: ${watchedColor}` : 'Invalid hex color'}
                          />
                        </div>
                      }
                      suffixNode={
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-7 rounded border border-border/80 shadow-sm transition-all"
                            style={{
                              backgroundColor: isValidHex ? watchedColor : 'transparent',
                            }}
                          />
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {isValidHex ? watchedColor.toUpperCase() : 'Preview'}
                          </span>
                        </div>
                      }
                      className="pl-14 pr-24 font-mono uppercase"
                    />
                  </div>

                  {/* Preset quick colors for convenience */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
                    {QUICK_COLORS.map((hex) => {
                      const isSelected = watchedColor?.toUpperCase() === hex.toUpperCase()
                      return (
                        <button
                          key={hex}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setValue('color', hex, { shouldValidate: true })}
                          title={`Select ${hex}`}
                          className={cn(
                            'h-5 w-5 rounded-full border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                            isSelected
                              ? 'ring-2 ring-primary ring-offset-1 scale-110 border-transparent shadow-sm'
                              : 'border-border/60 hover:border-foreground/40'
                          )}
                          style={{ backgroundColor: hex }}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            />
            {errors.color && (
              <p className="text-[12px] font-medium text-destructive">{errors.color.message}</p>
            )}
          </div>

          {/* Icon Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Category Icon <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <span className="text-[11px] text-muted-foreground capitalize">
                Selected: {watchedIcon || 'layers'}
              </span>
            </div>

            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="grid grid-cols-6 gap-1.5 p-2 rounded-lg border border-border/70 bg-muted/20">
                  {AVAILABLE_ICONS.map((item) => {
                    const isSelected = (field.value || 'layers') === item.key
                    const IconComp = item.icon
                    return (
                      <button
                        key={item.key}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => field.onChange(item.key)}
                        title={item.label}
                        className={cn(
                          'flex flex-col items-center justify-center p-2 rounded-md transition-all text-xs focus:outline-none',
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border/60'
                        )}
                      >
                        <IconComp className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>

          {/* Live Preview Card */}
          <div className="rounded-lg border border-border/70 bg-card/60 p-3 shadow-xs space-y-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase block">
              Live Card Preview
            </span>
            <div className="flex items-center justify-between bg-card p-3 rounded-md border border-border/60">
              <div className="flex items-center gap-3">
                <CategoryIcon
                  icon={watchedIcon || 'layers'}
                  color={isValidHex ? watchedColor : '#4F46E5'}
                  size="md"
                  withBackground
                />
                <div>
                  <span className="font-semibold text-sm text-foreground block">
                    {watchedName.trim() || 'New Category Name'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Color: {isValidHex ? watchedColor.toUpperCase() : '#4F46E5'}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Category</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
