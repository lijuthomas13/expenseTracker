/**
 * Re-export the single canonical browser client from @/lib/supabase/client.
 * Ensures the singleton pattern is strictly enforced across the application.
 */
export { supabase, type SupabaseBrowserClient as SupabaseClientInstance } from '@/lib/supabase/client'
