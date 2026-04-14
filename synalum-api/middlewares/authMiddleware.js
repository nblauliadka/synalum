import jwt from 'jsonwebtoken' // Untuk memverifikasi token JWT yang dikirim oleh client

function getJwtSecret() {
  // Ambil JWT_SECRET dari env, wajib ada agar verifikasi token valid
  const secret = process.env.JWT_SECRET
  return secret && secret.trim() ? secret : null
}

export function authenticate(req, res, next) {
  // Middleware ini memastikan user punya JWT yang valid
  const authHeader = req.headers.authorization || '' // Format yang kita harapkan: "Bearer <token>"
  const [scheme, token] = authHeader.split(' ') // Pisahkan kata "Bearer" dan isi token

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Unauthorized: token tidak ditemukan (gunakan Authorization: Bearer <token>)',
    })
  }

  const secret = getJwtSecret()
  if (!secret) {
    return res.status(500).json({
      message: 'JWT_SECRET belum diset di environment (.env)',
    })
  }

  try {
    const decoded = jwt.verify(token, secret) // Jika token invalid/expired, ini akan melempar error

    // Simpan data user di req.user agar route berikutnya bisa menggunakannya
    req.user = {
      id: decoded.sub ? Number(decoded.sub) : null, // Konversi user id dari string ke number
      role: decoded.role,
      email: decoded.email,
    }

    return next() // Lanjut ke handler berikutnya
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized: token tidak valid atau sudah expired',
    })
  }
}

export function authorizeRoles(...allowedRoles) {
  // Middleware ini membatasi akses berdasarkan role (RBAC)
  const allowed = new Set(allowedRoles) // Set agar pengecekan role lebih cepat

  return (req, res, next) => {
    // Pastikan authenticate sudah dijalankan dulu (req.user ada)
    if (!req.user?.role) {
      return res.status(401).json({
        message: 'Unauthorized: user belum terautentikasi',
      })
    }

    if (!allowed.has(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: role tidak punya akses ke resource ini',
      })
    }

    return next() // Role aman, lanjut
  }
}
