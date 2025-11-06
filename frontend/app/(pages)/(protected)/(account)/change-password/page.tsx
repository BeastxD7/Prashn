"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/api-config/api"
import Link from "next/link"

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[!@#$%^&*]/, "Must contain at least one special character (!@#$%^&*)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  async function onSubmit(data: ChangePasswordSchemaType) {
    setIsSubmitting(true)

    try {
      const response = await api.user.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      if (response && response.status === 200) {
        setIsSuccess(true)
        toast.success("Password changed successfully!")
        reset()

        setTimeout(() => {
          // Clear local storage auth tokens
          localStorage.clear()
          // Redirect to login
          router.push("/login")
          router.refresh()
        }, 1500)
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error("Current password is incorrect")
      } else if (err?.response?.status === 400) {
        toast.error(err?.response?.data?.message || "Invalid password. Please check requirements.")
      } else if (err?.response?.status === 429) {
        toast.error("Too many attempts. Please try again later.")
      } else {
        toast.error(err?.response?.data?.message || "Error changing password")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 bg-linear-to-br from-background via-primary/5 to-background">
        <Card className="w-full max-w-lg border-border/40 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold">Password Changed</CardTitle>
            <CardDescription className="text-base">
              Your password has been updated successfully. You'll be logged out and redirected to login.
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
            
            <CardTitle className="font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none">Change Your Password</CardTitle>
            <CardDescription className="text-base sm:text-lg md:text-xl font-medium bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight">
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Field>
                <FieldLabel>
                  <Label className="text-sm font-medium">Current Password</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter your current password"
                      {...register("currentPassword")}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError>{errors.currentPassword?.message}</FieldError>
                </FieldContent>
              </Field>

              <div className="border-t pt-4">
                <Field>
                  <FieldLabel>
                    <Label className="text-sm font-medium">New Password</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Create a strong new password"
                        {...register("newPassword")}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle password visibility"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldError>{errors.newPassword?.message}</FieldError>
                  </FieldContent>
                </Field>

                <Field className="mt-4">
                  <FieldLabel>
                    <Label className="text-sm font-medium">Confirm New Password</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your new password"
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
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
