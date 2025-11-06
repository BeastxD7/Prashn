"use client"

import { FileText, Youtube, Mic, FileUp, Download, Sparkles, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Generate from Text",
    description: "Prashn AI intelligently analyzes your text content, distills complex materials into concise questions, and orchestrates comprehensive quizzes. One unified assistant—streamlining your entire quiz creation while orchestrating everything beyond it.",
    gradient: "from-blue-500 to-cyan-500",
    size: "large", // Takes 2 columns
  },
  {
    icon: Youtube,
    title: "YouTube Integration",
    description: "Prashn AI intelligently orchestrates your entire video-to-quiz workflow, seamlessly automating and optimizing every conversion while adapting to your evolving content through advanced extraction algorithms.",
    gradient: "from-red-500 to-orange-500",
    size: "large", // Takes 2 columns
  },
  {
    icon: FileUp,
    title: "PDF Upload",
    description: "Upload documents, AI creates quizzes with context.",
    gradient: "from-purple-500 to-pink-500",
    size: "small",
  },
  {
    icon: Mic,
    title: "Audio Processing",
    description: "Speak naturally, AI creates quizzes with context.",
    gradient: "from-green-500 to-emerald-500",
    size: "small",
  },
  {
    icon: Download,
    title: "Export Formats",
    description: "Conversations become searchable, organized exports.",
    gradient: "from-indigo-500 to-blue-500",
    size: "small",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "AI quiz engine for everyone you teach. Context + history.",
    gradient: "from-yellow-500 to-amber-500",
    size: "small",
  },
]

export default function FeaturesSection() {
  return (
    <section className="w-full py-16 px-4 sm:py-20 sm:px-6 lg:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground dark:text-white">
            Not Just Quizzes. Your Complete AI Teaching System
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl overflow-hidden border border-border/40 dark:border-white/10">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isLarge = feature.size === "large"
            
            return (
              <div
                key={index}
                className={`
                  relative overflow-hidden bg-background dark:bg-black p-8 sm:p-10
                  ${isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}
                  ${index === 0 || index === 1 ? 'sm:col-span-2' : 'sm:col-span-1'}
                  hover:bg-muted/5 dark:hover:bg-white/5 transition-colors duration-300
                  group
                `}
                style={{
                  background: "rgba(231, 236, 235, 0.02)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient.replace('from-', 'from-').replace('to-', 'to-')}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm sm:text-base text-muted-foreground dark:text-gray-400 leading-relaxed ${isLarge ? 'max-w-xl' : ''}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
