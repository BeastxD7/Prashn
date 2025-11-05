"use client"

import { Suspense } from "react"
import Link from "next/link"
import LoginForm from "./LoginForm"
export default function LoginPage() {


  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg">
        <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  )
}
