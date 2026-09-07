import { ShieldCheck } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { toast } from 'react-toastify'

export function UsersSettingsPage() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="Team Members & Access Control"
      description="Invite architects, structural engineers, cost quantity surveyors, and project leads with role-based permissions."
      actionLabel="Invite Team Member"
      onAction={() => toast.info('Invite user modal placeholder')}
    />
  )
}
