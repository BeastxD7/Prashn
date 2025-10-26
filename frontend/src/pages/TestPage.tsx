import { FeatureCard } from "@/components/FeatureCard"

const mockFeature = {
  id: "generateQuizByText",
  title: "Generate Quiz from Text",
  description: "Create a quiz based on pasted or submitted text input.",
  route: "/generateQuizByText",
  image: "https://4kwallpapers.com/images/walls/thumbs_3t/7658.jpg",
  tiers: [
    { maxQuestions: 5, credits: 1 },
    { maxQuestions: 15, credits: 2 },
    { maxQuestions: 30, credits: 3 },
  ],
}

const TestPage = () => {
  return (
    <div className="flex justify-center items-center h-screen ">
      <FeatureCard feature={mockFeature} />
    </div>
  )
}

export default TestPage
