import express from 'express'
import { 
  getNotifications, 
  getNotificationCount,
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  createNotification,
  createBulkNotifications
} from '../controllers/notificationController.js'
import auth from '../middleware/auth.js'
import { requireAdmin } from '../middleware/roleAuth.js'

const router = express.Router()

// All routes require authentication
router.use(auth)

// User notification routes
router.get('/', getNotifications) // Get user's notifications
router.get('/count', getNotificationCount) // Get notification count
router.patch('/:id/read', markAsRead) // Mark specific notification as read
router.patch('/read-all', markAllAsRead) // Mark all notifications as read
router.delete('/:id', deleteNotification) // Delete specific notification

// Admin/System routes for creating notifications
router.post('/', requireAdmin, createNotification) // Create notification for specific user
router.post('/bulk', requireAdmin, createBulkNotifications) // Create notifications for multiple users

export default router

