import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export default function LandingPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]   = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const stats = useMemo(() => [
    { value: '12K+', label: 'Alumni Aktif',  icon: '👥' },
    { value: '450',  label: 'Co-Mentors',    icon: '🎓' },
    { value: '98%',  label: 'Verified',       icon: '✅' },
  ], [])

  const features = useMemo(() => [
    { icon: '🤝', title: 'Mentorship',  desc: 'Terhubung langsung dengan alumni berpengalaman sebagai mentor karier.' },
    { icon: '💼', title: 'Magang',      desc: 'Temukan peluang magang resmi dari alumni, dosen, dan mitra USK.' },
    { icon: '🔬', title: 'Riset',       desc: 'Kolaborasi riset lintas angkatan bersama dosen dan alumni peneliti.' },
  ], [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)
    try {
      const user = await login({ email: identifier, password })
      const roleToPath = {
        mahasiswa: '/dashboard/student',
        alumni:    '/dashboard/alumni',
        dosen:     '/dashboard/dosen',
        admin:     '/dashboard/dosen',
      }
      navigate(roleToPath[user?.role] || '/', { replace: true })
    } catch (error) {
      const msg = error?.response?.data?.message || 'Login gagal. Pastikan email & password benar, dan backend aktif.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #f3f7f9 0%, #e8f4f6 50%, #fef3e8 100%)' }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #0a6c75, transparent)' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #f2994a, transparent)' }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #0a6c75, transparent)' }} />

      {/* Nav bar */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #0a6c75, #0d8a96)' }}>
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-lg font-bold" style={{ color: '#0a6c75' }}>SYNALUM</span>
          <span className="hidden text-xs font-medium text-gray-400 sm:block">• USK</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="btn-ghost text-sm animate-fade-in"
          id="nav-register-btn"
        >
          Daftar Sekarang
        </button>
      </nav>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-20 pt-6 md:grid-cols-2 md:items-center md:gap-16 md:px-6">

        {/* ── Hero Left ── */}
        <section className="flex flex-col justify-center animate-slide-up">
          {/* Badge pill */}
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold glass shadow-sm" style={{ color: '#0a6c75' }}>
            <span className="h-2 w-2 rounded-full" style={{ background: '#f2994a' }} />
            Sinergy Alumni-Mahasiswa · Universitas Syiah Kuala
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl" style={{ color: '#0a6c75' }}>
            Satu Platform.{' '}
            <span className="text-gradient">Tiga Jembatan{' '}Karier.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed" style={{ color: '#4a5568' }}>
            Temukan peluang <strong>magang</strong>, <strong>mentorship</strong>, dan <strong>kolaborasi riset</strong> dari alumni,
            mahasiswa, dan dosen Universitas Syiah Kuala — semua dalam satu ekosistem terverifikasi.
          </p>

          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-xl">{s.icon}</div>
                <div className="mt-1 text-xl font-bold" style={{ color: '#0a6c75' }}>{s.value}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#718096' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-2xl">{f.icon}</div>
                <div className="mt-2 text-sm font-semibold" style={{ color: '#2d3748' }}>{f.title}</div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: '#718096' }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="hero-register-btn"
              onClick={() => navigate('/register')}
              className="btn-primary text-sm"
            >
              Mulai Bergabung →
            </button>
            <span className="text-sm" style={{ color: '#a0aec0' }}>Sudah punya akun? Login di kanan.</span>
          </div>
        </section>

        {/* ── Login Card Right ── */}
        <aside className="flex items-center justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-full max-w-md glass rounded-3xl p-8 shadow-xl">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-1.5 w-8 rounded-full" style={{ background: '#0a6c75' }} />
              <div className="h-1.5 w-4 rounded-full" style={{ background: '#f2994a' }} />
            </div>
            <h2 className="mt-3 text-2xl font-bold" style={{ color: '#0a6c75' }}>Masuk</h2>
            <p className="mt-1 text-sm" style={{ color: '#718096' }}>
              Akses dashboard sesuai peran Anda.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} id="login-form">
              {errorMessage && (
                <div className="animate-fade-in rounded-xl border px-4 py-3 text-sm" style={{ background: '#fff5ef', borderColor: '#f2994a', color: '#744210' }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: '#4a5568' }}>
                  Nomor Induk / Email
                </label>
                <input
                  id="login-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nama@usk.ac.id"
                  type="text"
                  autoComplete="email"
                  required
                  className="input-base"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: '#4a5568' }}>
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-base pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: '#a0aec0' }}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Memproses...
                  </span>
                ) : (
                  'Masuk ke Dashboard →'
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm" style={{ color: '#a0aec0' }}>
              <span>Belum punya akun?</span>
              <button
                type="button"
                id="login-to-register-btn"
                onClick={() => navigate('/register')}
                className="font-semibold transition hover:opacity-75"
                style={{ color: '#0a6c75' }}
              >
                Daftar sekarang →
              </button>
            </div>

            {/* Demo tip */}
            <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: '#f0fafa', color: '#4a5568' }}>
              💡 <strong>Demo:</strong> Daftar akun baru lalu login — backend berjalan lokal tanpa cloud.
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
