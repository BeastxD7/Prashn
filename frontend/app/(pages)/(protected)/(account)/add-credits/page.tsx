"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Zap, Check, CreditCard, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/api-config/api"
import { useAuth } from "@/context/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open: () => void
      on: (event: string, callback: (data: any) => void) => void
      close: () => void
    }
  }
}

const STATIC_PLANS = [
  {
    id: "basic",
    name: "Basic",
    credits: 10,
    price: 399,
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
    price: 999,
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
    price: 1999,
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""
  const razorpayCallbackUrl = process.env.NEXT_PUBLIC_RAZORPAY_CALLBACK_URL ?? ""
  
  

  const handlePurchase = async (plan: string) => {
  const pkg = plans.find((p) => p.id === plan)
    if (!pkg) return

    if (!razorpayKey) {
      toast.error("Missing Razorpay key. Please contact support.")
      return
    }

    setLoading(true)
    setSelectedPlan(plan)

    try {
      const response = await api.payment.createOrder({ plan })
      const order = response?.data?.order ?? response?.data?.data?.order

      if (!response || !(response.status === 200 || response.data?.status) || !order?.id) {
        throw new Error(response?.data?.message || "Failed to create payment order")
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Payment gateway not ready. Please refresh and try again.")
        setLoading(false)
        setSelectedPlan(null)
        return
      }

      const paymentObject = new window.Razorpay({
        key: razorpayKey,
        amount: String(order.amount ?? pkg.price * 100),
        currency: order.currency ?? "INR",
        name: "Prashn",
        description: `${pkg.name} Credits Pack`,
        order_id: order.id,
        notes: {
          plan: pkg.id,
        },
        // callback_url: process.env.NEXT_PUBLIC_RAZORPAY_CALLBACK_URL|| undefined,
        prefill: {
          name: user?.user?.name ?? undefined,
          email: user?.user?.email ?? undefined,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled")
            setLoading(false)
            setSelectedPlan(null)
          },
        },
        handler: async (razorpayResponse: any) => {
          // Called in-browser after payment authorization. Verify on backend.
          const payment_id = razorpayResponse?.razorpay_payment_id
          const order_id = razorpayResponse?.razorpay_order_id
          const signature = razorpayResponse?.razorpay_signature

          if (!order_id || !payment_id || !signature) {
            toast.error("Missing payment details from gateway.")
            setLoading(false)
            setSelectedPlan(null)
            return
          }

          toast("Verifying payment...")
          try {
            const verifyResp = await api.payment.verifyPayment({ order_id, payment_id, signature })
            const verified = verifyResp?.data?.status || verifyResp?.data?.success || verifyResp?.status === 200

            if (verified) {
              toast.success("Payment verified — credits added!")
              try {
                await refresh()
              } catch (refreshError) {
                console.error("Failed to refresh after verify", refreshError)
              }
              setTimeout(() => router.push("/dashboard"), 800)
            } else {
              throw new Error(verifyResp?.data?.message || "Verification failed")
            }
          } catch (verifyError: any) {
            console.error("Payment verification failed", verifyError)
            toast.error(verifyError?.response?.data?.message ?? verifyError?.message ?? "Payment verification failed")
          } finally {
            setLoading(false)
            setSelectedPlan(null)
          }
        },
      })

      paymentObject.on("payment.failed", (error: any) => {
        console.error("Razorpay payment failed", error)
        toast.error(error?.error?.description ?? "Payment failed. Please try again.")
        setLoading(false)
        setSelectedPlan(null)
      })

      paymentObject.open()
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? "Failed to purchase credits"
      toast.error(message)
      console.error("Purchase error:", error)
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const [plans, setPlans] = useState<typeof STATIC_PLANS>(STATIC_PLANS)
  const [plansLoading, setPlansLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setPlansLoading(true)
      try {
        const res = await api.payment.getPlans()
        const remotePlans = res?.data?.plans ?? res?.data?.data?.plans
        if (mounted && Array.isArray(remotePlans) && remotePlans.length > 0) {
          setPlans(remotePlans)
        }
      } catch (err) {
        console.error("Failed to load plans", err)
      } finally {
        if (mounted) setPlansLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="min-h-screen w-full bg-linear-to-br from-blue-50 via-indigo-50/30 to-sky-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/10 relative">
        {/* Decorative blur orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
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
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-background/70 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular ? "ring-2 ring-primary/30" : ""
                }`}
              >
                {plan.popular ? (
                  <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground shadow-sm">
                    Most popular
                  </Badge>
                ) : null}

                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-foreground">{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                      <span className="text-xs text-muted-foreground">INR</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className={`rounded-2xl bg-linear-to-br ${plan.accent} p-4 shadow-inner`}>
                    <div className="flex items-center justify-between text-sm text-foreground">
                      <span className="text-muted-foreground">Credits</span>
                      <div className="flex items-center gap-1 font-semibold">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-lg">{plan.credits}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                    variant={plan.buttonVariant}
                    className="w-full"
                  >
                    {loading && selectedPlan === plan.id ? (
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

          
        </div>
      </div>
    </>
  )
}
