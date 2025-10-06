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
