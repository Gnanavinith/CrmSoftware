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
    const query = {}
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see tasks assigned to them
      query.assignee = req.user._id
    } else if (req.user.role === 'manager') {
      // Managers can see all tasks
      // No additional filtering needed
    } else if (req.user.role === 'admin') {
      // Admins can see all tasks
      // No additional filtering needed
    }
    
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
        .populate('user', 'name email position')
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
    let query = { _id: id }
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see tasks assigned to them
      query.assignee = req.user._id
    }
    // Managers and admins can see any task
    
    const task = await Task.findOne(query)
      .populate('assignee', 'name email position')
      .populate('project', 'name status')
      .populate('user', 'name email position')
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
    let query = { _id: id }
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only update tasks assigned to them
      query.assignee = req.user._id
    }
    // Managers and admins can update any task
    
    const task = await Task.findOneAndUpdate(
      query, 
      updates, 
      { new: true }
    )
      .populate('assignee', 'name email position')
      .populate('project', 'name status')
      .populate('user', 'name email position')
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

// Get my assigned tasks (Employee)
export const getMyTasks = async (req, res) => {
  try {
    const { _id: userId } = req.user
    const { search, status, priority, project, page = 1, limit = 100 } = req.query
    const query = { assignee: userId }
    
    if (status) query.status = status
    if (priority) query.priority = priority
    if (project) query.project = project
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
    return res.status(500).json({ message: 'Failed to fetch my tasks', error: err.message })
  }
}

// Log time to task (Employee)
export const logTime = async (req, res) => {
  try {
    const { id } = req.params
    const { hours, description } = req.body
    
    if (!hours || hours <= 0) {
      return res.status(400).json({ message: 'Valid hours are required' })
    }
    
    const task = await Task.findOne({ _id: id, assignee: req.user._id })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    
    task.timeEntries.push({
      user: req.user._id,
      hours: Number(hours),
      description: description || '',
      date: new Date()
    })
    
    // Update total time spent
    task.totalTimeSpent = (task.totalTimeSpent || 0) + Number(hours)
    
    await task.save()
    await task.populate('timeEntries.user', 'name email')
    
    return res.status(200).json(task)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to log time', error: err.message })
  }
}

// Get all tasks in a project (Manager & Admin)
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params
    const { search, status, priority, assignee, page = 1, limit = 100 } = req.query
    const query = { project: projectId }
    
    if (status) query.status = status
    if (priority) query.priority = priority
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
    return res.status(500).json({ message: 'Failed to fetch project tasks', error: err.message })
  }
}