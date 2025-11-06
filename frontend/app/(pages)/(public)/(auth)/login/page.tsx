"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-provider"
import LoginForm from "./LoginForm"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 bg-linear-to-br from-blue-50 via-purple-50/30 to-pink-50/20 dark:from-gray-950 dark:via-blue-950/50 dark:to-purple-950/30 relative">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold underline-offset-4 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
