import express from 'express'
import { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject,
  addTask,
  updateTask,
  deleteTask
} from '../controllers/projectController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(auth)

// Project routes
router.get('/', getProjects)
router.get('/:id', getProject)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

// Task routes
router.post('/:id/tasks', addTask)
router.put('/:id/tasks/:taskId', updateTask)
router.delete('/:id/tasks/:taskId', deleteTask)

export default router
