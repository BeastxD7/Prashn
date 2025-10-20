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
import { Link } from "react-router-dom"

type FormData = z.infer<typeof LoginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  function onSubmit(data: FormData) {
    console.log("Validated data:", data)
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
