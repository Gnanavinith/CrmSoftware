import mongoose from 'mongoose'

const OTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    isUsed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
)

// Create TTL index for automatic cleanup
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('OTP', OTPSchema)
