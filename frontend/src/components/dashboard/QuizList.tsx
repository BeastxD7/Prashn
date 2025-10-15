"use client"

import { useState } from "react"

export function QuizList() {
  const [items] = useState<any[]>([
    { id: "1", title: "Biology — Chapter 1", questions: 8 },
    { id: "2", title: "History — WW2 Overview", questions: 10 },
    { id: "3", title: "React Basics Quiz", questions: 6 },
  ])

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Saved Quizzes</h4>
        <button className="text-sm text-primary">See all</button>
      </div>

      <ul className="mt-3 space-y-3">
        {items.map((q) => (
          <li key={q.id} className="flex items-center justify-between p-3 bg-background/30 rounded-md">
            <div>
              <div className="font-medium">{q.title}</div>
              <div className="text-xs text-muted-foreground">{q.questions} questions</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-sm px-3 py-1 border rounded">Edit</button>
              <button className="text-sm px-3 py-1 bg-primary text-white rounded">Use</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
