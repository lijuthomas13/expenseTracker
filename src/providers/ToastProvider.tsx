import type { ReactNode } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTheme } from '@/hooks/useTheme'

export interface ToastProviderProps {
  children?: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { resolvedTheme } = useTheme()

  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={resolvedTheme}
        toastClassName="!rounded-xl !border !border-border !shadow-level-2 !font-sans !text-sm"
      />
    </>
  )
}
