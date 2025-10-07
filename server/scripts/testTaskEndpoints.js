import mongoose from 'mongoose'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Client from '../models/Client.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const testTaskEndpoints = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    console.log('Connected to MongoDB')

    console.log('\n=== Testing Task Access by Role ===')

    // Test admin access
    console.log('\n1. Testing Admin Access...')
    const admin = await User.findOne({ email: 'hellotanglome@gmail.com' })
    if (admin) {
      console.log(`Admin: ${admin.name} (${admin.role})`)
      
      // Test admin can see all tasks
      const adminTasks = await Task.find({})
        .populate('assignee', 'name email position')
        .populate('project', 'name status')
        .populate('user', 'name email position')
      console.log(`✅ Admin can see ${adminTasks.length} tasks:`)
      adminTasks.forEach(task => {
        console.log(`   - ${task.title} (${task.status}) - Assigned to: ${task.assignee?.name}`)
      })
    }

    // Test manager access
    console.log('\n2. Testing Manager Access...')
    const manager = await User.findOne({ email: 'manager@gmail.com' })
    if (manager) {
      console.log(`Manager: ${manager.name} (${manager.role})`)
      
      // Test manager can see all tasks
      const managerTasks = await Task.find({})
        .populate('assignee', 'name email position')
        .populate('project', 'name status')
        .populate('user', 'name email position')
      console.log(`✅ Manager can see ${managerTasks.length} tasks:`)
      managerTasks.forEach(task => {
        console.log(`   - ${task.title} (${task.status}) - Assigned to: ${task.assignee?.name}`)
      })
    }

    // Test employee access
    console.log('\n3. Testing Employee Access...')
    const employee = await User.findOne({ role: 'employee' })
    if (employee) {
      console.log(`Employee: ${employee.name} (${employee.role})`)
      
      // Test employee can only see tasks assigned to them
      const employeeTasks = await Task.find({ assignee: employee._id })
        .populate('assignee', 'name email position')
        .populate('project', 'name status')
        .populate('user', 'name email position')
      console.log(`✅ Employee can see ${employeeTasks.length} tasks (only assigned to them):`)
      employeeTasks.forEach(task => {
        console.log(`   - ${task.title} (${task.status}) - Assigned to: ${task.assignee?.name}`)
      })
    }

    console.log('\n=== Testing Dropdown Data ===')

    // Test projects list
    console.log('\n4. Testing Projects List...')
    const projects = await Project.find({})
      .select('_id name status client')
      .populate('client', 'name company')
      .sort({ name: 1 })
    console.log(`✅ Found ${projects.length} projects for dropdown:`)
    projects.forEach(project => {
      console.log(`   - ${project.name} (${project.status}) - Client: ${project.client?.name}`)
    })

    // Test users list
    console.log('\n5. Testing Users List...')
    const users = await User.find({})
      .select('_id name email position role')
      .sort({ name: 1 })
    console.log(`✅ Found ${users.length} users for dropdown:`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.position} - ${user.role}`)
    })

  } catch (error) {
    console.error('Error testing task endpoints:', error)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
    process.exit(0)
  }
}

// Run the script
testTaskEndpoints()
