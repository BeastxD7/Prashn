"use client"

import Image from "next/image";
import { ContainerScroll } from "../ui/container-scroll-animation";
import { HoverBorderGradient } from "../ui/hover-border-gradient";
import Link from "next/link";



export default function HeroSection() {
  return (

     
<>
<ContainerScroll
          titleComponent={
            <>
              <h1 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl md:text-4xl lg:text-7xl font-sans md:py-10 relative z-20 font-bold tracking-tight ">
                Unleash the power of <br />
                <span className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl md:text-5xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
                  <span className="bg-gradient-to-b from-blue-500 to-blue-900 bg-clip-text text-transparent"> प्रश्न | </span>Prashn</span>
              </h1>

              <div className="flex justify-center pb-4 gap-4">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                >
                  <Link href="/register">Get Started</Link>
                </HoverBorderGradient>
              </div>

              <p className="mt-6text-center text-base md:text-lg lg:text-xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white tracking-tight leading-tight">
                AI-Powered Quiz Generator for Effortless Learning
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
