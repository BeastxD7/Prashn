"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { LoginSchema, type LoginSchemaType } from "@/zod/loginForm"
import { api } from "@/api-config/api"
import { useAuth } from "@/context/auth-provider"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login: loginWithContext } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  })

  const redirectPath = useMemo(() => {
    const from = searchParams?.get("from") ?? ""
    if (!from) return "/dashboard"
    if (!from.startsWith("/")) return "/dashboard"
    if (from.startsWith("//")) return "/dashboard"
    if (from === "/login" || from.startsWith("/auth")) return "/dashboard"
    return from
  }, [searchParams])

  async function onSubmit(data: LoginSchemaType) {
    setIsSubmitting(true)
    try {
  const res = loginWithContext
        ? await loginWithContext(data)
        : await api.user.login(data)
      if (!res) {
        toast.error("Login failed")
        return
      }
      const success = res?.data?.suctcess ?? res?.data?.status ?? res?.data?.data?.status

      if (success) {
        toast.success(res?.data?.message || "Logged in successfully")
        router.replace(redirectPath)
        router.refresh()
      } else {
        toast.error(res?.data?.message || "Login failed")
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = error?.response?.data?.message || error?.message || "Something went wrong"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="flex w-full max-w-xl flex-col gap-6 p-6 sm:p-8">
      <CardHeader className="space-y-3 p-0">
        <CardTitle>
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none">
            Welcome Back
          </h1>
        </CardTitle>
        <CardDescription>
          <p className="text-base sm:text-lg md:text-xl font-medium bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight">
            Sign in to continue to your account.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form className="grid w-full gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <FieldLabel>
              <Label className="font-bold text-sm sm:text-xl md:text-xl lg:text-xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">Username</Label>
            </FieldLabel>
            <FieldContent>
              <Input placeholder="username" {...register("username")} />
              <FieldError>{errors.username?.message}</FieldError>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>
              <Label className="font-bold text-sm sm:text-xl md:text-xl lg:text-xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">Password</Label>
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Your password" {...register("password")} />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              <FieldError>{errors.password?.message}</FieldError>
            </FieldContent>
          </Field>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/forgot-password" className="text-sm text-muted-foreground">Forgot password?</Link>
            <Button type="submit" disabled={isSubmitting} className="sm:ml-auto">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
