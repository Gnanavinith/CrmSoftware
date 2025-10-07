import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
    position: { type: String, default: 'Employee' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', UserSchema)



