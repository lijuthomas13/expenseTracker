import { CreditCard } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { toast } from 'react-toastify'

export function PaymentMethodsSettingsPage() {
  return (
    <EmptyState
      icon={CreditCard}
      title="Disbursement & Payment Channels"
      description="Configure accounts for RTGS settlements, NEFT transfers, corporate credit cards, and cheque books."
      actionLabel="Add Payment Account"
      onAction={() => toast.info('Add payment method placeholder')}
    />
  )
}
