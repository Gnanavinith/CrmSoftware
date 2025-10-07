import mongoose from 'mongoose'
import User from '../models/User.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    console.log('Connected to MongoDB')

    // Test admin login
    console.log('\n=== Testing Admin Login ===')
    const admin = await User.findOne({ email: 'hellotanglome@gmail.com' })
    if (admin) {
      const isAdminPasswordValid = await admin.comparePassword('Tanglome@123')
      console.log(`Admin email: ${admin.email}`)
      console.log(`Admin password valid: ${isAdminPasswordValid ? '✅ YES' : '❌ NO'}`)
      console.log(`Admin role: ${admin.role}`)
    } else {
      console.log('❌ Admin user not found')
    }

    // Test manager login
    console.log('\n=== Testing Manager Login ===')
    const manager = await User.findOne({ email: 'manager@gmail.com' })
    if (manager) {
      const isManagerPasswordValid = await manager.comparePassword('Manager@123')
      console.log(`Manager email: ${manager.email}`)
      console.log(`Manager password valid: ${isManagerPasswordValid ? '✅ YES' : '❌ NO'}`)
      console.log(`Manager role: ${manager.role}`)
    } else {
      console.log('❌ Manager user not found')
    }

    console.log('\n=== Login Credentials Summary ===')
    console.log('Admin Login:')
    console.log('  Email: hellotanglome@gmail.com')
    console.log('  Password: Tanglome@123')
    console.log('  Role: admin')
    console.log('\nManager Login:')
    console.log('  Email: manager@gmail.com')
    console.log('  Password: Manager@123')
    console.log('  Role: manager')

  } catch (error) {
    console.error('Error testing login:', error)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
    process.exit(0)
  }
}

// Run the script
testLogin()
