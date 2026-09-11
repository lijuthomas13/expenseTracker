import type { Expense } from '@/types/expense.types'

/**
 * Escapes a cell value for standard CSV formatting.
 * Encapsulates in quotes and escapes internal double quotes.
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).trim()
  return `"${str.replace(/"/g, '""')}"`
}

/**
 * Converts an array of expenses into a formatted CSV string with UTF-8 BOM
 * and triggers a file download in the browser.
 */
export function exportExpensesToCsv(
  expenses: Expense[],
  projectName: string = 'project'
): void {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Vendor / Payee',
    'Payment Method',
    'Invoice Number',
    'Status',
    'Amount (INR)',
  ]

  const rows = expenses.map((exp) => [
    exp.expense_date,
    exp.category?.name || 'General',
    exp.description || '',
    exp.vendor?.name || '',
    exp.payment_method?.name || '',
    exp.invoice_number || '',
    exp.status || 'Paid',
    exp.amount,
  ])

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]

  const csvContent = csvLines.join('\r\n')

  // Prepend UTF-8 BOM so Excel properly displays characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const sanitizedProjectName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40)
  const dateStamp = new Date().toISOString().split('T')[0]
  const filename = `expenses_${sanitizedProjectName}_${dateStamp}.csv`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
