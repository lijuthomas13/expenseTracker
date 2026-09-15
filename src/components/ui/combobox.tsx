import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
  color?: string
  description?: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  allowClear?: boolean
  error?: boolean
  id?: string
  'aria-label'?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found.',
  disabled = false,
  className,
  allowClear = false,
  error = false,
  id,
  'aria-label': ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || placeholder}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm font-normal text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
            !selectedOption && 'text-muted-foreground',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate text-left">
            {selectedOption?.icon && (
              <span className="shrink-0 flex items-center">{selectedOption.icon}</span>
            )}
            {selectedOption?.color && (
              <span
                className="h-3 w-3 rounded-full shrink-0 border border-border/60"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {allowClear && selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    onChange('')
                  }
                }}
                className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Clear selection"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(isSelected && allowClear ? '' : option.value)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {option.icon && (
                        <span className="shrink-0 flex items-center">{option.icon}</span>
                      )}
                      {option.color && (
                        <span
                          className="h-3 w-3 rounded-full shrink-0 border border-border/60"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <div className="flex flex-col truncate">
                        <span className="truncate font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isSelected ? 'opacity-100 text-primary' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
