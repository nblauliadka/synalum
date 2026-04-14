import { Router } from 'express' // Router untuk grup endpoint verifikasi
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js' // Proteksi JWT + RBAC
import { requestOtp, submitDocs } from '../controllers/verificationController.js' // Controller verifikasi

const router = Router()

// Semua endpoint di sini hanya boleh diakses oleh user alumni yang sudah login
router.post('/request-otp', authenticate, authorizeRoles('alumni'), requestOtp)
router.post('/submit-docs', authenticate, authorizeRoles('alumni'), submitDocs)

export default router
