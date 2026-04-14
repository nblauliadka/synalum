import { db } from '../db.js'

function getBadgeSourceByRole(role) {
  if (role === 'dosen')  return 'RESMI_USK'
  if (role === 'alumni') return 'ALUMNI_POST'
  if (role === 'admin')  return 'RESMI_USK'
  return 'EKSTERNAL'
}

// ─── POST /api/opportunities ─────────────────────────────────────────────────
export function createOpportunity(req, res) {
  try {
    const userId = req.user?.id
    const role   = req.user?.role

    if (!userId || !role) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const title       = String(req.body?.title || '').trim()
    const description = String(req.body?.description || '').trim()

    if (!title) {
      return res.status(400).json({ message: 'title wajib diisi' })
    }

    const badgeSource = getBadgeSourceByRole(role)

    const stmt = db.prepare(`
      INSERT INTO opportunities (created_by_user_id, title, description, badge_source)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(userId, title, description || null, badgeSource)

    const opportunity = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({ message: 'Peluang berhasil diposting', opportunity })
  } catch (error) {
    console.error('[createOpportunity]', error)
    return res.status(500).json({ message: 'Gagal membuat peluang' })
  }
}

// ─── GET /api/opportunities/all ──────────────────────────────────────────────
export function getAllOpportunities(req, res) {
  try {
    const opportunities = db.prepare(`
      SELECT id, created_by_user_id, title, description, badge_source, is_active, created_at
      FROM opportunities
      WHERE is_active = 1
      ORDER BY created_at DESC
    `).all()

    return res.json({ opportunities })
  } catch (error) {
    console.error('[getAllOpportunities]', error)
    return res.status(500).json({ message: 'Gagal mengambil daftar peluang' })
  }
}
