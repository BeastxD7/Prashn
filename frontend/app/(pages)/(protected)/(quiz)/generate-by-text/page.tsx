"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  DifficultyLevel,
  GenerateQuizByTextPayload,
  QuestionType,
} from "@/api-config/types"
import { api } from "@/api-config/api"
import { useAuth } from "@/context/auth-provider"
import { AuthPrompt } from "@/components/auth/AuthPrompt"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const QUESTION_TYPES = ["MCQ", "True / False", "Short Answer", "Fill in the Blank"] as const
const QUESTION_TYPE_VALUE_MAP: Record<(typeof QUESTION_TYPES)[number], QuestionType> = {
  "MCQ": "MCQ",
  "True / False": "TRUE_FALSE",
  "Short Answer": "SHORT_ANSWER",
  "Fill in the Blank": "FILL_IN_THE_BLANK",
}
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const

// Credit tiers: <=5 -> 1 credit, <=15 -> 2 credits, <=30 -> 3 credits
const calculateCredits = (questionCount: number) => {
  if (questionCount <= 5) return 1
  if (questionCount <= 15) return 2
  return 3
}

const GenerateQuizByText = () => {
  const [quizName, setQuizName] = useState<string>("")
  const [description, setDescription] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [textContent, setTextContent] = useState("")
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([QUESTION_TYPES[0]])
  const [difficulty, setDifficulty] = useState("Medium")
  const [loading, setLoading] = useState(false)
  // result is intentionally not stored inline; we navigate to a dedicated results route
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const { user } = useAuth()

  const router = useRouter()

  const credits = calculateCredits(questionCount)

  const handleGenerate = async () => {
    if (!user) {
      setAuthPromptOpen(true)
      return
    }

    const trimmedTitle = quizName?.trim()
    if (!trimmedTitle || trimmedTitle.length < 5) {
      toast.error("Title must be at least 5 characters.")
      return
    }

    const trimmedContent = textContent.trim()
    if (trimmedContent.length < 5) {
      toast.error("Text content must be at least 5 characters.")
      return
    }

    const trimmedDescription = description.trim()
    if (showDescription && trimmedDescription.length > 0 && trimmedDescription.length < 10) {
      toast.error("Description must be at least 10 characters when provided.")
      return
    }

    const finalDescription =
      trimmedDescription.length >= 10
        ? trimmedDescription
        : "Auto-generated quiz based on the provided content."

    const normalizedDifficulty = difficulty.toLowerCase() as DifficultyLevel

    const mappedQuestionTypes = selectedTypes
      .map((label) => QUESTION_TYPE_VALUE_MAP[label as (typeof QUESTION_TYPES)[number]])
      .filter(Boolean) as QuestionType[]

    const payload: GenerateQuizByTextPayload = {
      title: trimmedTitle,
      description: finalDescription,
      content: trimmedContent,
      preferences: {
        numOfQuestions: questionCount,
        difficulty: normalizedDifficulty,
        questionTypes: mappedQuestionTypes.length ? mappedQuestionTypes : undefined,
      },
    }

    try {
  setLoading(true)
      const response = await api.quiz.generateByText(payload)
      const data = response?.data

      if (!data) {
        toast.error("Failed to generate quiz. Please try again.")
        return
      }

  toast.success("Quiz generated successfully.")

      // Navigate to the generated quiz page and pass the quiz data via location state
      try {
        // navigate to nested route including the quiz id so the URL becomes
        // /generateQuizByText/generate/:id and the results page can fetch by id
  const quizId = (data as any)?.quiz?.id ?? (data as any)?.quizId ?? (data as any)?.id
        if (quizId) {
          // navigate to canonical quiz resource route
          router.push(`/quizzes/${quizId}/view`)
        } else {
          // fallback: reload current page (no server id returned)
          try {
            router.push(window.location.pathname)
          } catch {
            // ignore
          }
        }
      } catch (e) {
        // ignore navigation error
      }

      // If backend returned credits charged, update local cached credits
      if (typeof data.creditsCharged === 'number') {
        setUserCredits((prev) => {
          if (prev === null) return prev
          return Math.max(0, prev - data.creditsCharged!)
        })
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Unable to generate quiz right now."
      toast.error(message)
      console.error("generateByText error", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const fetchCredits = async () => {
      try {
        const res = await api.user.getCredits()
        const data = res?.data?.data ?? res?.data
        // expected shape: ApiResponse<{ credits: number }>
        const credits = data?.credits ?? data?.data?.credits ?? null
        if (mounted) setUserCredits(typeof credits === 'number' ? credits : null)
      } catch (err: any) {
        console.error('Failed to fetch user credits', err)
        toast.error('Unable to fetch credits')
      }
    }

    fetchCredits()
    return () => { mounted = false }
  }, [])

  const isGenerateDisabled =
    loading || quizName.trim().length < 5 || textContent.trim().length < 5

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 via-sky-50/30 to-cyan-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-sky-950/10 relative">
      {/* Decorative blur orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/5 rounded-full blur-3xl" />
      </div>
      
      <AuthPrompt open={authPromptOpen} onOpenChange={setAuthPromptOpen} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8 relative z-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">Generator</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Create quiz from text</h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Paste your source material, adjust preferences, and generate a tailored quiz in seconds.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-border/60 bg-background/65 p-6 shadow-[0_35px_120px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Quiz details</h2>
                  <p className="text-sm text-muted-foreground">Describe what the quiz should cover.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</label>
                  <Input
                    placeholder="Enter quiz title"
                    className="bg-background/60"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                  />
                </div>

                

                {!showDescription && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-center border-dashed bg-background/40 text-sm font-medium"
                    onClick={() => setShowDescription(true)}
                  >
                    + Add description
                  </Button>
                )}

                {showDescription && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Description
                      </label>
                      <button
                        onClick={() => setShowDescription(false)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      className="h-24 w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground shadow-inner outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      placeholder="Add optional description for the quiz..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Text content
                  </label>
                  <textarea
                    className="h-48 w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground shadow-inner outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    placeholder="Paste the source material or notes the quiz should be generated from..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/60 bg-background/65 p-6 shadow-[0_35px_120px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
              <h3 className="text-base font-semibold text-foreground">Question preferences</h3>
              <div className="mt-6">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question types</span>
                  <div className="flex flex-wrap gap-2">
                    {QUESTION_TYPES.map((type) => {
                      const active = selectedTypes.includes(type)
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedTypes((current) => {
                              if (current.includes(type)) {
                                if (current.length === 1) return current
                                return current.filter((item) => item !== type)
                              }
                              return [...current, type]
                            })
                          }}
                          className="rounded-full"
                        >
                          <Badge variant={active ? "default" : "outline"} className="px-3 py-1">
                            {type}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="hidden sm:block rounded-3xl bg-linear-to-br from-blue-500 via-cyan-500 to-teal-500 p-6 text-white shadow-lg dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium opacity-90">Available Credits</p>
                    <p className="text-3xl font-bold">{userCredits ?? 0}</p>
                  </div>
                  <div>
                    <Button className="rounded-md bg-white text-blue-600 hover:bg-white/90 font-semibold px-4 py-2">+ Add Credits</Button>
                  </div>
                </div>
                <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  <p className="text-xs opacity-75">This quiz will consume</p>
                  <p className="text-lg font-semibold">{credits} credits</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-background/65 p-6 backdrop-blur">
              <h3 className="text-base font-semibold text-foreground">Quick settings</h3>
              <div className="mt-5">
                {/* Number of Questions */}
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="question-count"
                    className="text-sm font-medium text-foreground"
                  >
                    Number of questions
                  </label>
                  <Input
                    id="question-count"
                    type="number"
                    min={3}
                    max={30}
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(Math.max(3, Math.min(30, Number(e.target.value))))
                    }
                    className="w-20 rounded-lg bg-background/60 text-center"
                  />
                </div>

                {/* Difficulty */}
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">Difficulty</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {DIFFICULTY_LEVELS.map((level) => {
                      const active = difficulty === level
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className="rounded-full"
                        >
                          <Badge variant={active ? "default" : "outline"} className="w-full">
                            {level}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  "Generate Quiz"
                )}
              </button>
            </div>

            
            {/* <Toaster /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateQuizByText
