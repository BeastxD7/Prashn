"use client"

import Link from "next/link"
import LoginForm from "./LoginForm"
export default function LoginPage() {


  return (
    <div className="w-full h-[90vh] flex items-center justify-center px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="w-full">
              <LoginForm />
              <div className="mt-4 text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary underline-offset-4 hover:underline">Create an account</Link>
              </div>
            </div>
        </div>
      </div>
  )
}
