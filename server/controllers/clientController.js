import Client from '../models/Client.js'

export const createClient = async (req, res) => {
  try {
    const data = req.body
    if (!data?.name || !data?.email || !data?.company) {
      return res.status(400).json({ message: 'name, email and company are required' })
    }
    const client = await Client.create({ ...data, user: req.user._id })
    return res.status(201).json(client)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create client', error: err.message })
  }
}

export const getClients = async (req, res) => {
  try {
    const { search, status, industry, page = 1, limit = 50 } = req.query
    const query = {}
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see clients assigned to them
      query.user = req.user._id
    } else if (req.user.role === 'manager') {
      // Managers can see all clients
      // No additional filtering needed
    } else if (req.user.role === 'admin') {
      // Admins can see all clients
      // No additional filtering needed
    }
    
    if (status) query.status = status
    if (industry) query.industry = industry
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const [clients, total] = await Promise.all([
      Client.find(query)
        .populate('user', 'name email position')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Client.countDocuments(query)
    ])
    return res.status(200).json({ clients, total })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch clients', error: err.message })
  }
}

export const getClient = async (req, res) => {
  try {
    const { id } = req.params
    let query = { _id: id }
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see clients assigned to them
      query.user = req.user._id
    }
    // Managers and admins can see any client
    
    const client = await Client.findOne(query)
      .populate('user', 'name email position')
    if (!client) return res.status(404).json({ message: 'Client not found' })
    return res.status(200).json(client)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch client', error: err.message })
  }
}

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    let query = { _id: id }
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only update clients assigned to them
      query.user = req.user._id
    }
    // Managers and admins can update any client
    
    const client = await Client.findOneAndUpdate(query, updates, { new: true })
      .populate('user', 'name email position')
    if (!client) return res.status(404).json({ message: 'Client not found' })
    return res.status(200).json(client)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update client', error: err.message })
  }
}

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params
    const client = await Client.findOneAndDelete({ _id: id, user: req.user._id })
    if (!client) return res.status(404).json({ message: 'Client not found' })
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete client', error: err.message })
  }
}

// Add project to client (Manager & Admin)
export const addProjectToClient = async (req, res) => {
  try {
    const { id } = req.params
    const { projectId } = req.body

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' })
    }

    const client = await Client.findById(id)
    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    // Add project to client's projects array if not already present
    if (!client.projects.includes(projectId)) {
      client.projects.push(projectId)
      await client.save()
    }

    return res.status(200).json({ message: 'Project added to client successfully', client })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add project to client', error: err.message })
  }
}



