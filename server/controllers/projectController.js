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
    const query = {}
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see projects assigned to them
      query.user = req.user._id
    } else if (req.user.role === 'manager') {
      // Managers can see all projects
      // No additional filtering needed
    } else if (req.user.role === 'admin') {
      // Admins can see all projects
      // No additional filtering needed
    }
    
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
        .populate('user', 'name email position')
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
    let query = { _id: id }
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see projects assigned to them
      query.user = req.user._id
    }
    // Managers and admins can see any project
    
    const project = await Project.findOne(query)
      .populate('client', 'name company email phone')
      .populate('user', 'name email position')
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
    let query = { _id: id }
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only update projects assigned to them
      query.user = req.user._id
    }
    // Managers and admins can update any project
    
    const project = await Project.findOneAndUpdate(
      query, 
      updates, 
      { new: true }
    ).populate('client', 'name company email')
     .populate('user', 'name email position')
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

// Get my assigned projects (Employee)
export const getMyProjects = async (req, res) => {
  try {
    const { _id: userId } = req.user
    const { search, status, priority, page = 1, limit = 50 } = req.query
    
    const query = {
      $or: [
        { user: userId },
        { 'teamMembers.user': userId }
      ]
    }
    
    if (status) query.status = status
    if (priority) query.priority = priority
    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { technologies: { $in: [new RegExp(search, 'i')] } }
          ]
        }
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
    return res.status(500).json({ message: 'Failed to fetch my projects', error: err.message })
  }
}

// Assign team member to project (Manager & Admin)
export const assignTeamMember = async (req, res) => {
  try {
    const { id } = req.params
    const { userId, role = 'member' } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check if user is already assigned
    const existingMember = project.teamMembers.find(member => 
      member.user.toString() === userId
    )

    if (existingMember) {
      return res.status(400).json({ message: 'User is already assigned to this project' })
    }

    // Add team member
    project.teamMembers.push({ user: userId, role })
    await project.save()

    const populatedProject = await Project.findById(id)
      .populate('client', 'name company email')
      .populate('teamMembers.user', 'name email position')

    return res.status(200).json({ 
      message: 'Team member assigned successfully', 
      project: populatedProject 
    })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to assign team member', error: err.message })
  }
}

// Get projects list for dropdowns (Manager & Admin)
export const getProjectsList = async (req, res) => {
  try {
    const { search, status } = req.query
    const query = {}
    
    if (status) query.status = status
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const projects = await Project.find(query)
      .select('_id name status client')
      .populate('client', 'name company')
      .sort({ name: 1 })
      .limit(100)
    
    return res.status(200).json({ projects })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch projects list', error: err.message })
  }
}