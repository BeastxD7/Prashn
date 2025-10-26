"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoginSchema } from "@/zod/loginForm"
import { Link, useNavigate } from "react-router-dom"
import { api } from "@/api/api"
import { useAuth } from '@/context/AuthContext'
import { toast } from "sonner"
type FormData = z.infer<typeof LoginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

async function onSubmit(data: FormData) {
    try {
      const response = await api.user.login(data)

      const msg = response?.data?.message ?? response?.data?.data?.message ?? 'Login failed'

      // Consider obvious success when backend responds with status=true or success=true
      const ok = response?.data?.status === true || response?.data?.success === true || response?.status === 200

      if (ok) {
        toast.success(msg)
        // reset form and hide password input
        form.reset()
        setShowPassword(false)

        // Try to set user from login response if present, otherwise fetch profile
        try {
          const userFromResponse = response?.data?.user ?? response?.data?.data?.user ?? null
          if (userFromResponse) {
            // set the user in auth context so ProtectedRoute sees authenticated user
            setUser(userFromResponse as any)
          } else {
            // fallback: fetch the authenticated profile using the api helper
            const profileRes = await api.user.me()
            if (profileRes?.data?.status) {
              setUser(profileRes.data.user as any)
            }
          }
        } catch (e) {
          // if fetching profile fails, still let navigation happen; ProtectedRoute or App may re-check
          console.error('Failed to set user after login:', e)
        }

        navigate('/dashboard')
      } else {
        toast.error(msg)
      }

    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? 'Login failed'
      toast.error(msg)
      console.error('Login error', error)
    }
  }

  return (
    <Card className="w-full max-w-md border border-border shadow-lg mx-auto">
      <div className="p-6">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
          <p className="text-sm text-muted-foreground">Enter your credentials below</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input {...field} id="username" placeholder="Enter your username" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input {...field} id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button type="submit" className="w-full">Sign In</Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="text-primary font-medium">Register</Link>
          </div>
        </form>
      </div>
    </Card>
  )
}
