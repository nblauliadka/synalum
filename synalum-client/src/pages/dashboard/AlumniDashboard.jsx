import { useCallback, useEffect, useState } from 'react' // useCallback agar dependency useEffect rapi, useEffect untuk fetch data, useState untuk menyimpan state
import { useNavigate } from 'react-router-dom' // Untuk redirect setelah logout
import { useAuth } from '../../context/useAuth.js' // Ambil data user & logout dari context
import { api } from '../../utils/api.js'

export default function AlumniDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate() // Dipakai untuk kembali ke landing page saat logout
  const [title, setTitle] = useState('') // Judul peluang yang akan diposting
  const [description, setDescription] = useState('') // Deskripsi peluang yang akan diposting
  const [isSubmitting, setIsSubmitting] = useState(false) // Loading state saat request
  const [message, setMessage] = useState('') // Pesan sukses/gagal yang tampil di UI
  const [myOpportunities, setMyOpportunities] = useState([]) // List peluang yang diposting oleh user ini
  const [applicantsByOpportunity, setApplicantsByOpportunity] = useState({}) // Map: opportunityId -> list applicants
  const [isLoadingReview, setIsLoadingReview] = useState(true) // Loading state saat fetch peluang untuk review
  const [reviewError, setReviewError] = useState('') // Error saat fetch review/applicants
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null) // Menandai lamaran yang sedang diupdate statusnya

  const loadMyOpportunities = useCallback(async () => {
    // Ambil semua peluang dari backend, lalu filter yang dibuat oleh user login
    // Catatan: karena backend saat ini belum punya endpoint "my opportunities",
    // kita pakai GET all lalu filter di frontend sebagai solusi cepat untuk MVP.
    setIsLoadingReview(true)
    setReviewError('')

    try {
      const response = await api.get('/api/opportunities/all')
      const all = response.data?.opportunities || []
      const myId = Number(user?.id) // user.id dari backend kadang berupa string, jadi kita ubah ke number
      const filtered = all.filter((o) => Number(o.created_by_user_id) === myId)
      setMyOpportunities(filtered)
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Gagal mengambil peluang untuk review pelamar.'
      setReviewError(msg)
    } finally {
      setIsLoadingReview(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    loadMyOpportunities()
  }, [user?.id, loadMyOpportunities])

  async function handleCreateOpportunity(e) {
    e.preventDefault() // Cegah reload halaman saat submit form
    setMessage('') // Reset pesan sebelumnya

    if (!title.trim()) {
      setMessage('Judul posisi wajib diisi.')
      return
    }

    setIsSubmitting(true)
    try {
      // Karena axios sudah dipasang Authorization header dari AuthContext,
      // request ini otomatis membawa JWT token user yang sedang login.
      await api.post('/api/opportunities/create', {
        title: title.trim(),
        description: description.trim(),
      })

      setMessage('Peluang berhasil diposting.')
      setTitle('') // Reset input agar siap posting peluang lain
      setDescription('')
      await loadMyOpportunities() // Refresh list agar peluang baru langsung muncul di section review
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Gagal posting peluang. Pastikan Anda login sebagai alumni dan server aktif.'
      setMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function loadApplicants(opportunityId) {
    // Ambil daftar pelamar untuk opportunity tertentu (milik user ini)
    setReviewError('')
    try {
      const response = await api.get(`/api/applications/${opportunityId}/applicants`)
      const applicants = response.data?.applicants || []
      setApplicantsByOpportunity((prev) => ({
        ...prev,
        [opportunityId]: applicants,
      }))
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Gagal mengambil daftar pelamar.'
      setReviewError(msg)
    }
  }

  async function updateStatus(applicationId, nextStatus, opportunityId) {
    // Update status lamaran ke accepted/rejected, lalu update state lokal agar UI ikut berubah
    setUpdatingApplicationId(applicationId)
    setReviewError('')

    try {
      const response = await api.put(`/api/applications/${applicationId}/status`, {
        status: nextStatus,
      })

      const updated = response.data?.application
      setApplicantsByOpportunity((prev) => {
        const currentList = prev[opportunityId] || []
        const nextList = currentList.map((a) =>
          a.id === updated?.id ? { ...a, status: updated.status } : a,
        )
        return { ...prev, [opportunityId]: nextList }
      })
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Gagal update status lamaran.'
      setReviewError(msg)
    } finally {
      setUpdatingApplicationId(null)
    }
  }

  function handleLogout() {
    // Logout = hapus token dari context/localStorage, lalu kembalikan user ke Landing Page (/)
    logout()
    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Dashboard Alumni
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

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-primary">
                Posting Peluang (Alumni)
              </div>
              <p className="mt-1 text-sm text-black/60">
                Postingan alumni akan diberi badge <span className="font-semibold">ALUMNI_POST</span> oleh backend.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Form Sederhana
            </span>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleCreateOpportunity}>
            {message ? (
              <div className="rounded-xl bg-black/5 px-4 py-3 text-sm text-black/70">
                {message}
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                Judul Posisi
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)} // Simpan input ke state
                placeholder="Contoh: Mentorship Backend"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)} // Simpan input ke state
                placeholder="Tulis ringkas kebutuhan/benefit/durasi..."
                rows={4}
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60"
              >
                {isSubmitting ? 'Memposting...' : 'Posting Peluang'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-lg font-semibold text-primary">
              Review Pelamar (Peluang Saya)
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              MVP
            </span>
          </div>

          {reviewError ? (
            <div className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm text-black/70 ring-1 ring-accent/30">
              {reviewError}
            </div>
          ) : null}

          {isLoadingReview ? (
            <div className="mt-4 rounded-xl bg-black/5 px-4 py-3 text-sm text-black/60">
              Memuat peluang...
            </div>
          ) : null}

          {!isLoadingReview && myOpportunities.length === 0 ? (
            <div className="mt-4 rounded-xl bg-black/5 px-4 py-3 text-sm text-black/60">
              Anda belum memposting peluang.
            </div>
          ) : null}

          <div className="mt-4 space-y-4">
            {myOpportunities.map((opp) => {
              const applicants = applicantsByOpportunity[opp.id] || null
              return (
                <div key={opp.id} className="rounded-2xl border border-black/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-black/80">
                        {opp.title}
                      </div>
                      <div className="mt-1 text-sm text-black/60">
                        {opp.description || 'Tanpa deskripsi'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadApplicants(opp.id)} // Klik untuk fetch pelamar peluang ini
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 transition hover:opacity-95"
                    >
                      Lihat Pelamar
                    </button>
                  </div>

                  {Array.isArray(applicants) ? (
                    <div className="mt-4 space-y-3">
                      {applicants.length === 0 ? (
                        <div className="rounded-xl bg-black/5 px-4 py-3 text-sm text-black/60">
                          Belum ada pelamar.
                        </div>
                      ) : (
                        applicants.map((a) => (
                          <div
                            key={a.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-semibold text-black/80">
                                {a.student_email}
                              </div>
                              <div className="mt-1 text-xs text-black/50">
                                Status: <span className="font-semibold">{a.status}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateStatus(a.id, 'accepted', opp.id)} // Terima lamaran
                                disabled={updatingApplicationId === a.id}
                                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                              >
                                Terima
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStatus(a.id, 'rejected', opp.id)} // Tolak lamaran
                                disabled={updatingApplicationId === a.id}
                                className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-lg font-semibold text-primary">
              Peluang Aktif
            </div>
            <div className="mt-4 space-y-3">
              {[
                { title: 'Mentorship Backend', status: 'Aktif' },
                { title: 'Internship Fullstack', status: 'Aktif' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3"
                >
                  <div className="font-medium text-black/80">{item.title}</div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-lg font-semibold text-primary">Mentee Dibimbing</div>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Mahasiswa A', progress: 'Sesi 2/6' },
                { name: 'Mahasiswa B', progress: 'Sesi 1/4' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3"
                >
                  <div className="font-medium text-black/80">{item.name}</div>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    {item.progress}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
