import { Router } from 'express' // Router untuk mengelompokkan endpoint auth
import { login, register } from '../controllers/authController.js' // Controller auth (register & login)

const router = Router() // Buat router baru khusus /api/auth

router.post('/register', register) // POST /api/auth/register
router.post('/login', login) // POST /api/auth/login

export default router // Export router agar bisa dipakai di server.js
