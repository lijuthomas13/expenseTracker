import { createBrowserClient } from '@supabase/ssr'

/**
 * Resolve Supabase configuration supporting Vite environments.
 */
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string

/**
 * Singleton Supabase browser client instance.
 * Exported as `supabase` and reused across all service layers.
 * No React component directly communicates with this client.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type SupabaseBrowserClient = typeof supabase
