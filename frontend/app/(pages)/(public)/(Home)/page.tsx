import HeroSection from "@/components/custom/HeroSection"
import FeaturesSection from "@/components/custom/FeaturesSection"
import FAQSection from "@/components/custom/FAQSection"
import Footer from "@/components/custom/Footer"


const Home = () => {
  return (
    <>
      <main className="w-full h-full dark:bg-linear-to-b dark:from-black dark:to-blue-950 bg-linear-to-b from-white to-blue-200">
        <HeroSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </>

  )
}

export default Home