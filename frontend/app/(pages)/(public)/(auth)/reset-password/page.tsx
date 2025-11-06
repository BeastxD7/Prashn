"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/api-config/api"
import Link from "next/link"

const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[!@#$%^&*]/, "Must contain at least one special character (!@#$%^&*)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get("token") ?? ""

    setToken(tokenParam)
    setInvalidToken(!tokenParam)
    setIsReady(true)
  }, [])

  async function onSubmit(data: ResetPasswordSchemaType) {
    if (!token) {
      toast.error("Invalid or missing reset token")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.user.resetPassword({
        token,
        password: data.newPassword,
      })

      if (response && response.status === 200) {
        setIsSuccess(true)
        toast.success("Password reset successfully!")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (err: any) {
      if (err?.response?.status === 400) {
        setInvalidToken(true)
        toast.error("Invalid or expired reset link. Please request a new one.")
      } else if (err?.response?.status === 429) {
        toast.error("Too many attempts. Please try again later.")
      } else {
        toast.error(err?.response?.data?.message || "Error resetting password")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while searchParams is being initialized
  if (!isReady) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 bg-linear-to-br from-background via-accent/5 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (invalidToken) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 bg-linear-to-br from-background via-primary/5 to-background">
        <Card className="w-full max-w-lg border-border/40 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-b from-red-400 to-red-900 bg-clip-text text-transparent leading-none">Invalid Reset Link</CardTitle>
            <CardDescription className="text-base sm:text-lg md:text-xl font-medium bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight">
              This reset link has expired or is invalid. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/forgot-password" className="block">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 bg-linear-to-br from-background via-primary/5 to-background">
        <Card className="w-full max-w-lg border-border/40 shadow-lg text-center">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-2">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-b from-green-400 to-green-900 bg-clip-text text-transparent leading-none">Password Reset Successfully</CardTitle>
            <CardDescription className="text-base">
              Your password has been updated. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 bg-linear-to-br from-background via-accent/5 to-background">
      <div className="w-full max-w-lg">
        <Card className="border-border/40 shadow-lg">
          <CardHeader className="space-y-2">
            
            <CardTitle className="font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none">Create New Password</CardTitle>
            <CardDescription className="text-base sm:text-lg md:text-xl font-medium bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight">
              Enter a strong password to secure your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Field>
                <FieldLabel>
                  <Label className="text-sm font-medium">New Password</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      {...register("newPassword")}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError>{errors.newPassword?.message}</FieldError>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label className="text-sm font-medium">Confirm Password</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      {...register("confirmPassword")}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError>{errors.confirmPassword?.message}</FieldError>
                </FieldContent>
              </Field>

              <p className="text-xs text-muted-foreground mt-2">Minimum 8 characters.</p>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
