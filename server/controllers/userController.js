import User from '../models/User.js'

export const getUsers = async (req, res) => {
  try {
    const { search, position, page = 1, limit = 50 } = req.query
    const query = {}
    
    if (position) query.position = position
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ])
    
    return res.status(200).json({ users, total })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message })
  }
}

export const getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).select('-password')
    
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    // Don't allow password updates through this endpoint
    delete updates.password
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update user', error: err.message })
  }
}

export const getTeamMembers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email position')
      .sort({ name: 1 })
    
    return res.status(200).json(users)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch team members', error: err.message })
  }
}

// Create new user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'employee', position, manager } = req.body
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      position,
      manager
    })
    
    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password
    
    return res.status(201).json(userResponse)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create user', error: err.message })
  }
}

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    // Prevent deleting self
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }
    
    const user = await User.findByIdAndDelete(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete user', error: err.message })
  }
}

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, position, page = 1, limit = 50 } = req.query
    const query = {}
    
    if (role) query.role = role
    if (position) query.position = position
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('manager', 'name email')
        .populate('team', 'name email position')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ])
    
    return res.status(200).json({ users, total })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch all users', error: err.message })
  }
}

// Get user profile (Employee)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('manager', 'name email position')
      .populate('team', 'name email position')
    
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: err.message })
  }
}

// Update user profile (Employee)
export const updateProfile = async (req, res) => {
  try {
    const { name, position, email } = req.body
    const updates = {}
    
    if (name) updates.name = name
    if (position) updates.position = position
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' })
      }
      updates.email = email
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password')
      .populate('manager', 'name email position')
      .populate('team', 'name email position')
    
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update profile', error: err.message })
  }
}

// Get users list for dropdowns (Manager & Admin)
export const getUsersList = async (req, res) => {
  try {
    const { search, role } = req.query
    const query = {}
    
    if (role) query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ]
    }
    
    const users = await User.find(query)
      .select('_id name email position role')
      .sort({ name: 1 })
      .limit(100)
    
    return res.status(200).json({ users })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users list', error: err.message })
  }
}