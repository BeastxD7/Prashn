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
            <div className="text-center mb-10">
              <p className="text-3xl sm:text-6xl md:text-7xl font-medium text-muted-foreground mb-2">Create Quizzes in</p>
              <h1 className="text-2xl sm:text-5xl md:text-6xl font-medium bg-linear-to-b from-blue-400 to-blue-900 bg-clip-text text-transparent leading-none">
                Seconds, Not Hours
              </h1>
            </div>

            

            <Link
                href="/register"
                className="px-8  py-3 bg-linear-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>

            <div className="flex justify-center gap-4 mt-4 flex-wrap px-4">
              <p className="mt-6 text-center text-base sm:text-lg md:text-xl font-medium bg-clip-text text-transparent bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight max-w-2xl mx-auto">
              Transform any content text, PDFs, YouTube videos, or audio into engaging quizzes powered by AI. Perfect
              for educators, trainers, and learners.
            </p>
              
            </div>
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
