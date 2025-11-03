"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { LoginSchema, type LoginSchemaType } from "@/zod/loginForm"
import { api } from "@/api-config/api"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  })



  async function onSubmit(data: LoginSchemaType) {
    setIsSubmitting(true)
    try {
      {
        const res = await api.user.login(data as any)
        if (res && (res.data?.success || res.data?.status || res.data?.data?.status)) {
          toast.success(res.data.message || "Logged in successfully")
            router.push("/dashboard")
        } else {
          toast.error(res?.data?.message || "Login failed")
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
  <Card className="w-full max-w-xl min-w-sm flex justify-between">
      <CardHeader>
        <CardTitle>
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-4xl bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none">
            Welcome back
          </h1>
        </CardTitle>
        <CardDescription>
          <p className="font-bold text-lg sm:text-lg md:text-xl lg:text-xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">
            Sign in to continue to your account.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
  <form className="grid gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
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

          <div className="flex items-center justify-between pt-2">
            <Link href="/forgot-password" className="text-sm text-muted-foreground">Forgot password?</Link>
            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
