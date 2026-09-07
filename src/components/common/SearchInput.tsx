import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onClear?: () => void
  shortcutHint?: string
  containerClassName?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onClear,
      placeholder = 'Search...',
      shortcutHint = '⌘K',
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [innerValue, setInnerValue] = React.useState<string>(
      defaultValue || (value !== undefined ? value : '')
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setInnerValue(value)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInnerValue(val)
      onChange?.(val)
    }

    const handleClear = () => {
      setInnerValue('')
      onChange?.('')
      onClear?.()
    }

    return (
      <div className={cn('relative flex items-center w-full', containerClassName)}>
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={innerValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'flex h-[38px] w-full rounded-lg border border-border bg-card pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute right-2.5 flex items-center gap-1">
          {innerValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Clear search input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : shortcutHint ? (
            <kbd className="hidden sm:inline-flex select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {shortcutHint}
            </kbd>
          ) : null}
        </div>
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
