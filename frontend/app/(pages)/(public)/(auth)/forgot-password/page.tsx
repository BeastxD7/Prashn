"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/api-config/api"
import Link from "next/link"

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
})

type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isRateLimited, setIsRateLimited] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: ForgotPasswordSchemaType) {
    setIsSubmitting(true)
    setSuccessMessage("")
    setIsRateLimited(false)

    try {
      const response = await api.user.forgotPassword({
        email: data.email,
      })

      if (response && response.status === 200) {
        setSuccessMessage("If an account exists with this email, a reset link has been sent. Please check your inbox.")
        reset()
        toast.success("Reset link sent!")
      }
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setIsRateLimited(true)
        toast.error("Too many requests. Please try again later.")
      } else {
        setSuccessMessage("If an account exists with this email, a reset link has been sent. Please check your inbox.")
        toast.error("Error sending reset link")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 bg-linear-to-br from-background via-primary/5 to-background">
      <div className="w-full max-w-lg">
        <Card className="border-border/40 shadow-lg">
          <CardHeader className="space-y-2">
            
            <CardTitle className="font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none">Reset Your Password</CardTitle>
            <CardDescription className="text-base sm:text-lg md:text-xl font-medium bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {successMessage ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 border p-4">
                  <p className="text-sm">{successMessage}</p>
                </div>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Back to Login
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Field>
                  <FieldLabel>
                    <Label className="text-sm font-medium">Email Address</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="name@example.com"
                        {...register("email")}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    <FieldError>{errors.email?.message}</FieldError>
                  </FieldContent>
                </Field>

                <Button type="submit" disabled={isSubmitting || isRateLimited} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : isRateLimited ? (
                    "Try again later"
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline font-semibold">
                    Sign up
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
