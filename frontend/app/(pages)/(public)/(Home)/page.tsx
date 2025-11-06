import HeroSection from "@/components/custom/HeroSection"
import FeaturesSection from "@/components/custom/FeaturesSection"
import FAQSection from "@/components/custom/FAQSection"
import Footer from "@/components/custom/Footer"

const Home = () => {
  return (
    <>
      <main className="w-full bg-linear-to-b from-transparent via-blue-50/30 to-purple-50/30 dark:via-blue-950/10 dark:to-purple-950/10">
        <HeroSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}

export default Home
