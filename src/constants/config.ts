export const APP_CONFIG = {
  name: 'HomeBuild',
  tagline: 'Expense Tracker',
  description: 'Precision Build Expense Architecture',
  defaultCurrency: 'INR' as const,
  defaultLocale: 'en-IN',
  currencySymbol: '₹',
  dateFormat: 'dd MMM yyyy',
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },
} as const
