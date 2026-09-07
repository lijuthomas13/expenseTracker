import { z } from 'zod'

export const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().default('https://mock-project.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).default('mock-anon-key-placeholder'),
  VITE_APP_NAME: z.string().default('HomeBuild Expense Tracker'),
  VITE_DEFAULT_CURRENCY: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
})

export type EnvConfig = z.infer<typeof envSchema>
