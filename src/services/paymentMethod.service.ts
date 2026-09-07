import { supabase } from '@/lib/supabase/client'
import type { PaymentMethod } from '@/types/expense'

/**
 * Service function to retrieve all active payment methods.
 * Directly communicates with Supabase and throws any client/network errors.
 * No React code resides in this service layer.
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as PaymentMethod[]
}
