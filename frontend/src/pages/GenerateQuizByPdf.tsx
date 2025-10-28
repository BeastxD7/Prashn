import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { Upload } from "lucide-react"

const QUESTION_TYPES = ["MCQ", "True / False", "Short Answer", "Fill in the Blank"]
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"]

const calculateCredits = (questionCount: number) => questionCount

const GenerateQuizByPdf = () => {
  const [quizName, setQuizName] = useState("Photosynthesis Quiz")
  const [description, setDescription] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([QUESTION_TYPES[0]])
  const [difficulty, setDifficulty] = useState("Medium")

  const credits = calculateCredits(questionCount)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
    } else {
      alert("Please upload a valid PDF file.")
    }
  }

  const handleGenerateQuiz = () => {
    if (!pdfFile) {
      alert("Please upload a PDF file before generating the quiz.")
      return
    }

    // TODO: You can add logic here to extract text from the PDF
    // using something like pdfjs or send to backend for quiz generation
    console.log("Generating quiz from:", pdfFile.name)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background/85">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">
              Generator
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Create quiz from PDF
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Upload a PDF, tweak your preferences, and generate a custom quiz in seconds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start rounded-full border border-border/60 bg-background/70 p-2 backdrop-blur sm:self-auto">
            <ModeToggle />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-8">
            {/* Quiz Details */}
            <section className="rounded-3xl border border-border/60 bg-background/65 p-6 shadow-[0_35px_120px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
              <h2 className="text-lg font-semibold text-foreground">Quiz details</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Describe what the quiz should cover.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Name
                  </label>
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

                {/* PDF Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Upload PDF
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="pdf-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/60 rounded-xl cursor-pointer bg-background/60 hover:bg-background/80 transition"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {pdfFile ? (
                            <span className="text-foreground font-medium">{pdfFile.name}</span>
                          ) : (
                            <>Click to upload or drag & drop your PDF</>
                          )}
                        </p>
                      </div>
                      <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Question Preferences */}
            <section className="rounded-3xl border border-border/60 bg-background/65 p-6 shadow-[0_35px_120px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
              <h3 className="text-base font-semibold text-foreground">Question preferences</h3>
              <div className="mt-6">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Question types
                  </span>
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

          {/* Right Side: Quick Settings + Credits */}
          <div className="space-y-8">
            <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-6 text-white shadow-lg dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium opacity-90">Available Credits</p>
                    <p className="text-3xl font-bold">4</p>
                  </div>
                  <div>
                    <Button className="rounded-md bg-white text-blue-600 hover:bg-white/90 font-semibold px-4 py-2">
                      + Add Credits
                    </Button>
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
              <div className="mt-5 flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Number of questions
                  </label>
                  <Input
                    type="number"
                    min={3}
                    max={30}
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(Math.max(3, Math.min(30, Number(e.target.value))))
                    }
                    className="bg-background/60 w-20 text-center rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Difficulty
                  </label>
                  <div className="mt-2 flex gap-2">
                    {DIFFICULTY_LEVELS.map((level) => {
                      const active = difficulty === level
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className="rounded-full"
                        >
                          <Badge variant={active ? "default" : "outline"} className="px-3 py-1">
                            {level}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600"
              >
                Generate Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateQuizByPdf
