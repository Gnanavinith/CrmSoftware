import mongoose from 'mongoose'
import User from '../models/User.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const createUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    console.log('Connected to MongoDB')

    // Create Admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'hellotanglome@gmail.com',
      password: 'Tanglome@123',
      role: 'admin',
      position: 'System Administrator'
    })

    // Create Manager user
    const managerUser = new User({
      name: 'Manager User',
      email: 'manager@gmail.com',
      password: 'Manager@123',
      role: 'manager',
      position: 'Team Manager'
    })

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: adminUser.email })
    const existingManager = await User.findOne({ email: managerUser.email })

    if (existingAdmin) {
      console.log('Admin user already exists, updating...')
      existingAdmin.password = adminUser.password
      existingAdmin.role = 'admin'
      await existingAdmin.save()
      console.log('Admin user updated successfully')
    } else {
      await adminUser.save()
      console.log('Admin user created successfully')
    }

    if (existingManager) {
      console.log('Manager user already exists, updating...')
      existingManager.password = managerUser.password
      existingManager.role = 'manager'
      await existingManager.save()
      console.log('Manager user updated successfully')
    } else {
      await managerUser.save()
      console.log('Manager user created successfully')
    }

    console.log('\nUsers created/updated:')
    console.log('Admin:', adminUser.email)
    console.log('Manager:', managerUser.email)
    console.log('\nYou can now use these credentials to log in to the system.')

  } catch (error) {
    console.error('Error creating users:', error)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('Database connection closed')
    process.exit(0)
  }
}

// Run the script
createUsers()
