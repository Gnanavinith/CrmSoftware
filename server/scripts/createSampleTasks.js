import mongoose from 'mongoose'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const createSampleTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    console.log('Connected to MongoDB')

    // Get users and projects
    const admin = await User.findOne({ email: 'hellotanglome@gmail.com' })
    const manager = await User.findOne({ email: 'manager@gmail.com' })
    const employee = await User.findOne({ role: 'employee' })
    
    const projects = await Project.find({})
    
    if (!admin || !manager || !employee || projects.length === 0) {
      console.log('Required users or projects not found. Please run createUsers.js and createSampleData.js first.')
      return
    }

    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Design User Interface',
        description: 'Create wireframes and mockups for the e-commerce platform',
        status: 'pending',
        priority: 'high',
        project: projects[0]._id,
        assignee: employee._id,
        user: admin._id,
        dueDate: new Date('2024-12-31'),
        labels: ['design', 'ui/ux'],
        tags: ['frontend', 'design']
      },
      {
        title: 'Setup Database Schema',
        description: 'Design and implement the database structure',
        status: 'in-progress',
        priority: 'high',
        project: projects[0]._id,
        assignee: admin._id,
        user: admin._id,
        dueDate: new Date('2024-11-30'),
        labels: ['backend', 'database'],
        tags: ['mongodb', 'schema']
      },
      {
        title: 'Implement Authentication',
        description: 'Add user login and registration functionality',
        status: 'pending',
        priority: 'medium',
        project: projects[1]._id,
        assignee: manager._id,
        user: manager._id,
        dueDate: new Date('2024-12-15'),
        labels: ['backend', 'security'],
        tags: ['auth', 'jwt']
      },
      {
        title: 'Create API Endpoints',
        description: 'Develop REST API for mobile app',
        status: 'completed',
        priority: 'medium',
        project: projects[1]._id,
        assignee: employee._id,
        user: manager._id,
        dueDate: new Date('2024-10-31'),
        labels: ['backend', 'api'],
        tags: ['rest', 'endpoints']
      },
      {
        title: 'Write Documentation',
        description: 'Create user and developer documentation',
        status: 'pending',
        priority: 'low',
        project: projects[2]._id,
        assignee: employee._id,
        user: admin._id,
        dueDate: new Date('2025-01-15'),
        labels: ['documentation'],
        tags: ['docs', 'manual']
      }
    ]

    // Create tasks
    const tasks = await Task.insertMany(sampleTasks)
    console.log('✅ Created sample tasks:', tasks.length)

    console.log('\n=== Sample Tasks Created ===')
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} - ${task.status} - Assigned to: ${task.assignee}`)
    })

  } catch (error) {
    console.error('Error creating sample tasks:', error)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
    process.exit(0)
  }
}

// Run the script
createSampleTasks()
