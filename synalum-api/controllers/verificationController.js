import { db } from '../db.js'

function generateOtp6Digits() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// ─── POST /api/verify/request-otp ───────────────────────────────────────────
export function requestOtp(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const otp = generateOtp6Digits()

    const stmt = db.prepare(`
      INSERT INTO verifications (user_id, otp_code, status, layer_level)
      VALUES (?, ?, 'pending', 1)
    `)
    const result = stmt.run(userId, otp)

    const verification = db.prepare('SELECT id, user_id, status, layer_level, created_at FROM verifications WHERE id = ?').get(result.lastInsertRowid)

    return res.json({
      message: 'OTP berhasil dibuat (simulasi email terkirim)',
      otp, // NOTE: In production, NEVER return the OTP to the client!
      verification,
    })
  } catch (error) {
    console.error('[requestOtp]', error)
    return res.status(500).json({ message: 'Gagal membuat OTP' })
  }
}

// ─── POST /api/verify/submit-docs ───────────────────────────────────────────
export function submitDocs(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const documentUrl = String(req.body?.documentUrl || req.body?.document_url || '').trim()
    const linkedinUrl = String(req.body?.linkedinUrl || req.body?.linkedin_url || '').trim()
    const finalUrl    = documentUrl || linkedinUrl

    if (!finalUrl) {
      return res.status(400).json({ message: 'documentUrl / linkedinUrl wajib diisi' })
    }

    // Check if layer-2 verification already exists for this user
    const existing = db.prepare(`
      SELECT id FROM verifications
      WHERE user_id = ? AND layer_level = 2
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId)

    let verificationRow

    if (existing) {
      db.prepare(`
        UPDATE verifications
        SET document_url = ?, status = 'pending_moderator'
        WHERE id = ?
      `).run(finalUrl, existing.id)

      verificationRow = db.prepare('SELECT id, user_id, status, layer_level, document_url, created_at FROM verifications WHERE id = ?').get(existing.id)
    } else {
      const result = db.prepare(`
        INSERT INTO verifications (user_id, document_url, status, layer_level)
        VALUES (?, ?, 'pending_moderator', 2)
      `).run(userId, finalUrl)

      verificationRow = db.prepare('SELECT id, user_id, status, layer_level, document_url, created_at FROM verifications WHERE id = ?').get(result.lastInsertRowid)
    }

    return res.json({
      message: 'Dokumen diterima dan menunggu moderasi',
      verification: verificationRow,
    })
  } catch (error) {
    console.error('[submitDocs]', error)
    return res.status(500).json({ message: 'Gagal submit dokumen' })
  }
}
