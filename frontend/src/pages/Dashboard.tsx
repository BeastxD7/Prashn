"use client"

import { useState, useEffect } from "react"
import { Zap, Plus, BookOpen } from "lucide-react"
import { FeatureCard } from "@/components/FeatureCard"
import { api } from "@/api/api"

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
}

const Dashboard = () => {
  const user = { username: "JohnDoe" }
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Welcome Section - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-2">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {user?.username || "User"}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground dark:text-slate-400">
                Create amazing quizzes with AI-powered generation
              </p>
            </div>

            {/* Credits Card - Takes 1 column on large screens */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Available Credits</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{dashboardData?.credits || 0}</div>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                <Plus className="w-4 h-4 flex-shrink-0" />
                Add Credits
              </button>
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
