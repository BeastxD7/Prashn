import HeroSection from "@/components/custom/HeroSection"
import FeaturesSection from "@/components/custom/FeaturesSection"
import FAQSection from "@/components/custom/FAQSection"
import Footer from "@/components/custom/Footer"

const Home = () => {
  return (
    <>
      <main className="w-full bg-background">
        <HeroSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}

export default Home
