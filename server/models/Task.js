import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'completed', 'blocked'], 
      default: 'pending' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date,
    completedAt: Date,
    labels: [{ type: String }],
    estimatedHours: Number,
    actualHours: Number,
    tags: [{ type: String }],
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }],
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
  },
  { timestamps: true }
)

// Index for better query performance
TaskSchema.index({ user: 1, status: 1 })
TaskSchema.index({ user: 1, priority: 1 })
TaskSchema.index({ user: 1, dueDate: 1 })
TaskSchema.index({ assignee: 1 })
TaskSchema.index({ project: 1 })

// Auto-update completedAt when status changes to completed
TaskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date()
  } else if (this.isModified('status') && this.status !== 'completed' && this.completedAt) {
    this.completedAt = undefined
  }
  next()
})

export default mongoose.model('Task', TaskSchema)