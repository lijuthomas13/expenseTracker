import { envSchema, type EnvConfig } from '@/validations/env.validation'

function parseEnv(): EnvConfig {
  const result = envSchema.safeParse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_DEFAULT_CURRENCY: import.meta.env.VITE_DEFAULT_CURRENCY,
  })

  if (!result.success) {
    console.warn(
      'Environment validation warnings (using fallback defaults for development):',
      result.error.flatten().fieldErrors
    )
    return {
      VITE_SUPABASE_URL: 'https://placeholder-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'placeholder-key',
      VITE_APP_NAME: 'HomeBuild Expense Tracker',
      VITE_DEFAULT_CURRENCY: 'INR',
    }
  }

  return result.data
}

export const env = parseEnv()
