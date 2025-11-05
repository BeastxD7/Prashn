"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface AuthPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthPrompt({ open, onOpenChange }: AuthPromptProps) {
  const router = useRouter()

  const handleLogin = () => {
    const currentUrl = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/"
    const encoded = encodeURIComponent(currentUrl || "/")
    onOpenChange(false)
    router.push(`/login?from=${encoded}`)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Authentication Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to be logged in to perform this action. Please log in to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin}>Login</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
