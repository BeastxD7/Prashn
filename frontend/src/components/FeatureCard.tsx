"use client"

import { Link } from "react-router-dom"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "./ui/button"

interface Tier {
  maxQuestions: number
  credits: number
}

interface FeatureItem {
  id: string
  title: string
  description: string
  route: string
  image: string
  tiers: Tier[]
}

interface FeatureCardProps {
  feature: FeatureItem
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <TooltipProvider>
      <div
        className={
          `group relative w-full
          h-40 sm:h-44 md:h-48
          rounded-xl overflow-hidden bg-slate-900/10 shadow-sm backdrop-blur-sm
          transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`
        }
      >
        {/* Full Background Image */}
        <img
          src={feature.image || "/placeholder.svg"}
          alt={feature.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Tooltip Button */}
        <div className="absolute top-2 right-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => e.preventDefault()}
                className="p-1.5 rounded-full backdrop-blur-sm text-white transition-all"
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
            >
              <p className="font-semibold mb-1 text-xs">Tiers:</p>
              {feature.tiers.map((tier, index) => (
                <p key={index} className="text-xs">
                  • {tier.maxQuestions} Questions → {tier.credits} Credits
                </p>
              ))}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Content (on top of image) */}
{/* Content (on top of image) */}
<div
  className="
    absolute bottom-0 w-full p-2 sm:p-2 space-y-1 z-10
    text-white
    bg-gradient-to-t from-black/60 to-transparent
    transition-opacity duration-500
    group-hover:bg-gradient-to-t group-hover:from-black/30
  "
>
  <h3 className="text-xs sm:text-sm font-semibold drop-shadow-md">
    {feature.title}
  </h3>
  <p className="text-[10px] sm:text-xs opacity-90 line-clamp-2">
    {feature.description}
  </p>
  <Link to={feature.route}>
    <Button className="w-full mt-1 sm:mt-1 bg-white/95 dark:bg-slate-900/90 dark:text-slate-200 text-slate-900 font-semibold py-1 rounded-md text-[10px] sm:text-xs transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700">
      Start Now
    </Button>
  </Link>
</div>
      </div>
    </TooltipProvider>
  )
}
