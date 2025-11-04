"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/api-config/api"

type User = any

type AuthContextType = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
  login?: (payload: any) => Promise<any>
  register?: (payload: any) => Promise<any>
  getCredits?: () => Promise<any>
  refreshAccessToken?: () => Promise<any>
  setUser: (u: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.user.me()
      // Normalize multiple possible shapes returned by API.
      // Some APIs return { data: { user } }, others return { user } or { data: user }
      const maybeUser =
        res?.data?.data?.user ?? // ApiResponse<ApiData>.data.user
        res?.data?.user ?? // { user }
        res?.data?.data ?? // { data: user }
        null

      if (maybeUser) {
        setUser(maybeUser as any)
      } else {
        setUser(null)
      }
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])



  

  // Periodically or on focus/visibility, attempt a silent refresh so users don't get logged out
  // immediately when the access cookie expires. Throttle calls to avoid spamming the server.
  const lastRefreshRef = React.useRef<number>(0)
  useEffect(() => {
    const trySilentRefresh = async () => {
      try {
        const now = Date.now()
        if (now - lastRefreshRef.current < 30_000) return // 30s throttle
        lastRefreshRef.current = now

        // Call the refresh endpoint; if it succeeds, update the user state via refresh()
        await api.user.refresh()
        await refresh()
      } catch (e) {
        // ignore errors (will be handled by interceptor / user can re-login)
      }
    }

    const onFocus = () => {
      trySilentRefresh()
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") trySilentRefresh()
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [refresh])

  useEffect(() => {
    // fetch current user on mount
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.user.logout()
    } catch (err: any) {
      // ignore
      console.warn("logout failed", err)
    } finally {
      setUser(null)
      toast.success("Logged out")
      try {
        router.push("/login")
      } catch (_) {
        if (typeof window !== "undefined") window.location.href = "/login"
      }
    }
  }, [router])

  const register = useCallback(async (payload: any) => {
    try {
      const res = await api.user.register(payload)
      // Optionally refresh the user after successful registration
      try {
        await refresh()
      } catch (e) {
        // ignore; registration succeeded even if fetching profile failed
      }
      return res
    } catch (err) {
      throw err
    }
  }, [refresh])

  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await api.user.refresh()
      // After refresh, re-run refresh() to update user state
      try {
        await refresh()
      } catch (_) {
        // ignore
      }
      return res
    } catch (err) {
      throw err
    }
  }, [refresh])

  const getCredits = useCallback(async () => {
    try {
      const res = await api.user.getCredits()
      return res
    } catch (err) {
      throw err
    }
  }, [])

  const login = useCallback(
    async (payload: any) => {
      try {
        const res = await api.user.login(payload)
        // After login, attempt to refresh the current user (me endpoint) so state is authoritative
        try {
          await refresh()
        } catch (e) {
          // fallback: try to set user from login response if me failed
          const maybeUserFromLogin =
            res?.data?.data?.user ?? res?.data?.user ?? res?.data?.data ?? null
          if (maybeUserFromLogin) setUser(maybeUserFromLogin as any)
        }
        return res
      } catch (err) {
        throw err
      }
    },
    [refresh]
  )

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, login, register, getCredits, refreshAccessToken, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export default useAuth
