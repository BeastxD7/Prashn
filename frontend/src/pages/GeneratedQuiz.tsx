import { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { api } from '@/api/api'
import { toast } from 'sonner'

export default function GeneratedQuizPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const dataFromState = (location.state as any)?.quiz ?? null
  const [data, setData] = useState<any>(dataFromState)
  const [loading, setLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [authRequiredMessage, setAuthRequiredMessage] = useState<string | null>(null)

  // Editable state and helpers (must be declared unconditionally to preserve Hooks order)
  const [editableQuestions, setEditableQuestions] = useState<any[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [isPublic, setIsPublic] = useState<boolean>(Boolean(data?.isPublic ?? data?.quiz?.isPublic ?? false))
  const [privacyLoading, setPrivacyLoading] = useState(false)
  const [requiresLogin, setRequiresLogin] = useState<boolean>(Boolean(data?.requiresLogin ?? data?.quiz?.requiresLogin ?? false))
  const [requireLoading, setRequireLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const id = params.id
    if (!data && id) {
      setLoading(true)
      ;(async () => {
        try {
          // prefer query-style endpoint
          const res = await api.quiz.getQuizById(Number(id))
          const payload = res?.data ?? null
          // If server responds that authentication is required to view this quiz,
          // show a dedicated screen prompting the user to log in.
          if (mounted) {
            if (payload && payload.status === false && typeof payload.message === 'string' && /auth/i.test(payload.message)) {
              setAuthRequiredMessage(payload.message)
              setData(null)
            } else {
              setAuthRequiredMessage(null)
              setData(payload)
            }
          }
        } catch (err) {
          console.error('Failed to fetch generated quiz by id', err)
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    }
    if (!id && !data) {
      // no id and no state — redirect back to generator
      const t = setTimeout(() => navigate('/generateQuizByText'), 500)
      return () => clearTimeout(t)
    }
    return () => { mounted = false }
  }, [data, params, navigate])

  // keep local isPublic synced when data loads/changes
  useEffect(() => {
    setIsPublic(Boolean(data?.isPublic ?? data?.quiz?.isPublic ?? false))
    setRequiresLogin(Boolean(data?.requiresLogin ?? data?.quiz?.requiresLogin ?? false))
  }, [data])

  const handleSetRequireLogin = async (next: boolean) => {
    const id = params.id ?? data?.quiz?.id ?? data?.id
    if (!id) {
      toast.error('Quiz id not available')
      return
    }
    try {
      setRequireLoading(true)
      await api.quiz.setRequireLogin(Number(id), { requiresLoginkey: next })
      setRequiresLogin(next)
      setData((d: any) => ({ ...(d ?? {}), requiresLogin: next, quiz: { ...(d?.quiz ?? {}), requiresLogin: next } }))
      toast.success(next ? 'Login required for this quiz' : 'Login no longer required')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to update setting'
      toast.error(msg)
    } finally {
      setRequireLoading(false)
    }
  }

  // NOTE: do not auto-enable edit mode on load. Owner can click Edit to start editing.

  function validateQuestion(q: any): boolean {
    if (!q.type || typeof q.type !== 'string') return false
    if (!q.content || typeof q.content !== 'string') return false
    if (q.options && !Array.isArray(q.options)) return false
    if (!q.answer || (typeof q.answer !== 'string' && !Array.isArray(q.answer))) return false
    if (q.explanation && typeof q.explanation !== 'string') return false
    if (q.difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty)) return false
    return true
  }

  // Helper: detect multiple-choice questions (common type names: MCQ, MULTIPLE_CHOICE, CHOICE)
  // We keep this loose to support several backend type strings like 'MCQ', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE', etc.
  const isMCQ = (q: any) => {
    const t = String(q?.type ?? '').toUpperCase()
    return t === 'MCQ' || t.includes('MULTIPLE') || t.includes('CHOICE') || t.includes('MC')
  }

  const updateQuestionField = (index: number, field: string, value: any) => {
    setEditableQuestions((prev) => {
      if (!prev) return prev
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      setDirty(true)
      return next
    })
  }

  const addOption = (qIndex: number) => {
    setEditableQuestions((prev) => {
      if (!prev) return prev
      const next = [...prev]
      const opts = Array.isArray(next[qIndex].options) ? [...next[qIndex].options] : []
      // Prevent accidental double-add of a blank option (e.g. duplicate events)
      if (opts.length > 0 && opts[opts.length - 1] === '') {
        // don't add another empty option if the last one is still empty
        next[qIndex] = { ...next[qIndex], options: opts }
        return next
      }
      // mark dirty when adding an option
      setDirty(true)
      opts.push('')
      next[qIndex] = { ...next[qIndex], options: opts }
      return next
    })
  }

  const removeOption = (qIndex: number, optIndex: number) => {
    setEditableQuestions((prev) => {
      if (!prev) return prev
      const next = [...prev]
      next[qIndex].options = next[qIndex].options.filter((_: any, i: number) => i !== optIndex)
      setDirty(true)
      return next
    })
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setEditableQuestions((prev) => {
      if (!prev) return prev
      const next = [...prev]
      next[qIndex].options = [...(next[qIndex].options || [])]
      next[qIndex].options[optIndex] = value
      setDirty(true)
      return next
    })
  }

  const handleSaveAll = async () => {
    if (!editableQuestions) return
    // validate
    for (let i = 0; i < editableQuestions.length; i++) {
      const ok = validateQuestion(editableQuestions[i])
      if (!ok) {
        toast.error(`Question ${i + 1} is invalid. Please check required fields.`)
        return
      }
    }

    try {
      setSaving(true)
      const payload = { questions: editableQuestions }
      const res = await api.quiz.editQuestions(payload)
      const respData = res?.data ?? null
      toast.success('Questions saved.')
      // After save, re-fetch authoritative quiz data from server to avoid stale shapes
      const id = params.id ?? data?.quiz?.id ?? data?.id
      if (id) {
        try {
          const fresh = await api.quiz.getQuizById(Number(id))
          const freshData = fresh?.data ?? respData ?? null
          if (freshData) {
            setData(freshData)
            const q = freshData?.questions?.questions ?? freshData?.questions ?? freshData?.quiz?.questions ?? []
            setEditableQuestions(JSON.parse(JSON.stringify(q)))
            setDirty(false)
          }
        } catch (fetchErr) {
          // fallback: use respData or local editableQuestions
          if (respData) {
            setData(respData)
            const q = respData?.questions?.questions ?? respData?.questions ?? respData?.quiz?.questions ?? []
            setEditableQuestions(JSON.parse(JSON.stringify(q)))
            setDirty(false)
          } else {
            setData((d: any) => ({ ...d, questions: { questions: editableQuestions }, quiz: { ...(d.quiz ?? {}), questions: editableQuestions } }))
          }
        }
      } else {
        // no id available, fall back to server response or local
        if (respData) {
          setData(respData)
          const q = respData?.questions?.questions ?? respData?.questions ?? respData?.quiz?.questions ?? []
          setEditableQuestions(JSON.parse(JSON.stringify(q)))
          setDirty(false)
        } else {
          setData((d: any) => ({ ...d, questions: { questions: editableQuestions }, quiz: { ...(d.quiz ?? {}), questions: editableQuestions } }))
        }
      }
    } catch (err: any) {
      console.error('Failed to save questions', err)
      const msg = err?.response?.data?.message ?? err?.message ?? 'Save failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (!data && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    )
  }
  if (authRequiredMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center max-w-lg">
          <h2 className="text-lg font-semibold">Authentication required</h2>
          <p className="text-sm text-muted-foreground">{authRequiredMessage}</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/login">
              <Button>Sign in</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Create account</Button>
            </Link>
            <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold">No generated quiz found</h2>
          <p className="text-sm text-muted-foreground">You can generate a quiz first.</p>
          <div className="flex justify-center">
            <Link to="/generateQuizByText">
              <Button>Go to Generator</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const quiz = data.quiz ?? {}
  // Support multiple response shapes:
  // - { questions: [...] }
  // - { questions: { questions: [...] } }
  // - { quiz: { questions: [...] } }
  const questions = data.questions?.questions ?? data.questions ?? quiz?.questions ?? []
  // ownership flag added by the API to indicate whether current user owns this quiz
  const isOwner = Boolean(data?.isOwner ?? data?.quiz?.isOwner ?? false)

  // (use handleSetPrivacy for changing privacy via the Switch)

  // set privacy to explicit value (used by Switch)
  const handleSetPrivacy = async (next: boolean) => {
    const id = params.id ?? data?.quiz?.id ?? data?.id
    if (!id) {
      toast.error('Quiz id not available')
      return
    }
    try {
      setPrivacyLoading(true)
      await api.quiz.setPrivacy(Number(id), { isPublic: next })
      setIsPublic(next)
      setData((d: any) => ({ ...(d ?? {}), isPublic: next, quiz: { ...(d?.quiz ?? {}), isPublic: next } }))
      toast.success(next ? 'Quiz is now public' : 'Quiz is now private')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to update privacy'
      toast.error(msg)
    } finally {
      setPrivacyLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background/85">
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-400 text-transparent">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
              {isOwner && !editableQuestions ? (
                <Button onClick={() => { setEditableQuestions(JSON.parse(JSON.stringify(questions))); setDirty(false); }}>Edit</Button>
              ) : null}

              {/* When editing, show privacy toggle for owners */}
              {/* Privacy toggle visible to owners in view mode (not when editing) - switch + label */}
              {/* Owner controls moved into a settings card below the header */}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isOwner ? (
            <div className="mb-4 rounded-2xl border border-border/60 bg-gradient-to-br from-white/5 to-background/60 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={isPublic} disabled={privacyLoading || Boolean(editableQuestions)} onCheckedChange={(v) => handleSetPrivacy(Boolean(v))} />
                    <div>
                      <div className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</div>
                      <div className="text-xs text-muted-foreground">Whether anyone can access this quiz</div>
                    </div>
                  </div>

                  <div className="hidden sm:block h-full border-l border-border/40 ml-2 mr-2" />

                  <div className="flex items-center gap-2">
                    <Switch checked={requiresLogin} disabled={requireLoading || Boolean(editableQuestions)} onCheckedChange={(v) => handleSetRequireLogin(Boolean(v))} />
                    <div>
                      <div className="text-sm font-medium">{requiresLogin ? 'Requires login' : 'No login required'}</div>
                      <div className="text-xs text-muted-foreground">Only signed-in users may take this quiz</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Owner settings</div>
              </div>
            </div>
          ) : null}
          {editableQuestions ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                {dirty ? (
                  <Button variant="outline" onClick={() => { const q = data?.questions?.questions ?? data?.questions ?? data?.quiz?.questions ?? []; setEditableQuestions(JSON.parse(JSON.stringify(q))); setDirty(false); }}>Reset</Button>
                ) : null}
                {dirty ? (
                  <Button onClick={handleSaveAll} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                ) : null}
              </div>

              {editableQuestions.map((q: any, idx: number) => (
                <div key={q?.id ?? `${idx}-${q.content}`} className="rounded-2xl border border-border/60 bg-gradient-to-br from-white/5 to-background/60 p-4 space-y-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-muted-foreground">Question {idx + 1}</div>
                      <Badge variant="outline" className="uppercase">{String(q.type).replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={q.difficulty ?? ''}
                        onChange={(e) => updateQuestionField(idx, 'difficulty', e.target.value)}
                        className="rounded-md bg-background/50 px-2 py-1 text-sm"
                      >
                        <option value="">Difficulty</option>
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Content</label>
                    <textarea value={q.content} onChange={(e) => updateQuestionField(idx, 'content', e.target.value)} className="w-full rounded-md border border-border/50 bg-background/50 p-2 text-sm shadow-inner" />
                  </div>

                  {q.options ? (
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Options</label>
                      <div className="space-y-2">
                        {q.options.map((opt: string, oi: number) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} className="flex-1 rounded-md border border-border/50 bg-background/50 p-2 text-sm" />
                            <Button variant="ghost" type="button" onClick={() => removeOption(idx, oi)}>Remove</Button>
                          </div>
                        ))}
                        {isMCQ(q) ? (
                          <Button variant="outline" size="sm" type="button" onClick={() => addOption(idx)}>Add option</Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="text-xs text-muted-foreground">Answer</label>
                    <input value={q.answer} onChange={(e) => updateQuestionField(idx, 'answer', e.target.value)} className="w-full rounded-md border border-border/50 bg-background/50 p-2 text-sm" />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Explanation</label>
                    <textarea value={q.explanation ?? ''} onChange={(e) => updateQuestionField(idx, 'explanation', e.target.value)} className="w-full rounded-md border border-border/50 bg-background/50 p-2 text-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q: any, idx: number) => (
                <div key={q?.id ?? `${idx}-${q.content}`} className="rounded-2xl border border-border/60 bg-gradient-to-br from-white/2 to-background/60 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Question {idx + 1}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase">{String(q.type).replace(/_/g, ' ')}</Badge>
                      {q.difficulty ? <Badge variant="outline" className="uppercase">{String(q.difficulty)}</Badge> : null}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-foreground">{q.content}</p>

                  {q.options?.length ? (
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {q.options.map((opt: string, oi: number) => (
                        <li key={oi} className="flex items-start gap-2">
                          <span className="mt-1 text-xs font-medium text-muted-foreground">{String.fromCharCode(65 + oi)}.</span>
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-3 text-sm text-foreground">
                    <span className="font-medium">Answer:</span> {q.answer}
                  </div>

                  {q.explanation ? (
                    <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Explanation:</span> {q.explanation}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
