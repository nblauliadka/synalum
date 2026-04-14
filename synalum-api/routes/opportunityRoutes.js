import { Router } from 'express' // Router untuk grup endpoint opportunities
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js' // Proteksi JWT + RBAC
import { createOpportunity, getAllOpportunities } from '../controllers/opportunityController.js' // Controller opportunities

const router = Router()

// Semua role yang login boleh melihat feed
router.get('/all', authenticate, getAllOpportunities)

// Hanya dosen/alumni/admin yang boleh posting peluang
router.post('/create', authenticate, authorizeRoles('dosen', 'alumni', 'admin'), createOpportunity)

export default router
