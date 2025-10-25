import { Router } from 'express'
import { register, login, sendRegistrationOTP, verifyRegistrationOTP, resendRegistrationOTP } from '../controllers/authController.js'

const router = Router()

// OTP-based registration flow
router.post('/send-otp', sendRegistrationOTP)
router.post('/verify-otp', verifyRegistrationOTP)
router.post('/resend-otp', resendRegistrationOTP)

// Legacy endpoints
router.post('/register', register)
router.post('/login', login)

export default router



