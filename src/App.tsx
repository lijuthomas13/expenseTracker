import { RouterProvider } from 'react-router-dom'
import { Providers } from '@/providers/Providers'
import { router } from '@/app/routes'

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
