"use client"

import { useState } from "react"

export function QuizGenerator() {
  const [sourceType, setSourceType] = useState<"text"|"pdf"|"audio"|"video"|"youtube">("text")
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function generate() {
    // Mock generation flow for UI preview
    setLoading(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 700))
    const mock = {
      title: `Generated quiz from ${sourceType}`,
      questions: [
        { question: "What is the main topic?", options: ["A","B","C","D"], answer: "A" },
        { question: "Choose the correct statement.", options: ["X","Y","Z"], answer: "Y" },
      ],
      source: inputText || "(no source provided)",
    }
    setResult(mock)
    setLoading(false)
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold mb-3">Generate Quiz</h3>

      <div className="flex gap-2 mb-4">
        <select value={sourceType} onChange={(e) => setSourceType(e.target.value as any)} className="rounded-md border px-2 py-1">
          <option value="text">Text</option>
          <option value="pdf">PDF</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="youtube">YouTube</option>
        </select>
        <button onClick={() => { /* TODO: file picker for pdf/audio/video */ }} className="rounded-md px-3 py-1 border">Attach file</button>
      </div>

      <div className="mb-4">
        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} rows={6} className="w-full rounded-md border p-3 bg-transparent text-sm" placeholder={sourceType === "youtube" ? "YouTube URL" : "Paste text here"} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={generate} disabled={loading} className="bg-primary text-white rounded-lg px-5 py-2 shadow">{loading ? "Generating..." : "Generate Quiz"}</button>
        <button onClick={() => { setInputText(""); setResult(null) }} className="border rounded-lg px-4 py-2">Reset</button>
      </div>

      {result && (
        <div className="mt-6 bg-background/50 border border-border rounded-md p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{result.title}</h4>
              <div className="text-xs text-muted-foreground">Source: {result.source}</div>
            </div>
            <div className="text-sm text-muted-foreground">{result.questions.length} questions</div>
          </div>

          <div className="mt-3 space-y-2">
            {result.questions.map((q: any, i: number) => (
              <div key={i} className="p-2 bg-card/40 rounded">
                <div className="font-medium text-sm">{i+1}. {q.question}</div>
                <div className="text-xs text-muted-foreground mt-1">Options: {q.options.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
