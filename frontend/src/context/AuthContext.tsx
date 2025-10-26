import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/api/api'

type User = {
  id: string
  firstName: string
  lastName: string
  username?: string
  email?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.user.me()
        if (res?.data.status) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const logout = async () => {
    await api.user.logout() // backend clears cookie
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
