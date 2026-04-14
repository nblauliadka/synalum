import { useMemo, useState } from 'react' // useState untuk langkah aktif, useMemo untuk data step biar rapi
import { useNavigate } from 'react-router-dom' // Untuk redirect ke dashboard setelah verifikasi
import { useAuth } from '../context/useAuth.js' // Ambil user + markAlumniVerified untuk unlock dashboard alumni
import { api } from '../utils/api.js'

export default function AlumniVerification() {
  const [step, setStep] = useState(1) // Step aktif: 1..3
  const [otpInput, setOtpInput] = useState('') // OTP yang diketik user
  const [issuedOtp, setIssuedOtp] = useState('') // OTP dari server (SIMULASI email terkirim)
  const [documentUrl, setDocumentUrl] = useState('') // URL LinkedIn/Ijazah yang diinput user
  const [isSubmitting, setIsSubmitting] = useState(false) // Loading state untuk request API
  const [errorMessage, setErrorMessage] = useState('') // Menyimpan error agar ditampilkan di UI

  const navigate = useNavigate() // Dipakai untuk pindah halaman setelah verifikasi
  const { user, markAlumniVerified } = useAuth() // Kita butuh role + fungsi untuk set status verifikasi (sementara)

  const steps = useMemo(
    () => [
      {
        id: 1,
        title: 'OTP Email',
        description: 'Masukkan kode OTP yang dikirim ke email Anda.',
      },
      {
        id: 2,
        title: 'Unggah LinkedIn / Ijazah',
        description: 'Unggah bukti alumni atau tautan LinkedIn untuk validasi.',
      },
      {
        id: 3,
        title: 'Konfirmasi Sesama Alumni',
        description: 'Minta konfirmasi dari alumni lain sebagai verifikasi layer 3.',
      },
    ],
    [],
  )

  function next() {
    setStep((prev) => Math.min(prev + 1, 3)) // Naik step maksimal sampai 3
  }

  function back() {
    setStep((prev) => Math.max(prev - 1, 1)) // Turun step minimal sampai 1
  }

  const active = steps.find((s) => s.id === step) // Ambil data step yang sedang aktif

  async function handleRequestOtp() {
    // Step 1: minta OTP ke backend (simulasi email terkirim)
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/api/verify/request-otp')
      const otpFromServer = String(response.data?.otp || '')
      setIssuedOtp(otpFromServer) // Simpan OTP dari server agar bisa divalidasi di frontend (khusus simulasi MVP)
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Gagal meminta OTP. Pastikan Anda login sebagai alumni dan server aktif.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleValidateOtp() {
    // Step 1: validasi OTP (untuk MVP kita bandingkan dengan OTP response)
    // Catatan: di produksi, validasi harus dilakukan di backend, bukan di frontend.
    setErrorMessage('')

    if (!issuedOtp) {
      setErrorMessage('Silakan klik "Kirim OTP" dulu.')
      return
    }

    if (otpInput.trim() !== issuedOtp) {
      setErrorMessage('OTP tidak cocok. Coba lagi.')
      return
    }

    next() // Jika OTP cocok, lanjut ke step 2
  }

  async function handleSubmitDocs() {
    // Step 2: submit URL LinkedIn/Ijazah ke backend untuk layer 2
    setErrorMessage('')
    if (!documentUrl.trim()) {
      setErrorMessage('URL LinkedIn/Ijazah wajib diisi.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/api/verify/submit-docs', {
        documentUrl: documentUrl.trim(),
      })

      // Untuk testing prototipe MVP:
      // Setelah submit dokumen sukses, kita tandai alumniVerified=true agar ProtectedRoute mengizinkan masuk dashboard.
      markAlumniVerified(true)

      navigate('/dashboard/alumni', { replace: true }) // Coba masuk ke dashboard alumni
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Gagal submit dokumen. Pastikan Anda login sebagai alumni dan server aktif.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">
          Verifikasi Alumni (3-Layer)
        </h1>
        <p className="mt-2 text-sm text-black/60">
          Verifikasi 3 langkah untuk alumni. (Layer 3 opsional)
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => {
            const isDone = s.id < step
            const isActive = s.id === step

            return (
              <div
                key={s.id}
                className={[
                  'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5',
                  isActive ? 'ring-2 ring-accent' : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-primary">
                    Step {s.id}
                  </div>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      isDone
                        ? 'bg-primary/10 text-primary'
                        : isActive
                          ? 'bg-accent text-white'
                          : 'bg-black/5 text-black/60',
                    ].join(' ')}
                  >
                    {isDone ? 'Selesai' : isActive ? 'Aktif' : 'Menunggu'}
                  </span>
                </div>
                <div className="mt-3 text-base font-semibold text-black/80">
                  {s.title}
                </div>
                <div className="mt-2 text-sm text-black/60">{s.description}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="text-lg font-semibold text-primary">{active?.title}</div>
          <div className="mt-2 text-sm text-black/60">{active?.description}</div>

          {user?.role && user.role !== 'alumni' ? (
            <div className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm text-black/70 ring-1 ring-accent/30">
              Anda login sebagai <span className="font-semibold">{user.role}</span>. Halaman ini khusus untuk alumni.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm text-black/70 ring-1 ring-accent/30">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-5">
            {step === 1 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-black/70">
                  Kode OTP
                </label>
                <input
                  placeholder="Contoh: 123456"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)} // Simpan OTP yang diketik user
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRequestOtp} // Minta OTP dari backend
                    disabled={isSubmitting}
                    className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 transition disabled:opacity-60"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateOtp} // Validasi OTP di frontend (simulasi)
                    className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  >
                    Verifikasi OTP
                  </button>
                </div>

                {issuedOtp ? (
                  <div className="rounded-xl bg-black/5 px-4 py-3 text-xs text-black/60">
                    Simulasi OTP (untuk testing): <span className="font-semibold">{issuedOtp}</span>
                  </div>
                ) : null}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-black/70">
                  Tautan LinkedIn atau URL Dokumen
                </label>
                <input
                  placeholder="https://linkedin.com/in/..."
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)} // Simpan URL dokumen
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <button
                  type="button"
                  onClick={handleSubmitDocs} // Kirim dokumen ke backend
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60"
                >
                  {isSubmitting ? 'Mengirim...' : 'Submit Dokumen'}
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-black/70">
                  Email Alumni Konfirmasi
                </label>
                <input
                  placeholder="alumni.lain@usk.ac.id"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 transition disabled:opacity-50"
            >
              &lt;- Kembali
            </button>

            <button
              type="button"
              onClick={next}
              disabled={step === 1 || step === 2} // Step 1 & 2 harus lewat tombol aksi (OTP/doc) agar validasinya benar
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              {step === 3 ? 'Selesai' : 'Lanjut ->'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
