"use client"

import { useState, useEffect } from "react"
import { Zap, Plus, BookOpen } from "lucide-react"
import { Link } from 'react-router-dom'
import { FeatureCard } from "@/components/FeatureCard"
import { api } from "@/api/api"
import { useAuth } from "@/context/AuthContext"

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
  const user = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
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
  }, [])

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-background to-background/95 w-full pb-12 overflow-x-hidden">
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
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {user?.user?.firstName || "User"}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground dark:text-slate-400">
                Create amazing quizzes with AI-powered generation
              </p>

             {/* Stats section - two gradient cards showing totals */}
              {dashboardData?.stats ? (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-foreground mb-3">Stats</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-600 to-pink-500 text-white shadow-md">
                      <div className="text-xs opacity-90">Total Quizzes</div>
                      <div className="text-2xl sm:text-3xl font-bold">{dashboardData.stats.totalQuizzes}</div>
                      <div className="text-xs opacity-80 mt-1">Quizzes you've generated</div>
                    </div>

                    <div className="rounded-2xl p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md">
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
                        to={`/quizzes/${q.id}/view`}
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

            {/* Credits Card - hidden on xs (below `sm`) to avoid overlap; visible from `sm` upwards and sits in the right column on `lg` */}
            <div className="hidden sm:flex mt-4 sm:mt-0 sm:col-span-1 justify-end">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-2xl p-3 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow w-20 h-20 sm:w-56 sm:h-auto flex items-center justify-center">
                <div className="w-full h-full flex flex-col items-center sm:items-start justify-center gap-2">
                <div className="flex items-center gap-2 mb-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium opacity-90 hidden sm:inline">Available Credits</span>
                </div>

                <div className="text-2xl sm:text-3xl font-bold mb-0 sm:mb-2">{dashboardData?.credits || 0}</div>

                {/* Add credits: icon-only on small screens, full button on sm+ */}
                <div className="w-full flex items-center justify-center sm:justify-start">
                  <button className="sm:hidden w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>

                  <button className="hidden sm:inline-flex bg-white/20 hover:bg-white/30 text-white font-semibold py-1 px-3 rounded-lg transition-colors items-center justify-center gap-2 text-xs sm:text-sm">
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    Add Credits
                  </button>
                </div>
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
