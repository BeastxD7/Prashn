"use client"

import { useState } from "react"

export function CreditsCard() {
  const [credits] = useState<number>(42)

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Credits</h4>
        <span className="text-sm text-muted-foreground">Balance</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-3xl font-bold">{credits}</div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Estimated</div>
          <div className="text-sm">{credits * 0.1} USD</div>
        </div>
      </div>

      <div className="mt-4">
        <button className="w-full rounded-md bg-primary text-white py-2">Buy Credits</button>
      </div>
    </div>
  )
}
