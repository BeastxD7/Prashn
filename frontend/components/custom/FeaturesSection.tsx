"use client"

import { FileText, Youtube, Mic, FileUp, Download, Sparkles } from "lucide-react"
import { useState } from "react"

const features = [
  {
    icon: FileText,
    title: "Generate from Text",
    description:
      "Paste any text and let AI create comprehensive quizzes instantly. Perfect for articles, blog posts, and study notes.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: Youtube,
    title: "YouTube Videos",
    description: "Extract key concepts from YouTube videos and transform them into interactive quizzes automatically.",
    gradient: "from-red-500 to-orange-600",
  },
  {
    icon: FileUp,
    title: "PDF Documents",
    description: "Upload PDFs and generate contextual questions based on the document content.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Mic,
    title: "Audio Files",
    description: "Convert audio lectures and recordings into quiz questions with intelligent extraction.",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: Download,
    title: "Easy Export",
    description: "Export your quizzes in multiple formats for sharing, printing, and integration.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Advanced AI ensures high-quality, relevant questions tailored to your content.",
    gradient: "from-yellow-500 to-orange-600",
  },
]

export default function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle gradient orbs in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none mb-4">
            Powerful Features for Modern Learning
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-medium bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight max-w-2xl mx-auto">
            Everything you need to create, customize, and share engaging quizzes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 md:p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="mb-4 inline-block">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${feature.gradient} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                  <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <svg
                      className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
