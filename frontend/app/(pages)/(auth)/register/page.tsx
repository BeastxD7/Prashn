"use client"

import Link from "next/link"
import RegisterForm from "./RegisterForm"

export default function RegisterPage() {
  return (
    <div className="w-full h-[90vh] flex items-center justify-center px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="w-full">
              <RegisterForm />
              <div className="mt-4 text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
              </div>
            </div>
        </div>
      </div>
  )
}
