import { Users2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { toast } from 'react-toastify'

export function VendorsSettingsPage() {
  return (
    <EmptyState
      icon={Users2}
      title="Contractors & Material Vendors"
      description="Maintain site partners, contract documents, GSTIN numbers, bank details, and payment histories."
      actionLabel="Register Contractor"
      onAction={() => toast.info('Register contractor placeholder')}
    />
  )
}
