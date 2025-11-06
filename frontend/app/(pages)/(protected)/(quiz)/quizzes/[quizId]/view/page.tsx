"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react'
import { exportQuiz } from '@/lib/export-utils'
// small inline Toggle to avoid missing Switch component
function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`h-5 w-9 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border/40'}`} />
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </label>
  )
}
import { api } from '@/api-config/api'
import { toast } from 'sonner'

export default function GeneratedQuizPage() {
  const router = useRouter()
  const params = useParams()
  // next/navigation does not preserve location.state; always fetch by id
  const [data, setData] = useState<any>(null)
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
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [includeAnswers, setIncludeAnswers] = useState(true)

  useEffect(() => {
    let mounted = true
    const id = params?.quizId ?? params?.id
    if (!data && id) {
      setLoading(true)
      ;(async () => {
        // Helper: try multiple nesting shapes to find an auth-required message
        const findAuthMessage = (obj: any): string | null => {
          if (!obj) return null
          const candidates = [obj, obj.data, obj.payload, obj.data?.data, obj.response]
          for (const c of candidates) {
            if (!c || typeof c !== 'object') continue
            const status = c.status ?? c.success ?? null
            const message = c.message ?? c.msg ?? c.error ?? null
            if (status === false && typeof message === 'string' && /auth|authentication|required|login|sign in|signin/i.test(message)) {
              return message
            }
          }
          return null
        }

        try {
          // prefer query-style endpoint
          const res = await api.quiz.getQuizById(Number(id))
          const payload = res?.data ?? res ?? null
          const authMsg = findAuthMessage(res) ?? findAuthMessage(res?.data) ?? findAuthMessage(payload)

          // If server responds that authentication is required to view this quiz,
          // show a dedicated screen prompting the user to log in.
          if (mounted) {
            if (authMsg) {
              setAuthRequiredMessage(authMsg)
              setData(null)
            } else {
              setAuthRequiredMessage(null)
              setData(payload)
            }
          }
        } catch (err: any) {
          // axios throws for non-2xx statuses — check error response body for auth messages too
          const errData = err?.response?.data ?? err?.data ?? null
          const authMsgFromErr = findAuthMessage(err) ?? findAuthMessage(errData)
          if (mounted && authMsgFromErr) {
            setAuthRequiredMessage(authMsgFromErr)
            setData(null)
          } else {
            console.error('Failed to fetch generated quiz by id', err)
          }
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    }
    if (!id && !data) {
      // no id and no state — redirect back to generator
      const t = setTimeout(() => router.push('/generate-by-text'), 500)
      return () => {
        clearTimeout(t)
        mounted = false
      }
    }
    return () => { mounted = false }
  }, [data, params])

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
          <h2 className="text-lg font-semibold">Login to View this Quiz</h2>
          <p className="text-sm text-muted-foreground">{authRequiredMessage}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Create account</Button>
            </Link>
            <Button variant="ghost" onClick={() => router.back()}>Back</Button>
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
            <Link href="/generate-by-text">
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

  const handleExport = (format: 'pdf' | 'excel' | 'docx' | 'text') => {
    try {
      const quizData = {
        title: quiz.title || 'Quiz',
        description: quiz.description,
        questions: questions,
      }
      exportQuiz(quizData, format, includeAnswers, true) // always include watermark
      toast.success(`Exporting to ${format.toUpperCase()}...`)
      setShowExportMenu(false)
    } catch (err: any) {
      const msg = err?.message ?? 'Export failed'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-sky-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-sky-950/20 dark:to-blue-950/10 relative">
      {/* Decorative blur orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-4 py-8 sm:py-12 relative z-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 py-2">
            <h1 className="text-xl sm:text-2xl font-semibold bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-400 text-transparent break-words">{quiz.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{quiz.description}</p>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={() => router.back()} variant="outline" size="sm" className="text-xs sm:text-sm">Back</Button>
              
              {/* Export dropdown menu */}
              <div className="relative">
                <Button 
                  onClick={() => setShowExportMenu(!showExportMenu)} 
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  Export
                </Button>
                
                {showExportMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowExportMenu(false)}
                    />

                    {/* Dropdown menu - mobile: fixed bottom sheet; sm+: anchored dropdown */}
                    <div className=" sm:absolute fixed bottom-0 left-0 right-0 top-auto sm:top-full mt-0 sm:mt-2 sm:right-0 sm:left-auto w-full sm:w-64 max-w-none sm:max-w-xs rounded-t-lg sm:rounded-lg border border-border/60 bg-background backdrop-blur-sm shadow-lg z-20 p-3 h-fit">
                      <div className="mb-3 pb-3 border-b border-border/40">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input 
                            type="checkbox" 
                            checked={includeAnswers}
                            onChange={(e) => setIncludeAnswers(e.target.checked)}
                            className="w-4 h-4 rounded border-border flex-shrink-0"
                          />
                          <span className="text-sm">Include answers & explanations</span>
                        </label>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => handleExport('pdf')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium">Export as PDF</div>
                            <div className="text-[11px] text-muted-foreground truncate">Print-ready document</div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleExport('excel')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium">Export as Excel (CSV)</div>
                            <div className="text-[11px] text-muted-foreground truncate">Spreadsheet format</div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleExport('text')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium">Export as Text</div>
                            <div className="text-[11px] text-muted-foreground truncate">Plain text file</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {isOwner && !editableQuestions ? (
                <Button onClick={() => { setEditableQuestions(JSON.parse(JSON.stringify(questions))); setDirty(false); }} size="sm" className="text-xs sm:text-sm">Edit</Button>
              ) : null}

              {/* When editing, show privacy toggle for owners */}
              {/* Privacy toggle visible to owners in view mode (not when editing) - switch + label */}
              {/* Owner controls moved into a settings card below the header */}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isOwner ? (
            <div className="mb-4 rounded-2xl border border-border/60 bg-linear-to-br from-white/5 to-background/60 p-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-start sm:items-center gap-2 w-full">
                    <Toggle checked={isPublic} disabled={privacyLoading || Boolean(editableQuestions)} onChange={(v: boolean) => handleSetPrivacy(Boolean(v))} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{isPublic ? 'Public' : 'Private'}</div>
                      <div className="text-[11px] text-muted-foreground truncate">Whether anyone can access this quiz</div>
                    </div>
                  </div>

                  <div className="h-0 sm:h-8 sm:border-l sm:border-border/40" />

                  <div className="flex items-start sm:items-center gap-2 w-full">
                    <Toggle checked={requiresLogin} disabled={requireLoading || Boolean(editableQuestions)} onChange={(v: boolean) => handleSetRequireLogin(Boolean(v))} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{requiresLogin ? 'Requires login' : 'No login required'}</div>
                      <div className="text-[11px] text-muted-foreground truncate">Only signed-in users may take this quiz</div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground text-right">Owner settings</div>
              </div>
            </div>
          ) : null}
          {editableQuestions ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                {dirty ? (
                  <Button variant="outline" size="sm" onClick={() => { const q = data?.questions?.questions ?? data?.questions ?? data?.quiz?.questions ?? []; setEditableQuestions(JSON.parse(JSON.stringify(q))); setDirty(false); }} className="text-xs sm:text-sm">Reset</Button>
                ) : null}
                {dirty ? (
                  <Button size="sm" onClick={handleSaveAll} disabled={saving} className="text-xs sm:text-sm">{saving ? 'Saving...' : 'Save'}</Button>
                ) : null}
              </div>

              {editableQuestions.map((q: any, idx: number) => (
                <div key={q?.id ?? `${idx}-${q.content}`} className="rounded-2xl border border-border/60 bg-linear-to-br from-white/5 to-background/60 p-3 sm:p-4 space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Question {idx + 1}</div>
                      <Badge variant="outline" className="uppercase text-[10px] sm:text-xs">{String(q.type).replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={q.difficulty ?? ''}
                        onChange={(e) => updateQuestionField(idx, 'difficulty', e.target.value)}
                        className="rounded-md bg-background/50 px-2 py-1 text-xs sm:text-sm"
                      >
                        <option value="">Difficulty</option>
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Content</label>
                    <textarea value={q.content} onChange={(e) => updateQuestionField(idx, 'content', e.target.value)} className="w-full rounded-md border border-border/50 bg-background/50 p-2 text-xs sm:text-sm shadow-inner min-h-[80px]" />
                  </div>

                  {q.options ? (
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-muted-foreground">Options</label>
                      <div className="space-y-2">
                        {q.options.map((opt: string, oi: number) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} className="flex-1 rounded-md border border-border/50 bg-background/50 p-2 text-xs sm:text-sm" />
                            <Button variant="ghost" size="sm" type="button" onClick={() => removeOption(idx, oi)} className="text-xs">Remove</Button>
                          </div>
                        ))}
                        {isMCQ(q) ? (
                          <Button variant="outline" size="sm" type="button" onClick={() => addOption(idx)} className="text-xs sm:text-sm">Add option</Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Answer</label>
                    <input value={q.answer} onChange={(e) => updateQuestionField(idx, 'answer', e.target.value)} className="w-full rounded-md border border-border/50 bg-background/50 p-2 text-xs sm:text-sm" />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Explanation</label>
                    <textarea value={q.explanation ?? ''} onChange={(e) => updateQuestionField(idx, 'explanation', e.target.value)} className="w-full rounded-md border border-border/50 bg-background/50 p-2 text-xs sm:text-sm min-h-[60px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q: any, idx: number) => (
                <div key={q?.id ?? `${idx}-${q.content}`} className="rounded-2xl border border-border/60 bg-linear-to-br from-white/2 to-background/60 p-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-[11px] text-muted-foreground">Question {idx + 1}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="uppercase text-[11px]">{String(q.type).replace(/_/g, ' ')}</Badge>
                      {q.difficulty ? <Badge variant="outline" className="uppercase text-[11px]">{String(q.difficulty)}</Badge> : null}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-foreground break-words">{q.content}</p>

                  {q.options?.length ? (
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {q.options.map((opt: string, oi: number) => (
                        <li key={oi} className="flex items-start gap-2">
                          <span className="mt-0.5 text-xs font-medium text-muted-foreground shrink-0">{String.fromCharCode(65 + oi)}.</span>
                          <span className="break-words">{opt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-3 text-sm text-foreground">
                    <span className="font-medium">Answer:</span> <span className="break-words">{q.answer}</span>
                  </div>

                  {q.explanation ? (
                    <p className="mt-2 text-sm text-muted-foreground break-words"><span className="font-medium text-foreground">Explanation:</span> {q.explanation}</p>
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
