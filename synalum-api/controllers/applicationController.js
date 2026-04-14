import { db } from '../db.js'

// ─── POST /api/applications/apply ─────────────────────────────────────────────
export function applyOpportunity(req, res) {
  try {
    const studentUserId = req.user?.id
    if (!studentUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const opportunityIdRaw = req.body?.opportunity_id ?? req.body?.opportunityId
    const opportunityId = Number(opportunityIdRaw)

    if (!opportunityId || Number.isNaN(opportunityId)) {
      return res.status(400).json({ message: 'opportunity_id wajib diisi' })
    }

    // Verify the opportunity exists and is active
    const opp = db.prepare('SELECT id, is_active FROM opportunities WHERE id = ? LIMIT 1').get(opportunityId)
    if (!opp) {
      return res.status(404).json({ message: 'Opportunity tidak ditemukan' })
    }
    if (!opp.is_active) {
      return res.status(400).json({ message: 'Opportunity sudah tidak aktif' })
    }

    let result
    try {
      result = db.prepare(`
        INSERT INTO applications (opportunity_id, student_user_id, status)
        VALUES (?, ?, 'pending')
      `).run(opportunityId, studentUserId)
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || String(err.message).includes('UNIQUE')) {
        return res.status(409).json({ message: 'Anda sudah melamar peluang ini' })
      }
      throw err
    }

    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({ message: 'Lamaran berhasil dikirim', application })
  } catch (error) {
    console.error('[applyOpportunity]', error)
    return res.status(500).json({ message: 'Gagal mengirim lamaran' })
  }
}

// ─── GET /api/applications/:opportunityId/applicants ──────────────────────────
export function getApplicantList(req, res) {
  try {
    const ownerUserId = req.user?.id
    if (!ownerUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const opportunityId = Number(req.params?.opportunityId)
    if (!opportunityId || Number.isNaN(opportunityId)) {
      return res.status(400).json({ message: 'opportunity_id tidak valid' })
    }

    // Ensure this opportunity belongs to the logged-in user
    const ownership = db.prepare(
      'SELECT id FROM opportunities WHERE id = ? AND created_by_user_id = ? LIMIT 1'
    ).get(opportunityId, ownerUserId)

    if (!ownership) {
      return res.status(403).json({ message: 'Anda tidak punya akses ke pelamar untuk peluang ini' })
    }

    const applicants = db.prepare(`
      SELECT
        a.id,
        a.status,
        a.created_at,
        u.id   AS student_user_id,
        u.email AS student_email
      FROM applications a
      JOIN users u ON u.id = a.student_user_id
      WHERE a.opportunity_id = ?
      ORDER BY a.created_at DESC
    `).all(opportunityId)

    return res.json({ opportunity_id: opportunityId, applicants })
  } catch (error) {
    console.error('[getApplicantList]', error)
    return res.status(500).json({ message: 'Gagal mengambil daftar pelamar' })
  }
}

// ─── PUT /api/applications/:id/status ────────────────────────────────────────
export function updateApplicationStatus(req, res) {
  try {
    const ownerUserId = req.user?.id
    if (!ownerUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const applicationId = Number(req.params?.id)
    if (!applicationId || Number.isNaN(applicationId)) {
      return res.status(400).json({ message: 'application id tidak valid' })
    }

    const nextStatus = String(req.body?.status || '').trim()
    if (!['accepted', 'rejected'].includes(nextStatus)) {
      return res.status(400).json({ message: "status harus 'accepted' atau 'rejected'" })
    }

    // Ensure this application belongs to an opportunity owned by the current user
    const check = db.prepare(`
      SELECT a.id
      FROM applications a
      JOIN opportunities o ON o.id = a.opportunity_id
      WHERE a.id = ? AND o.created_by_user_id = ?
      LIMIT 1
    `).get(applicationId, ownerUserId)

    if (!check) {
      return res.status(403).json({ message: 'Anda tidak punya akses untuk mengubah status lamaran ini' })
    }

    db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(nextStatus, applicationId)

    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId)

    return res.json({ message: 'Status lamaran berhasil diupdate', application })
  } catch (error) {
    console.error('[updateApplicationStatus]', error)
    return res.status(500).json({ message: 'Gagal update status lamaran' })
  }
}
