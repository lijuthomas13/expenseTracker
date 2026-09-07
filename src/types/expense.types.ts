export type ExpenseStatus =
  | 'paid'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overrun'
  | 'draft'

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP'

export interface ExpenseCategoryBreakdown {
  id: string
  name: string
  code: string
  color: string
  budgetAllocation: number
  spent: number
  icon?: string
}

export interface VendorContractor {
  id: string
  name: string
  initials: string
  specialty: string
  totalPaid: number
  contractsCount: number
  invoicesCount: number
  progressPercentage: number
  status: 'active' | 'settled' | 'in_progress' | 'completed'
}

export interface ExpenseRecord {
  id: string
  date: string
  category: string
  categoryCode: string
  vendor: string
  paymentMethod: string
  amount: number
  status: ExpenseStatus
  description?: string
  invoiceNumber?: string
}

export interface ConstructionMilestone {
  id: string
  title: string
  badgeText: string
  badgeVariant: 'success' | 'warning' | 'primary' | 'secondary'
  verificationDate: string
  note: string
  imageUrl: string
}

export interface ExpenseCategoryRef {
  id: string
  name: string
  color?: string | null
  icon?: string | null
}

export interface ExpenseVendorRef {
  id: string
  name: string
}

export interface ExpensePaymentMethodRef {
  id: string
  name: string
}

export interface Expense {
  id: string
  amount: number
  expense_date: string
  description: string | null
  status: string
  invoice_number: string | null
  created_at: string
  category: ExpenseCategoryRef | null
  vendor: ExpenseVendorRef | null
  payment_method: ExpensePaymentMethodRef | null
}

export interface PaginatedExpensesResponse {
  data: Expense[]
  count: number
}

