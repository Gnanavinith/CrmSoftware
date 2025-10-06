import express from 'express'
import { 
  getUsers, 
  getUser, 
  updateUser,
  getTeamMembers
} from '../controllers/userController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(auth)

// User routes
router.get('/', getUsers)
router.get('/team', getTeamMembers)
router.get('/:id', getUser)
router.put('/:id', updateUser)

export default router
