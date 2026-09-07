import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/app/dashboard/DashboardPage'
import { ExpensesPage } from '@/app/expenses/ExpensesPage'
import { ReportsPage } from '@/app/reports/ReportsPage'
import { SettingsLayout } from '@/app/settings/SettingsLayout'
import { GeneralSettingsPage } from '@/app/settings/GeneralSettingsPage'
import { CategoriesSettingsPage } from '@/app/settings/categories/CategoriesSettingsPage'
import { VendorsSettingsPage } from '@/app/settings/vendors/VendorsSettingsPage'
import { PaymentMethodsSettingsPage } from '@/app/settings/payment-methods/PaymentMethodsSettingsPage'
import { UsersSettingsPage } from '@/app/settings/users/UsersSettingsPage'
import { ProjectSettingsPage } from '@/app/settings/project/ProjectSettingsPage'
import { ROUTES } from '@/constants/routes'

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <GeneralSettingsPage />,
          },
          {
            path: 'categories',
            element: <CategoriesSettingsPage />,
          },
          {
            path: 'vendors',
            element: <VendorsSettingsPage />,
          },
          {
            path: 'payment-methods',
            element: <PaymentMethodsSettingsPage />,
          },
          {
            path: 'users',
            element: <UsersSettingsPage />,
          },
          {
            path: 'project',
            element: <ProjectSettingsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
    ],
  },
])
