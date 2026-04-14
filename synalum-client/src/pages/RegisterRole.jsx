import { useMemo, useState } from 'react' // useState untuk menyimpan role terpilih, useMemo untuk data roles
import { useNavigate } from 'react-router-dom' // Untuk pindah route (kembali ke landing)
import { useAuth } from '../context/useAuth.js' // Ambil fungsi login agar auto-login setelah register
import { api } from '../utils/api.js'

export default function RegisterRole() {
  const [selectedRole, setSelectedRole] = useState(null) // Nilai: 'mahasiswa' | 'alumni' | 'dosen'
  const [email, setEmail] = useState('') // Email untuk akun baru
  const [password, setPassword] = useState('') // Password akun baru
  const [isSubmitting, setIsSubmitting] = useState(false) // Flag loading saat submit
  const [errorMessage, setErrorMessage] = useState('') // Pesan error jika register gagal
  const navigate = useNavigate() // Dipakai untuk kembali ke halaman landing
  const { login } = useAuth() // Setelah register sukses, langsung login otomatis

  const roles = useMemo(
    () => [
      {
        key: 'mahasiswa', // Disamakan dengan backend (role = mahasiswa)
        title: 'Mahasiswa',
        description: 'Cari peluang magang/mentorship dan bangun portofolio skill.',
      },
      {
        key: 'alumni',
        title: 'Alumni',
        description: 'Buka peluang mentoring/magang dan bantu mahasiswa berkembang.',
      },
      {
        key: 'dosen', // Disamakan dengan backend (role = dosen)
        title: 'Dosen',
        description: 'Bagikan info resmi dan pantau aktivitas karier mahasiswa.',
      },
    ],
    [],
  )

  function handleSelect(roleKey) {
    setSelectedRole(roleKey) // Simpan pilihan user agar UI bisa menandai kartu yang aktif
  }

  async function handleRegister() {
    // Register ke backend, lalu auto-login
    setErrorMessage('') // Reset error
    if (!selectedRole) {
      setErrorMessage('Pilih salah satu peran terlebih dahulu.')
      return
    }
    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.')
      return
    }

    setIsSubmitting(true) // Aktifkan loading agar tidak double submit
    try {
      await api.post('/api/auth/register', {
        email, // Email yang diinput user
        password, // Password yang diinput user
        role: selectedRole, // Role yang dipilih user
      }) // Server akan menyimpan user baru (password di-hash)

      const user = await login({ email, password }) // Setelah register, langsung login agar UX cepat

      const roleToPath = {
        mahasiswa: '/dashboard/student',
        alumni: '/dashboard/alumni',
        dosen: '/dashboard/dosen',
        admin: '/dashboard/dosen',
      } // Mapping sederhana role -> dashboard

      navigate(roleToPath[user?.role] || '/', { replace: true }) // Arahkan ke dashboard yang sesuai
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Registrasi gagal. Pastikan data valid dan server aktif.'
      setErrorMessage(msg) // Tampilkan error di UI
    } finally {
      setIsSubmitting(false) // Matikan loading
    }
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-white via-bg to-primary/10 text-text overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Pilih Peran Anda
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Peran menentukan dashboard, fitur, dan alur verifikasi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')} // Kembali ke Landing Page (S1)
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            &lt;- Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {roles.map((role) => {
            const isActive = selectedRole === role.key // True jika role ini sedang dipilih

            return (
              <button
                key={role.key}
                type="button"
                onClick={() => handleSelect(role.key)} // Klik kartu = pilih role
                className={[
                  'group rounded-2xl bg-white/80 p-6 text-left shadow-sm ring-1 ring-black/5 transition backdrop-blur',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  isActive ? 'ring-2 ring-accent' : '',
                ].join(' ')} // Gabungkan class Tailwind secara aman
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-primary">
                      {role.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">
                      {role.description}
                    </p>
                  </div>

                  <div
                    className={[
                      'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold',
                      isActive ? 'bg-accent text-white' : 'bg-primary/10 text-primary',
                    ].join(' ')} // Badge kecil sebagai identitas visual role
                  >
                    {role.title.slice(0, 1)}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-black/50">
                  <span
                    className={[
                      'h-2 w-2 rounded-full',
                      isActive ? 'bg-accent' : 'bg-black/15',
                    ].join(' ')} // Dot indikator status (dipilih / belum)
                  />
                  {isActive ? 'Dipilih' : 'Klik untuk memilih'}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 rounded-3xl bg-white/85 p-7 shadow-lg ring-1 ring-black/5 backdrop-blur">
          <div className="text-lg font-semibold text-primary">Buat Akun</div>
          <p className="mt-1 text-sm text-black/60">
            Masukkan email & password untuk menyelesaikan pendaftaran.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault() // Cegah reload halaman
              handleRegister() // Jalankan proses register
            }}
            className="mt-5 space-y-4"
          >
            {errorMessage ? (
              <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-black/70 ring-1 ring-accent/30">
                {errorMessage}
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Simpan nilai email
                placeholder="nama@usk.ac.id"
                type="email"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Simpan nilai password
                placeholder="Minimal 8 karakter"
                type="password"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60"
              >
                {isSubmitting ? 'Memproses...' : 'Daftar & Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
