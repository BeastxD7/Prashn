import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const packs = [
  { id: 'small', credits: 10, price: 199 },
  { id: 'medium', credits: 50, price: 799 },
  { id: 'large', credits: 200, price: 2499 },
]

export default function AddCreditsPage() {
  const [selected, setSelected] = useState<string | null>(packs[0].id)
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()

  const currentPack = packs.find((p) => p.id === selected) ?? packs[0]

  const handlePurchase = async () => {
    if (!currentPack) return
    try {
      setProcessing(true)
      // Placeholder: integrate with backend/payment gateway here.
      await new Promise((res) => setTimeout(res, 900))
      toast.success(`Purchased ${currentPack.credits} credits`)
      // Navigate back to dashboard where credits will be shown/refreshed
      navigate('/dashboard')
    } catch (err) {
      console.error('Purchase failed', err)
      toast.error('Failed to complete purchase')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 w-full bg-gradient-to-br from-background to-background/95">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-400 text-transparent">Add Credits</h1>
            <p className="text-sm text-muted-foreground mt-1">Buy credits to generate more quizzes with AI.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {packs.map((p) => (
            <div key={p.id} className={`rounded-2xl p-4 border border-border/60 bg-card/60 shadow-sm ${selected === p.id ? 'ring-2 ring-indigo-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Credits</div>
                  <div className="text-2xl font-bold">{p.credits}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${(p.price / 100).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">one-time</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Pack</div>
                <Badge variant={selected === p.id ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelected(p.id)}>{p.id}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-white/5 to-background/60 p-6">
          <h3 className="text-sm font-medium">Purchase summary</h3>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Credits</div>
            <div className="text-sm font-semibold">{currentPack.credits}</div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-sm font-semibold">${(currentPack.price / 100).toFixed(2)}</div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handlePurchase} disabled={processing}>{processing ? 'Processing...' : 'Purchase'}</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
