import { useContext } from 'react'
import { AuthContext } from './authContext.js'

export function useAuth() {
  // Hook helper agar pemakaian context lebih gampang: const { user } = useAuth()
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  }
  return ctx
}
