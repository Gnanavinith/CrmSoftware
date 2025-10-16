import { api } from './api'

export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(params = {}) {
    console.log('🌐 NotificationService: Fetching notifications with params:', params)
    const res = await api.get('/api/notifications', { params })
    console.log('🌐 NotificationService: Notifications response:', res.data)
    return res.data
  },

  // Mark a notification as read
  async markAsRead(notificationId) {
    console.log('🌐 NotificationService: Marking notification as read:', notificationId)
    const res = await api.patch(`/api/notifications/${notificationId}/read`)
    console.log('🌐 NotificationService: Mark as read response:', res.data)
    return res.data
  },

  // Mark all notifications as read
  async markAllAsRead() {
    console.log('🌐 NotificationService: Marking all notifications as read')
    const res = await api.patch('/api/notifications/read-all')
    console.log('🌐 NotificationService: Mark all as read response:', res.data)
    return res.data
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    console.log('🌐 NotificationService: Deleting notification:', notificationId)
    const res = await api.delete(`/api/notifications/${notificationId}`)
    console.log('🌐 NotificationService: Delete response:', res.data)
    return res.data
  },

  // Get notification count
  async getNotificationCount() {
    console.log('🌐 NotificationService: Getting notification count')
    const res = await api.get('/api/notifications/count')
    console.log('🌐 NotificationService: Count response:', res.data)
    return res.data
  },

  // Create a notification (for testing/admin purposes)
  async createNotification(notificationData) {
    console.log('🌐 NotificationService: Creating notification:', notificationData)
    const res = await api.post('/api/notifications', notificationData)
    console.log('🌐 NotificationService: Create response:', res.data)
    return res.data
  }
}

