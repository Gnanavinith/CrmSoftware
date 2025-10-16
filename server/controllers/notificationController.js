import Notification from '../models/Notification.js'

// Get all notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query
    const userId = req.user._id

    const query = { user: userId }
    if (unreadOnly === 'true') {
      query.read = false
    }

    const skip = (Number(page) - 1) * Number(limit)
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, read: false })
    ])

    // Add timeAgo to each notification
    const notificationsWithTimeAgo = notifications.map(notification => {
      const now = new Date()
      const diff = now - new Date(notification.createdAt)
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      let timeAgo = 'Just now'
      if (minutes >= 1 && minutes < 60) timeAgo = `${minutes} min ago`
      else if (hours >= 1 && hours < 24) timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`
      else if (days >= 1) timeAgo = `${days} day${days > 1 ? 's' : ''} ago`

      return {
        ...notification,
        timeAgo
      }
    })

    res.status(200).json({
      notifications: notificationsWithTimeAgo,
      total,
      unreadCount,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (err) {
    console.error('Error fetching notifications:', err)
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message })
  }
}

// Get notification count
export const getNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id
    const unreadCount = await Notification.countDocuments({ user: userId, read: false })
    
    res.status(200).json({ unreadCount })
  } catch (err) {
    console.error('Error fetching notification count:', err)
    res.status(500).json({ message: 'Failed to fetch notification count', error: err.message })
  }
}

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true, readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.status(200).json(notification)
  } catch (err) {
    console.error('Error marking notification as read:', err)
    res.status(500).json({ message: 'Failed to mark notification as read', error: err.message })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id

    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    )

    res.status(200).json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    })
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: err.message })
  }
}

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId })

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.status(200).json({ message: 'Notification deleted successfully' })
  } catch (err) {
    console.error('Error deleting notification:', err)
    res.status(500).json({ message: 'Failed to delete notification', error: err.message })
  }
}

// Create a notification (for admin/system use)
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'system', priority = 'medium', data = {}, actionUrl } = req.body

    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' })
    }

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      priority,
      data,
      actionUrl
    })

    res.status(201).json(notification)
  } catch (err) {
    console.error('Error creating notification:', err)
    res.status(500).json({ message: 'Failed to create notification', error: err.message })
  }
}

// Create notification for multiple users (for admin/system use)
export const createBulkNotifications = async (req, res) => {
  try {
    const { userIds, title, message, type = 'system', priority = 'medium', data = {}, actionUrl } = req.body

    if (!userIds || !Array.isArray(userIds) || !title || !message) {
      return res.status(400).json({ message: 'userIds array, title, and message are required' })
    }

    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type,
      priority,
      data,
      actionUrl
    }))

    const createdNotifications = await Notification.insertMany(notifications)

    res.status(201).json({ 
      message: 'Notifications created successfully',
      count: createdNotifications.length,
      notifications: createdNotifications
    })
  } catch (err) {
    console.error('Error creating bulk notifications:', err)
    res.status(500).json({ message: 'Failed to create bulk notifications', error: err.message })
  }
}

