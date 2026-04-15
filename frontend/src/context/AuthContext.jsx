import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Restore session from localStorage on mount ─────────────
  useEffect(() => {
    const saved = localStorage.getItem('savoria_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed)
        // Optionally verify token is still valid
        // authAPI.getMe().catch(() => { setUser(null); localStorage.removeItem('savoria_user') })
      } catch {}
    }
    setLoading(false)
  }, [])

  // ── Register ───────────────────────────────────────────────
  const signup = async (name, email, password, role = 'user') => {
    const { data } = await authAPI.register({ name, email, password, role })
    const userData = { ...data.user, token: data.token }
    setUser(userData)
    localStorage.setItem('savoria_user', JSON.stringify(userData))
    return userData
  }

  // ── Login ──────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    const userData = { ...data.user, token: data.token }
    setUser(userData)
    localStorage.setItem('savoria_user', JSON.stringify(userData))
    return userData
  }

  // ── Logout ─────────────────────────────────────────────────
  const logout = () => {
    authAPI.logout().catch(() => {})  // fire-and-forget
    setUser(null)
    localStorage.removeItem('savoria_user')
  }

  // ── Update profile ─────────────────────────────────────────
  const updateProfile = async (updates) => {
    const { data } = await authAPI.updateProfile(updates)
    const updated  = { ...user, ...data.user }
    setUser(updated)
    localStorage.setItem('savoria_user', JSON.stringify(updated))
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
