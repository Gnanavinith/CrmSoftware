import Project from '../models/Project.js'

export const createProject = async (req, res) => {
  try {
    const data = req.body
    if (!data?.name) {
      return res.status(400).json({ message: 'Project name is required' })
    }
    const project = await Project.create({ ...data, user: req.user._id })
    return res.status(201).json(project)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create project', error: err.message })
  }
}

export const getProjects = async (req, res) => {
  try {
    const { search, status, priority, page = 1, limit = 50 } = req.query
    const query = { user: req.user._id }
    
    if (status) query.status = status
    if (priority) query.priority = priority
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('client', 'name company email')
        .populate('teamMembers.user', 'name email position')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Project.countDocuments(query)
    ])
    
    return res.status(200).json({ projects, total })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch projects', error: err.message })
  }
}

export const getProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findOne({ _id: id, user: req.user._id })
      .populate('client', 'name company email phone')
      .populate('teamMembers.user', 'name email position')
    
    if (!project) return res.status(404).json({ message: 'Project not found' })
    return res.status(200).json(project)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch project', error: err.message })
  }
}

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const project = await Project.findOneAndUpdate(
      { _id: id, user: req.user._id }, 
      updates, 
      { new: true }
    ).populate('client', 'name company email')
     .populate('teamMembers.user', 'name email position')
    
    if (!project) return res.status(404).json({ message: 'Project not found' })
    return res.status(200).json(project)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update project', error: err.message })
  }
}

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findOneAndDelete({ _id: id, user: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete project', error: err.message })
  }
}

export const addTask = async (req, res) => {
  try {
    const { id } = req.params
    const taskData = req.body
    
    const project = await Project.findOne({ _id: id, user: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    
    project.tasks.push(taskData)
    await project.save()
    
    return res.status(200).json(project)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add task', error: err.message })
  }
}

export const updateTask = async (req, res) => {
  try {
    const { id, taskId } = req.params
    const updates = req.body
    
    const project = await Project.findOne({ _id: id, user: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    
    const task = project.tasks.id(taskId)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    
    Object.assign(task, updates)
    if (updates.status === 'completed') {
      task.completedAt = new Date()
    }
    
    await project.save()
    return res.status(200).json(project)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update task', error: err.message })
  }
}

export const deleteTask = async (req, res) => {
  try {
    const { id, taskId } = req.params
    
    const project = await Project.findOne({ _id: id, user: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    
    project.tasks.id(taskId).remove()
    await project.save()
    
    return res.status(200).json(project)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete task', error: err.message })
  }
}
