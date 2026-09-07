import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getPaymentMethods } from '@/services/paymentMethod.service'
import type { PaymentMethod } from '@/types/expense'

/**
 * Custom React Query hook to fetch active payment methods.
 * Architecture: Component -> Hook -> Service -> Supabase Client.
 */
export function usePaymentMethodsQuery() {
  return useQuery<PaymentMethod[], Error>({
    queryKey: queryKeys.paymentMethods,
    queryFn: getPaymentMethods,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
