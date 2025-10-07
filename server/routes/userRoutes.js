import express from 'express'
import { 
  getUsers, 
  getUser, 
  updateUser,
  getTeamMembers,
  createUser,
  deleteUser,
  getAllUsers,
  getProfile,
  updateProfile,
  getUsersList
} from '../controllers/userController.js'
import auth from '../middleware/auth.js'
import { requireEmployee, requireManager, requireAdmin, requireUserAccess } from '../middleware/roleAuth.js'

const router = express.Router()

// Employee Access
router.get('/profile', auth, requireEmployee, getProfile)
router.put('/profile', auth, requireEmployee, updateProfile)

// Manager Access
router.get('/', auth, requireManager, getTeamMembers) // View team members
router.get('/list', auth, requireEmployee, getUsersList) // Get users list for dropdowns (all authenticated users)
router.get('/:id', auth, requireUserAccess, getUser) // View team member details

// Admin Only Access
router.post('/', auth, requireAdmin, createUser) // Create new users
router.put('/:id', auth, requireAdmin, updateUser) // Update any user
router.delete('/:id', auth, requireAdmin, deleteUser) // Delete users
router.get('/all', auth, requireAdmin, getAllUsers) // View all users

export default router
