import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { checkDbConnection } from './db.js'
import authRoutes from './routes/authRoutes.js'
import verificationRoutes from './routes/verificationRoutes.js'
import opportunityRoutes from './routes/opportunityRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'

dotenv.config()

const app = express()

// ─── CORS — open for local dev ────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}))

app.use(express.json())

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/verify',       verificationRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api/applications', applicationRoutes)

// ─── Root ping ────────────────────────────────────────────────────────────────
app.get('/api', (_req, res) => {
  res.json({ message: 'SYNALUM API is running ✅', version: 'v1-sqlite' })
})

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  try {
    const row = checkDbConnection()
    res.json({ status: 'ok', serverTime: new Date().toISOString(), db: { ok: true, time: row.now } })
  } catch {
    res.json({ status: 'ok', serverTime: new Date().toISOString(), db: { ok: false } })
  }
})

// ─── 404 Fallback ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000

app.listen(PORT, () => {
  console.log(`\n🚀 SYNALUM API  →  http://localhost:${PORT}`)
  console.log(`   DB           →  SQLite (synalum.db) — no credentials needed\n`)
})

export default app
