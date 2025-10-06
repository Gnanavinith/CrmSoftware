import express from 'express'
import { 
  createTask, 
  getTasks, 
  getTask, 
  updateTask, 
  deleteTask,
  addComment,
  updateTaskStatus
} from '../controllers/taskController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(auth)

// Task routes
router.get('/', getTasks)
router.get('/:id', getTask)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

// Additional task operations
router.post('/:id/comments', addComment)
router.patch('/:id/status', updateTaskStatus)

export default router