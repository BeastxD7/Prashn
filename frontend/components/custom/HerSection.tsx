"use client"

import React from "react";
import Image from "next/image";
import { ContainerScroll } from "../ui/container-scroll-animation";



export default function HeroSection() {
  return (

     
    <div className="w-full h-full dark:bg-gradient-to-b dark:from-black dark:to-green-950 bg-gradient-to-b from-white to-green-200">
       
    <ContainerScroll
      titleComponent={
        <>
          <h1 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight ">
            Unleash the power of <br />
            <span className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl md:text-5xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
              <span className="bg-gradient-to-b from-green-500 to-green-900 bg-clip-text text-transparent"> प्रश्न | </span>Prashn</span>
          </h1>
        </>
      }
    >
      {/* Light theme image */}
      <Image
        src={`/hero-light.png`}
        alt="hero light"
        height={720}
        width={1400}
        className="mx-auto rounded-2xl object-cover h-full object-left-top block dark:hidden"
        draggable={false}
      />
  
      {/* Dark theme image */}
      <Image
        src={`/hero-dark.png`}
        alt="hero dark"
        height={720}
        width={1400}
        className="mx-auto rounded-2xl object-cover h-full object-left-top hidden dark:block"
        draggable={false}
      />

    </ContainerScroll>
    
  </div>


  )
}
