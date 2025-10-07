import mongoose from 'mongoose'
import User from '../models/User.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const verifyUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    console.log('Connected to MongoDB')

    // Find the users
    const admin = await User.findOne({ email: 'hellotanglome@gmail.com' })
    const manager = await User.findOne({ email: 'manager@gmail.com' })

    console.log('\n=== User Verification ===')
    
    if (admin) {
      console.log('✅ Admin User Found:')
      console.log(`   Name: ${admin.name}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Position: ${admin.position}`)
      console.log(`   Created: ${admin.createdAt}`)
    } else {
      console.log('❌ Admin user not found')
    }

    if (manager) {
      console.log('\n✅ Manager User Found:')
      console.log(`   Name: ${manager.name}`)
      console.log(`   Email: ${manager.email}`)
      console.log(`   Role: ${manager.role}`)
      console.log(`   Position: ${manager.position}`)
      console.log(`   Created: ${manager.createdAt}`)
    } else {
      console.log('❌ Manager user not found')
    }

    // List all users
    const allUsers = await User.find({}, 'name email role position createdAt')
    console.log('\n=== All Users in Database ===')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })

  } catch (error) {
    console.error('Error verifying users:', error)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
    process.exit(0)
  }
}

// Run the script
verifyUsers()
