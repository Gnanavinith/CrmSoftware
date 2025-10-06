import { Router } from 'express'
import auth from '../middleware/auth.js'
import { checkIn, checkOut, getMyAttendance } from '../controllers/attendanceController.js'

const router = Router()

router.post('/check-in', auth, checkIn)
router.post('/check-out', auth, checkOut)
router.get('/me', auth, getMyAttendance)

export default router



