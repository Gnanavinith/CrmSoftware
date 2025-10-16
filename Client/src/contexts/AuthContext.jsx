
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('authUser')
    if (raw) {
      try {
        const userData = JSON.parse(raw)
        setUser(userData)
        const token = localStorage.getItem('token')
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`
          console.log('🔐 AuthContext: Token set for user:', userData.name, 'Role:', userData.role)
        }
      } catch (error) {
        console.error('❌ AuthContext: Error parsing user data:', error)
      }
    }
  }, [])

  const register = async ({ name, email, password }) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    const { token, user: u } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('authUser', JSON.stringify(u))
    localStorage.setItem('onboardingComplete', 'false')
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    setUser(u)
  }

  const login = async ({ email, password }) => {
    console.log('🔐 AuthContext: Attempting login for:', email)
    const res = await api.post('/api/auth/login', { email, password })
    const { token, user: u } = res.data
    console.log('🔐 AuthContext: Login successful for user:', u.name, 'Role:', u.role)
    localStorage.setItem('token', token)
    localStorage.setItem('authUser', JSON.stringify(u))
    if (!localStorage.getItem('onboardingComplete')) localStorage.setItem('onboardingComplete', 'false')
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    console.log('🔐 AuthContext: Authorization header set:', api.defaults.headers.common.Authorization)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('authUser')
    localStorage.removeItem('token')
    localStorage.removeItem('onboardingComplete')
    delete api.defaults.headers.common.Authorization
    setUser(null)
  }

  const value = useMemo(() => ({ user, register, login, logout }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}



