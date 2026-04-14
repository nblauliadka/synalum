import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_JWT_SECRET = 'synalum_local_dev_secret_change_in_prod'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  return secret && secret.trim() ? secret : DEFAULT_JWT_SECRET
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const email    = normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '')
    const role     = String(req.body?.role || '').trim()

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'email, password, dan role wajib diisi' })
    }

    const allowedRoles = new Set(['mahasiswa', 'alumni', 'dosen', 'admin'])
    if (!allowedRoles.has(role)) {
      return res.status(400).json({ message: 'role tidak valid (mahasiswa | alumni | dosen | admin)' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, role)
      VALUES (?, ?, ?)
    `)

    let result
    try {
      result = stmt.run(email, passwordHash, role)
    } catch (err) {
      // SQLite UNIQUE constraint violation
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || String(err.message).includes('UNIQUE')) {
        return res.status(409).json({ message: 'Email sudah terdaftar' })
      }
      throw err
    }

    const newUser = db.prepare('SELECT id, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({ message: 'Register berhasil', user: newUser })
  } catch (error) {
    console.error('[register]', error)
    return res.status(500).json({ message: 'Terjadi error saat register' })
  }
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const email    = normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '')

    if (!email || !password) {
      return res.status(400).json({ message: 'email dan password wajib diisi' })
    }

    const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1').get(email)

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const secret = getJwtSecret()
    const tokenPayload = {
      sub: String(user.id),
      role: user.role,
      email: user.email,
    }

    const token = jwt.sign(tokenPayload, secret, { expiresIn: '7d' })

    return res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('[login]', error)
    return res.status(500).json({ message: 'Terjadi error saat login' })
  }
}
