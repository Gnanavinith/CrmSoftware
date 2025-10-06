import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 },
    note: { type: String, default: '' },
    location: { type: String, default: 'Office' }
  },
  { timestamps: true }
)

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true })

export default mongoose.model('Attendance', AttendanceSchema)



