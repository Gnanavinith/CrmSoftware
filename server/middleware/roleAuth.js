// Role-based authorization middleware

// Check if user has employee role or higher
export const requireEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  const allowedRoles = ['employee', 'manager', 'admin']
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Employee access required' })
  }
  
  next()
}

// Check if user has manager role or higher
export const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  const allowedRoles = ['manager', 'admin']
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Manager access required' })
  }
  
  next()
}

// Check if user has admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  
  next()
}

// Check if user can access team member data (manager or admin)
export const requireTeamAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  const allowedRoles = ['manager', 'admin']
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Team access required' })
  }
  
  next()
}

// Check if user can access specific user data (self, team member, or admin)
export const requireUserAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  const targetUserId = req.params.userId || req.params.id
  const isSelf = req.user._id.toString() === targetUserId
  const isAdmin = req.user.role === 'admin'
  const isManager = req.user.role === 'manager'
  
  // Allow if accessing own data, or if admin, or if manager accessing team member
  if (isSelf || isAdmin || (isManager && req.user.team.includes(targetUserId))) {
    return next()
  }
  
  return res.status(403).json({ message: 'Access denied to this user data' })
}
