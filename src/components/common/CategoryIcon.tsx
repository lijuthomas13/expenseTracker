import React from 'react'
import {
  Factory,
  Building2,
  Home,
  DoorOpen,
  Utensils,
  Grid3X3,
  Box,
  Zap,
  Droplets,
  Paintbrush,
  Hammer,
  Wrench,
  Truck,
  HardHat,
  FileText,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  // FontAwesome mappings from Supabase RPC / categories table
  faindustry: Factory,
  fabuilding: Building2,
  fahouse: Home,
  fahome: Home,
  fadooropen: DoorOpen,
  fakitchenset: Utensils,
  fagrip: Grid3X3,
  facube: Box,
  fabolt: Zap,
  fafaucet: Droplets,
  fapaintroller: Paintbrush,
  fahammer: Hammer,
  fawrench: Wrench,
  fatruck: Truck,
  fahardhat: HardHat,
  fafileinvoice: FileText,

  // Direct / lowercase names
  industry: Factory,
  factory: Factory,
  building: Building2,
  house: Home,
  door: DoorOpen,
  kitchen: Utensils,
  grip: Grid3X3,
  cube: Box,
  box: Box,
  bolt: Zap,
  zap: Zap,
  electrical: Zap,
  plumbing: Droplets,
  faucet: Droplets,
  paint: Paintbrush,
  paintbrush: Paintbrush,
  hammer: Hammer,
  wrench: Wrench,
  truck: Truck,
  hardhat: HardHat,
  layers: Layers,
}

export interface CategoryIconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  icon?: string | null
  color?: string | null
  size?: 'sm' | 'md' | 'lg'
  withBackground?: boolean
}

function getCategoryIcon(icon?: string | null): LucideIcon {
  if (!icon) return Layers
  const normalizedKey = icon.toLowerCase().replace(/[-_\s]/g, '')
  return ICON_MAP[normalizedKey] || Layers
}

const iconSizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const containerSizes = {
  sm: 'h-6 w-6 rounded-md',
  md: 'h-8 w-8 rounded-lg',
  lg: 'h-10 w-10 rounded-xl',
}

export function CategoryIcon({
  icon,
  color,
  size = 'sm',
  withBackground = false,
  className,
  ...props
}: CategoryIconProps) {
  const IconComponent = getCategoryIcon(icon)

  if (withBackground) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 border border-border/60 transition-colors',
          containerSizes[size],
          className
        )}
        style={{
          backgroundColor: color ? `${color}15` : undefined,
          borderColor: color ? `${color}35` : undefined,
          color: color || 'currentColor',
        }}
        {...props}
      >
        {React.createElement(IconComponent, {
          className: iconSizes[size],
          'aria-hidden': true,
        })}
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center justify-center shrink-0', className)}
      style={{ color: color || 'currentColor' }}
      {...props}
    >
      {React.createElement(IconComponent, {
        className: iconSizes[size],
        'aria-hidden': true,
      })}
    </span>
  )
}
