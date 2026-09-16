import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Home,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { signUpSchema, type SignUpFormData } from '@/validations/auth.schema'
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

export function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [confirmationRequiredEmail, setConfirmationRequiredEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  })

  const onSubmit = async (data: SignUpFormData) => {
    setAuthError(null)
    try {
      const result = await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      })

      // Check if session was granted immediately (Email confirmation disabled)
      if (result.session) {
        toast.success('Account created successfully!')
        navigate(ROUTES.DASHBOARD, { replace: true })
      } else {
        // Email confirmation is enabled in Supabase
        setConfirmationRequiredEmail(data.email.trim())
        toast.info(
          'Account created. Please check your email to confirm your account.'
        )
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to create account. Please try again.'
      setAuthError(errorMessage)
      toast.error(errorMessage)
    }
  }

  // Email confirmation state view
  if (confirmationRequiredEmail) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-8 antialiased">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-level-1">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                Check your email
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Verification Required
              </p>
            </div>
          </div>

          <Card className="border border-border/80 bg-card shadow-level-2">
            <CardHeader className="space-y-2 pb-4 text-center">
              <CardTitle className="text-lg font-semibold text-foreground">
                Account created. Please check your email to confirm your account.
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                We've sent a confirmation link to{' '}
                <strong className="text-foreground font-medium">
                  {confirmationRequiredEmail}
                </strong>
                . Please click the link inside that email to activate your account and start managing your construction expenses.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Didn't receive the email?</p>
                <p>Check your spam folder or wait a few minutes before trying to register again.</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
              <Link to={ROUTES.LOGIN} className="w-full">
                <Button className="w-full h-10 font-semibold text-sm">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
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

        {/* SignUp Card */}
        <Card className="border border-border/80 bg-card shadow-level-2">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Create your account
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Start managing your construction expenses.
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
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider block"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  disabled={isSubmitting}
                  prefixNode={<UserIcon className="h-4 w-4" />}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

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
                  autoComplete="new-password"
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

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider block"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  prefixNode={<Lock className="h-4 w-4" />}
                  suffixNode={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="cursor-pointer hover:text-foreground transition-colors p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                      aria-label={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? 'confirmPassword-error' : undefined
                  }
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-xs text-destructive font-medium mt-1"
                  >
                    {errors.confirmPassword.message}
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center pt-0 pb-6">
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-semibold text-primary hover:underline transition-colors ml-1"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
