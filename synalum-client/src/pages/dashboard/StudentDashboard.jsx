import { useEffect, useState } from 'react' // useEffect untuk fetch saat mount, useState untuk simpan data
import { useNavigate } from 'react-router-dom' // Untuk redirect setelah logout
import { useAuth } from '../../context/useAuth.js' // Ambil data user & logout dari context
import { api } from '../../utils/api.js'

export default function StudentDashboard() {
  const { user, logout } = useAuth() // user.role dipakai untuk validasi route, logout untuk keluar
  const navigate = useNavigate() // Dipakai untuk kembali ke landing page saat logout
  const [opportunities, setOpportunities] = useState([]) // List lowongan dari API
  const [isLoading, setIsLoading] = useState(true) // Loading state saat fetch
  const [errorMessage, setErrorMessage] = useState('') // Pesan error jika fetch gagal
  const [applyingId, setApplyingId] = useState(null) // Menyimpan id peluang yang sedang dilamar (biar tombol bisa loading)

  useEffect(() => {
    // Saat komponen pertama kali tampil, kita fetch daftar peluang dari backend
    // Catatan: axios sudah otomatis membawa JWT dari AuthContext (Authorization header)
    let isCancelled = false // Flag kecil untuk mencegah setState setelah unmount

    async function loadOpportunities() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await api.get('/api/opportunities/all')
        if (!isCancelled) {
          setOpportunities(response.data?.opportunities || [])
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          'Gagal mengambil feed peluang. Pastikan backend aktif.'
        if (!isCancelled) {
          setErrorMessage(msg)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadOpportunities()

    return () => {
      isCancelled = true
    }
  }, [])

  function renderBadge(badgeSource) {
    // Fungsi helper untuk membuat badge sesuai tipe sumber peluang.
    // - RESMI_USK => warna mencolok (accent) supaya mudah terlihat “resmi”
    // - ALUMNI_POST => highlight sebagai posting alumni
    // - EKSTERNAL => tampilan netral
    if (badgeSource === 'RESMI_USK') {
      return (
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
          RESMI USK
        </span>
      )
    }

    if (badgeSource === 'ALUMNI_POST') {
      return (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          ALUMNI
        </span>
      )
    }

    return (
      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
        EKSTERNAL
      </span>
    )
  }

  async function handleApply(opportunityId) {
    // Saat mahasiswa klik "Lamar Sekarang", kita hit endpoint backend untuk membuat record applications
    setApplyingId(opportunityId) // Set state agar UI bisa menampilkan loading untuk card ini
    try {
      await api.post('/api/applications/apply', {
        opportunity_id: opportunityId, // Backend menerima opportunity_id (atau opportunityId)
      })

      alert('Lamaran berhasil dikirim!') // Notifikasi sederhana untuk MVP
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Gagal mengirim lamaran. Pastikan Anda login sebagai mahasiswa.'
      alert(msg) // Notifikasi sederhana untuk MVP
    } finally {
      setApplyingId(null) // Matikan loading setelah request selesai
    }
  }

  function handleLogout() {
    // Logout = hapus token dari context/localStorage, lalu kembalikan user ke halaman Landing Page (/)
    logout()
    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Dashboard Mahasiswa
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Selamat datang, {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-sm font-medium text-black/60">Skor Relevansi</div>
            <div className="mt-2 text-4xl font-semibold text-primary">82</div>
            <div className="mt-2 text-sm text-black/50">
              Dummy skor berdasarkan minat karier & profil.
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-primary">
                Feed Peluang Magang / Mentorship
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Live API
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {errorMessage ? (
                <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-black/70 ring-1 ring-accent/30">
                  {errorMessage}
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-xl bg-black/5 px-4 py-3 text-sm text-black/60">
                  Memuat peluang...
                </div>
              ) : null}

              {!isLoading && !errorMessage && opportunities.length === 0 ? (
                <div className="rounded-xl bg-black/5 px-4 py-3 text-sm text-black/60">
                  Belum ada peluang yang tersedia.
                </div>
              ) : null}

              {!isLoading &&
                !errorMessage &&
                opportunities.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-black/10 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-base font-semibold text-black/80">
                        {item.title}
                      </div>
                      {renderBadge(item.badge_source)}
                    </div>
                    {item.description ? (
                      <p className="mt-2 text-sm text-black/60">
                        {item.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleApply(item.id)} // Kirim lamaran untuk peluang ini
                        disabled={applyingId === item.id} // Disable agar tidak double apply
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                      >
                        {applyingId === item.id ? 'Memproses...' : 'Lamar Sekarang'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
