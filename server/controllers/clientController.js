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
    const query = { user: req.user._id }
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
      Client.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
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
    const client = await Client.findOne({ _id: id, user: req.user._id })
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
    const client = await Client.findOneAndUpdate({ _id: id, user: req.user._id }, updates, { new: true })
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



