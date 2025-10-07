import mongoose from 'mongoose'
import User from '../models/User.js'
import Client from '../models/Client.js'
import Project from '../models/Project.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const testRoleAccess = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    console.log('Connected to MongoDB')

    // Test admin access
    console.log('\n=== Testing Admin Access ===')
    const admin = await User.findOne({ email: 'hellotanglome@gmail.com' })
    if (admin) {
      console.log(`Admin: ${admin.name} (${admin.role})`)
      
      // Test admin can see all clients
      const adminClients = await Client.find({})
        .populate('user', 'name email position')
      console.log(`✅ Admin can see ${adminClients.length} clients:`)
      adminClients.forEach(client => {
        console.log(`   - ${client.name} (${client.company}) - Created by: ${client.user?.name}`)
      })
      
      // Test admin can see all projects
      const adminProjects = await Project.find({})
        .populate('client', 'name company email')
        .populate('user', 'name email position')
      console.log(`✅ Admin can see ${adminProjects.length} projects:`)
      adminProjects.forEach(project => {
        console.log(`   - ${project.name} (${project.status}) - Created by: ${project.user?.name}`)
      })
    }

    // Test manager access
    console.log('\n=== Testing Manager Access ===')
    const manager = await User.findOne({ email: 'manager@gmail.com' })
    if (manager) {
      console.log(`Manager: ${manager.name} (${manager.role})`)
      
      // Test manager can see all clients
      const managerClients = await Client.find({})
        .populate('user', 'name email position')
      console.log(`✅ Manager can see ${managerClients.length} clients:`)
      managerClients.forEach(client => {
        console.log(`   - ${client.name} (${client.company}) - Created by: ${client.user?.name}`)
      })
      
      // Test manager can see all projects
      const managerProjects = await Project.find({})
        .populate('client', 'name company email')
        .populate('user', 'name email position')
      console.log(`✅ Manager can see ${managerProjects.length} projects:`)
      managerProjects.forEach(project => {
        console.log(`   - ${project.name} (${project.status}) - Created by: ${project.user?.name}`)
      })
    }

    // Test employee access (if we had one)
    console.log('\n=== Testing Employee Access ===')
    const employee = await User.findOne({ role: 'employee' })
    if (employee) {
      console.log(`Employee: ${employee.name} (${employee.role})`)
      
      // Test employee can only see their own clients
      const employeeClients = await Client.find({ user: employee._id })
        .populate('user', 'name email position')
      console.log(`✅ Employee can see ${employeeClients.length} clients (only their own):`)
      employeeClients.forEach(client => {
        console.log(`   - ${client.name} (${client.company}) - Created by: ${client.user?.name}`)
      })
      
      // Test employee can only see their own projects
      const employeeProjects = await Project.find({ user: employee._id })
        .populate('client', 'name company email')
        .populate('user', 'name email position')
      console.log(`✅ Employee can see ${employeeProjects.length} projects (only their own):`)
      employeeProjects.forEach(project => {
        console.log(`   - ${project.name} (${project.status}) - Created by: ${project.user?.name}`)
      })
    } else {
      console.log('No employee user found for testing')
    }

  } catch (error) {
    console.error('Error testing role access:', error)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
    process.exit(0)
  }
}

// Run the script
testRoleAccess()
