import { Router } from 'express'
import auth from '../middleware/auth.js'
import { requireEmployee, requireManager, requireAdmin, requireUserAccess } from '../middleware/roleAuth.js'
import { 
  checkIn, 
  checkOut, 
  getMyAttendance, 
  getAllAttendance, 
  getUserAttendance, 
  updateAttendance, 
  deleteAttendance 
} from '../controllers/attendanceController.js'

const router = Router()

// Employee Access (All authenticated users)
router.post('/checkin', auth, requireEmployee, checkIn)
router.post('/checkout', auth, requireEmployee, checkOut)
router.get('/my-attendance', auth, requireEmployee, getMyAttendance)

// Manager & Admin Access
router.get('/all', auth, requireManager, getAllAttendance)
router.get('/user/:userId', auth, requireUserAccess, getUserAttendance)
router.put('/:id', auth, requireManager, updateAttendance)

// Admin Only Access
router.delete('/:id', auth, requireAdmin, deleteAttendance)

export default router



