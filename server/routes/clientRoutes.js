import { Router } from 'express'
import auth from '../middleware/auth.js'
import { requireEmployee, requireManager, requireAdmin } from '../middleware/roleAuth.js'
import { 
  createClient, 
  getClients, 
  getClient, 
  updateClient, 
  deleteClient,
  addProjectToClient 
} from '../controllers/clientController.js'

const router = Router()

// Employee Access (All authenticated users)
router.get('/', auth, requireEmployee, getClients) // Filtered by assigned clients
router.get('/:id', auth, requireEmployee, getClient)
router.post('/', auth, requireEmployee, createClient) // If allowed by company policy

// Manager & Admin Access
router.get('/', auth, requireManager, getClients) // View all clients
router.put('/:id', auth, requireManager, updateClient)
router.post('/:id/projects', auth, requireManager, addProjectToClient)

// Admin Only Access
router.delete('/:id', auth, requireAdmin, deleteClient)

export default router



