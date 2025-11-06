"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-provider"
import RegisterForm from "./RegisterForm"

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center px-4 py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[90vh] flex items-center justify-center px-4 py-12 bg-linear-to-br from-purple-50 via-blue-50/30 to-cyan-50/20 dark:from-gray-950 dark:via-purple-950/50 dark:to-blue-950/30 relative">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-48 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="flex items-center justify-center relative z-10">
        <div className="w-full">
          <RegisterForm />
          <div className="mt-4 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
