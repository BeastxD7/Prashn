"use client"

import Image from "next/image"
import { ContainerScroll } from "../ui/container-scroll-animation"
import Link from "next/link"

export default function HeroSection() {
  return (
    <>
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-center text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-4">
              Create Quizzes in
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Seconds, Not Hours
              </span>
            </h1>

            <div className="flex justify-center gap-4 mt-8 flex-wrap px-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              
            </div>
            <p className="mt-6 text-center text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform any content—text, PDFs, YouTube videos, or audio—into engaging quizzes powered by AI. Perfect
              for educators, trainers, and learners.
            </p>
          </>
        }
      >
        {/* Light theme image */}
        <Image
          src={`/light-hero.png`}
          alt="hero light"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top block dark:hidden"
          draggable={false}
        />

        {/* Dark theme image */}
        <Image
          src={`/dark-hero.png`}
          alt="hero dark"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top hidden dark:block"
          draggable={false}
        />
      </ContainerScroll>
    </>
  )
}
