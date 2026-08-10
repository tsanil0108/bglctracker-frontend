import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/authApi'
import { extractErrorMessage } from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('bglc_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) localStorage.setItem('bglc_user', JSON.stringify(user))
    else localStorage.removeItem('bglc_user')
  }, [user])

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.login({ username, password })
      localStorage.setItem('bglc_token', data.token)
      setUser({ username: data.username, role: data.role })
      return true
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid username or password.'))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const registerAccount = useCallback(async (username, password, registrationKey) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.register({ username, password, registrationKey })
      localStorage.setItem('bglc_token', data.token)
      setUser({ username: data.username, role: data.role })
      return true
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create account. Check your registration key.'))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bglc_token')
    localStorage.removeItem('bglc_user')
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    registerAccount,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
