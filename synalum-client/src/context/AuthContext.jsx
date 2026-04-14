import { useEffect, useMemo, useState } from 'react' // React hooks untuk state & context
import { AuthContext } from './authContext.js' // Context disimpan terpisah supaya file ini hanya export component (Fast Refresh)
import { api, setApiAuthToken } from '../utils/api.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null) // JWT token (string)
  const [user, setUser] = useState(null) // Data user minimal (id, email, role)
  const [isLoading, setIsLoading] = useState(true) // Flag untuk menunggu proses load session dari localStorage
  const [alumniVerified, setAlumniVerified] = useState(false) // Status verifikasi alumni (sementara mock)

  useEffect(() => {
    // Saat app pertama kali dibuka, kita coba restore session dari localStorage
    const savedToken = localStorage.getItem('synalum_token') // Ambil token yang pernah disimpan
    const savedUserRaw = localStorage.getItem('synalum_user') // Ambil user yang pernah disimpan
    const savedAlumniVerified = localStorage.getItem('synalum_alumni_verified') // Simpan status verifikasi alumni (mock)

    try {
      const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null // Parse JSON user, kalau ada
      setToken(savedToken || null) // Simpan ke state
      setUser(savedUser) // Simpan ke state
      setApiAuthToken(savedToken || null)
      setAlumniVerified(savedAlumniVerified === 'true') // Konversi string ke boolean
    } catch {
      // Kalau JSON user rusak, kita anggap session invalid dan reset saja
      localStorage.removeItem('synalum_token')
      localStorage.removeItem('synalum_user')
      localStorage.removeItem('synalum_alumni_verified')
      setToken(null)
      setUser(null)
      setApiAuthToken(null)
      setAlumniVerified(false)
    } finally {
      setIsLoading(false) // Setelah selesai restore, app boleh lanjut render normal
    }
  }, [])

  async function login({ email, password }) {
    // Login = panggil backend, dapatkan token + user, lalu simpan ke state dan localStorage
    const response = await api.post('/api/auth/login', {
      email, // Backend kita saat ini menerima field email
      password, // Password plaintext hanya dikirim ke server untuk diverifikasi (server membandingkan dengan hash)
    })

    const nextToken = response.data?.token // Token JWT dari backend
    const nextUser = response.data?.user // User minimal dari backend

    setToken(nextToken) // Simpan token ke state
    setUser(nextUser) // Simpan user ke state
    localStorage.setItem('synalum_token', nextToken) // Persist token supaya tidak hilang saat refresh
    localStorage.setItem('synalum_user', JSON.stringify(nextUser)) // Persist user supaya app tahu role saat refresh
    setApiAuthToken(nextToken)
    if (nextUser?.role === 'alumni') {
      // Jika user alumni, kita asumsikan default belum terverifikasi kecuali sudah ada state sebelumnya
      const saved = localStorage.getItem('synalum_alumni_verified')
      const current = saved === 'true'
      setAlumniVerified(current)
    }

    return nextUser // Balikkan user agar UI bisa melakukan redirect sesuai role
  }

  function logout() {
    // Logout = hapus session dari state dan localStorage
    setToken(null)
    setUser(null)
    localStorage.removeItem('synalum_token')
    localStorage.removeItem('synalum_user')
    localStorage.removeItem('synalum_alumni_verified')
    setApiAuthToken(null)
    setAlumniVerified(false)
  }

  function markAlumniVerified(next = true) {
    // Fungsi pembantu untuk mengubah status verifikasi alumni (sementara mock)
    const val = next ? true : false // Hindari pemanggilan Boolean() yang terdeteksi redundant oleh ESLint
    setAlumniVerified(val)
    localStorage.setItem('synalum_alumni_verified', val ? 'true' : 'false')
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      login,
      logout,
      alumniVerified,
      markAlumniVerified,
      isAuthenticated: Boolean(token && user), // True jika token + user tersedia
    }),
    [token, user, isLoading, alumniVerified],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
