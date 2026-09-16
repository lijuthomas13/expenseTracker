import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff, Loader2, Home, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/validations/auth.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'

interface LocationStateWithFrom {
  from?: {
    pathname: string
    search?: string
    hash?: string
  }
}

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  })

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    try {
      await signIn({
        email: data.email,
        password: data.password,
      })

      toast.success('Signed in successfully')

      // Redirect to the intended protected route if one exists, otherwise to dashboard
      const state = location.state as LocationStateWithFrom | null
      const destination = state?.from
        ? `${state.from.pathname}${state.from.search || ''}${state.from.hash || ''}`
        : ROUTES.DASHBOARD

      navigate(destination, { replace: true })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-8 antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-level-1">
            <Home className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-display text-base font-bold tracking-tight text-foreground">
              HomeBuild
            </span>
            <span className="block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Expense Tracker
            </span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-border/80 bg-card shadow-level-2">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sign in to your account to continue managing your construction expenses.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Inline Error Alert */}
            {authError && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider block"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="username"
                  disabled={isSubmitting}
                  prefixNode={<Mail className="h-4 w-4" />}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider block"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  prefixNode={<Lock className="h-4 w-4" />}
                  suffixNode={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="cursor-pointer hover:text-foreground transition-colors p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 mt-2 font-semibold text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center pt-0 pb-6">
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link
                to={ROUTES.SIGNUP}
                className="font-semibold text-primary hover:underline transition-colors ml-1"
              >
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
