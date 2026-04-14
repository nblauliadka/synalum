import { Router } from 'express' // Router untuk grup endpoint applications
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js' // Proteksi JWT + RBAC
import {
  applyOpportunity,
  getApplicantList,
  updateApplicationStatus,
} from '../controllers/applicationController.js' // Controller lamaran

const router = Router()

// Mahasiswa apply ke opportunity
router.post('/apply', authenticate, authorizeRoles('mahasiswa'), applyOpportunity)

// Alumni/Dosen/Admin melihat pelamar untuk opportunity yang mereka posting
router.get(
  '/:opportunityId/applicants',
  authenticate,
  authorizeRoles('alumni', 'dosen', 'admin'),
  getApplicantList,
)

// Alumni/Dosen/Admin update status lamaran untuk opportunity mereka
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('alumni', 'dosen', 'admin'),
  updateApplicationStatus,
)

export default router
