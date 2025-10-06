import Task from '../models/Task.js'

export const createTask = async (req, res) => {
  try {
    const data = req.body
    if (!data?.title) {
      return res.status(400).json({ message: 'Task title is required' })
    }
    const task = await Task.create({ ...data, user: req.user._id })
    await task.populate('assignee', 'name email')
    await task.populate('project', 'name')
    return res.status(201).json(task)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create task', error: err.message })
  }
}

export const getTasks = async (req, res) => {
  try {
    const { search, status, priority, project, assignee, page = 1, limit = 100 } = req.query
    const query = { user: req.user._id }
    
    if (status) query.status = status
    if (priority) query.priority = priority
    if (project) query.project = project
    if (assignee) query.assignee = assignee
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { labels: { $in: [new RegExp(search, 'i')] } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignee', 'name email position')
        .populate('project', 'name status')
        .populate('dependencies', 'title status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(query)
    ])
    
    return res.status(200).json({ tasks, total })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch tasks', error: err.message })
  }
}

export const getTask = async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findOne({ _id: id, user: req.user._id })
      .populate('assignee', 'name email position')
      .populate('project', 'name status')
      .populate('dependencies', 'title status')
      .populate('comments.user', 'name email')
    
    if (!task) return res.status(404).json({ message: 'Task not found' })
    return res.status(200).json(task)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch task', error: err.message })
  }
}

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id }, 
      updates, 
      { new: true }
    )
      .populate('assignee', 'name email position')
      .populate('project', 'name status')
      .populate('dependencies', 'title status')
    
    if (!task) return res.status(404).json({ message: 'Task not found' })
    return res.status(200).json(task)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update task', error: err.message })
  }
}

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete task', error: err.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body
    
    const task = await Task.findOne({ _id: id, user: req.user._id })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    
    task.comments.push({
      user: req.user._id,
      text
    })
    
    await task.save()
    await task.populate('comments.user', 'name email')
    
    return res.status(200).json(task)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add comment', error: err.message })
  }
}

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { status },
      { new: true }
    )
      .populate('assignee', 'name email position')
      .populate('project', 'name status')
    
    if (!task) return res.status(404).json({ message: 'Task not found' })
    return res.status(200).json(task)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update task status', error: err.message })
  }
}
