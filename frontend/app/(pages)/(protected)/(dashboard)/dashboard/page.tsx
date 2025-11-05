"use client"

import { useState, useEffect, use } from "react"
import { Zap, Plus, BookOpen, Loader2, FileText, HelpCircle } from "lucide-react"
import { FeatureCard } from "@/components/custom/FeatureCard"
import { useAuth } from "@/context/auth-provider"
import { api } from "@/api-config/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardData {
  credits: number
  features: Array<{
    id: string
    title: string
    description: string
    image: string
    tiers: Array<{ maxQuestions: number; credits: number }>
    route: string
  }>
  recentQuizzes?: Array<{
    id: number
    title: string
    createdAt: string
  }>
  stats?: {
    totalQuizzes: number
    totalQuestions: number
  }
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setDashboardData(null)
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const response = await api.dashboard.getData()
        if (response?.data?.data) {
          setDashboardData(response.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // If auth is still resolving, show a loader so users don't see the login prompt
  // while the auth provider is determining whether they're signed in.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-lg bg-card/70 p-4 shadow-md backdrop-blur">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading your dashboard…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    const loginUrl = `/login?from=${encodeURIComponent("/dashboard")}`
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border/60 bg-card/70 p-8 text-center shadow-[0_35px_120px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
          <h1 className="text-2xl font-semibold text-foreground">Login required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please sign in to access your dashboard and manage your quizzes.
          </p>
          <Link
            href={loginUrl}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen w-full  pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          {/* Use a 2-column grid on small screens so credits can sit at top-right, and switch to 3 columns on large */}
          {/* Use flex column on xs with absolute small credits so welcome area can be full width; switch to grid at sm */}
          {/* Layout: single column flow up to lg, switch to 3-column grid at lg (>=1024px) */}
          {/* Make credits stay in the right column starting at md (>=768px) so it doesn't drop below recent quizzes until smaller screens */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Welcome Section - spans 2 cols on large */}
              <div className="sm:col-span-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-2">
                Welcome Back,{" "}
                <span className="bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {user?.firstName || "User"}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground dark:text-slate-400">
                Create amazing quizzes with AI-powered generation
              </p>

              {/* Compact cards section - Credits + Stats in squares on mobile */}
              <div className="mt-6 sm:hidden">
                <div className="grid grid-cols-3 gap-3">
                  {/* Credits Card - compact square on mobile */}
                  <div className="bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl p-3 text-white shadow-md">
                    <Zap className="w-4 h-4 mb-2" />
                    <div className="text-xs opacity-90 mb-1">Credits</div>
                    <div className="text-xl font-bold">{dashboardData?.credits || 0}</div>
                  </div>

                  {/* Stats cards - compact squares */}
                  {dashboardData?.stats ? (
                    <>
                      <div className="rounded-xl p-3 bg-linear-to-br from-indigo-600 to-pink-500 text-white shadow-md">
                        <FileText className="w-4 h-4 mb-2" />
                        <div className="text-xs opacity-90 mb-1">Quizzes</div>
                        <div className="text-xl font-bold">{dashboardData.stats.totalQuizzes}</div>
                      </div>

                      <div className="rounded-xl p-3 bg-linear-to-br from-green-500 to-emerald-500 text-white shadow-md">
                        <HelpCircle className="w-4 h-4 mb-2" />
                        <div className="text-xs opacity-90 mb-1">Questions</div>
                        <div className="text-xl font-bold">{dashboardData.stats.totalQuestions}</div>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Add Credits button on mobile */}
                <Link
                  href="/add-credits"
                  className="mt-3 inline-flex bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors items-center justify-center gap-2 text-sm w-full"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  Add Credits
                </Link>
              </div>

             {/* Stats section - two gradient cards showing totals */}
              {dashboardData?.stats ? ( 
                <div className="mt-6 hidden sm:block">
                  <h3 className="text-sm font-medium text-foreground mb-3">Stats</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl p-4 bg-linear-to-br from-indigo-600 to-pink-500 text-white shadow-md">
                      <div className="text-xs opacity-90">Total Quizzes</div>
                      <div className="text-2xl sm:text-3xl font-bold">{dashboardData.stats.totalQuizzes}</div>
                      <div className="text-xs opacity-80 mt-1">Quizzes you've generated</div>
                    </div>

                    <div className="rounded-2xl p-4 bg-linear-to-br from-green-500 to-emerald-500 text-white shadow-md">
                      <div className="text-xs opacity-90">Total Questions</div>
                      <div className="text-2xl sm:text-3xl font-bold">{dashboardData.stats.totalQuestions}</div>
                      <div className="text-xs opacity-80 mt-1">Questions across your quizzes</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Recent quizzes created by the user (new) */}
              {dashboardData?.recentQuizzes && dashboardData.recentQuizzes.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Recent quizzes</h3>

                  <div className="flex flex-col md:flex-row md:space-x-3 gap-3">
                    {dashboardData.recentQuizzes.slice(0, 4).map((q) => (
                      <Link
                        key={q.id}
                        href={`/quizzes/${q.id}/view`}
                        className="block w-full lg:w-64 rounded-xl bg-card/60 p-3 shadow-md hover:shadow-lg transition-colors hover:bg-card/70"
                      >
                        <div className="flex items-start justify-between">
                          <div className="text-sm font-semibold text-foreground truncate">{q.title}</div>
                          <div className="text-xs text-muted-foreground ml-2">{new Date(q.createdAt).toLocaleDateString()}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">View & edit quiz</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Credits Card - shows on desktop in the right column */}
            <div className="hidden sm:flex sm:col-span-1 justify-end">
              <div className="bg-linear-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow w-56">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium opacity-90">Available Credits</span>
                  </div>
                  <div className="text-3xl font-bold mb-2">{dashboardData?.credits || 0}</div>
                  <Link
                    href="/add-credits"
                    className="inline-flex bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    Add Credits
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-4 sm:mb-6">
            Quiz Generation Features
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full h-60 sm:h-64 md:h-72 bg-card dark:bg-slate-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {dashboardData?.features.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && (!dashboardData?.features || dashboardData.features.length === 0) && (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground dark:text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2">
              No features available
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground dark:text-slate-400">
              Check back soon for new quiz generation features
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
