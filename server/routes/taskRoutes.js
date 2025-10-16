import express from 'express'
import { 
  createTask, 
  getTasks, 
  getTask, 
  updateTask, 
  deleteTask,
  addComment,
  updateTaskStatus,
  getMyTasks,
  logTime,
  getProjectTasks
} from '../controllers/taskController.js'
import auth from '../middleware/auth.js'
import { requireEmployee, requireManager, requireAdmin } from '../middleware/roleAuth.js'

const router = express.Router()

// Employee Access
router.get('/my-tasks', auth, requireEmployee, getMyTasks)
router.get('/:id', auth, requireEmployee, getTask)
router.patch('/:id/status', auth, requireEmployee, updateTaskStatus)
router.post('/:id/comments', auth, requireEmployee, addComment)
router.post('/:id/time', auth, requireEmployee, logTime)

// All authenticated users can access tasks (with role-based filtering)
router.get('/', auth, getTasks) // View tasks (filtered by role)
router.post('/', auth, requireManager, createTask)
router.put('/:id', auth, requireManager, updateTask)
router.get('/project/:projectId', auth, requireManager, getProjectTasks)

// Admin Only Access
router.delete('/:id', auth, requireAdmin, deleteTask)

export default router