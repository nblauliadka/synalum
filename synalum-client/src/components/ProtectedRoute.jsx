import { Navigate, Outlet, useLocation } from 'react-router-dom' // Navigate untuk redirect, Outlet untuk nested routes
import { useAuth } from '../context/useAuth.js' // Ambil info login (token/user) dari AuthContext

export default function ProtectedRoute({ allowedRoles }) {
  // allowedRoles opsional: kalau diisi, hanya role tertentu yang boleh masuk
  const { isAuthenticated, isLoading, user, alumniVerified } = useAuth() // Ambil status auth + verifikasi alumni (mock) dari context
  const location = useLocation() // Lokasi saat ini, berguna untuk menyimpan “asal” halaman

  if (isLoading) {
    // Saat masih loading session dari localStorage, jangan langsung redirect (biar tidak flicker)
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="rounded-xl bg-white px-5 py-4 text-sm shadow-sm ring-1 ring-black/5">
          Memeriksa sesi login...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Kalau belum login, kita tendang balik ke landing page
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  // Logika khusus untuk role alumni:
  // - Jika user adalah alumni dan status verifikasinya (sementara) belum OK,
  //   paksa redirect ke halaman verifikasi agar tidak bisa membuka dashboard dulu.
  if (user?.role === 'alumni' && !alumniVerified) {
    return <Navigate to="/verifikasi-alumni" replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    // Jika route butuh role tertentu, kita cek apakah role user termasuk yang diizinkan
    const isAllowed = allowedRoles.includes(user?.role)
    if (!isAllowed) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet /> // Kalau lolos semua cek, lanjut render halaman yang dilindungi
}
