import { SlidersHorizontal } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { toast } from 'react-toastify'

export function GeneralSettingsPage() {
  return (
    <EmptyState
      icon={SlidersHorizontal}
      title="General Settings"
      description="Configure workspace preferences, default currency (INR ₹), financial fiscal cycles, and system alert thresholds."
      actionLabel="Save Configuration"
      onAction={() => toast.success('Configuration saved')}
    />
  )
}
