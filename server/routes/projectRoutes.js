import express from 'express'
import { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
  getMyProjects,
  assignTeamMember,
  getProjectsList
} from '../controllers/projectController.js'
import auth from '../middleware/auth.js'
import { requireEmployee, requireManager, requireAdmin } from '../middleware/roleAuth.js'

const router = express.Router()

// Employee Access
router.get('/my-projects', auth, requireEmployee, getMyProjects)
router.get('/list', auth, requireEmployee, getProjectsList) // Get projects list for dropdowns (all authenticated users)
router.get('/:id', auth, requireEmployee, getProject)

// Team Member Access (for task management)
router.post('/:id/tasks', auth, requireEmployee, addTask)
router.put('/tasks/:taskId', auth, requireEmployee, updateTask)

// Manager & Admin Access
router.get('/', auth, requireManager, getProjects) // View all projects
router.post('/', auth, requireManager, createProject)
router.put('/:id', auth, requireManager, updateProject)
router.post('/:id/team', auth, requireManager, assignTeamMember)

// Admin Only Access
router.delete('/:id', auth, requireAdmin, deleteProject)

export default router
