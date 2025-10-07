import mongoose from 'mongoose'
import User from '../models/User.js'
import Client from '../models/Client.js'
import Project from '../models/Project.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const createSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    console.log('Connected to MongoDB')

    // Get the admin user
    const admin = await User.findOne({ email: 'hellotanglome@gmail.com' })
    const manager = await User.findOne({ email: 'manager@gmail.com' })
    
    if (!admin || !manager) {
      console.log('Admin or manager user not found. Please run createUsers.js first.')
      return
    }

    // Create sample clients
    const sampleClients = [
      {
        name: 'John Smith',
        email: 'john@acmecorp.com',
        company: 'Acme Corporation',
        phone: '+1-555-0123',
        status: 'active',
        industry: 'Technology',
        user: admin._id
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@techstart.com',
        company: 'TechStart Inc',
        phone: '+1-555-0456',
        status: 'active',
        industry: 'Software',
        user: manager._id
      },
      {
        name: 'Mike Wilson',
        email: 'mike@retailco.com',
        company: 'RetailCo Ltd',
        phone: '+1-555-0789',
        status: 'inactive',
        industry: 'Retail',
        user: admin._id
      }
    ]

    // Create clients
    const clients = await Client.insertMany(sampleClients)
    console.log('✅ Created sample clients:', clients.length)

    // Create sample projects
    const sampleProjects = [
      {
        name: 'E-commerce Platform',
        description: 'Build a modern e-commerce platform for Acme Corporation',
        status: 'active',
        priority: 'high',
        technologies: ['React', 'Node.js', 'MongoDB'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        client: clients[0]._id,
        user: admin._id
      },
      {
        name: 'Mobile App Development',
        description: 'Develop a mobile app for TechStart Inc',
        status: 'active',
        priority: 'medium',
        technologies: ['React Native', 'Firebase'],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        client: clients[1]._id,
        user: manager._id
      },
      {
        name: 'Inventory Management System',
        description: 'Create an inventory management system for RetailCo Ltd',
        status: 'completed',
        priority: 'low',
        technologies: ['Vue.js', 'Express', 'PostgreSQL'],
        startDate: new Date('2023-10-01'),
        endDate: new Date('2024-01-31'),
        client: clients[2]._id,
        user: admin._id
      }
    ]

    // Create projects
    const projects = await Project.insertMany(sampleProjects)
    console.log('✅ Created sample projects:', projects.length)

    console.log('\n=== Sample Data Created ===')
    console.log('Clients:', clients.map(c => `${c.name} (${c.company})`))
    console.log('Projects:', projects.map(p => `${p.name} - ${p.status}`))

  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
    process.exit(0)
  }
}

// Run the script
createSampleData()
