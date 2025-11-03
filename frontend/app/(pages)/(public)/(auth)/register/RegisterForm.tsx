"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { RegisterSchema } from "@/zod/RegisterForm"
import { api } from "@/api-config/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
} from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"

type RegisterFormValues = z.infer<typeof RegisterSchema>

export default function RegisterForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: RegisterFormValues) {
        setIsSubmitting(true)
        try {
            const res = await api.user.register(data)

            if (res && res.data && res.data.status) {
                toast.success(res.data.message || "Registered successfully")
                // redirect to login
                router.push("/login")
            } else {
                const msg = res?.data?.message || "Registration failed"
                toast.error(msg)
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Something went wrong"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-lg flex justify-between">
            <CardHeader>
                <CardTitle>
                    <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-4xl bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none">
                        Create Your Account
                    </h1>
                </CardTitle>
                <CardDescription>
                    <p className="font-bold text-xl sm:text-xl md:text-2xl lg:text-2xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">
                        Join us and start your journey today!
                    </p>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-3">
                        <Field>
                            <FieldLabel>
                                <Label className="font-bold text-sm sm:text-xl md:text-xl lg:text-xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">First name</Label>
                            </FieldLabel>
                            <FieldContent>
                                <Input placeholder="First name" {...register("firstName")} />
                                <FieldError>{errors.firstName?.message}</FieldError>
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>
                                <Label className="font-bold text-sm sm:text-xl md:text-xl lg:text-xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">Last name</Label>
                            </FieldLabel>
                            <FieldContent>
                                <Input placeholder="Last name" {...register("lastName")} />
                                <FieldError>{errors.lastName?.message}</FieldError>
                            </FieldContent>
                        </Field>
                    </div>

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
                            <Label className="font-bold text-sm sm:text-xl md:text-xl lg:text-xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">Email</Label>
                        </FieldLabel>
                        <FieldContent>
                            <Input placeholder="email@example.com" type="email" {...register("email")} />
                            <FieldError>{errors.email?.message}</FieldError>
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <Label className="font-bold text-sm sm:text-xl md:text-xl lg:text-xl bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-none">Password</Label>
                        </FieldLabel>
                        <FieldContent>
                            <div className="relative">
                                <Input
                                    placeholder="Your password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    aria-label="Toggle password visibility"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                </button>
                            </div>
                            <FieldError>{errors.password?.message}</FieldError>
                        </FieldContent>
                    </Field>

                    <div className="flex items-center justify-between pt-2">
                        <div />
                        <Button  type="submit" disabled={isSubmitting} className="ml-auto">
                            {isSubmitting ? "Creating…" : "Create account"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
