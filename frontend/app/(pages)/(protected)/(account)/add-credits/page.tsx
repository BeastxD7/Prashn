"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Check, CreditCard, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/api-config/api"
import { useAuth } from "@/context/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const CREDIT_PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    credits: 10,
    price: 4.99,
    popular: false,
    accent: "from-sky-500/20 to-indigo-500/10",
    buttonVariant: "outline" as const,
    features: [
      "10 credits",
      "Generate up to 5 quizzes",
      "All question types",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 50,
    price: 14.99,
    popular: true,
    accent: "from-blue-500/25 to-cyan-500/15",
    buttonVariant: "default" as const,
    features: [
      "50 credits",
      "Generate up to 25 quizzes",
      "Priority generation",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    credits: 150,
    price: 39.99,
    popular: false,
    accent: "from-emerald-500/25 to-teal-500/10",
    buttonVariant: "outline" as const,
    features: [
      "150 credits",
      "Unlimited quiz generation",
      "Premium support",
    ],
  },
]

export default function AddCreditsPage() {
  const router = useRouter()
  const { user, refresh } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePurchase = async (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId)
    if (!pkg) return

    setLoading(true)
    setSelectedPackage(packageId)

    try {
      const response = await api.user.purchaseCredits({ packageId })

      if (response?.data?.success || response?.status === 200) {
        toast.success(`Successfully added ${pkg.credits} credits!`)
        await refresh()
        setTimeout(() => router.push("/dashboard"), 750)
      } else {
        throw new Error(response?.data?.message || "Purchase failed")
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? "Failed to purchase credits"
      toast.error(message)
      console.error("Purchase error:", error)
    } finally {
      setLoading(false)
      setSelectedPackage(null)
    }
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-background via-background/95 to-background/80">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="bg-linear-to-r from-sky-500 via-primary to-indigo-500 bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
            Add Credits
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Choose a plan that fits your pace and keep your quiz generation running without interruptions.
          </p>

          {user?.user && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                Current balance: <span className="font-semibold text-foreground">{user.user.credits ?? 0}</span> credits
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-background/70 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
                pkg.popular ? "ring-2 ring-primary/30" : ""
              }`}
            >
              {pkg.popular ? (
                <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground shadow-sm">
                  Most popular
                </Badge>
              ) : null}

              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-foreground">{pkg.name}</CardTitle>
                <CardDescription>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">${pkg.price}</span>
                    <span className="text-xs text-muted-foreground">USD</span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className={`rounded-2xl bg-linear-to-br ${pkg.accent} p-4 shadow-inner`}>
                  <div className="flex items-center justify-between text-sm text-foreground">
                    <span className="text-muted-foreground">Credits</span>
                    <div className="flex items-center gap-1 font-semibold">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-lg">{pkg.credits}</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-muted-foreground">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading && selectedPackage === pkg.id}
                  variant={pkg.buttonVariant}
                  className="w-full"
                >
                  {loading && selectedPackage === pkg.id ? (
                    <>
                      <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
