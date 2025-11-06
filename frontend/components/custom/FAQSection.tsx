"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does AI quiz generation work?",
    answer: "Prashn uses advanced AI to analyze your content from text, PDFs, YouTube videos, or audio files. It identifies key concepts, generates relevant questions, and creates comprehensive quizzes tailored to your material."
  },
  {
    question: "What file formats are supported?",
    answer: "You can generate quizzes from plain text, PDF documents, YouTube video links, and audio files. Our AI processes each format intelligently to extract the most important information."
  },
  {
    question: "How many quizzes can I create?",
    answer: "The number of quizzes depends on your plan. Basic plan includes 10 credits (5 quizzes), Pro includes 50 credits (25 quizzes), and Ultimate includes 150 credits (75 quizzes). Each quiz generation uses 2 credits."
  },
  {
    question: "Can I export my quizzes?",
    answer: "Yes! You can export your quizzes as PDF files with professional formatting, including watermarks and custom styling. Perfect for printing or sharing with students."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, new users get free credits to try out Prashn. You can generate your first few quizzes completely free to see how our AI-powered system works."
  },
  {
    question: "How accurate are the AI-generated questions?",
    answer: "Our AI is trained on educational content and uses advanced language models to ensure high-quality, relevant questions. However, we recommend reviewing generated quizzes to ensure they meet your specific needs."
  },
  {
    question: "Can I customize the quizzes?",
    answer: "Absolutely! After generation, you can edit questions, answers, and customize the quiz format to match your teaching style and requirements."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and UPI payments. All transactions are secure and processed through trusted payment gateways."
  }
]

export default function FAQSection() {
  return (
    <section className="w-full py-16 px-4 sm:py-20 sm:px-6 lg:py-24">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about Prashn AI Quiz Generator
          </p>
        </div>

        {/* FAQ Accordion */}
        <div 
          className="rounded-2xl border border-border/40 dark:border-white/10 p-6 sm:p-8"
          style={{
            background: "rgba(231, 236, 235, 0.02)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground dark:text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground dark:text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
