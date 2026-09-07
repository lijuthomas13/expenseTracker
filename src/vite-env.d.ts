/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_DEFAULT_CURRENCY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
